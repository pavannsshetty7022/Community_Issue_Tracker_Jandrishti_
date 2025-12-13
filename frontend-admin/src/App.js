
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import useDocumentTitle from './utils/useDocumentTitle';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3f51b5', 
    },
    secondary: {
      main: '#f50057', 
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});


const AdminPrivateRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return admin ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  useDocumentTitle();

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={
        <AdminPrivateRoute>
          <AdminDashboard />
        </AdminPrivateRoute>
      } />
      {}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;