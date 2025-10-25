import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  CircularProgress,
  Paper,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const popularCities = [
  { label: 'Москва', value: 'moscow' },
  { label: 'Лондон', value: 'london' },
  { label: 'Париж', value: 'paris' },
  { label: 'Нью-Йорк', value: 'new york' },
  { label: 'Токио', value: 'tokyo' },
  { label: 'Берлин', value: 'berlin' },
  { label: 'Рим', value: 'rome' },
  { label: 'Мадрид', value: 'madrid' },
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

  useEffect(() => {
    if (inputValue.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);

    const timer = setTimeout(() => {
      fetch(
        `http://localhost:8080/cities/search?q=${encodeURIComponent(inputValue)}`
      )
        .then((resp) => resp.json())
        .then((data: City[]) => {
          setOptions(data || []);
        })
        .catch((err) => {
          console.error('City search error:', err);
          setOptions([]);
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue]);

  return (
    <Box>
      {/* Поисковая строка */}
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
        PaperComponent={({ children }) => (
          <Paper elevation={8} sx={{ mt: 1 }}>
            {children}
          </Paper>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Введите название города"
            variant="outlined"
            fullWidth
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 3,
                backgroundColor: 'white',
              },
            }}
            InputProps={{
              ...params.InputProps,
              startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
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
      <Box sx={{ mt: 3 }}>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: 'center',
          }}
        >
          {popularCities.map((cityItem) => (
            <Chip
              key={cityItem.value}
              label={cityItem.label}
              onClick={() => {
                setCity(cityItem.value);
                setInputValue(cityItem.label);
              }}
              color={city === cityItem.value ? 'primary' : 'default'}
              variant={city === cityItem.value ? 'filled' : 'outlined'}
              sx={{
                fontWeight: city === cityItem.value ? 600 : 400,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 2,
                },
              }}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
