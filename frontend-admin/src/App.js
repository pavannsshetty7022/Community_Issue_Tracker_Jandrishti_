
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AOS from 'aos';
import 'aos/dist/aos.css';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import IssueDetails from './pages/Admin/IssueDetails';
import { Spinner } from 'react-bootstrap';
import useDocumentTitle from './utils/useDocumentTitle';


const AdminPrivateRoute = ({ children }) => {
  const { admin, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return admin ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  useDocumentTitle();

  React.useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-in-out',
      once: true,
      mirror: false
    });
  }, []);

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/dashboard" element={
        <AdminPrivateRoute>
          <AdminDashboard />
        </AdminPrivateRoute>
      } />
      <Route path="/dashboard/issue/:id" element={
        <AdminPrivateRoute>
          <IssueDetails />
        </AdminPrivateRoute>
      } />
      { }
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AdminAuthProvider>
          <AppContent />
        </AdminAuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;