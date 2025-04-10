import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../../styles/layout/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          Veritas Exeat System
        </Link>

        <ul className="navbar-nav">
          <li>
            <Link to="/dashboard" className="nav-link">
              Dashboard
            </Link>
          </li>
          {user.role === 'student' && (
            <li>
              <Link to="/exeat/new" className="nav-link">
                New Request
              </Link>
            </li>
          )}
        </ul>

        <div className="nav-user">
          <div className="nav-user-info">
            <span className="nav-user-name">{user.firstName} {user.lastName}</span>
            <span className="nav-user-role">{user.role}</span>
          </div>
          <button onClick={handleLogout} className="action-button primary">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 