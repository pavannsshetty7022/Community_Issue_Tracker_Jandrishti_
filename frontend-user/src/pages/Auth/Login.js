import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import EngineeringIcon from '@mui/icons-material/Engineering';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [showPassword, setShowPassword] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);
  const { login } = useAuth();

  useEffect(() => {
    setUsername('');
    setPassword('');
    setMessage('');
    setMessageType('error');
    setShowPassword(false);
    setAnimateContent(true);
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('error');

    try {
      const data = await AuthService.login(username, password);
      login(data);
    } catch (error) {
      console.error('Login error:', error);
      let errorMsg = 'Something went wrong during login.';
      if (error && typeof error === 'object') {
        if (error.message) errorMsg = error.message;
        else if (typeof error === 'string') errorMsg = error;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      setMessage(errorMsg);
      setMessageType('error');
    }
  };

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      p: { xs: 2, sm: 4 },
    }}>
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

      <Container maxWidth="sm" sx={{
        zIndex: 1,
        opacity: animateContent ? 1 : 0,
        transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
      }}>
        <Box
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: { xs: 3, md: 6 },
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.18)',
            borderRadius: 8,
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <EngineeringIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'primary.dark' }}>
            Login to Jan Drishti
          </Typography>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 3, width: '100%' }} autoComplete="off">
            {message && <Alert severity={messageType} sx={{ mb: 2 }}>{message}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{ mb: 3 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 2,
                mb: 2,
                borderRadius: 5,
                boxShadow: 6,
                fontWeight: 900,
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(90deg, #42a5f5 0%, #7e57c2 100%)',
                color: '#fff',
                transition: 'box-shadow 0.3s, transform 0.3s',
                '&:hover': {
                  boxShadow: 12,
                  background: 'linear-gradient(90deg, #7e57c2 0%, #42a5f5 100%)',
                  transform: 'scale(1.03)',
                },
              }}
            >
              Login
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 2 }}>
              Don't have an account? <Link to="/register" style={{ textDecoration: 'none', color: '#3f51b5', fontWeight: 'bold' }}>Register</Link>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
