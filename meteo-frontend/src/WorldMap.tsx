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

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Увеличенный список городов
const cityCoordinates = [
  // Европа
  { name: "Москва", value: "moscow", coordinates: [37.6173, 55.7558] },
  { name: "Лондон", value: "london", coordinates: [-0.1278, 51.5074] },
  { name: "Париж", value: "paris", coordinates: [2.3522, 48.8566] },
  { name: "Берлин", value: "berlin", coordinates: [13.4050, 52.5200] },
  { name: "Рим", value: "rome", coordinates: [12.4964, 41.9028] },
  { name: "Мадрид", value: "madrid", coordinates: [-3.7038, 40.4168] },
  { name: "Амстердам", value: "amsterdam", coordinates: [4.9041, 52.3676] },
  { name: "Прага", value: "prague", coordinates: [14.4378, 50.0755] },
  { name: "Вена", value: "vienna", coordinates: [16.3738, 48.2082] },
  { name: "Варшава", value: "warsaw", coordinates: [21.0122, 52.2297] },
  { name: "Киев", value: "kyiv", coordinates: [30.5234, 50.4501] },
  { name: "Стамбул", value: "istanbul", coordinates: [28.9784, 41.0082] },
  { name: "Афины", value: "athens", coordinates: [23.7275, 37.9838] },
  { name: "Стокгольм", value: "stockholm", coordinates: [18.0686, 59.3293] },
  { name: "Осло", value: "oslo", coordinates: [10.7522, 59.9139] },
  
  // Северная Америка
  { name: "Нью-Йорк", value: "new york", coordinates: [-74.0060, 40.7128] },
  { name: "Лос-Анджелес", value: "los angeles", coordinates: [-118.2437, 34.0522] },
  { name: "Чикаго", value: "chicago", coordinates: [-87.6298, 41.8781] },
  { name: "Торонто", value: "toronto", coordinates: [-79.3832, 43.6532] },
  { name: "Ванкувер", value: "vancouver", coordinates: [-123.1207, 49.2827] },
  { name: "Мексико", value: "mexico city", coordinates: [-99.1332, 19.4326] },
  
  // Азия
  { name: "Токио", value: "tokyo", coordinates: [139.6503, 35.6762] },
  { name: "Пекин", value: "beijing", coordinates: [116.4074, 39.9042] },
  { name: "Шанхай", value: "shanghai", coordinates: [121.4737, 31.2304] },
  { name: "Сеул", value: "seoul", coordinates: [126.9780, 37.5665] },
  { name: "Дели", value: "delhi", coordinates: [77.2090, 28.6139] },
  { name: "Мумбаи", value: "mumbai", coordinates: [72.8777, 19.0760] },
  { name: "Бангкок", value: "bangkok", coordinates: [100.5018, 13.7563] },
  { name: "Сингапур", value: "singapore", coordinates: [103.8198, 1.3521] },
  { name: "Дубай", value: "dubai", coordinates: [55.2708, 25.2048] },
  
  // Южная Америка
  { name: "Сан-Паулу", value: "sao paulo", coordinates: [-46.6333, -23.5505] },
  { name: "Рио-де-Жанейро", value: "rio de janeiro", coordinates: [-43.1729, -22.9068] },
  { name: "Буэнос-Айрес", value: "buenos aires", coordinates: [-58.3816, -34.6037] },
  { name: "Лима", value: "lima", coordinates: [-77.0428, -12.0464] },
  
  // Африка
  { name: "Каир", value: "cairo", coordinates: [31.2357, 30.0444] },
  { name: "Йоханнесбург", value: "johannesburg", coordinates: [28.0473, -26.2041] },
  { name: "Найроби", value: "nairobi", coordinates: [36.8219, -1.2921] },
  { name: "Лагос", value: "lagos", coordinates: [3.3792, 6.5244] },
  
  // Австралия и Океания
  { name: "Сидней", value: "sydney", coordinates: [151.2093, -33.8688] },
  { name: "Мельбурн", value: "melbourne", coordinates: [144.9631, -37.8136] },
  { name: "Окленд", value: "auckland", coordinates: [174.7645, -36.8509] },
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
        Интерактивная карта мира ({cityCoordinates.length} городов)
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
            <Geographies geography={geoUrl}>
              {({ geographies }: any) =>
                geographies.map((geo: any) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#E6E6E6"
                    stroke="#D6D6DA"
                    strokeWidth={0.3}
                    style={{
                      default: { outline: "none" },
                      hover: { 
                        fill: "#F5F5F5", 
                        outline: "none",
                        stroke: "#999",
                        strokeWidth: 0.5
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
            
            {cityCoordinates.map((city) => (
              <Marker
                key={city.value}
                coordinates={city.coordinates as [number, number]}
              >
                <circle
                  r={currentCity === city.value ? 5 : 3}
                  fill={currentCity === city.value ? "#f44336" : "#2196f3"}
                  stroke="#fff"
                  strokeWidth={1}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
                  }}
                  onClick={() => setCity(city.value)}
                />
                {currentCity === city.value && (
                  <text
                    textAnchor="middle"
                    y={-8}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fill: "#333",
                      fontSize: "10px",
                      fontWeight: "bold",
                      pointerEvents: "none",
                      textShadow: "1px 1px 2px white",
                    }}
                  >
                    {city.name}
                  </text>
                )}
              </Marker>
            ))}
          </ZoomableGroup>
        </ComposableMap>
      </Box>

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
              width: 8, 
              height: 8, 
              backgroundColor: "#2196f3", 
              borderRadius: "50%",
              border: "1px solid white"
            }} />
            <Typography variant="caption">Город</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ 
              width: 8, 
              height: 8, 
              backgroundColor: "#f44336", 
              borderRadius: "50%",
              border: "1px solid white"
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