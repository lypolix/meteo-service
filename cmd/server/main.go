package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/go-co-op/gocron/v2"
	"github.com/lypolix/meteo-service/internal/client/http/geocoding"
	openmeteo "github.com/lypolix/meteo-service/internal/client/http/open_meteo"
)

const (
	httpPort = ":8080"
)

var mainCities = []string{"moscow", "london", "paris", "new york", "tokyo"}

type Meteo struct {
	Name        string    `db:"name" json:"name"`
	Timestamp   time.Time `db:"timestamp" json:"timestamp"`
	Temperature float64   `db:"temperature" json:"temperature"`
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	r.Use(cors.Handler(cors.Options{
        AllowedOrigins:   []string{"http://localhost:3000"}, 
        AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
        AllowCredentials: false,
        MaxAge:           300,
    }))

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
		Timeout: time.Second * 10,
	}
	geocodingClient := geocoding.NewClient(httpClient)
	openmeteoClient := openmeteo.NewClient(httpClient)

	r.Get("/{city}", func(w http.ResponseWriter, r *http.Request) {
		cityName := chi.URLParam(r, "city")
		cityName = strings.ToLower(cityName) 

		var meteo Meteo

		err = pool.QueryRow(
			ctx,
			"select name, timestamp, temperature from meteo where name = $1 order by timestamp desc limit 1",
			cityName,
		).Scan(&meteo.Name, &meteo.Timestamp, &meteo.Temperature)

		if err != nil || time.Since(meteo.Timestamp) > time.Hour {
			log.Printf("Fetching fresh data for city: %s\n", cityName)

			geoRes, err := geocodingClient.GetCoords(cityName)
			if err != nil {
				log.Printf("Geocoding error for %s: %v\n", cityName, err)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("geocoding error"))
				return
			}

			if len(geoRes) == 0 {
				w.WriteHeader(http.StatusNotFound)
				w.Write([]byte("city not found"))
				return
			}

			openMetRes, err := openmeteoClient.GetTemperature(geoRes[0].Latitude, geoRes[0].Longitude)
			if err != nil {
				log.Printf("Weather API error for %s: %v\n", cityName, err)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("weather api error"))
				return
			}

			timestamp, err := time.Parse("2006-01-02T15:04", openMetRes.Current.Time)
			if err != nil {
				log.Printf("Time parse error: %v\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("time parse error"))
				return
			}

			_, err = pool.Exec(ctx, "insert into meteo (name, temperature, timestamp) values ($1, $2, $3)", cityName, openMetRes.Current.Temperature2m, timestamp)
			if err != nil {
				log.Printf("Database insert error: %v\n", err)
			}

			meteo = Meteo{
				Name:        cityName,
				Timestamp:   timestamp,
				Temperature: openMetRes.Current.Temperature2m,
			}

			log.Printf("Updated data for city: %s\n", cityName)
		}

		raw, err := json.Marshal(meteo)
		if err != nil {
			log.Println(err)
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("json marshal error"))
			return
		}

		w.Header().Set("Content-Type", "application/json")
		_, err = w.Write(raw)
		if err != nil {
			log.Println(err)
		}
	})

	s, err := gocron.NewScheduler()
	if err != nil {
		panic(err)
	}

	jobs, err := initJobs(ctx, s, pool, geocodingClient, openmeteoClient)
	if err != nil {
		panic(err)
	}

	wg := sync.WaitGroup{}
	wg.Add(2)

	go func() {
		defer wg.Done()

		fmt.Println("starting server on port " + httpPort)
		err = http.ListenAndServe(httpPort, r)
		if err != nil {
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

func initJobs(ctx context.Context, scheduler gocron.Scheduler, pool *pgxpool.Pool, geocodingClient *geocoding.Client, openmeteoClient *openmeteo.Client) ([]gocron.Job, error) {
	var jobs []gocron.Job

	for _, cityName := range mainCities {
		city := cityName

		j, err := scheduler.NewJob(
			gocron.DurationJob(
				10*time.Second,
			),
			gocron.NewTask(
				func() {
					geoRes, err := geocodingClient.GetCoords(city)
					if err != nil {
						log.Printf("Job error for %s (geocoding): %v\n", city, err)
						return
					}

					if len(geoRes) == 0 {
						log.Printf("Job error for %s: city not found\n", city)
						return
					}

					openMetRes, err := openmeteoClient.GetTemperature(geoRes[0].Latitude, geoRes[0].Longitude)
					if err != nil {
						log.Printf("Job error for %s (weather API): %v\n", city, err)
						return
					}

					timestamp, err := time.Parse("2006-01-02T15:04", openMetRes.Current.Time)
					if err != nil {
						log.Printf("Job error for %s (time parse): %v\n", city, err)
						return
					}

					_, err = pool.Exec(ctx, "insert into meteo (name, temperature, timestamp) values ($1, $2, $3)", city, openMetRes.Current.Temperature2m, timestamp)
					if err != nil {
						log.Printf("Job error for %s (database): %v\n", city, err)
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
