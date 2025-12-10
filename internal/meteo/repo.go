package meteo

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Repository interface {
	GetLatest(ctx context.Context, city string) (Reading, error)
	Insert(ctx context.Context, r Reading) error
}

type pgRepo struct {
	pool *pgxpool.Pool
}

func NewPGRepository(pool *pgxpool.Pool) Repository {
	return &pgRepo{pool: pool}
}

func (r *pgRepo) GetLatest(ctx context.Context, city string) (Reading, error) {
	var out Reading
	err := r.pool.QueryRow(
		ctx,
		`SELECT name, timestamp, temperature 
         FROM meteo 
         WHERE name = $1 
         ORDER BY timestamp DESC 
         LIMIT 1`,
		city,
	).Scan(&out.Name, &out.Timestamp, &out.Temperature)
	return out, err
}

func (r *pgRepo) Insert(ctx context.Context, rd Reading) error {
	_, err := r.pool.Exec(
		ctx,
		`INSERT INTO meteo (name, temperature, timestamp) 
         VALUES ($1, $2, $3)`,
		rd.Name, rd.Temperature, rd.Timestamp,
	)
	return err
}

func NewReading(city string, t time.Time, temp float64) Reading {
	return Reading{
		Name:        city,
		Timestamp:   t,
		Temperature: temp,
	}
}
