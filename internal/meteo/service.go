package meteo

import (
	"context"
	"log"
	"strings"
	"time"

	"github.com/lypolix/meteo-service/internal/client/http/geocoding"
	openmeteo "github.com/lypolix/meteo-service/internal/client/http/open_meteo"
)

type Service struct {
	repo            Repository
	cache           *Cache
	geocodingClient *geocoding.Client
	openmeteoClient *openmeteo.Client
	ttl             time.Duration
}

func NewService(
	repo Repository,
	cache *Cache,
	geo *geocoding.Client,
	open *openmeteo.Client,
	ttl time.Duration,
) *Service {
	return &Service{
		repo:            repo,
		cache:           cache,
		geocodingClient: geo,
		openmeteoClient: open,
		ttl:             ttl,
	}
}

func normalizeCity(city string) string {
	return strings.ToLower(strings.TrimSpace(city))
}

// Для HTTP: вернуть одно значение с кешом/БД/внешними API.
func (s *Service) GetReading(ctx context.Context, city string) (Reading, error) {
	city = normalizeCity(city)

	// 1. кеш
	if r, ok := s.cache.Get(city); ok && time.Since(r.Timestamp) <= s.ttl {
		return r, nil
	}

	// 2. БД
	r, err := s.repo.GetLatest(ctx, city)
	if err == nil && time.Since(r.Timestamp) <= s.ttl {
		s.cache.Set(city, r)
		return r, nil
	}

	// 3. Внешние сервисы
	geoRes, err := s.geocodingClient.GetCoords(city)
	if err != nil {
		return Reading{}, err
	}
	if len(geoRes) == 0 {
		return Reading{}, ErrCityNotFound
	}

	openRes, err := s.openmeteoClient.GetTemperature(geoRes[0].Latitude, geoRes[0].Longitude)
	if err != nil {
		return Reading{}, err
	}

	timestamp, err := time.Parse("2006-01-02T15:04", openRes.Current.Time)
	if err != nil {
		return Reading{}, err
	}

	newR := NewReading(city, timestamp, openRes.Current.Temperature2m)

	// best-effort запись
	if err := s.repo.Insert(ctx, newR); err != nil {
		log.Printf("failed to insert reading for %s: %v", city, err)
	}

	s.cache.Set(city, newR)
	return newR, nil
}

// Для фоновых джоб: принудительное обновление по городу.
func (s *Service) RefreshCity(ctx context.Context, city string) error {
	city = normalizeCity(city)

	geoRes, err := s.geocodingClient.GetCoords(city)
	if err != nil {
		return err
	}
	if len(geoRes) == 0 {
		return ErrCityNotFound
	}

	openRes, err := s.openmeteoClient.GetTemperature(geoRes[0].Latitude, geoRes[0].Longitude)
	if err != nil {
		return err
	}

	timestamp, err := time.Parse("2006-01-02T15:04", openRes.Current.Time)
	if err != nil {
		return err
	}

	r := NewReading(city, timestamp, openRes.Current.Temperature2m)

	if err := s.repo.Insert(ctx, r); err != nil {
		return err
	}

	s.cache.Set(city, r)
	return nil
}

func (s *Service) SearchCities(ctx context.Context, query string, count int) ([]geocoding.Response, error) {
	query = normalizeCity(query)
	if query == "" {
		return []geocoding.Response{}, nil
	}
	res, err := s.geocodingClient.SearchCities(query, count)
	if err != nil {
		return []geocoding.Response{}, err
	}
	return res, nil
}
