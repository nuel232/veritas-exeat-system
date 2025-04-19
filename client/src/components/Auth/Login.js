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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
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

  // Validate a single field
  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'email':
        if (!value) {
          error = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          error = 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          error = 'Password is required';
        } else if (value.length < 6) {
          error = 'Password must be at least 6 characters';
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  // Validate the entire form
  const validateForm = () => {
    const errors = {};
    
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        errors[key] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = e => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields({ ...touchedFields, [name]: true });
    }
    
    // Real-time validation
    const error = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: error
    });
  };

  const onBlur = e => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields({ ...touchedFields, [name]: true });
    
    // Validate on blur
    const error = validateField(name, value);
    setValidationErrors({
      ...validationErrors,
      [name]: error
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouchedFields(allTouched);
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const res = await api.post('/api/auth/login', {
        ...formData,
        role
      });
      sessionStorage.setItem('token', res.data.token);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Show success animation before redirecting
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
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

          <form onSubmit={onSubmit} className="auth-form" noValidate>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                onBlur={onBlur}
                className={`form-input ${touchedFields.email && validationErrors.email ? 'error' : ''}`}
                placeholder="Enter your email"
                aria-invalid={touchedFields.email && validationErrors.email ? 'true' : 'false'}
                aria-describedby={validationErrors.email ? 'email-error' : undefined}
                autoComplete="email"
              />
              {touchedFields.email && validationErrors.email && (
                <span className="form-error" id="email-error">{validationErrors.email}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <div className="form-icon">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={onChange}
                  onBlur={onBlur}
                  className={`form-input ${touchedFields.password && validationErrors.password ? 'error' : ''}`}
                  placeholder="Enter your password"
                  aria-invalid={touchedFields.password && validationErrors.password ? 'true' : 'false'}
                  aria-describedby={validationErrors.password ? 'password-error' : undefined}
                  autoComplete="current-password"
                />
                <span 
                  className="form-icon-right" 
                  onClick={togglePasswordVisibility}
                  onKeyDown={(e) => e.key === 'Enter' && togglePasswordVisibility()}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  role="button"
                  tabIndex="0"
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </span>
              </div>
              {touchedFields.password && validationErrors.password && (
                <span className="form-error" id="password-error">{validationErrors.password}</span>
              )}
            </div>

            <button 
              type="submit" 
              className={`auth-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
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