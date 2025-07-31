import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Grid, Card, CardContent
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DescriptionIcon from '@mui/icons-material/Description';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import EngineeringIcon from '@mui/icons-material/Engineering'; // Consistent branding icon

const Home = () => {
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateContent(true);
  }, []);

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Animated gradient circles for background effect */}
      <Box sx={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #90caf9 0%, #e0e7ff 80%)',
        opacity: 0.4,
        zIndex: 0,
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite',
        '@keyframes float': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(40px)' },
          '100%': { transform: 'translateY(0)' },
        },
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-120px',
        right: '-120px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f48fb1 0%, #f5f7fa 80%)',
        opacity: 0.3,
        zIndex: 0,
        filter: 'blur(40px)',
        animation: 'float2 10s ease-in-out infinite',
        '@keyframes float2': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
          '100%': { transform: 'translateY(0)' },
        },
      }} />

      <AppBar position="sticky" sx={{
        bgcolor: 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        zIndex: 2,
        height: { xs: 72, md: 96 },
        justifyContent: 'center',
      }}>
        <Toolbar sx={{ minHeight: { xs: 72, md: 96 }, px: { xs: 2, md: 6 } }}>
          <EngineeringIcon sx={{ mr: 2, color: 'primary.main', fontSize: { xs: 40, md: 56 } }} />
          <Typography variant="h4" component="div" sx={{ flexGrow: 1, fontWeight: 800, color: 'primary.dark', letterSpacing: 2, fontSize: { xs: 28, md: 36 } }}>
            Jan Drishti
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/login"
            startIcon={<LoginIcon />}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 3,
              fontWeight: 'bold',
              mr: 2,
              px: 3,
              py: 1,
              fontSize: { xs: 16, md: 18 },
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: 3,
              },
            }}
          >
            Login
          </Button>
          <Button
            color="inherit"
            component={Link}
            to="/register"
            startIcon={<PersonAddIcon />}
            sx={{
              color: 'primary.main',
              borderColor: 'primary.main',
              fontWeight: 'bold',
              border: '2px solid',
              borderRadius: 3,
              px: 3,
              py: 1,
              fontSize: { xs: 16, md: 18 },
              '&:hover': {
                bgcolor: 'primary.light',
                borderColor: 'primary.dark',
                boxShadow: 3,
              },
            }}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{
        mt: 8,
        mb: 8,
        zIndex: 1,
        opacity: animateContent ? 1 : 0,
        transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
        flexGrow: 1,
      }}>
        <Typography variant="h3" component="h1" align="center" gutterBottom sx={{
          fontWeight: 700, // Kept bold
          color: 'primary.dark',
          mb: 4, // Slightly reduced margin bottom
          textShadow: '1px 1px 2px rgba(0,0,0,0.05)',
          fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.5rem' } // Responsive font sizes
        }}>
          Bridging Communities, Solving Problems
        </Typography>
        <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{
          mb: 6,
          fontWeight: 500, // Slightly bolder for prominence
          fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' } // Responsive font sizes
        }}>
          Jan Drishti is your platform to report local issues and track their resolution, empowering citizens for a better community.
        </Typography>

        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.9)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              },
            }}>
              <DescriptionIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                Report Issues Easily
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ fontWeight: 400 }}> {/* Explicitly set for clarity */}
                Quickly submit issues like potholes, street light outages, or garbage problems with detailed descriptions.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.9)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              },
            }}>
              <CheckCircleOutlineIcon sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                Track Progress
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ fontWeight: 400 }}>
                Monitor the status of your reported issues in real-time as they move from 'open' to 'resolved'.
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.9)',
              transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
              },
            }}>
              <NotificationsActiveIcon sx={{ fontSize: 60, color: 'info.main', mb: 2 }} />
              <Typography variant="h6" component="h3" gutterBottom align="center" sx={{ fontWeight: 600 }}>
                Stay Informed
              </Typography>
              <Typography variant="body1" color="text.secondary" align="center" sx={{ fontWeight: 400 }}>
                Receive live updates on new issues and status changes, keeping the community connected.
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Button
            variant="contained"
            component={Link}
            to="/register"
            size="large"
            sx={{
              borderRadius: 3,
              fontWeight: 'bold',
              px: 4,
              py: 1.5,
              bgcolor: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: 5,
              },
            }}
          >
            Join Jan Drishti Today!
          </Button>
        </Box>
      </Container>

      {/* Footer */}
      <Box sx={{
        py: 3,
        bgcolor: 'rgba(50, 50, 50, 0.8)',
        backdropFilter: 'blur(5px)',
        color: 'white',
        textAlign: 'center',
        mt: 'auto',
        zIndex: 2,
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
      }}>
        <Container maxWidth="lg">
          <Typography variant="body2" sx={{ fontWeight: 400 }}>
            © {new Date().getFullYear()} Jan Drishti. All rights reserved.
          </Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block', fontWeight: 300 }}>
            Powered by Community Spirit and Modern Technology.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;