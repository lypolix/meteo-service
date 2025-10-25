import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Autocomplete, 
  Box, 
  Chip, 
  CircularProgress 
} from '@mui/material';

const popularCities = [
  'Moscow',
  'London',
  'Paris',
  'New York',
  'Tokyo',
  'Berlin',
  'Rome',
  'Madrid'
];

interface City {
  name: string;
  country: string;
  latitude: number;
  longitude: number;
}

interface CitySelectorProps {
  city: string;
  setCity: (city: string) => void;
}

export default function CitySelector({ city, setCity }: CitySelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);

  // Автодополнение при вводе
  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    
    const timer = setTimeout(() => {
      fetch(`http://localhost:8080/cities/search?q=${encodeURIComponent(inputValue)}`)
        .then((resp) => resp.json())
        .then((data: City[]) => {
          setOptions(data || []);
        })
        .catch((err) => {
          console.error('City search error:', err);
          setOptions([]);
        })
        .finally(() => setLoading(false));
    }, 300); // debounce 300ms

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <Box>
      <Autocomplete
        freeSolo
        options={options}
        loading={loading}
        inputValue={inputValue}
        onInputChange={(_, newValue) => setInputValue(newValue)}
        onChange={(_, newValue) => {
          if (typeof newValue === 'string') {
            setCity(newValue.toLowerCase());
          } else if (newValue && 'name' in newValue) {
            setCity(newValue.name.toLowerCase());
          }
        }}
        getOptionLabel={(option) => {
          if (typeof option === 'string') return option;
          return `${option.name}, ${option.country}`;
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Введите название города"
            variant="outlined"
            InputProps={{
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
      />

      {/* Популярные города */}
      <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {popularCities.map((cityName) => (
          <Chip
            key={cityName}
            label={cityName}
            onClick={() => {
              setCity(cityName.toLowerCase());
              setInputValue(cityName);
            }}
            color={city === cityName.toLowerCase() ? 'primary' : 'default'}
            variant={city === cityName.toLowerCase() ? 'filled' : 'outlined'}
          />
        ))}
      </Box>
    </Box>
  );
}
