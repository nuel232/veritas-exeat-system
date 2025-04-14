import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/pages/Dashboard.css';

const AdminDashboard = ({ exeatRequests, navigate }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRequests = exeatRequests.filter(request => {
    const matchesFilter = filter === 'all' || request.status === filter;
    const matchesSearch = request.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.student.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: exeatRequests.length,
    pending: exeatRequests.filter(req => req.status === 'pending').length,
    approved: exeatRequests.filter(req => req.status === 'approved').length,
    rejected: exeatRequests.filter(req => req.status === 'rejected').length
  };

  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h2 className="content-title">Exeat Requests Management</h2>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3 className="stat-title">Total Requests</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Pending Requests</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Approved Requests</h3>
          <p className="stat-value">{stats.approved}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Rejected Requests</h3>
          <p className="stat-value">{stats.rejected}</p>
        </div>
      </div>

      <div className="filters">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-input"
        >
          <option value="all">All Requests</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <input
          type="text"
          placeholder="Search by student name or matric number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="filter-input"
        />
      </div>

      {filteredRequests.length === 0 ? (
        <p>No exeat requests found.</p>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Matric Number</th>
              <th>Department</th>
              <th>Date Requested</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(request => (
              <tr key={request._id}>
                <td>{request.student.firstName} {request.student.lastName}</td>
                <td>{request.student.matricNumber}</td>
                <td>{request.student.department}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-button primary"
                    onClick={() => navigate(`/exeat/${request._id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const StudentDashboard = ({ exeatRequests, navigate }) => {
  const stats = {
    total: exeatRequests.length,
    pending: exeatRequests.filter(req => req.status === 'pending').length,
    approved: exeatRequests.filter(req => req.status === 'approved').length
  };

  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h2 className="content-title">My Exeat Requests</h2>
        <button 
          className="action-button primary"
          onClick={() => navigate('/exeat-request')}
        >
          New Exeat Request
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3 className="stat-title">Total Requests</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Pending Requests</h3>
          <p className="stat-value">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3 className="stat-title">Approved Requests</h3>
          <p className="stat-value">{stats.approved}</p>
        </div>
      </div>

      {exeatRequests.length === 0 ? (
        <div className="empty-state">
          <p>You haven't made any exeat requests yet.</p>
          <button 
            className="action-button primary"
            onClick={() => navigate('/exeat-request')}
          >
            Create Your First Request
          </button>
        </div>
      ) : (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>Request Date</th>
              <th>Departure Date</th>
              <th>Return Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exeatRequests.map(request => (
              <tr key={request._id}>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>{new Date(request.departureDate).toLocaleDateString()}</td>
                <td>{new Date(request.returnDate).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge status-${request.status.toLowerCase()}`}>
                    {request.status}
                  </span>
                </td>
                <td>
                  <button 
                    className="action-button primary"
                    onClick={() => navigate(`/exeat/${request._id}`)}
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

const Dashboard = () => {
  const [exeatRequests, setExeatRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);
  const navigate = useNavigate();
  
  // Try to get user from session storage first, then local storage
  const userString = sessionStorage.getItem('user') || localStorage.getItem('user');
  const [user, setUser] = useState(userString ? JSON.parse(userString) : null);

  useEffect(() => {
    // If no user is found, redirect to login
    if (!user) {
      setError('No user found. Please login again.');
      setLoading(false);
      setTimeout(() => navigate('/login'), 3000);
      return;
    }

    const fetchExeatRequests = async () => {
      try {
        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        
        if (!token) {
          setError('No authentication token found. Please login again.');
          setLoading(false);
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        // Add debug information
        setDebugInfo({
          user: user,
          token: token ? `${token.substring(0, 10)}...` : 'None',
          endpoint: user.role === 'admin' ? '/api/exeat' : '/api/exeat/my-requests'
        });

        // Make the API request with proper auth header
        const endpoint = user.role === 'admin' ? '/api/exeat' : '/api/exeat/my-requests';
        const res = await api.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        setExeatRequests(Array.isArray(res.data) ? res.data : []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching exeat requests:', err);
        
        // Extract detailed error information
        const errorMessage = err.response?.data?.message || err.message || 'An unknown error occurred';
        const statusCode = err.response?.status || 'No status';
        
        setError(`Failed to fetch exeat requests: ${errorMessage} (Status: ${statusCode})`);
        setLoading(false);
      }
    };

    fetchExeatRequests();
  }, [user, navigate]);

  // Check for connection issues with the backend
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        await api.get('/api/test/db');
        // Server is reachable, no action needed
      } catch (err) {
        setError(prev => prev || 'Cannot connect to the server. Please check if the backend is running.');
      }
    };
    
    checkServerStatus();
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Loading dashboard data...</div>;
  }

  if (!user) {
    return (
      <div className="dashboard">
        <div className="alert alert-error">
          {error || 'No user found. Please login again.'}
          <button 
            onClick={() => navigate('/login')}
            className="action-button primary"
            style={{ marginLeft: '10px' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.firstName || 'User'}!</h1>
          <p className="dashboard-subtitle">
            {user.role === 'admin' 
              ? 'Manage student exeat requests'
              : 'Manage your exeat requests'}
          </p>
        </div>
        <button onClick={handleLogout} className="action-button primary">
          Logout
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {debugInfo && debugInfo.user && debugInfo.user.role === 'admin' && (
        <div className="debug-info" style={{ marginBottom: '20px', fontSize: '0.8rem', color: '#666' }}>
          <details>
            <summary>Debug Information (Admin Only)</summary>
            <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
          </details>
        </div>
      )}

      {!error && exeatRequests.length === 0 && (
        <div className="dashboard-content">
          <div className="empty-state">
            <h3>No Exeat Requests Found</h3>
            <p>
              {user.role === 'admin' 
                ? 'There are no exeat requests in the system yet.' 
                : 'You have not created any exeat requests yet.'}
            </p>
            {user.role !== 'admin' && (
              <button 
                className="action-button primary"
                onClick={() => navigate('/exeat-request')}
              >
                Create Your First Request
              </button>
            )}
          </div>
        </div>
      )}

      {!error && exeatRequests.length > 0 && (
        user.role === 'admin' ? (
          <AdminDashboard exeatRequests={exeatRequests} navigate={navigate} />
        ) : (
          <StudentDashboard exeatRequests={exeatRequests} navigate={navigate} />
        )
      )}
    </div>
  );
};

export default Dashboard; 