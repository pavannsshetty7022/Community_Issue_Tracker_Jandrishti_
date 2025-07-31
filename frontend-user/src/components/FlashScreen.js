// frontend-user/src/components/FlashScreen.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Box } from '@mui/material';
import EngineeringIcon from '@mui/icons-material/Engineering'; // Example logo icon

const FlashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home'); // Redirect to home after 3 seconds
    }, 3000); // 3 seconds

    return () => clearTimeout(timer); // Cleanup timer
  }, [navigate]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f0f2f5', // Light grey background
        color: '#3f51b5', // Material UI primary blue
      }}
    >
      <EngineeringIcon sx={{ fontSize: 100, mb: 2 }} /> {/* Larger icon */}
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