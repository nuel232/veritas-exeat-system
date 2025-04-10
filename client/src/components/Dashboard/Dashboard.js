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
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchExeatRequests = async () => {
      try {
        const token = localStorage.getItem('token');
        const endpoint = user.role === 'admin' ? '/api/exeat' : '/api/exeat/my-requests';
        const res = await api.get(endpoint, {
          headers: { 'x-auth-token': token }
        });
        setExeatRequests(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch exeat requests');
        setLoading(false);
      }
    };

    fetchExeatRequests();
  }, [user.role]);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Welcome, {user?.firstName}!</h1>
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

      {user.role === 'admin' ? (
        <AdminDashboard exeatRequests={exeatRequests} navigate={navigate} />
      ) : (
        <StudentDashboard exeatRequests={exeatRequests} navigate={navigate} />
      )}
    </div>
  );
};

export default Dashboard; 