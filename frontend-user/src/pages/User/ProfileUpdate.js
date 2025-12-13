import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TextField, Button, Typography, Container, Box, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress
} from '@mui/material';
import EngineeringIcon from '@mui/icons-material/Engineering';
import AuthService from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';

const userTypes = [
  'Student', 'Senior Citizen', 'Working Professional / Employee',
  'Business Owner', 'Homemaker', 'Unemployed', 'Retired', 'Other'
];

const ProfileUpdate = () => {
  const { user, updateProfileStatus, logout } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [userType, setUserType] = useState('');
  const [userTypeCustom, setUserTypeCustom] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateContent(true);

    if (!user) {
      navigate('/login');
      return;
    }
    if (user.profileCompleted && initialLoad) {
      navigate('/dashboard');
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await AuthService.getProfile(user.token);
        setFullName(data.full_name || '');
        setPhoneNumber(data.phone_number || '');
        setAddress(data.address || '');
        setUserType(data.user_type || '');
        setUserTypeCustom(data.user_type_custom || '');
        setInitialLoad(false);
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setInitialLoad(false);
        if (error.message === 'Failed to fetch profile' || error.message.includes('token')) {
          setMessage('Could not load existing profile. Please fill in details.');
          setMessageType('warning');
        } else {
          setMessage(error.message || 'Error loading profile data.');
          setMessageType('error');
        }
      } finally {
        setLoading(false);
      }
    };
    if (user && !user.profileCompleted) {
      fetchProfile();
    } else if (user && user.profileCompleted) {
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [user, navigate, initialLoad]);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('error');
    setLoading(true);

    if (!user || !user.token) {
      setMessage('You must be logged in to update your profile.');
      setLoading(false);
      logout();
      return;
    }

    const profileData = {
      fullName,
      phoneNumber,
      address,
      userType: userType === 'Other' && !userTypeCustom ? '' : userType,
      userTypeCustom: userType === 'Other' ? userTypeCustom : null
    };

    if (!profileData.fullName || !profileData.phoneNumber || !profileData.address || !profileData.userType) {
      setMessage('All required fields must be filled.');
      setLoading(false);
      return;
    }
    if (profileData.userType === 'Other' && !profileData.userTypeCustom) {
      setMessage('Please specify your custom user type.');
      setLoading(false);
      return;
    }

    try {
      await AuthService.updateProfile(profileData, user.token);
      updateProfileStatus(true);
      setMessage('Profile updated successfully!');
      setMessageType('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Profile update failed:', error);
      setMessage(error.message || 'Something went wrong during profile update.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && initialLoad) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      }}>
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.dark' }}>Loading profile...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)',
      position: 'relative',
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      p: { xs: 2, sm: 4 },
    }}>
      <Box sx={{
        position: 'absolute',
        top: '-100px',
        left: '-100px',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #90caf9 0%, #e0e7ff 80%)',
        opacity: 0.4,
        zIndex: 0,
        filter: 'blur(30px)',
        animation: 'float 8s ease-in-out infinite',
        '@keyframes float': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(40px)' },
          '100%': { transform: 'translateY(0)' },
        },
      }} />
      <Box sx={{
        position: 'absolute',
        bottom: '-120px',
        right: '-120px',
        width: '350px',
        height: '350px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #f48fb1 0%, #f5f7fa 80%)',
        opacity: 0.3,
        zIndex: 0,
        filter: 'blur(40px)',
        animation: 'float2 10s ease-in-out infinite',
        '@keyframes float2': {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
          '100%': { transform: 'translateY(0)' },
        },
      }} />

      <Container maxWidth="sm" sx={{
        zIndex: 1,
        opacity: animateContent ? 1 : 0,
        transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
      }}>
        <Box
          sx={{
            mt: 4,
            mb: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: { xs: 3, md: 6 },
            boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.18)',
            borderRadius: 8,
            bgcolor: 'rgba(255,255,255,0.8)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <EngineeringIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 700, mb: 2, color: 'primary.dark' }}>
            Complete Your Profile
          </Typography>
          <Box component="form" onSubmit={handleProfileUpdate} sx={{ mt: 3, width: '100%' }}>
            {message && <Alert severity={messageType} sx={{ mb: 2 }}>{message}</Alert>}
            <TextField
              margin="normal"
              required
              fullWidth
              id="fullName"
              label="Full Name"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="phoneNumber"
              label="Phone Number"
              name="phoneNumber"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="address"
              label="Address"
              name="address"
              autoComplete="address-line1"
              multiline
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
              <InputLabel id="user-type-label">User Type</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                value={userType}
                label="User Type"
                onChange={(e) => setUserType(e.target.value)}
              >
                {userTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {userType === 'Other' && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="userTypeCustom"
                label="Specify Other User Type"
                name="userTypeCustom"
                value={userTypeCustom}
                onChange={(e) => setUserTypeCustom(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{
                mt: 3,
                mb: 2,
                borderRadius: 5,
                boxShadow: 6,
                fontWeight: 900,
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(90deg, #42a5f5 0%, #7e57c2 100%)',
                color: '#fff',
                transition: 'box-shadow 0.3s, transform 0.3s',
                '&:hover': {
                  boxShadow: 12,
                  background: 'linear-gradient(90deg, #7e57c2 0%, #42a5f5 100%)',
                  transform: 'scale(1.03)',
                },
              }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : 'Update Profile'}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProfileUpdate;