import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Container, Box, Alert,
  CircularProgress, Card, CardContent, CardActions, Grid, TextField,
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LogoutIcon from '@mui/icons-material/Logout'; // Added for logout button
import EngineeringIcon from '@mui/icons-material/Engineering'; // Added for consistent branding icon
import { useAuth } from '../../context/AuthContext';
import IssueService from '../../services/issue.service';
import { socket } from '../../socket';

const UserDashboard = () => {
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [issueToDelete, setIssueToDelete] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [animateContent, setAnimateContent] = useState(false); // New state for animation

  const fetchIssues = useCallback(async () => {
    if (!user || !user.token || !user.id) {
      setError('Authentication required. Please log in.');
      setLoading(false);
      logout();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fetchedIssues = await IssueService.getUserIssues(user.id, user.token);
      setIssues(fetchedIssues);
    } catch (err) {
      console.error('Failed to fetch user issues:', err);
      setError(err.message || 'Failed to load your issues.');
      if (err.message.includes('token') || err.message.includes('Unauthorized')) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  }, [user, logout]);

  useEffect(() => {
    setAnimateContent(true); // Trigger animation on mount
    fetchIssues();

    socket.on('status_updated', (updatedIssue) => {
      if (updatedIssue.user_id === user?.id) {
        setIssues(prevIssues =>
          prevIssues.map(issue =>
            issue.id === updatedIssue.id ? { ...issue, status: updatedIssue.status, resolved_at: updatedIssue.resolved_at } : issue
          )
        );
        console.log('User dashboard received status update:', updatedIssue.issue_id, updatedIssue.status);
      }
    });

    return () => {
      socket.off('status_updated');
    };
  }, [fetchIssues, user]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchIssues();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await IssueService.searchUserIssue(searchQuery, user.token);
      if (result) {
        setIssues([result]);
      } else {
        setIssues([]);
        setError('Issue not found.');
      }
    } catch (err) {
      console.error('Search issue error:', err);
      setError(err.message || 'Issue not found.');
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteDialog = (issue) => {
    setIssueToDelete(issue);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIssueToDelete(null);
    setDeleteDialogOpen(false);
  };

  const handleDeleteIssue = async () => {
    if (!issueToDelete || !user || !user.token) return;
    setLoading(true);
    setError('');
    try {
      await IssueService.deleteIssue(issueToDelete.id, user.token);
      setIssues(issues.filter(issue => issue.id !== issueToDelete.id));
      setMessage('Issue deleted successfully!');
      setMessageType('success');
    } catch (err) {
      console.error('Delete issue error:', err);
      setError(err.message || 'Failed to delete issue.');
    } finally {
      setLoading(false);
      closeDeleteDialog();
    }
  };

  if (loading && issues.length === 0) { // Only show full loading screen if no issues are loaded yet
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
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.dark' }}>Loading issues...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{
      flexGrow: 1,
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%)', // Page background
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

      <AppBar position="sticky" sx={{ // AppBar styling
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        zIndex: 2, // Ensure AppBar is above content
      }}>
        <Toolbar>
          <EngineeringIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.dark' }}>
            Jan Drishti - Welcome {user?.username}
          </Typography>
          <Button
            color="inherit"
            component={Link}
            to="/report-issue"
            startIcon={<AddCircleOutlineIcon />}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              borderRadius: 3,
              fontWeight: 'bold',
              mr: 2,
              '&:hover': {
                bgcolor: 'primary.dark',
                boxShadow: 3,
              },
            }}
          >
            Report New Issue
          </Button>
          <Button
            color="inherit"
            onClick={logout}
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

      <Container maxWidth="lg" sx={{
        mt: 4,
        mb: 4,
        zIndex: 1, // Ensure container is above background animations
        opacity: animateContent ? 1 : 0, // Fade-in effect
        transform: animateContent ? 'translateY(0)' : 'translateY(20px)', // Slide-up effect
        transition: 'opacity 1s ease-out, transform 1s ease-out', // Animation duration
      }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.dark', textAlign: 'center', mb: 4 }}>
          Your Reported Issues
        </Typography>

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
        }}>
          <TextField
            label="Search by Issue ID (e.g., JDR-YYYYMMDD-XXXX)"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => { if (e.key === 'Enter') handleSearch(); }}
            sx={{ flexGrow: 1 }}
            InputProps={{
              sx: { borderRadius: 2 } // Rounded corners for text field
            }}
            InputLabelProps={{
              sx: { fontWeight: 'medium' }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSearch}
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
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={() => { setSearchQuery(''); fetchIssues(); }}
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
            Clear Search
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}
        {message && <Alert severity={messageType} sx={{ mb: 3, borderRadius: 2 }}>{message}</Alert>}

        {issues.length === 0 && !loading && !error && (
          <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 5 }}>
            No issues reported yet. Click "Report New Issue" to get started!
          </Typography>
        )}

        <Grid container spacing={3}>
          {issues.map((issue) => (
            <Grid item xs={12} sm={6} md={4} key={issue.id}>
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
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.85rem' }}>
                    Reported on: {new Date(issue.created_at).toLocaleDateString()}
                  </Typography>
                  <Typography variant="h6" component="div" sx={{ mb: 1, fontWeight: 'bold', color: 'primary.dark' }}>
                    {issue.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    ID: {issue.issue_id}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Location: {issue.location}
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Status: <Box component="span" sx={{
                      color: issue.status === 'resolved' ? 'success.main' : issue.status === 'pending' ? 'warning.main' : 'error.main',
                      textTransform: 'uppercase',
                    }}>
                      {issue.status}
                    </Box>
                  </Typography>
                  {issue.resolved_at && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Resolved On: {new Date(issue.resolved_at).toLocaleDateString()}
                    </Typography>
                  )}
                  {issue.media_path && (
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      <img
                        src={`http://localhost:5000${issue.media_path}`}
                        alt="Issue Media"
                        style={{ maxWidth: '100%', maxHeight: '180px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                      />
                    </Box>
                  )}
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', p: 2, pt: 0 }}>
                  {issue.status === 'open' ? (
                    <>
                      <Button
                        size="small"
                        startIcon={<EditIcon />}
                        component={Link}
                        to={`/edit-issue/${issue.id}`}
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          '&:hover': { bgcolor: 'primary.light' },
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={() => openDeleteDialog(issue)}
                        sx={{
                          fontWeight: 'bold',
                          '&:hover': { bgcolor: 'error.light' },
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', pr: 1 }}>
                      Cannot edit/delete {issue.status} issues.
                    </Typography>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={closeDeleteDialog}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
          PaperProps={{
            sx: {
              borderRadius: 4,
              boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              bgcolor: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(8px)',
            }
          }}
        >
          <DialogTitle id="alert-dialog-title" sx={{ fontWeight: 'bold', color: 'primary.dark' }}>
            {"Confirm Delete"}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description" sx={{ color: 'text.primary' }}>
              Are you sure you want to delete the issue "{issueToDelete?.title}" (ID: {issueToDelete?.issue_id})? This action cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={closeDeleteDialog} sx={{ fontWeight: 'bold', color: 'text.secondary' }}>Cancel</Button>
            <Button
              onClick={handleDeleteIssue}
              color="error"
              autoFocus
              variant="contained"
              sx={{
                borderRadius: 2,
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: 'error.dark',
                },
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default UserDashboard;