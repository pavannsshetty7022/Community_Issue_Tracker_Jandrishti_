
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

const reportIssue = async (issueData, mediaFiles, token) => {
  const formData = new FormData();
  for (const key in issueData) {
    formData.append(key, issueData[key]);
  }
  if (mediaFiles && mediaFiles.length > 0) {
    mediaFiles.forEach((file) => {
      formData.append('media', file);
    });
  }

  const response = await fetch(`${API_URL}/issues`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to report issue');
  }
  return data;
};

const getUserIssues = async (userId, token) => {
  const response = await fetch(`${API_URL}/issues/user/${userId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user issues');
  }
  return data;
};

const searchUserIssue = async (issueId, token) => {
  const response = await fetch(`${API_URL}/issues/search/${issueId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to search issue');
  }
  return data;
};

const editIssue = async (issueId, issueData, newMediaFiles, existingMediaPaths, token) => {
  const formData = new FormData();
  for (const key in issueData) {
    formData.append(key, issueData[key]);
  }


  if (newMediaFiles && newMediaFiles.length > 0) {
    newMediaFiles.forEach((file) => {
      formData.append('newMedia', file);
    });
  }

  if (existingMediaPaths && existingMediaPaths.length > 0) {
    formData.append('existingMedia', JSON.stringify(existingMediaPaths));
  } else {
    formData.append('existingMedia', '[]'); 
  }

  const response = await fetch(`${API_URL}/issues/${issueId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to edit issue');
  }
  return data;
};

const deleteIssue = async (issueId, token) => {
  const response = await fetch(`${API_URL}/issues/${issueId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete issue');
  }
  return data;
};

const IssueService = {
  reportIssue,
  getUserIssues,
  searchUserIssue,
  editIssue,
  deleteIssue
};

export default IssueService;