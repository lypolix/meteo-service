package geocoding

import (
	"encoding/json"
	"fmt"
	"net/http"
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

func (c *Client) GetCoords(city string) ([]Response, error) {
	res, err := c.httpClient.Get(fmt.Sprintf("https://geocoding-api.open-meteo.com/v1/search?name=%s&count=1&language=ru&format=json", city))
	if err != nil {
		return []Response{}, err
	}

	defer res.Body.Close()
	
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

	return geoResp.Results, nil

}
