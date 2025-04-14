import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/components/Login.css';
import logoImage from '../../assets/images/logo-desk.png';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
    department: '',
    matricNumber: '',
    phoneNumber: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    firstName,
    lastName,
    email,
    password,
    role,
    department,
    matricNumber,
    phoneNumber
  } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/register', formData);
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-form-container">
          <div className="auth-header">
            <img src={logoImage} alt="Veritas Logo" className="auth-logo" />
            <h1 className="auth-title">Veritas Exeat Permission System</h1>
            <p className="auth-subtitle">Student Registration</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={firstName}
                  onChange={onChange}
                  required
                  className="form-input"
                  placeholder="Enter your first name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={lastName}
                  onChange={onChange}
                  required
                  className="form-input"
                  placeholder="Enter your last name"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Enter your password"
                minLength="6"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <input
                type="text"
                name="department"
                value={department}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Enter your department"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Matriculation Number</label>
              <input
                type="text"
                name="matricNumber"
                value={matricNumber}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Enter your matriculation number"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="text"
                name="phoneNumber"
                value={phoneNumber}
                onChange={onChange}
                required
                className="form-input"
                placeholder="Enter your phone number"
              />
            </div>

            <button type="submit" className="btn btn-primary auth-button">
              Register
            </button>

            <div className="auth-links">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Login
                </Link>
              </p>
            </div>

            <div className="auth-back-link">
              <Link to="/" className="back-to-home">
                ← Back to Home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register; 