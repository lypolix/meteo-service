package meteo

import "time"

type Reading struct {
	Name        string    `db:"name" json:"name"`
	Timestamp   time.Time `db:"timestamp" json:"timestamp"`
	Temperature float64   `db:"temperature" json:"temperature"`
}
