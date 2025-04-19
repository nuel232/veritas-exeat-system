import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/logo-desk.png';
import '../../styles/components/Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Get user info from session storage
  const user = JSON.parse(sessionStorage.getItem('user')) || {};
  const { firstName = 'User', role } = user;
  
  const logout = () => {
    // Clear session storage
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    // Navigate to home
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const renderRole = () => {
    if (!role) return '';
    return role === 'admin' ? 'Admin' : 'Student';
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-logo">
          <img src={logoImage} alt="Logo" className="navbar-logo-img" />
        </Link>
        
        <div className="navbar-menu">
          <div className="navbar-user">
            <span className="username">Hello, {firstName}</span>
            <span className="navbar-role">{renderRole()}</span>
          </div>
          <button onClick={logout} className="logout-button">
            <i className="fas fa-sign-out-alt"></i> Logout
          </button>
          <button className="mobile-toggle" onClick={toggleMobileMenu}>
            <i className={mobileMenuOpen ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        </div>
      </div>
      
      <div className={`mobile-menu ${mobileMenuOpen ? 'show' : ''}`}>
        <div className="mobile-user-info">
          <span className="username">Hello, {firstName}</span>
          <span className="navbar-role">{renderRole()}</span>
        </div>
        <Link to="/dashboard" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
          <i className="fas fa-home"></i> Dashboard
        </Link>
        <Link to="/exeat-request" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
          <i className="fas fa-plus-circle"></i> New Exeat
        </Link>
        <Link to="/exeat/history" className="mobile-menu-item" onClick={() => setMobileMenuOpen(false)}>
          <i className="fas fa-history"></i> History
        </Link>
        <button onClick={logout} className="mobile-logout-button">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar; 