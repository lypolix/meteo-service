import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup
} from "react-simple-maps";

interface WorldMapProps {
  setCity: (city: string) => void;
  currentCity: string;
}

// URL для топографии мира
const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Координаты популярных городов [longitude, latitude]
const cityCoordinates = [
  { name: "Москва", value: "moscow", coordinates: [37.6173, 55.7558] },
  { name: "Лондон", value: "london", coordinates: [-0.1278, 51.5074] },
  { name: "Париж", value: "paris", coordinates: [2.3522, 48.8566] },
  { name: "Нью-Йорк", value: "new york", coordinates: [-74.0060, 40.7128] },
  { name: "Токио", value: "tokyo", coordinates: [139.6503, 35.6762] },
  { name: "Берлин", value: "berlin", coordinates: [13.4050, 52.5200] },
  { name: "Рим", value: "rome", coordinates: [12.4964, 41.9028] },
  { name: "Мадрид", value: "madrid", coordinates: [-3.7038, 40.4168] },
];

export default function WorldMap({ setCity, currentCity }: WorldMapProps) {
  return (
    <Paper
      sx={{
        height: "500px",
        borderRadius: 2,
        overflow: "hidden",
        position: "relative",
        background: "white",
      }}
    >
      <Typography 
        variant="h6" 
        sx={{ 
          p: 2, 
          backgroundColor: "primary.main", 
          color: "white",
          textAlign: "center",
          fontWeight: 600
        }}
      >
        Интерактивная карта мира
      </Typography>
      
      <Box sx={{ height: "calc(100% - 64px)", width: "100%" }}>
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{
            scale: 100,
            center: [0, 20],
          }}
          style={{ 
            width: "100%", 
            height: "100%",
            backgroundColor: "#e3f2fd"
          }}
        >
          <ZoomableGroup center={[0, 20]} zoom={1}>
            {/* Страны мира */}
            <Geographies geography={geoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#E6E6E6"
                    stroke="#D6D6DA"
                    strokeWidth={0.5}
                    style={{
                      default: { outline: "none" },
                      hover: { 
                        fill: "#F5F5F5", 
                        outline: "none",
                        stroke: "#999",
                        strokeWidth: 1
                      },
                      pressed: { 
                        fill: "#E6E6E6", 
                        outline: "none" 
                      },
                    }}
                  />
                ))
              }
            </Geographies>
            
            {/* Маркеры городов */}
            {cityCoordinates.map((city) => (
              <Marker
                key={city.value}
                coordinates={city.coordinates as [number, number]}
              >
                <circle
                  r={currentCity === city.value ? 8 : 6}
                  fill={currentCity === city.value ? "#f44336" : "#2196f3"}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))"
                  }}
                  onClick={() => setCity(city.value)}
                />
                <text
                  textAnchor="middle"
                  y={-12}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fill: "#333",
                    fontSize: "12px",
                    fontWeight: "bold",
                    pointerEvents: "none",
                    textShadow: "1px 1px 2px white",
                  }}
                >
                  {city.name}
                </text>
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </Box>

      {/* Легенда */}
      <Paper
        sx={{
          position: "absolute",
          bottom: "60px",
          left: "20px",
          p: 2,
          backgroundColor: "rgba(255,255,255,0.95)",
          borderRadius: 2,
          boxShadow: 3,
          maxWidth: "200px",
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Легенда:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              backgroundColor: "#2196f3", 
              borderRadius: "50%",
              border: "2px solid white"
            }} />
            <Typography variant="caption">Город</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ 
              width: 12, 
              height: 12, 
              backgroundColor: "#f44336", 
              borderRadius: "50%",
              border: "2px solid white"
            }} />
            <Typography variant="caption">Выбранный</Typography>
          </Box>
        </Box>
      </Paper>
      
      <Typography 
        variant="body2" 
        sx={{ 
          position: "absolute", 
          bottom: 8, 
          left: 0, 
          right: 0, 
          textAlign: "center",
          backgroundColor: "rgba(255,255,255,0.9)",
          p: 1,
          fontWeight: 500
        }}
      >
        Нажмите на маркер города для просмотра погоды • Используйте колесо мыши для масштабирования
      </Typography>
    </Paper>
  );
}