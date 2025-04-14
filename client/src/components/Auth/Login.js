import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/components/Login.css';
import logoImage from '../../assets/images/logo-desk.png';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [role, setRole] = useState('student');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get role from URL query parameter
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam) {
      setRole(roleParam);
    }
  }, [location]);

  const { email, password } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const res = await api.post('/api/auth/login', {
        ...formData,
        role
      });
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
            <p className="auth-subtitle">{role === 'admin' ? 'Admin Login' : 'Student Login'}</p>
          </div>

          <form onSubmit={onSubmit} className="auth-form">
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

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
              />
            </div>

            <button type="submit" className="btn btn-primary auth-button">
              Login
            </button>

            {role === 'student' && (
              <div className="auth-links">
                <p>
                  Don't have an account?{' '}
                  <Link to="/register" className="auth-link">
                    Register
                  </Link>
                </p>
              </div>
            )}

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

export default Login; 