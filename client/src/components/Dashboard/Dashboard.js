import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  QrCode,
  Shield,
  BookOpen,
  User,
  Eye,
  Calendar,
  MapPin,
  AlertCircle
} from 'lucide-react';
import api from '../../utils/api';
import '../../styles/pages/Dashboard.css';

const AdminDashboard = ({ exeatRequests, navigate }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Filter and sort requests
  const filteredRequests = exeatRequests
    .filter(request => {
      const matchesFilter = filter === 'all' || request.status === filter;
      const matchesSearch = request.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           request.student.matricNumber.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => {
      let valueA, valueB;
      
      // Determine what to sort by
      switch(sortBy) {
        case 'studentName':
          valueA = `${a.student.firstName} ${a.student.lastName}`.toLowerCase();
          valueB = `${b.student.firstName} ${b.student.lastName}`.toLowerCase();
          break;
        case 'department':
          valueA = a.student.department.toLowerCase();
          valueB = b.student.department.toLowerCase();
          break;
        case 'status':
          valueA = a.status.toLowerCase();
          valueB = b.status.toLowerCase();
          break;
        case 'createdAt':
        default:
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
      }
      
      // Apply sort order
      return sortOrder === 'asc' 
        ? (valueA > valueB ? 1 : -1)
        : (valueA < valueB ? 1 : -1);
    });

  const stats = {
    total: exeatRequests.length,
    pending: exeatRequests.filter(req => req.status === 'pending').length,
    approved: exeatRequests.filter(req => req.status === 'approved').length,
    rejected: exeatRequests.filter(req => req.status === 'rejected').length
  };

  const handleRowClick = (requestId) => {
    navigate(`/exeat/${requestId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  return (
    <div className="dashboard-content">
      <div className="content-header">
        <h2 className="content-title">Exeat Requests Management</h2>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-title">TOTAL REQUESTS</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-icon"><i className="fas fa-clipboard-list"></i></div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-title">PENDING REQUESTS</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
        </div>
        
        <div className="stat-card approved">
          <div className="stat-title">APPROVED REQUESTS</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-title">REJECTED REQUESTS</div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-icon"><i className="fas fa-times-circle"></i></div>
        </div>
      </div>

      <div className="filter-controls">
        <div className="filter-section-left">
          <div className="filter-group">
            <h3 className="filter-heading">Filter By Status</h3>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Requests</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="used">Used</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        
        <div className="filter-section-right">
          <div className="filter-group">
            <h3 className="filter-heading">Search Requests</h3>
            <input
              type="text"
              placeholder="Search by student name or matric number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </div>
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
              <tr 
                key={request._id} 
                onClick={() => handleRowClick(request._id)}
                className="clickable-row"
              >
                <td>{request.student.firstName} {request.student.lastName}</td>
                <td>{request.student.matricNumber}</td>
                <td>{request.student.department}</td>
                <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                <td>
                  {request.status === 'rejected' && request.rejectionReason ? (
                    <div className="tooltip">
                      <span className={`status-badge status-${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                      <span className="tooltip-text">
                        Reason: {request.rejectionReason}
                      </span>
                    </div>
                  ) : (
                    <span className={`status-badge status-${request.status.toLowerCase()}`}>
                      {request.status}
                    </span>
                  )}
                </td>
                <td>
                  <button 
                    className="action-button primary"
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent row click event
                      navigate(`/exeat/${request._id}`);
                    }}
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
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Sort requests
  const sortedRequests = [...exeatRequests].sort((a, b) => {
    let valueA, valueB;
    
    // Determine what to sort by
    switch(sortBy) {
      case 'departureDate':
        valueA = new Date(a.departureDate);
        valueB = new Date(b.departureDate);
        break;
      case 'returnDate':
        valueA = new Date(a.returnDate);
        valueB = new Date(b.returnDate);
        break;
      case 'status':
        valueA = a.status.toLowerCase();
        valueB = b.status.toLowerCase();
        break;
      case 'createdAt':
      default:
        valueA = new Date(a.createdAt);
        valueB = new Date(b.createdAt);
    }
    
    // Apply sort order
    return sortOrder === 'asc' 
      ? (valueA > valueB ? 1 : -1)
      : (valueA < valueB ? 1 : -1);
  });

  const stats = {
    total: exeatRequests.length,
    pending: exeatRequests.filter(req => req.status === 'pending').length,
    approved: exeatRequests.filter(req => req.status === 'approved').length,
    rejected: exeatRequests.filter(req => req.status === 'rejected').length,
    expired: exeatRequests.filter(req => req.status === 'expired').length
  };

  const handleRowClick = (requestId) => {
    navigate(`/exeat/${requestId}`);
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
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
          <div className="stat-title">TOTAL REQUESTS</div>
          <div className="stat-value">{stats.total}</div>
          <div className="stat-icon"><i className="fas fa-clipboard-list"></i></div>
        </div>
        
        <div className="stat-card pending">
          <div className="stat-title">PENDING REQUESTS</div>
          <div className="stat-value">{stats.pending}</div>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
        </div>
        
        <div className="stat-card approved">
          <div className="stat-title">APPROVED REQUESTS</div>
          <div className="stat-value">{stats.approved}</div>
          <div className="stat-icon"><i className="fas fa-check-circle"></i></div>
        </div>
        
        <div className="stat-card rejected">
          <div className="stat-title">REJECTED REQUESTS</div>
          <div className="stat-value">{stats.rejected}</div>
          <div className="stat-icon"><i className="fas fa-times-circle"></i></div>
        </div>
        
        <div className="stat-card expired">
          <div className="stat-title">EXPIRED REQUESTS</div>
          <div className="stat-value">{stats.expired}</div>
          <div className="stat-icon"><i className="fas fa-clock"></i></div>
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
        <>
          <div className="filter-controls">
            <div className="filter-section-left">
              <div className="filter-group">
                <h3 className="filter-heading">Sort Exeat Requests</h3>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="filter-select"
                >
                  <option value="createdAt">Date Requested</option>
                  <option value="departureDate">Departure Date</option>
                  <option value="returnDate">Return Date</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>
        
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
              {sortedRequests.map(request => (
                <tr 
                  key={request._id} 
                  onClick={() => handleRowClick(request._id)}
                  className="clickable-row"
                >
                  <td>{new Date(request.createdAt).toLocaleDateString()}</td>
                  <td>{new Date(request.departureDate).toLocaleDateString()}</td>
                  <td>{new Date(request.returnDate).toLocaleDateString()}</td>
                  <td>
                    {request.status === 'rejected' && request.rejectionReason ? (
                      <div className="tooltip">
                        <span className={`status-badge status-${request.status.toLowerCase()}`}>
                          {request.status}
                        </span>
                        <span className="tooltip-text">
                          Reason: {request.rejectionReason}
                        </span>
                      </div>
                    ) : (
                      <span className={`status-badge status-${request.status.toLowerCase()}`}>
                        {request.status}
                      </span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="action-button primary"
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click event
                        navigate(`/exeat/${request._id}`);
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
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

  // Function to check and update expired exeats
  const checkExpiredExeats = async (exeats) => {
    const currentDate = new Date();
    const expiredExeats = exeats.filter(exeat => 
      exeat.status === 'approved' && 
      new Date(exeat.returnDate) < currentDate
    );
    
    // If there are any expired exeats, update them
    if (expiredExeats.length > 0) {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      try {
        // Update each expired exeat's status
        for (const exeat of expiredExeats) {
          await api.patch(`/api/exeat/${exeat._id}/status`, 
            { status: 'expired' },
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'x-auth-token': token,
                'Content-Type': 'application/json'
              }
            }
          );
        }
        
        // Fetch updated exeats after marking some as expired
        const endpoint = user.role === 'admin' ? '/api/exeat' : '/api/exeat/my-requests';
        const res = await api.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        return Array.isArray(res.data) ? res.data : [];
      } catch (err) {
        console.error('Error updating expired exeats:', err);
        // Return the original list if update fails
        return exeats;
      }
    }
    
    // If no exeats need updating, return the original list
    return exeats;
  };

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
        let endpoint = null;
        if (user.role === 'admin') {
          endpoint = '/api/exeat';
        } else if (user.role === 'student') {
          endpoint = '/api/exeat/my-requests';
        } else if (user.role === 'staff' || user.role === 'dean') {
          endpoint = '/api/exeat/pending-approval';
        }

        if (!endpoint) {
          setError('Your role does not have access to exeat requests.');
          setLoading(false);
          return;
        }

        const res = await api.get(endpoint, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-auth-token': token,
            'Content-Type': 'application/json'
          }
        });
        
        let exeats = Array.isArray(res.data) ? res.data : [];
        
        // Check for and update expired exeats
        const updatedExeats = await checkExpiredExeats(exeats);
        
        setExeatRequests(updatedExeats);
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
