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

// Create a custom Material UI theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', // A shade of blue for primary elements
    },
    secondary: {
      main: '#f50057', // A shade of pink for secondary elements
    },
    info: { // <-- ADDED: Info color for general informational elements like the boxes in Home.js
      main: '#2196f3',
      light: '#64b5f6', // Lighter shade for backgrounds
      contrastText: '#fff' // White text on info backgrounds
    }
  },
  typography: {
    fontFamily: [
      'Inter', // <-- UPDATED: Added 'Inter' as the primary font
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: { // <-- ADDED: Component-level style overrides
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none', // Prevents button text from being all uppercase
        },
      },
    },
    // You can add more component overrides here if needed
  },
});

// PrivateRoute component to protect routes
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

// ProfileRequiredRoute to ensure profile is completed
const ProfileRequiredRoute = ({ children }) => {
  const { user, loading } = useAuth();

  console.log('ProfileRequiredRoute - user:', user); // Debug log
  console.log('ProfileRequiredRoute - loading:', loading); // Debug log

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // If user is logged in but profile not completed, redirect to profile update
  if (user && !user.profileCompleted) {
    console.log('ProfileRequiredRoute - redirecting to profile-update'); // Debug log
    return <Navigate to="/profile-update" replace />;
  }

  // Otherwise, if logged in and profile completed, allow access to children
  // Or if not logged in, PrivateRoute will handle redirect to login
  console.log('ProfileRequiredRoute - allowing access to children'); // Debug log
  return user ? children : <Navigate to="/login" replace />;
};


function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Provides a consistent baseline to build on. */}
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<FlashScreen />} />
            <Route path="/home" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
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
                <ReportIssue /> {/* Re-use ReportIssue component for editing */}
              </ProfileRequiredRoute>
            } />

            {/* Redirect any unmatched routes to home or login */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;