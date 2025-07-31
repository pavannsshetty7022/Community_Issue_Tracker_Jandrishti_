// frontend-user/src/context/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, username, token, profileCompleted }
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('janDrishtiUser');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Basic token expiry check (can be more robust with JWT decoding)
          if (parsedUser.token) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('janDrishtiUser'); // Clear invalid token
          }
        }
      } catch (error) {
        console.error("Failed to load user from localStorage:", error);
        localStorage.removeItem('janDrishtiUser');
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const login = (userData) => {
    console.log('Login data received:', userData); // Debug log
    localStorage.setItem('janDrishtiUser', JSON.stringify(userData));
    setUser(userData);
    // Navigate based on profile completion status
    console.log('Profile completed:', userData.profileCompleted); // Debug log
    if (!userData.profileCompleted) {
      console.log('Navigating to profile-update'); // Debug log
      navigate('/profile-update');
    } else {
      console.log('Navigating to dashboard'); // Debug log
      navigate('/dashboard');
    }
  };

  const logout = () => {
    localStorage.removeItem('janDrishtiUser');
    setUser(null);
    window.location.replace('/home'); // Force reload to home
  };

  const updateProfileStatus = (isCompleted) => {
    setUser(prev => {
      const updatedUser = { ...prev, profileCompleted: isCompleted };
      localStorage.setItem('janDrishtiUser', JSON.stringify(updatedUser));
      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfileStatus, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);