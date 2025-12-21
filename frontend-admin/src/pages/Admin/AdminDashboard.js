import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Card, Button, Alert, Spinner, Form,
  Badge, InputGroup, Pagination
} from 'react-bootstrap';
import AdminNavbar from '../../components/AdminNavbar';
import AdminService from '../../services/admin.service';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { socket } from '../../socket';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, logoutAdmin } = useAdminAuth();
  const { isDarkMode } = useTheme();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearchQuery, setTempSearchQuery] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchIssues = useCallback(async () => {
    if (!admin || !admin.token) {
      setError('Admin authentication required. Please log in.');
      setLoading(false);
      logoutAdmin();
      return;
    }
    setLoading(true);
    setError('');
    try {
      const fetchedIssues = await AdminService.getAllIssues(admin.token, statusFilter, searchQuery);
      setIssues(Array.isArray(fetchedIssues) ? fetchedIssues : []);
      setCurrentPage(1); // Reset to first page on new search/filter
    } catch (err) {
      setError(err.message || 'Failed to load issues.');
      if (err.message.includes('token') || err.message.includes('Unauthorized') || err.message.includes('expired')) {
        logoutAdmin();
      }
    } finally {
      setLoading(false);
    }
  }, [admin, logoutAdmin, statusFilter, searchQuery]);

  useEffect(() => {
    fetchIssues();

    socket.on('new_issue', (newIssue) => {
      setIssues(prevIssues => [newIssue, ...prevIssues]);
      setUpdateMessage(`New issue reported: ${newIssue.issue_id}`);
      setTimeout(() => setUpdateMessage(''), 5000);
    });

    socket.on('status_updated', (updatedIssue) => {
      setIssues(prevIssues =>
        prevIssues.map(issue =>
          issue.id === updatedIssue.id ? { ...issue, status: updatedIssue.status, resolved_at: updatedIssue.resolved_at } : issue
        )
      );
    });

    return () => {
      socket.off('new_issue');
      socket.off('status_updated');
    };
  }, [fetchIssues]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    setSearchQuery(tempSearchQuery);
  };

  const handleOpenMedia = (issueId) => {
    navigate(`/dashboard/issue/${issueId}`);
  };

  const statusColors = {
    OPEN: 'primary',
    PENDING: 'warning',
    RESOLVED: 'success',
    REJECTED: 'danger'
  };

  const counters = useMemo(() => {
    return {
      OPEN: issues.filter(i => i.status.toUpperCase() === 'OPEN').length,
      PENDING: issues.filter(i => i.status.toUpperCase() === 'PENDING').length,
      RESOLVED: issues.filter(i => i.status.toUpperCase() === 'RESOLVED').length,
      REJECTED: issues.filter(i => i.status.toUpperCase() === 'REJECTED').length
    };
  }, [issues]);

  // Removed isOverdue logic as per user request

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = issues.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(issues.length / itemsPerPage);

  if (loading && issues.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 flex-column" style={{ background: isDarkMode ? '#1a1d21' : '#f8fafc' }}>
        <Spinner animation="grow" variant="primary" />
        <h6 className="mt-3 text-primary text-uppercase tracking-widest">Loading Dashboard...</h6>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: isDarkMode ? '#121417' : '#f1f5f9' }}>
      <AdminNavbar />

      <Container fluid className="py-4 px-lg-5" data-aos="fade-in">
        {/* Compressed Header Section */}
        <div className={`d-flex justify-content-between align-items-center mb-4 border-bottom pb-3 ${isDarkMode ? 'border-secondary' : ''}`}>
          <div>
            <h3 className={`fw-bold mb-0 ${isDarkMode ? 'text-white' : 'text-dark'}`} style={{ fontSize: '1.5rem' }}>
              Admin Dashboard
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
              Welcome back, <span className="text-primary fw-semibold">{admin?.username?.replace(/\b\w/g, l => l.toUpperCase())}</span>
            </p>
          </div>

          {/* Status Summaries */}
          <div className="d-flex gap-2">
            {Object.entries(counters).map(([status, count], index) => (
              <div
                key={status}
                className={`px-3 py-2 rounded shadow-sm border-start border-4 border-${statusColors[status]} ${isDarkMode ? 'bg-dark text-white' : 'bg-white text-dark'}`}
                data-aos="fade-down"
                data-aos-delay={index * 100}
              >
                <div className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.65rem' }}>{status}</div>
                <div className="h5 mb-0 fw-bold">{count}</div>
              </div>
            ))}
          </div>
        </div>

        {updateMessage && <Alert variant="info" className="py-2 small shadow-sm mb-3">{updateMessage}</Alert>}
        {error && <Alert variant="danger" className="py-2 small shadow-sm mb-3">{error}</Alert>}

        {/* Improved Filters & Search Bar */}
        <Card className={`mb-4 border-0 shadow-sm overflow-hidden ${isDarkMode ? 'bg-dark' : ''}`} data-aos="fade-up">
          <Card.Body className="p-3">
            <Form onSubmit={handleSearchSubmit}>
              <Row className="g-2 align-items-center">
                <Col md={3}>
                  <Form.Select
                    size="sm"
                    className={`border-0 ${isDarkMode ? 'bg-secondary text-white' : 'bg-light text-dark'}`}
                    style={{ colorScheme: isDarkMode ? 'dark' : 'light' }}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">All Statuses</option>
                    <option value="OPEN" className={isDarkMode ? 'bg-dark text-white' : ''}>Open</option>
                    <option value="PENDING" className={isDarkMode ? 'bg-dark text-white' : ''}>Pending</option>
                    <option value="RESOLVED" className={isDarkMode ? 'bg-dark text-white' : ''}>Resolved</option>
                    <option value="REJECTED" className={isDarkMode ? 'bg-dark text-white' : ''}>Rejected</option>
                  </Form.Select>
                </Col>
                <Col md={6}>
                  <InputGroup size="sm">
                    <Form.Control
                      type="text"
                      className={`border-0 ${isDarkMode ? 'bg-secondary text-white' : 'bg-light text-dark'}`}
                      style={{
                        '::placeholder': { color: isDarkMode ? '#ccc' : '#6c757d' }
                      }}
                      placeholder="Search by ID, Title, or Description..."
                      value={tempSearchQuery}
                      onChange={(e) => setTempSearchQuery(e.target.value)}
                    />
                    <Button variant="primary" type="submit">
                      Search
                    </Button>
                  </InputGroup>
                </Col>
                <Col md={3} className="d-flex gap-2 text-end">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="flex-grow-1 border-0"
                    onClick={() => { setTempSearchQuery(''); setSearchQuery(''); setStatusFilter(''); fetchIssues(); }}
                  >
                    <i className="bi bi-x-circle me-1"></i> Clear
                  </Button>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="flex-grow-1 border-0"
                    onClick={fetchIssues}
                    disabled={loading}
                  >
                    <i className="bi bi-arrow-clockwise"></i> Refresh
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* Issue Cards Grid */}
        {issues.length === 0 ? (
          <div className={`text-center py-5 rounded shadow-sm ${isDarkMode ? 'bg-dark text-white border border-secondary' : 'bg-white text-muted'}`}>
            <i className="bi bi-inbox display-4"></i>
            <p className="mt-3">No issues found matching your criteria</p>
          </div>
        ) : (
          <>
            <Row className="g-4">
              {currentItems.map((issue) => (
                <Col key={issue.id} md={6} lg={4} xl={3}>
                  <Card className={`h-100 border-0 shadow-sm position-relative overflow-hidden issue-card-hover ${isDarkMode ? 'bg-dark text-white pt-4' : 'bg-white text-dark pt-4'}`} style={{ transition: 'transform 0.2s' }}>
                    <Card.Body className="d-flex flex-column pt-3">
                      <div className="position-absolute top-0 end-0 p-2 d-flex flex-column align-items-end gap-1">
                        <Badge bg={statusColors[issue.status.toUpperCase()]} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                          {issue.status}
                        </Badge>
                        <small className="text-muted fw-bold" style={{ fontSize: '0.65rem' }}>ID: {issue.id}</small>
                      </div>

                      <Card.Title className="fw-bold mb-2 pe-5" style={{ fontSize: '1.05rem', lineHeight: '1.3' }}>
                        {issue.title}
                      </Card.Title>

                      <Card.Text className="text-muted mb-4 flex-grow-1" style={{ fontSize: '0.85rem', opacity: '0.8' }}>
                        {issue.description.length > 90 ? `${issue.description.substring(0, 90)}...` : issue.description}
                      </Card.Text>

                      <div className="mt-auto border-top pt-3 border-secondary">
                        <div className="d-flex align-items-center mb-2" style={{ fontSize: '0.8rem' }}>
                          <i className="bi bi-person-circle text-primary me-2"></i>
                          <span className={`${isDarkMode ? 'text-light' : 'text-dark'} fw-medium text-truncate`}>{issue.full_name || 'Anonymous'}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2" style={{ fontSize: '0.8rem' }}>
                          <i className="bi bi-calendar3 text-muted me-2"></i>
                          <span className="text-muted">{new Date(issue.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="d-flex align-items-center mb-3" style={{ fontSize: '0.8rem' }}>
                          <i className="bi bi-geo-alt text-danger me-2"></i>
                          <span className="text-muted text-truncate">{issue.location}</span>
                        </div>

                        <Button
                          variant={isDarkMode ? "outline-primary" : "primary"}
                          className={`w-100 rounded-pill btn-sm fw-bold shadow-sm py-2 ${isDarkMode ? 'border-2' : ''}`}
                          onClick={() => handleOpenMedia(issue.id)}
                        >
                          View Details
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="d-flex justify-content-center mt-5">
                <Pagination size="sm">
                  <Pagination.First onClick={() => setCurrentPage(1)} disabled={currentPage === 1} />
                  <Pagination.Prev onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1} />
                  {[...Array(totalPages)].map((_, i) => (
                    <Pagination.Item
                      key={i + 1}
                      active={i + 1 === currentPage}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Pagination.Item>
                  ))}
                  <Pagination.Next onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages} />
                  <Pagination.Last onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages} />
                </Pagination>
              </div>
            )}
          </>
        )}
      </Container>
      <style>
        {`
          .issue-card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.1) !important;
          }
          .tracking-widest {
            letter-spacing: 0.1em;
          }
        `}
      </style>
    </div>
  );
};

export default AdminDashboard;