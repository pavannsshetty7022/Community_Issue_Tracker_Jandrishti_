// frontend-admin/src/services/admin.service.js
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const login = async (username, password) => {
  console.log('Admin service - attempting login for:', username);
  console.log('Admin service - API URL:', API_URL);
  
  const response = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  console.log('Admin service - response status:', response.status);
  console.log('Admin service - response data:', data);
  
  if (!response.ok) {
    throw new Error(data.message || 'Admin login failed');
  }
  return data;
};

const getAllIssues = async (token, statusFilter = '', searchQuery = '') => {
  try {
    let url = `${API_URL}/issues`;
    const params = new URLSearchParams();
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    if (params.toString()) {
      url += `?${params.toString()}`;
    }

    console.log('Fetching issues from:', url); // Debug log
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('Server response error:', data); // Debug log
      throw new Error(data.message || 'Failed to fetch all issues');
    }

    return data;
  } catch (error) {
    console.error('Error fetching issues:', error); // Debug log
    throw new Error(error.message || 'Network error while fetching issues');
  }
};

const updateIssueStatus = async (issueId, status, token) => {
  const response = await fetch(`${API_URL}/issues/${issueId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update issue status');
  }
  return data;
};

const AdminService = {
  login,
  getAllIssues,
  updateIssueStatus
};

export default AdminService;