import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import FlashScreen from './components/FlashScreen';
import Home from './pages/Home';
import Register from './pages/Auth/Register';
import Login from './pages/Auth/Login';
import ProfileUpdate from './pages/User/ProfileUpdate';
import UserDashboard from './pages/User/UserDashboard';
import ReportIssue from './pages/User/ReportIssue';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    info: {
      main: '#2196f3',
      light: '#64b5f6',
      contrastText: '#fff'
    }
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
};

const ProfileRequiredRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProfileRequiredRoute - user:', user);
  console.log('ProfileRequiredRoute - loading:', loading);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (user && !user.profileCompleted) {
    console.log('ProfileRequiredRoute - redirecting to profile-update');
    return <Navigate to="/profile-update" replace />;
  }

  console.log('ProfileRequiredRoute - allowing access to children');
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<FlashScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            <Route path="/profile-update" element={
              <PrivateRoute>
                <ProfileUpdate />
              </PrivateRoute>
            } />

            <Route path="/dashboard" element={
              <ProfileRequiredRoute>
                <UserDashboard />
              </ProfileRequiredRoute>
            } />

            <Route path="/report-issue" element={
              <ProfileRequiredRoute>
                <ReportIssue />
              </ProfileRequiredRoute>
            } />

            <Route path="/edit-issue/:id" element={
              <ProfileRequiredRoute>
                <ReportIssue />
              </ProfileRequiredRoute>
            } />

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
