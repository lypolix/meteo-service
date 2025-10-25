import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';

interface WeatherData {
  name: string;        // изменено: lowercase для консистентности с бэкендом
  temperature: number; // изменено: lowercase
  timestamp: string;   // изменено: lowercase
}

interface WeatherDisplayProps {
  city: string;
}

export default function WeatherDisplay({ city }: WeatherDisplayProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!city) return; // Защита от пустого города

    setLoading(true);
    setError('');
    setData(null);

    // Исправлен порт: 8080 вместо 3000
    fetch(`http://localhost:8080/${city}`)
      .then((resp) => {
        if (!resp.ok) throw new Error('Данные не найдены');
        return resp.json();
      })
      .then((json: WeatherData) => {
        setData(json);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Загрузка...</Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return <Alert severity="error">Ошибка: {error}</Alert>;
  }

  if (!data) {
    return null;
  }

  // Защита от undefined/null в data.name
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

  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h5" component="h2" gutterBottom>
          Погода в {cityName}
        </Typography>
        <Typography variant="h3" color="primary" gutterBottom>
          {data.temperature}°C
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Обновлено: {dateFormatted}
        </Typography>
      </CardContent>
    </Card>
  );
}
