import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/components/LandingPage.css';
import logoImage from '../../assets/images/logo-desk.png';
import cardImage from '../../assets/images/card-image.png';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <div className="landing-wrapper">
        <div className="landing-image-section">
          <img src={cardImage} alt="Veritas University" className="card-image" />
        </div>
        <div className="landing-content-section">
          <div className="logo-container">
            <img src={logoImage} alt="Veritas Logo" className="landing-logo" />
          </div>
          <h1 className="landing-title">WELCOME TO</h1>
          <h2 className="landing-subtitle">Veritas Exeat Permission System</h2>
          
          <div className="landing-buttons">
            <Link to="/login?role=student" className="landing-button student-button">
              <i className="fas fa-user-graduate"></i> STUDENT
            </Link>
            
            <Link to="/login?role=admin" className="landing-button student-button">
              <i className="fas fa-user-tie"></i> STAFF
            </Link>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 