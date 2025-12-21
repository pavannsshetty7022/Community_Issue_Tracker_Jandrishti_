import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Row, Col, Spinner, Alert, ListGroup, Dropdown, ButtonGroup } from 'react-bootstrap';
import AdminNavbar from '../../components/AdminNavbar';
import BackButton from '../../components/BackButton';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';

const IssueDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { admin, logoutAdmin } = useAdminAuth();
    const { isDarkMode } = useTheme();
    const [issue, setIssue] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [updateError, setUpdateError] = useState('');
    const [updateStatusLoading, setUpdateStatusLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const BACKEND_URL = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api').replace('/api', '');

    const fetchIssueDetails = useCallback(async () => {
        if (!admin || !admin.token) {
            logoutAdmin();
            return;
        }
        setLoading(true);
        setLoadError('');
        try {
            const data = await AdminService.getIssueById(id, admin.token);
            setIssue(data);
        } catch (err) {
            setLoadError(err.message || 'Failed to load issue details');
        } finally {
            setLoading(false);
        }
    }, [id, admin, logoutAdmin]);

    useEffect(() => {
        fetchIssueDetails();
    }, [fetchIssueDetails]);

    const handleStatusUpdate = async (newStatus) => {
        if (!admin || !admin.token) return;
        const normalizedStatus = newStatus.trim().toUpperCase();
        setUpdateStatusLoading(true);
        setSuccessMessage('');
        setUpdateError('');
        try {
            await AdminService.updateIssueStatus(id, normalizedStatus, admin.token);
            setIssue(prev => ({ ...prev, status: normalizedStatus }));
            setSuccessMessage(`Status updated to ${normalizedStatus}`);
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err) {
            setUpdateError(err.message || 'Failed to update status');
        } finally {
            setUpdateStatusLoading(false);
        }
    };

    const handleDownload = async (path, index) => {
        try {
            const response = await fetch(`${BACKEND_URL}${path}`);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;

            const extension = path.split('.').pop();
            const fileName = `${issue.issue_id}-${index + 1}.${extension}`;

            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download error:', err);
            alert('Failed to download file');
        }
    };

    const isVideo = (path) => {
        const ext = path.split('.').pop().toLowerCase();
        return ['mp4', 'webm', 'ogg'].includes(ext);
    };

    const statusColors = {
        OPEN: 'primary',
        PENDING: 'warning',
        RESOLVED: 'success',
        REJECTED: 'danger'
    };

    const formatDate = (dateString, withTime = false) => {
        if (!dateString) return 'N/A';
        const options = {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            ...(withTime && { hour: '2-digit', minute: '2-digit' })
        };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    if (loading) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: isDarkMode ? '#1a1d21' : '#f8fafc' }}>
                <AdminNavbar />
                <Container className="d-flex justify-content-center align-items-center flex-grow-1">
                    <Spinner animation="border" variant="primary" />
                </Container>
            </div>
        );
    }

    if (loadError || !issue) {
        return (
            <div className="min-vh-100 d-flex flex-column" style={{ background: isDarkMode ? '#1a1d21' : '#f8fafc' }}>
                <AdminNavbar />
                <Container className="py-4">
                    <Alert variant="danger">{loadError || 'Issue not found'}</Alert>
                    <Button variant="primary" onClick={() => navigate('/dashboard')}>
                        Back to Dashboard
                    </Button>
                </Container>
            </div>
        );
    }

    const currentStatus = issue.status.toUpperCase();

    return (
        <div className="min-vh-100 d-flex flex-column" style={{ background: isDarkMode ? '#121417' : '#f1f5f9' }}>
            <AdminNavbar />
            <Container className="py-4 px-lg-5" data-aos="zoom-in">
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <BackButton />
                        <h2 className={`fw-bold mb-0 ${isDarkMode ? 'text-white' : 'text-dark'}`}>{issue.title} <span className="text-muted small">/ {issue.issue_id}</span></h2>
                    </div>
                    <div className="text-end d-flex flex-column align-items-end gap-2">
                        <Badge bg={statusColors[currentStatus]} className="text-uppercase py-2 px-3 shadow-sm" style={{ letterSpacing: '0.05em' }}>
                            {currentStatus}
                        </Badge>
                        <Dropdown as={ButtonGroup} size="sm">
                            <Button variant="primary" disabled={updateStatusLoading} className="fw-bold shadow-sm">
                                {updateStatusLoading ? <Spinner size="sm" /> : 'Update Status'}
                            </Button>
                            <Dropdown.Toggle split variant="primary" id="dropdown-status-detail" />
                            <Dropdown.Menu align="end" className={`shadow border-0 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                                <Dropdown.Item active={currentStatus === 'OPEN'} onClick={() => handleStatusUpdate('OPEN')}>
                                    <i className="bi bi-circle-fill text-primary me-2 small"></i>Open
                                </Dropdown.Item>
                                <Dropdown.Item active={currentStatus === 'PENDING'} onClick={() => handleStatusUpdate('PENDING')}>
                                    <i className="bi bi-circle-fill text-warning me-2 small"></i>Pending
                                </Dropdown.Item>
                                <Dropdown.Item active={currentStatus === 'RESOLVED'} onClick={() => handleStatusUpdate('RESOLVED')}>
                                    <i className="bi bi-circle-fill text-success me-2 small"></i>Resolved
                                </Dropdown.Item>
                                <Dropdown.Item active={currentStatus === 'REJECTED'} onClick={() => handleStatusUpdate('REJECTED')}>
                                    <i className="bi bi-circle-fill text-danger me-2 small"></i>Rejected
                                </Dropdown.Item>
                            </Dropdown.Menu>
                        </Dropdown>
                    </div>
                </div>

                {successMessage && <Alert variant="success" className="mb-4 shadow-sm py-2 border-0 border-start border-4 border-success">{successMessage}</Alert>}
                {updateError && <Alert variant="danger" className="mb-4 shadow-sm py-2 border-0 border-start border-4 border-danger" onClose={() => setUpdateError('')} dismissible>{updateError}</Alert>}

                <Row className="g-4">
                    <Col lg={8}>
                        <Card className={`shadow-sm mb-4 border-0 rounded-3 ${isDarkMode ? 'bg-dark' : ''}`}>
                            <Card.Header className={`border-bottom-0 pt-4 px-4 pb-0 ${isDarkMode ? 'bg-dark' : 'bg-white'}`}>
                                <h4 className={`mb-0 fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>{issue.title}</h4>
                            </Card.Header>
                            <Card.Body className="p-4">
                                <div className="mb-4">
                                    <h6 className="text-muted text-uppercase fw-bold small mb-2 tracking-widest" style={{ fontSize: '0.7rem' }}>Description</h6>
                                    <p className={`${isDarkMode ? 'text-light' : 'text-dark'}`} style={{ fontSize: '1.05rem', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>{issue.description}</p>
                                </div>

                                <Row className="mb-4 g-3">
                                    <Col md={6}>
                                        <div className={`p-3 rounded shadow-sm h-100 border-start border-3 border-danger ${isDarkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                            <h6 className="text-muted text-uppercase fw-bold small mb-2 tracking-widest" style={{ fontSize: '0.65rem' }}>Location</h6>
                                            <p className={`mb-0 fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}><i className="bi bi-geo-alt-fill text-danger me-2"></i>{issue.location}</p>
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className={`p-3 rounded shadow-sm h-100 border-start border-3 border-primary ${isDarkMode ? 'bg-secondary bg-opacity-10' : 'bg-light'}`}>
                                            <h6 className="text-muted text-uppercase fw-bold small mb-2 tracking-widest" style={{ fontSize: '0.65rem' }}>Date of Occurrence</h6>
                                            <p className={`mb-0 fw-semibold ${isDarkMode ? 'text-light' : 'text-dark'}`}><i className="bi bi-calendar-event-fill text-primary me-2"></i>{formatDate(issue.date_of_occurrence)}</p>
                                        </div>
                                    </Col>
                                </Row>

                                {issue.media_paths && issue.media_paths.length > 0 && (
                                    <div className="mt-4 pt-3 border-top">
                                        <h6 className="text-muted text-uppercase fw-bold small mb-4 tracking-widest" style={{ fontSize: '0.7rem' }}>Attached Media ({issue.media_paths.length})</h6>
                                        <Row className="g-3">
                                            {issue.media_paths.map((path, index) => (
                                                <Col key={index} xs={12} md={6}>
                                                    <Card className="h-100 border-0 shadow-sm overflow-hidden bg-dark">
                                                        <div style={{ height: '320px' }} className="d-flex align-items-center justify-content-center">
                                                            {isVideo(path) ? (
                                                                <video
                                                                    controls
                                                                    className="w-100 h-100"
                                                                    style={{ objectFit: 'contain' }}
                                                                >
                                                                    <source src={`${BACKEND_URL}${path}`} />
                                                                    Your browser does not support the video tag.
                                                                </video>
                                                            ) : (
                                                                <img
                                                                    src={`${BACKEND_URL}${path}`}
                                                                    alt={`Issue media ${index + 1}`}
                                                                    className="w-100 h-100"
                                                                    style={{ objectFit: 'contain', cursor: 'zoom-in' }}
                                                                    onClick={() => window.open(`${BACKEND_URL}${path}`, '_blank')}
                                                                    onError={(e) => {
                                                                        e.target.src = 'https://via.placeholder.com/400x300?text=Media+Not+Found';
                                                                    }}
                                                                />
                                                            )}
                                                        </div>
                                                        <Card.Footer className={`border-0 d-flex justify-content-between align-items-center py-2 px-3 ${isDarkMode ? 'bg-secondary bg-opacity-25' : 'bg-white'}`}>
                                                            <small className={`fw-bold ${isDarkMode ? 'text-light' : 'text-muted'}`}>Item {index + 1}</small>
                                                            <Button
                                                                variant="outline-primary"
                                                                size="sm"
                                                                className={`rounded-pill px-3 border-0 ${isDarkMode ? 'bg-dark text-primary' : 'bg-light'}`}
                                                                onClick={() => handleDownload(path, index)}
                                                            >
                                                                <i className="bi bi-download me-1"></i> Download
                                                            </Button>
                                                        </Card.Footer>
                                                    </Card>
                                                </Col>
                                            ))}
                                        </Row>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>

                    <Col lg={4}>
                        <Card className={`shadow-sm border-0 mb-4 rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark' : ''}`}>
                            <Card.Header className={`fw-bold py-3 border-bottom-0 tracking-widest text-uppercase small ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`} style={{ fontSize: '0.75rem' }}>Reporter Information</Card.Header>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                    <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>Full Name</small>
                                    <span className={`fw-bold ${isDarkMode ? 'text-white' : 'text-dark'}`}>{issue.full_name || 'Anonymous'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                    <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>Phone Number</small>
                                    <span className={isDarkMode ? 'text-light' : 'text-dark'}>{issue.phone_number || 'N/A'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                    <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>Address</small>
                                    <span className={`d-block ${isDarkMode ? 'text-light' : 'text-dark'}`} style={{ fontSize: '0.9rem' }}>{issue.address || 'N/A'}</span>
                                </ListGroup.Item>
                                <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                    <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>User Type</small>
                                    <Badge bg="info" className="text-white rounded-pill px-3 py-1">
                                        {issue.user_type === 'Other' ? issue.user_type_custom : issue.user_type}
                                    </Badge>
                                </ListGroup.Item>
                            </ListGroup>
                        </Card>

                        <Card className={`shadow-sm border-0 rounded-3 overflow-hidden ${isDarkMode ? 'bg-dark' : ''}`}>
                            <Card.Header className={`fw-bold py-3 border-bottom-0 tracking-widest text-uppercase small ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`} style={{ fontSize: '0.75rem' }}>System Metadata</Card.Header>
                            <ListGroup variant="flush">
                                <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                    <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>Reported On</small>
                                    <span className={isDarkMode ? 'text-light' : 'text-dark'}>{formatDate(issue.created_at, true)}</span>
                                </ListGroup.Item>
                                {issue.resolved_at && (
                                    <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                        <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>Resolved On</small>
                                        <span className="fw-medium text-success">{formatDate(issue.resolved_at, true)}</span>
                                    </ListGroup.Item>
                                )}
                                {issue.feedback && (
                                    <ListGroup.Item className="py-3 px-4 bg-transparent border-bottom-0">
                                        <small className="text-muted d-block text-uppercase small fw-bold mb-1 tracking-widest" style={{ fontSize: '0.6rem' }}>Feedback</small>
                                        <div className={`p-3 rounded border-start border-3 border-primary italic ${isDarkMode ? 'bg-secondary bg-opacity-25 text-light' : 'bg-light text-dark'}`} style={{ fontSize: '0.9rem' }}>
                                            "{issue.feedback}"
                                            {issue.rating && (
                                                <div className="mt-2 pt-2 border-top">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`bi bi-star${i < issue.rating ? '-fill text-warning' : ''} me-1`}></i>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </ListGroup.Item>
                                )}
                            </ListGroup>
                        </Card>
                    </Col>
                </Row>
            </Container >
            <style>
                {`
                    .tracking-widest { letter-spacing: 0.12em; }
                    .italic { font-style: italic; }
                `}
            </style>
        </div >
    );
};

export default IssueDetails;

