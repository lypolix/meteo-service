package geocoding

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"  // ДОБАВЬ этот импорт
)

type Client struct {
	httpClient *http.Client
}

type Response struct {
	Name      string  `json:"name"`
	Country   string  `json:"country"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
}

func NewClient(httpClient *http.Client) *Client {
	return &Client{
		httpClient: httpClient,
	}
}

// GetCoords возвращает первый найденный город (для получения погоды)
func (c *Client) GetCoords(city string) ([]Response, error) {
	return c.searchCities(city, 1)
}

// SearchCities возвращает несколько результатов (для автодополнения)
func (c *Client) SearchCities(city string, count int) ([]Response, error) {
	return c.searchCities(city, count)
}

// Общая функция поиска
func (c *Client) searchCities(city string, count int) ([]Response, error) {
	encodedCity := url.QueryEscape(city)
	
	apiURL := fmt.Sprintf(
		"https://geocoding-api.open-meteo.com/v1/search?name=%s&count=%d&language=en&format=json",
		encodedCity,
		count,
	)

	res, err := c.httpClient.Get(apiURL)
	if err != nil {
		return []Response{}, err
	}
	defer res.Body.Close()

	// Если 403, возвращаем пустой массив (не ошибку)
	if res.StatusCode == http.StatusForbidden {
		return []Response{}, nil
	}

	if res.StatusCode != http.StatusOK {
		return []Response{}, fmt.Errorf("status code %d", res.StatusCode)
	}

	var geoResp struct {
		Results []Response `json:"results"`
	}

	err = json.NewDecoder(res.Body).Decode(&geoResp)
	if err != nil {
		return []Response{}, err
	}

	if geoResp.Results == nil {
		return []Response{}, nil
	}

	return geoResp.Results, nil
}

