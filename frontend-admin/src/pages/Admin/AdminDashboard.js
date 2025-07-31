import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Alert,
  CircularProgress, Card, CardContent, CardActions, Grid, TextField,
  MenuItem, Select, InputLabel, FormControl, IconButton, Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { socket } from '../../socket';
import SecurityIcon from '@mui/icons-material/Security'; // For AppBar branding
import LogoutIcon from '@mui/icons-material/Logout'; // For Logout button
import SearchIcon from '@mui/icons-material/Search'; // For search button

const AdminDashboard = () => {
  const { admin, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState(''); // 'open', 'pending', 'resolved', or '' for all
  const [searchQuery, setSearchQuery] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');
  const [updateMessageType, setUpdateMessageType] = useState('success');
  const [animateContent, setAnimateContent] = useState(false); // New state for animation

  const fetchIssues = useCallback(async () => {
    if (!admin || !admin.token) {
      console.log('No admin or token found'); // Debug log
      setError('Admin authentication required. Please log in.');
      setLoading(false);
      logoutAdmin();
      return;
    }
    setLoading(true);
    setError('');
    try {
      console.log('Fetching issues with token:', admin.token.substring(0, 20) + '...'); // Debug log (partial token)
      const fetchedIssues = await AdminService.getAllIssues(admin.token, statusFilter, searchQuery);
      console.log('Successfully fetched issues:', fetchedIssues.length); // Debug log
      setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
    } catch (err) {
      console.error('Failed to fetch issues for admin:', err);
      setError(err.message || 'Failed to load issues. Please try logging out and back in.');
      if (err.message.includes('token') || err.message.includes('Unauthorized') || err.message.includes('expired')) {
        console.log('Authentication error detected, logging out'); // Debug log
        logoutAdmin();
      }
    } finally {
      setLoading(false);
    }
  }, [admin, logoutAdmin, statusFilter, searchQuery]);

  useEffect(() => {
    setAnimateContent(true); // Trigger animation on mount
    fetchIssues();

    socket.on('new_issue', (newIssue) => {
      console.log('Admin: Received new issue via WebSocket:', newIssue.issue_id);
      setIssues(prevIssues => [newIssue, ...prevIssues]);
      setUpdateMessage(`New issue reported: ${newIssue.issue_id} (${newIssue.title})`);
      setUpdateMessageType('info');
      setTimeout(() => setUpdateMessage(''), 5000);
    });

    socket.on('status_updated', (updatedIssue) => {
      console.log('Admin: Received status update via WebSocket:', updatedIssue.issue_id, updatedIssue.status);
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === updatedIssue.id ? { ...issue, status: updatedIssue.status, resolved_at: updatedIssue.resolved_at } : issue
        )
      );
      setUpdateMessage(`Issue ${updatedIssue.issue_id} status changed to ${updatedIssue.status.toUpperCase()}`);
      setUpdateMessageType('success');
      setTimeout(() => setUpdateMessage(''), 5000);
    });

    return () => {
      socket.off('new_issue');
      socket.off('status_updated');
    };
  }, [fetchIssues]);

  const handleStatusChange = async (issueId, newStatus) => {
    if (!admin || !admin.token) {
      setError('Admin authentication required.');
      logoutAdmin();
      return;
    }
    setUpdateMessage('');
    try {
      await AdminService.updateIssueStatus(issueId, newStatus, admin.token);
    } catch (err) {
      console.error('Failed to update issue status:', err);
      setError(err.message || 'Failed to update status.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'pending': return 'warning';
      case 'resolved': return 'success';
      default: return 'default';
    }
  };

  if (loading && issues.length === 0) {
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
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.dark' }}>Loading all issues...</Typography>
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
    }}>
      {/* Animated gradient circles for background effect */}
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

      <AppBar position="sticky" sx={{
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 2,
      }}>
        <Toolbar>
          <SecurityIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.dark' }}>
            Jan Drishti - Admin Dashboard - Welcome {admin?.username}
          </Typography>
          <Button
            color="inherit"
            onClick={logoutAdmin}
            startIcon={<LogoutIcon />}
            sx={{
              color: 'text.secondary',
              borderColor: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                borderColor: 'error.main',
              },
            }}
          >
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{
        mt: 4,
        mb: 4,
        zIndex: 1,
        opacity: animateContent ? 1 : 0,
        transform: animateContent ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 1s ease-out, transform 1s ease-out',
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.dark', textAlign: 'center', mb: 4 }}>
          All Reported Issues
        </Typography>

        {updateMessage && (
          <Alert severity={updateMessageType} sx={{ mb: 3, borderRadius: 2 }}>
            {updateMessage}
          </Alert>
        )}
        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

        <Box sx={{
          display: 'flex',
          gap: 2,
          mb: 4,
          p: 2,
          bgcolor: 'rgba(255,255,255,0.7)',
          backdropFilter: 'blur(8px)',
          borderRadius: 4,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel id="status-filter-label" sx={{ fontWeight: 'medium' }}>Filter by Status</InputLabel>
            <Select
              labelId="status-filter-label"
              id="status-filter"
              value={statusFilter}
              label="Filter by Status"
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="open">Open</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Search by Issue ID or Title/Description"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') fetchIssues(); }}
            sx={{ flexGrow: 1, maxWidth: 400 }}
            InputProps={{
              sx: { borderRadius: 2 }
            }}
            InputLabelProps={{
              sx: { fontWeight: 'medium' }
            }}
          />
          <Button
            variant="contained"
            onClick={fetchIssues}
            startIcon={<SearchIcon />}
            sx={{
              borderRadius: 3,
              fontWeight: 'bold',
              bgcolor: 'secondary.main',
              '&:hover': {
                bgcolor: 'secondary.dark',
                boxShadow: 3,
              },
            }}
          >
            Apply Filter/Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => { setStatusFilter(''); setSearchQuery(''); fetchIssues(); }}
            sx={{
              borderRadius: 3,
              fontWeight: 'bold',
              borderColor: 'text.secondary',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
                bgcolor: 'action.hover',
              },
            }}
          >
            Clear Filters
          </Button>
        </Box>

        {issues.length === 0 && !loading && !error && (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 5 }}>
            No issues found matching your criteria.
          </Typography>
        )}

        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} sm={6} lg={4} key={issue.id}>
              <Card sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
                borderRadius: 4,
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                },
              }}>
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'medium' }}>
                      Issue ID: {issue.issue_id}
                    </Typography>
                    <Chip label={issue.status.toUpperCase()} color={getStatusColor(issue.status)} size="small" sx={{ fontWeight: 'bold' }} />
                  </Box>
                  <Typography variant="h6" component="div" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    <strong>Description:</strong> {issue.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Location:</strong> {issue.location}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Date of Occurrence:</strong> {new Date(issue.date_of_occurrence).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    <strong>Reported by:</strong> {issue.full_name || 'N/A'} (Type: {issue.user_type} {issue.user_type_custom ? `(${issue.user_type_custom})` : ''})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Contact:</strong> {issue.phone_number || 'N/A'}, {issue.address || 'N/A'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Reported On:</strong> {new Date(issue.created_at).toLocaleString()}
                  </Typography>
                  {issue.resolved_at && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Resolved On:</strong> {new Date(issue.resolved_at).toLocaleString()}
                    </Typography>
                  )}
                  {issue.media_path && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={`http://localhost:5000${issue.media_path}`}
                        alt="Issue Media"
                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'contain', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Click image to view in full size (not implemented in this snippet)
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-start', p: 2, pt: 0 }}>
                  <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel id={`status-select-label-${issue.id}`} sx={{ fontWeight: 'medium' }}>Update Status</InputLabel>
                    <Select
                      labelId={`status-select-label-${issue.id}`}
                      id={`status-select-${issue.id}`}
                      value={issue.status}
                      label="Update Status"
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="open">Open</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="resolved">Resolved</MenuItem>
                    </Select>
                  </FormControl>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;