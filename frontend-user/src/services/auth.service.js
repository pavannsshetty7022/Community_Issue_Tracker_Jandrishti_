const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const register = async (profileData) => {
  console.log('Auth service - attempting register for:', profileData.username);
  console.log('Auth service - API URL:', API_URL);

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(profileData),
    });

    console.log('Auth service - response status:', response.status);
    const data = await response.json();
    console.log('Auth service - response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  } catch (error) {
    console.error('Auth service - registration error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw error;
  }
};

const login = async (username, password) => {
  console.log('Auth service - attempting login for:', username);
  console.log('Auth service - API URL:', API_URL);

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ username, password }),
    });

    console.log('Auth service - response status:', response.status);
    const data = await response.json();
    console.log('Auth service - response data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  } catch (error) {
    console.error('Auth service - login error:', error);
    if (error.message === 'Failed to fetch') {
      throw new Error('Unable to connect to the server. Please check if the server is running.');
    }
    throw error;
  }
};

const updateProfile = async (profileData, token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Profile update failed');
  }
  return data;
};

const getProfile = async (token) => {
  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch profile');
  }
  return data;
};


const AuthService = {
  register,
  login,
  updateProfile,
  getProfile
};

export default AuthService;