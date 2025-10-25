import React from "react";
import { Box, Typography, Paper } from "@mui/material";

interface PopularCityCardsProps {
  setCity: (city: string) => void;
  currentCity: string;
}

export default function PopularCityCards({ setCity, currentCity }: PopularCityCardsProps) {
  const cities = [
    { name: "Москва", value: "moscow" },
    { name: "Лондон", value: "london" },
    { name: "Париж", value: "paris" },
    { name: "Нью-Йорк", value: "new york" },
    { name: "Токио", value: "tokyo" },
    { name: "Берлин", value: "berlin" },
    { name: "Рим", value: "rome" },
    { name: "Мадрид", value: "madrid" },
  ];

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 2,
      }}
    >
      {cities.map((city) => (
        <Paper
          key={city.value}
          elevation={currentCity === city.value ? 8 : 2}
          sx={{
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            backgroundColor: currentCity === city.value 
              ? "primary.main" 
              : "background.paper",
            color: currentCity === city.value ? "primary.contrastText" : "text.primary",
            "&:hover": {
              backgroundColor: currentCity === city.value 
                ? "primary.dark" 
                : "action.hover",
              transform: "translateY(-4px)",
            },
            transition: "all 0.3s ease",
            borderRadius: 2,
          }}
          onClick={() => setCity(city.value)}
        >
          <Typography variant="h6" fontWeight="bold">
            {city.name}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
}