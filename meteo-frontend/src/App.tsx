import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import CloudIcon from "@mui/icons-material/Cloud";
import CitySelector from "./CitySelector";
import WeatherDisplay from "./WeatherDisplay";
import PopularCityCards from "./PopularCityCards";
import WorldMap from "./WorldMap";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#6366f1" },
    secondary: { main: "#ec4899" },
    background: { default: "#f8fafc" },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [city, setCity] = useState("moscow");
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <Paper
            elevation={24}
            sx={{
              p: 4,
              borderRadius: 4,
              background: "rgba(255,255,255,0.95)",
              backdropFilter: "blur(10px)",
              mb: 3,
            }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <CloudIcon sx={{ fontSize: 60, color: "#6366f1", mb: 2 }} />
              <Typography
                variant="h3"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Погода сейчас
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Актуальная информация о погоде в любой точке мира
              </Typography>
            </Box>

            <CitySelector city={city} setCity={setCity} />
            <WeatherDisplay city={city} />

            <Divider sx={{ my: 4 }} />
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: "#6366f1",
              }}
            >
              Популярные города
            </Typography>
            <PopularCityCards setCity={setCity} currentCity={city} />

            <Divider sx={{ my: 4 }} />
            <Typography
              variant="h5"
              sx={{
                mb: 2,
                fontWeight: 700,
                color: "#6366f1",
              }}
            >
              Интерактивная карта
            </Typography>
            <WorldMap setCity={setCity} currentCity={city} />
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
}
export default App;