import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const cities = ['moscow', 'petersburg', 'kazan', 'novosibirsk', 'yekaterinburg'];

interface CitySelectorProps {
  city: string;
  setCity: (city: string) => void;
}

export default function CitySelector({ city, setCity }: CitySelectorProps) {
  return (
    <FormControl fullWidth>
      <InputLabel id="city-select-label">Выберите город</InputLabel>
      <Select
        labelId="city-select-label"
        value={city}
        label="Выберите город"
        onChange={(e) => setCity(e.target.value)}
      >
        {cities.map((c) => (
          <MenuItem key={c} value={c}>
            {c.charAt(0).toUpperCase() + c.slice(1)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
