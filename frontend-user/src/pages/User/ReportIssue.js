import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  TextField, Button, Typography, Container, Box, Alert,
  MenuItem, Select, InputLabel, FormControl, CircularProgress, IconButton
} from '@mui/material';
import IssueService from '../../services/issue.service';
import { useAuth } from '../../context/AuthContext';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CloseIcon from '@mui/icons-material/Close';

const issueOptions = [
  'Road potholes', 'Broken streetlights', 'Water supply leakage or shortage',
  'Open manholes', 'Damaged footpaths', 'Overflowing garbage bins',
  'Non-functioning traffic signals', 'Power outages',
  'Broken public benches / park equipment', 'Non-functional public toilets',
  'Inadequate street lighting', 'Tree fallen / blocking pathway',
  'Uncollected garbage', 'Illegal garbage dumping', 'Drainage blockage',
  'Waterlogging during rains', 'Mosquito breeding spots',
  'Graffiti or wall defacement', 'Lack of public dustbins',
  'Smoke or air pollution', 'Stray animal issues (dogs, monkeys, etc.)',
  'Loud noise or sound pollution', 'Suspicious activity',
  'Other'
];

const ReportIssue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [title, setTitle] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [dateOfOccurrence, setDateOfOccurrence] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);
  const [previewMedia, setPreviewMedia] = useState([]);
  const [existingMedia, setExistingMedia] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [animateContent, setAnimateContent] = useState(false);

  useEffect(() => {
    setAnimateContent(true);

    if (id) {
      setIsEditing(true);
      setLoading(true);
      const fetchIssueForEdit = async () => {
        try {
          const userIssues = await IssueService.getUserIssues(user.id, user.token);
          const issueToEdit = userIssues.find(i => String(i.id) === id);

          if (issueToEdit) {
            if (issueOptions.includes(issueToEdit.title)) {
              setTitle(issueToEdit.title);
            } else {
              setTitle('Other');
              setCustomTitle(issueToEdit.title);
            }
            setDescription(issueToEdit.description);
            setLocation(issueToEdit.location);
            setDateOfOccurrence(issueToEdit.date_of_occurrence.split('T')[0]);

            const mediaPaths = Array.isArray(issueToEdit.media_paths)
              ? issueToEdit.media_paths
              : (issueToEdit.media_paths ? issueToEdit.media_paths.split(',') : []);

            const formattedExistingMedia = mediaPaths.map(path => ({
              path: path.trim(),
              url: `http://localhost:5000${path.trim()}`,
              type: path.trim().match(/\.(mp4|mov|avi|wmv|flv)$/i) ? 'video' : 'image'
            }));

            setExistingMedia(formattedExistingMedia);
            setPreviewMedia(formattedExistingMedia.map(m => ({ url: m.url, type: m.type })));
          } else {
            setMessage('Issue not found for editing.');
            setMessageType('error');
            navigate('/dashboard');
          }
        } catch (err) {
          console.error('Failed to load issue for editing:', err);
          setMessage(err.message || 'Error loading issue for editing.');
          setMessageType('error');
          navigate('/dashboard');
        } finally {
          setLoading(false);
        }
      };
      fetchIssueForEdit();
    }
  }, [id, user, navigate]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newMediaFiles = [...mediaFiles];
    const newPreviewMedia = [...previewMedia];

    files.forEach(file => {
      const fileType = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('video/') ? 'video' : 'other');
      if (fileType !== 'other') {
        newMediaFiles.push(file);
        newPreviewMedia.push({
          url: URL.createObjectURL(file),
          type: fileType,
          name: file.name,
          isNew: true
        });
      }
    });

    setMediaFiles(newMediaFiles);
    setPreviewMedia(newPreviewMedia);
    event.target.value = null;
  };

  const handleRemoveMedia = (indexToRemove, isNewFile = true) => {
    if (isNewFile) {
      setMediaFiles(prev => prev.filter((_, index) => index !== indexToRemove));
      setPreviewMedia(prev => prev.filter((_, index) => index !== indexToRemove));
    } else {
      setExistingMedia(prev => prev.filter((_, index) => index !== indexToRemove));
      setPreviewMedia(prev => prev.filter((item, index) => {
        const originalIndex = prev.findIndex(p => p.url === item.url && !p.isNew);
        return originalIndex !== indexToRemove;
      }));
    }
  };


  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setMessageType('error');
    setLoading(true);

    if (!user || !user.token) {
      setMessage('You must be logged in to report/edit an issue.');
      setLoading(false);
      return;
    }

    const finalTitle = title === 'Other' ? customTitle : title;

    if (!finalTitle || !description || !location || !dateOfOccurrence) {
      setMessage('All required fields must be filled.');
      setLoading(false);
      return;
    }

    const issueData = {
      title: finalTitle,
      description,
      location,
      dateOfOccurrence,
    };

    try {
      if (isEditing) {
        await IssueService.editIssue(id, issueData, mediaFiles, existingMedia.map(m => m.path), user.token);
        setMessage('Issue updated successfully!');
      } else {
        await IssueService.reportIssue(issueData, mediaFiles, user.token);
        setMessage('Issue reported successfully!');
      }
      setMessageType('success');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Issue submission error:', error);
      setMessage(error.message || `Something went wrong during issue ${isEditing ? 'update' : 'reporting'}.`);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditing) {
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
        <Typography variant="h6" sx={{ mt: 2, color: 'primary.dark' }}>Loading issue for edit...</Typography>
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

      <Container maxWidth="md" sx={{
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
            {isEditing ? 'Edit Issue' : 'Report New Issue'}
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
            {message && <Alert severity={messageType} sx={{ mb: 2 }}>{message}</Alert>}
            <FormControl fullWidth margin="normal" required sx={{ mb: 2 }}>
              <InputLabel id="issue-title-label">Name of Issue (Title)</InputLabel>
              <Select
                labelId="issue-title-label"
                id="title"
                value={title}
                label="Name of Issue (Title)"
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (e.target.value === 'Other') {
                    setCustomTitle('');
                  }
                }}
              >
                {issueOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {title === 'Other' && (
              <TextField
                margin="normal"
                required
                fullWidth
                id="customTitle"
                label="Specify Other Issue"
                name="customTitle"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                sx={{ mb: 2 }}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Description"
              name="description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="location"
              label="Manual Location"
              name="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="dateOfOccurrence"
              label="Date of Occurrence"
              name="dateOfOccurrence"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={dateOfOccurrence}
              onChange={(e) => setDateOfOccurrence(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Box sx={{ mt: 2, mb: 2 }}>
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="media-upload"
                type="file"
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="media-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<PhotoCameraIcon />}
                  sx={{
                    borderRadius: 5,
                    px: 3,
                    py: 1.5,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 'bold',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.light',
                    },
                  }}
                >
                  Upload Media (Images/Videos)
                </Button>
              </label>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                {previewMedia.map((media, index) => (
                  <Box key={media.url} sx={{ position: 'relative', width: 150, height: 150, border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                    {media.type === 'image' ? (
                      <img src={media.url} alt={`Media Preview ${index}`} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    ) : (
                      <video src={media.url} controls style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    )}
                    <IconButton
                      aria-label="delete"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        bgcolor: 'rgba(255, 255, 255, 0.7)',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.9)' },
                      }}
                      onClick={() => handleRemoveMedia(index, media.isNew)}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                    {media.name && !media.isNew && (
                        <Typography variant="caption" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'rgba(0,0,0,0.5)', color: 'white', px: 1, py: 0.5, textAlign: 'center' }}>
                          {media.name}
                        </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
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
              {loading ? <CircularProgress size={24} color="inherit" /> : (isEditing ? 'Update Issue' : 'Submit Issue')}
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => navigate('/dashboard')}
              sx={{
                borderRadius: 5,
                px: 5,
                py: 1.5,
                borderColor: 'text.secondary',
                color: 'text.secondary',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  bgcolor: 'action.hover',
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ReportIssue;