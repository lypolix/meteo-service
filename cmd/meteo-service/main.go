package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"sync"
	"time"

	"github.com/go-co-op/gocron/v2"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/lypolix/meteo-service/internal/client/http/geocoding"
	openmeteo "github.com/lypolix/meteo-service/internal/client/http/open_meteo"
	"github.com/lypolix/meteo-service/internal/httpapi"
	"github.com/lypolix/meteo-service/internal/meteo"
)

const (
	httpPort  = ":8080"
	cacheTTL  = time.Hour
	jobPeriod = 10 * time.Second
)

var mainCities = []string{"moscow", "london", "paris", "new york", "tokyo"}

func main() {
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, "postgresql://postgres:password@localhost:54321/meteo?sslmode=disable")
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		panic(err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		fmt.Fprintf(os.Stderr, "Unable to ping database: %v\n", err)
		panic(err)
	}

	httpClient := &http.Client{
		Timeout: time.Second * 60,
	}
	geoClient := geocoding.NewClient(httpClient)
	openClient := openmeteo.NewClient(httpClient)

	repo := meteo.NewPGRepository(pool)
	cache := meteo.NewCache(cacheTTL)
	svc := meteo.NewService(repo, cache, geoClient, openClient, cacheTTL)

	httpHandler := httpapi.NewHandler(svc)
	router := httpHandler.Routes()

	s, err := gocron.NewScheduler()
	if err != nil {
		panic(err)
	}
	jobs, err := initJobs(ctx, s, svc)
	if err != nil {
		panic(err)
	}
	_ = jobs

	wg := sync.WaitGroup{}
	wg.Add(2)

	go func() {
		defer wg.Done()
		fmt.Println("starting server on port " + httpPort)
		if err := http.ListenAndServe(httpPort, router); err != nil {
			panic(err)
		}
	}()

	go func() {
		defer wg.Done()
		fmt.Printf("starting %d background jobs for cities: %v\n", len(jobs), mainCities)
		s.Start()
	}()

	wg.Wait()
}

func initJobs(ctx context.Context, scheduler gocron.Scheduler, svc *meteo.Service) ([]gocron.Job, error) {
	var jobs []gocron.Job

	for _, cityName := range mainCities {
		city := cityName

		j, err := scheduler.NewJob(
			gocron.DurationJob(jobPeriod),
			gocron.NewTask(
				func() {
					if err := svc.RefreshCity(ctx, city); err != nil {
						log.Printf("job error for %s: %v\n", city, err)
						return
					}
					fmt.Printf("Background job: updated data for city: %s\n", city)
				},
			),
		)
		if err != nil {
			return nil, fmt.Errorf("failed to create job for %s: %w", city, err)
		}
		jobs = append(jobs, j)
	}

	return jobs, nil
}
