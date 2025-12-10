package httpapi

import (
	"encoding/json"
	"log"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"github.com/lypolix/meteo-service/internal/meteo"
)

type Handler struct {
	svc *meteo.Service
}

func NewHandler(svc *meteo.Service) *Handler {
	return &Handler{svc: svc}
}

func (h *Handler) Routes() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.Logger)
	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"},

		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Get("/cities/search", h.searchCities)
	r.Get("/{city}", h.getCity)

	return r
}

func (h *Handler) searchCities(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query().Get("q")
	count := 10
	if c := r.URL.Query().Get("count"); c != "" {
		if n, err := strconv.Atoi(c); err == nil && n > 0 && n <= 50 {
			count = n
		}
	}

	results, err := h.svc.SearchCities(r.Context(), q, count)
	if err != nil {
		log.Printf("searchCities error: %v", err)
		w.WriteHeader(http.StatusInternalServerError)
		if _, err := w.Write([]byte("internal error")); err != nil {
			log.Println("write response error:", err)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(results); err != nil {
		log.Printf("json encode error: %v", err)
	}
}

func (h *Handler) getCity(w http.ResponseWriter, r *http.Request) {
	city := chi.URLParam(r, "city")

	reading, err := h.svc.GetReading(r.Context(), city)
	if err != nil {
		if err == meteo.ErrCityNotFound {
			w.WriteHeader(http.StatusNotFound)
			if _, err := w.Write([]byte("city not found")); err != nil {
				log.Println("write response error:", err)
			}
			return
		}
		log.Printf("getCity error for %s: %v\n", city, err)
		w.WriteHeader(http.StatusInternalServerError)
		if _, err := w.Write([]byte("internal error")); err != nil {
			log.Println("write response error:", err)
		}
		
		return
	}

	raw, err := json.Marshal(reading)
	if err != nil {
		log.Println(err)
		w.WriteHeader(http.StatusInternalServerError)
		if _, err := w.Write([]byte("json marshall error")); err != nil {
			log.Println("write response error:", err)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if _, err := w.Write(raw); err != nil {
		log.Println("write response error:", err)
	}
}
