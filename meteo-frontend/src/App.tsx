import React, { useState } from 'react';
import { Container, Typography, Paper, Box } from '@mui/material';
import CitySelector from './CitySelector';
import WeatherDisplay from './WeatherDisplay';

function App() {
  const [city, setCity] = useState('moscow');

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper elevation={4} sx={{ p: 3 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Погода сейчас
        </Typography>

        <CitySelector city={city} setCity={setCity} />

        <Box mt={3}>
          <WeatherDisplay city={city} />
        </Box>
      </Paper>
    </Container>
  );
}

export default App;
