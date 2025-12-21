import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Spinner, InputGroup } from 'react-bootstrap';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [isSuccessLoading, setIsSuccessLoading] = useState(false); // New state for success animation
  const [showPassword, setShowPassword] = useState(false);
  const { loginAdmin } = useAdminAuth();
  const { isDarkMode } = useTheme();
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setUsername('');
    setPassword('');
    setMessage('');
    setMessageType('error');
    setLoading(false);
    setIsSuccessLoading(false);
    setShowPassword(false);
    setAnimateContent(true);

    return () => {
      // Cleanup
      setIsSuccessLoading(false);
    };
  }, []);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('error');
    setLoading(true);

    try {
      const data = await AdminService.login(username, password);

      // Stop form loading, start success loading
      setLoading(false);
      setIsSuccessLoading(true);

      // Wait 2 seconds before redirecting
      setTimeout(() => {
        loginAdmin(data);
      }, 2000);

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
      setLoading(false); // Only stop loading on error, keep true on success until transition
    }
  };

  if (isSuccessLoading) {
    return (
      <div className="min-vh-100 d-flex flex-column align-items-center justify-content-center" style={{
        background: isDarkMode ? '#121417' : '#f8fafc',
        transition: 'background-color 0.3s ease'
      }}>
        <Spinner animation="grow" variant="primary" style={{ width: '3rem', height: '3rem' }} />
        <h5 className={`mt-4 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>Loading reported issues...</h5>
        <p className="text-muted small">Accessing Admin Dashboard</p>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, var(--background-color) 0%, #f0f4f8 100%)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(30, 58, 138, 0.1) 0%, rgba(248, 250, 252, 0.8) 80%)',
        zIndex: 0,
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite'
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-120px',
        right: '-120px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(248, 250, 252, 0.8) 80%)',
        zIndex: 0,
        filter: 'blur(40px)',
        animation: 'float2 10s ease-in-out infinite'
      }} />

      <style>
        {`
          @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(40px); }
            100% { transform: translateY(0); }
          }
          @keyframes float2 {
            0% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
            100% { transform: translateY(0); }
          }
        `}
      </style>

      <Container>
        <Row className="justify-content-center">
          <Col xs={12} md={6} lg={4}>
            <Card className="shadow-lg border-0" style={{
              backgroundColor: 'var(--card-color)',
              zIndex: 1,
              opacity: animateContent ? 1 : 0,
              transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease-out, transform 1s ease-out'
            }}>
              <Card.Body className="p-4">
                <div className="text-center mb-4">
                  <i className="bi bi-shield-lock display-4 text-primary mb-3"></i>
                  <h2 className="fw-bold text-primary">Admin Login</h2>
                  <p className="text-muted">Access the administrative dashboard</p>
                </div>

                <Form onSubmit={handleLogin} autoComplete="off">
                  {message && (
                    <Alert variant={messageType === 'error' ? 'danger' : 'success'} className="mb-3">
                      {message}
                    </Alert>
                  )}

                  <Form.Group className="mb-3">
                    <Form.Label>Admin Username</Form.Label>
                    <Form.Control
                      type="text"
                      id="adminUsername"
                      placeholder="Enter admin username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoFocus
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        id="adminPassword"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={handleClickShowPassword}
                        aria-label="Toggle password visibility"
                      >
                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-bold"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-box-arrow-in-right me-2"></i>
                        Login as Admin
                      </>
                    )}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLogin;
