import React from 'react';
import './Logo.css';

const Logo = ({ className = '' }) => {
  return (
    <div className={`logo ${className}`}>
      <span className="logo-text">JanDrishti</span>
      <span className="logo-jd">JD</span>
    </div>
  );
};

export default Logo;