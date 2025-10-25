import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Box,
  Divider,
  IconButton,
} from '@mui/material';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RefreshIcon from '@mui/icons-material/Refresh';

interface WeatherData {
  name: string;
  temperature: number;
  timestamp: string;
}

interface WeatherDisplayProps {
  city: string;
}

export default function WeatherDisplay({ city }: WeatherDisplayProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = async () => {
    if (!city) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:8080/${city}`);
      if (!response.ok) throw new Error('Данные не найдены');
      
      const json: WeatherData = await response.json();
      setData(json);
      setLastUpdated(new Date());
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Загружаем погоду при изменении города
  useEffect(() => {
    fetchWeather();
  }, [city]);

  // Автообновление каждые 2 минуты
  useEffect(() => {
    const interval = setInterval(() => {
      if (city) {
        fetchWeather();
      }
    }, 120000); // 2 минуты

    return () => clearInterval(interval);
  }, [city]);

  if (loading && !data) {
    return (
      <Card
        sx={{
          mt: 4,
          p: 3,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        }}
      >
        <CircularProgress size={60} />
        <Typography sx={{ mt: 2 }} variant="h6" color="text.secondary">
          Загрузка данных...
        </Typography>
      </Card>
    );
  }

  if (error && !data) {
    return (
      <Alert 
        severity="error" 
        sx={{ mt: 4, borderRadius: 3 }}
        action={
          <IconButton color="inherit" size="small" onClick={fetchWeather}>
            <RefreshIcon />
          </IconButton>
        }
      >
        Ошибка: {error}
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  const cityName = data.name
    ? data.name.charAt(0).toUpperCase() + data.name.slice(1)
    : 'Неизвестный город';

  const dateFormatted = new Date(data.timestamp).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const timeSinceUpdate = lastUpdated ? 
    Math.round((new Date().getTime() - lastUpdated.getTime()) / 1000 / 60) : 0;

  return (
    <Card
      elevation={0}
      sx={{
        mt: 4,
        borderRadius: 4,
        background: 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent sx={{ p: 4, position: 'relative' }}>
        {/* Кнопка обновления */}
        <IconButton
          onClick={fetchWeather}
          disabled={loading}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          <RefreshIcon />
        </IconButton>

        {/* Название города */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationOnIcon sx={{ fontSize: 32, color: '#6366f1', mr: 1 }} />
          <Typography variant="h4" component="h2" fontWeight={600}>
            {cityName}
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Температура */}
        <Box sx={{ textAlign: 'center', my: 4 }}>
          <ThermostatIcon sx={{ fontSize: 80, color: '#ec4899', mb: 2 }} />
          <Typography
            variant="h1"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {data.temperature}°C
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Время обновления */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AccessTimeIcon sx={{ fontSize: 20, color: 'text.secondary', mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              Обновлено: {dateFormatted}
            </Typography>
          </Box>
          {timeSinceUpdate > 0 && (
            <Typography variant="caption" color="text.secondary">
              ({timeSinceUpdate} мин. назад)
            </Typography>
          )}
          {loading && (
            <CircularProgress size={16} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}