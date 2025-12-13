import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Typography,
  Container,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import SecurityIcon from '@mui/icons-material/Security';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin } = useAdminAuth();
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setUsername('');
    setPassword('');
    setMessage('');
    setMessageType('error');
    setLoading(false);
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
    setLoading(true);

    try {
      const data = await AdminService.login(username, password);
      loginAdmin(data);
    } catch (error) {
      console.error('Admin login error:', error);
      let errorMsg = 'Something went wrong during admin login.';
      if (error && typeof error === 'object') {
        if (error.message) errorMsg = error.message;
        else if (typeof error === 'string') errorMsg = error;
      } else if (typeof error === 'string') {
        errorMsg = error;
      }
      setMessage(errorMsg);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
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
        }}
      />
      <Box
        sx={{
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
        }}
      />

      <Container maxWidth="sm">
        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 4,
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
            borderRadius: 4,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(8px)',
            zIndex: 1,
            opacity: animateContent ? 1 : 0,
            transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 1s ease-out, transform 1s ease-out',
          }}
        >
          <SecurityIcon sx={{ fontSize: 70, mb: 2, color: 'primary.main' }} />
          <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 700, color: 'primary.dark' }}>
            Admin Login
          </Typography>

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 2, width: '100%' }} autoComplete="off">
            {message && <Alert severity={messageType} sx={{ mb: 2, borderRadius: 2 }}>{message}</Alert>}

            <TextField
              margin="normal"
              required
              fullWidth
              id="adminUsername"
              label="Admin Username"
              name="adminUsername"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 }
              }}
              InputLabelProps={{
                sx: { fontWeight: 'medium' }
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="adminPassword"
              label="Password"
              id="adminPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              InputProps={{
                sx: { borderRadius: 2 },
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
              InputLabelProps={{
                sx: { fontWeight: 'medium' }
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 3,
                fontWeight: 'bold',
                py: 1.5,
                bgcolor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: 5,
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Login as Admin'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AdminLogin;
