import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

const NavigationBar = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const circleButtonStyle = {
    width: '46px',
    height: '46px',
    minWidth: '46px',
    borderWidth: '2px',
    padding: '0',
    lineHeight: '1',
    transition: 'all 0.2s ease'
  };

  // Helper function to check if a path is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <Navbar
      bg={isDarkMode ? 'dark' : 'white'}
      variant={isDarkMode ? 'dark' : 'light'}
      expand="lg"
      sticky="top"
      className={`py-3 shadow-sm ${isDarkMode ? 'border-bottom border-secondary' : 'border-bottom'}`}
    >
      <Container className="px-lg-5">
        <LinkContainer to="/home">
          <Navbar.Brand className="d-flex align-items-center ps-0">
            <Logo />
          </Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" className="border-0 shadow-none" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-lg-auto text-center py-3 py-lg-0 fw-semibold">
            <LinkContainer to="/home">
              <Nav.Link
                className="px-lg-3 mx-lg-1"
                active={isActive('/home') || isActive('/')}
              >
                Home
              </Nav.Link>
            </LinkContainer>

            {user && (
              <>
                <LinkContainer to="/dashboard">
                  <Nav.Link
                    className="px-lg-3 mx-lg-1"
                    active={isActive('/dashboard')}
                  >
                    Dashboard
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/report-issue">
                  <Nav.Link
                    className="px-lg-3 mx-lg-1"
                    active={isActive('/report-issue')}
                  >
                    Report Issue
                  </Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>

          <Nav className="ms-auto align-items-center gap-3">
            {/* Dark Mode Button */}
            <Button
              variant={isDarkMode ? 'outline-light' : 'outline-dark'}
              onClick={toggleTheme}
              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
              style={circleButtonStyle}
              title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
            >
              <i className={`bi ${isDarkMode ? 'bi-sun-fill' : 'bi-moon-stars-fill'} fs-5`} />
            </Button>

            {user ? (
              <>
                {/* Profile Avatar */}
                <LinkContainer to="/profile">
                  <Button
                    variant={isDarkMode ? 'outline-light' : 'outline-primary'}
                    className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                    style={{
                      ...circleButtonStyle,
                      fontSize: '18px',
                      fontWeight: '700'
                    }}
                    title="View Profile"
                  >
                    {(user.full_name || user.username || 'U')[0].toUpperCase()}
                  </Button>
                </LinkContainer>

                {/* Logout */}
                <Button
                  variant="danger"
                  className="px-4 fw-bold rounded-pill shadow-sm d-flex align-items-center"
                  style={{ height: '46px' }}
                  onClick={logout}
                >
                  <i className="bi bi-box-arrow-right me-2"></i>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <LinkContainer to="/login">
                  <Button
                    variant="outline-primary"
                    className="fw-bold px-4 rounded-pill"
                    style={{ height: '46px' }}
                  >
                    Login
                  </Button>
                </LinkContainer>

                <LinkContainer to="/register">
                  <Button
                    variant="primary"
                    className="fw-bold px-4 rounded-pill shadow-sm"
                    style={{ height: '46px' }}
                  >
                    Register
                  </Button>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;
