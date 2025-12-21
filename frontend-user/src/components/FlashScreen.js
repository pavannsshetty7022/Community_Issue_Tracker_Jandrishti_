import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const FlashScreen = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="d-flex flex-column justify-content-center align-items-center vh-100"
      style={{
        backgroundColor: 'var(--background-color)',
        color: 'var(--primary-color)',
      }}
    >
      <i className="bi bi-tools display-1 mb-3"></i>
      <h1 className="display-4 fw-bold mb-3">JanDrishti</h1>
      <h4 className="text-muted">Community Issue Tracker</h4>
    </div>
  );
};

export default FlashScreen;
