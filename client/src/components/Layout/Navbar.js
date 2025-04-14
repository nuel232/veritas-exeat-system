import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo-desk.png';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  
  const logout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <img src={logoImage} alt="Veritas Logo" className="navbar-logo-img" />
          <span className="navbar-title">Veritas Exeat Permission System</span>
        </Link>
        
        <div className="navbar-menu">
          <div className="navbar-user">
            <span className="username">Welcome, {user.firstName || 'User'}</span>
            <div className="navbar-role">{user.role === 'admin' ? 'Admin' : 'Student'}</div>
          </div>
          
          <button onClick={logout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 