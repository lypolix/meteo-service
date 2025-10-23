package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-co-op/gocron/v2"
	"github.com/lypolix/meteo-service/internal/client/http/geocoding"
	openmeteo "github.com/lypolix/meteo-service/internal/client/http/open_meteo"
)

const (
	httpPort = ":3000"
	city     = "moscow"
)

type Values struct {
	Timestamp   time.Time
	Temperature float64
}

type Storage struct {
	data map[string][]Values
	mu   sync.RWMutex
}

func main() {
	r := chi.NewRouter()
	r.Use(middleware.Logger)

	storage := &Storage{
		data: make(map[string][]Values),
	}

	r.Get("/{city}", func(w http.ResponseWriter, r *http.Request) {
		cityName := chi.URLParam(r, "city")

		storage.mu.RLock()
		defer storage.mu.RUnlock()
		
		values, ok := storage.data[cityName]
		if !ok {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		raw, err := json.Marshal(values)
		if err != nil {
			log.Println(err)
		}

		fmt.Printf("Requested city: %s\n", city)
		_, err = w.Write(raw)
		if err != nil {
			log.Println(err)
		}
	})

	s, err := gocron.NewScheduler()
	if err != nil {
		panic(err)
	}

	jobs, err := initJobs(s, storage)
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

		fmt.Printf("starting job: %v\n", jobs[0].ID())
		s.Start()
	}()

	wg.Wait()

}

func initJobs(scheduler gocron.Scheduler, storage *Storage) ([]gocron.Job, error) {

	httpClient := &http.Client{
		Timeout: time.Second * 10,
	}

	geocodingClient := geocoding.NewClient(httpClient)
	openmeteoClient := openmeteo.NewClient(httpClient)

	j, err := scheduler.NewJob(
		gocron.DurationJob(
			10*time.Second,
		),
		gocron.NewTask(
			func() {
				geoRes, err := geocodingClient.GetCoords(city)
				if err != nil {
					log.Println(err)
					return
				}

				openMetRes, err := openmeteoClient.GetTemperature(geoRes[0].Latitude, geoRes[0].Longitude)
				if err != nil {
					log.Println(err)
					return
				}

				storage.mu.Lock()
				defer storage.mu.Unlock()

				timestamp, err := time.Parse("2006-01-02T15:04", openMetRes.Current.Time)
				if err != nil {
					log.Println(err)
					return
				}
				storage.data[city] = append(storage.data[city], Values{Timestamp: timestamp, Temperature: openMetRes.Current.Temperature2m})

				fmt.Printf("updated data for city: %s\n", city)
			},
		),
	)
	if err != nil {
		return nil, err
	}

	return []gocron.Job{j}, nil
}
