import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Alert } from '@mui/material';

interface WeatherData {
  Name: string;
  Temperature: number;
  Timestamp: string;
}

interface WeatherDisplayProps {
  city: string;
}

export default function WeatherDisplay({ city }: WeatherDisplayProps) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    setData(null);

    fetch(`http://localhost:3000/${city}`)
      .then((resp) => {
        if (!resp.ok) throw new Error('Данные не найдены');
        return resp.json();
      })
      .then((json) => {
        setData(json);
      })
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [city]);

  if (loading) {
    return (
      <Card>
        <CardContent style={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body2" mt={2}>Загрузка...</Typography>
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

  const dateFormatted = new Date(data.Timestamp).toLocaleString();

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Погода в {data.Name.charAt(0).toUpperCase() + data.Name.slice(1)}
        </Typography>
        <Typography variant="body1">Температура: {data.Temperature}°C</Typography>
        <Typography variant="body2" color="text.secondary">
          Обновлено: {dateFormatted}
        </Typography>
      </CardContent>
    </Card>
  );
}
