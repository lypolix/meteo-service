import React, { useEffect, useState } from "react";
import { Box, Typography, Paper, IconButton, Card, CardContent, CircularProgress } from "@mui/material";
import { ChevronLeft, ChevronRight, Thermostat } from "@mui/icons-material";

interface PopularCityCardsProps {
  setCity: (city: string) => void;
  currentCity: string;
}

interface WeatherData {
  name: string;
  temperature: number;
  timestamp: string;
}

const popularCities = [
  { name: "Москва", value: "moscow" },
  { name: "Лондон", value: "london" },
  { name: "Париж", value: "paris" },
  { name: "Нью-Йорк", value: "new york" },
  { name: "Токио", value: "tokyo" },
  { name: "Берлин", value: "berlin" },
  { name: "Рим", value: "rome" },
  { name: "Мадрид", value: "madrid" },
  { name: "Сидней", value: "sydney" },
  { name: "Дубай", value: "dubai" },
  { name: "Сингапур", value: "singapore" },
  { name: "Торонто", value: "toronto" },
];

export default function PopularCityCards({ setCity, currentCity }: PopularCityCardsProps) {
  const [startIndex, setStartIndex] = useState(0);
  const [weatherData, setWeatherData] = useState<{ [key: string]: WeatherData }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});

  const visibleCities = popularCities.slice(startIndex, startIndex + 4);

  const fetchWeather = async (cityValue: string) => {
    setLoading(prev => ({ ...prev, [cityValue]: true }));
    try {
      const response = await fetch(`http://localhost:8080/${cityValue}`);
      if (response.ok) {
        const data: WeatherData = await response.json();
        setWeatherData(prev => ({ ...prev, [cityValue]: data }));
      }
    } catch (error) {
      console.error(`Error fetching weather for ${cityValue}:`, error);
    } finally {
      setLoading(prev => ({ ...prev, [cityValue]: false }));
    }
  };

  // Загружаем погоду для всех популярных городов при монтировании
  useEffect(() => {
    popularCities.forEach(city => {
      fetchWeather(city.value);
    });

    // Автообновление каждые 5 минут
    const interval = setInterval(() => {
      popularCities.forEach(city => {
        fetchWeather(city.value);
      });
    }, 300000);

    return () => clearInterval(interval);
  }, []);

  const handleNext = () => {
    setStartIndex(prev => Math.min(prev + 4, popularCities.length - 4));
  };

  const handlePrev = () => {
    setStartIndex(prev => Math.max(prev - 4, 0));
  };

  return (
    <Box sx={{ position: "relative" }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "primary.main" }}>
        Популярные города
      </Typography>
      
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <IconButton 
          onClick={handlePrev} 
          disabled={startIndex === 0}
          sx={{ 
            backgroundColor: "primary.main", 
            color: "white",
            "&:hover": { backgroundColor: "primary.dark" },
            "&:disabled": { backgroundColor: "action.disabled" }
          }}
        >
          <ChevronLeft />
        </IconButton>

        <Box sx={{ display: "flex", gap: 2, overflow: "hidden", flex: 1 }}>
          {visibleCities.map((city) => (
            <Card
              key={city.value}
              elevation={currentCity === city.value ? 8 : 2}
              sx={{
                minWidth: 200,
                cursor: "pointer",
                backgroundColor: currentCity === city.value ? "primary.main" : "background.paper",
                color: currentCity === city.value ? "primary.contrastText" : "text.primary",
                transition: "all 0.3s ease",
                transform: currentCity === city.value ? "translateY(-4px)" : "none",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 6,
                },
              }}
              onClick={() => setCity(city.value)}
            >
              <CardContent sx={{ textAlign: "center", p: 2 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {city.name}
                </Typography>
                
                {loading[city.value] ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={24} />
                    <Typography variant="body2">Загрузка...</Typography>
                  </Box>
                ) : weatherData[city.value] ? (
                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <Thermostat sx={{ fontSize: 20 }} />
                      <Typography variant="h5" fontWeight="bold">
                        {weatherData[city.value].temperature}°C
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      {new Date(weatherData[city.value].timestamp).toLocaleTimeString('ru-RU')}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Нет данных
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>

        <IconButton 
          onClick={handleNext} 
          disabled={startIndex >= popularCities.length - 4}
          sx={{ 
            backgroundColor: "primary.main", 
            color: "white",
            "&:hover": { backgroundColor: "primary.dark" },
            "&:disabled": { backgroundColor: "action.disabled" }
          }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", textAlign: "center" }}>
        Показано {startIndex + 1}-{Math.min(startIndex + 4, popularCities.length)} из {popularCities.length} городов
      </Typography>
    </Box>
  );
}