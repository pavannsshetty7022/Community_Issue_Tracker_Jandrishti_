import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import EngineeringIcon from '@mui/icons-material/Engineering';

const FlashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5',
        color: '#3f51b5',
      }}
    >
      <EngineeringIcon sx={{ fontSize: 100, mb: 2 }} />
      <Typography variant="h3" component="h1" gutterBottom>
        Jan Drishti
      </Typography>
      <Typography variant="h6">
        Community Issue Tracker
      </Typography>
    </Box>
  );
};

export default FlashScreen;
