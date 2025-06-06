import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Mail, 
  Lock, 
  GraduationCap,
  AlertCircle,
  Eye,
  EyeOff,
  Shield,
  Users,
  UserCheck,
  Building,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import api from '../../utils/api';
import '../../styles/components/Login.css';

const Login = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const suggestedRole = searchParams.get('role');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await api.post('/api/auth/login', formData);
      
      // Store authentication data
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to dashboard
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => {
    const roleConfig = {
      student: {
        icon: GraduationCap,
        color: 'blue',
        title: 'Student Portal',
        description: 'Submit and track your exeat requests',
        features: ['Submit exeat requests', 'Track approval status', 'QR code access', 'View history']
      },
      parent: {
        icon: Users,
        color: 'green',
        title: 'Parent Portal',
        description: 'Approve your child\'s exeat requests',
        features: ['Email notifications', 'Quick approval', 'Track child activity', 'Safety updates']
      },
      staff: {
        icon: UserCheck,
        color: 'purple',
        title: 'Staff Portal',
        description: 'Manage student exeat approvals',
        features: ['Review requests', 'Bulk approvals', 'Student insights', 'Reporting tools']
      },
      dean: {
        icon: Building,
        color: 'indigo',
        title: 'Dean Portal',
        description: 'Administrative oversight and management',
        features: ['Administrative control', 'System oversight', 'Policy management', 'Analytics dashboard']
      },
      security: {
        icon: Shield,
        color: 'red',
        title: 'Security Portal',
        description: 'Monitor campus entry and exit',
        features: ['QR code scanning', 'Real-time tracking', 'Security logs', 'Alert system']
      }
    };
    return roleConfig[role] || roleConfig.student;
  };

  const roleInfo = suggestedRole ? getRoleInfo(suggestedRole) : null;

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-background">
        <div className="bg-pattern"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
          <div className="shape shape-4"></div>
          <div className="shape shape-5"></div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`login-content ${isVisible ? 'visible' : ''}`}>
        {/* Left Side - Branding & Info */}
        <div className="login-brand-section">
          <div className="brand-header">
            <div className="brand-logo">
              <div className="logo-container">
                <GraduationCap className="logo-icon" />
                <div className="logo-sparkle">
                  <Sparkles className="sparkle-icon" />
                </div>
              </div>
            </div>
            <h1 className="brand-title">Veritas University</h1>
            <p className="brand-subtitle">Student Exeat Management System</p>
          </div>

          {roleInfo && (
            <div className="role-showcase">
              <div className="role-badge">
                <roleInfo.icon className="role-icon" />
                <span>{roleInfo.title}</span>
              </div>
              <p className="role-description">{roleInfo.description}</p>
              <div className="role-features">
                {roleInfo.features.map((feature, index) => (
                  <div key={index} className="feature-item">
                    <ChevronRight className="feature-icon" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="stats-grid">
            <div className="stat-card">
              <h3>1000+</h3>
              <p>Active Students</p>
            </div>
            <div className="stat-card">
              <h3>500+</h3>
              <p>Approved Requests</p>
            </div>
            <div className="stat-card">
              <h3>99.9%</h3>
              <p>System Uptime</p>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="login-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2 className="form-title">Welcome Back</h2>
              <p className="form-subtitle">
                Sign in to continue to your {roleInfo ? roleInfo.title.toLowerCase() : 'dashboard'}
              </p>
            </div>

            {error && (
              <div className="error-banner">
                <AlertCircle className="error-icon" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  Email Address
                </label>
                <div className="input-wrapper">
                  <Mail className="input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your email address"
                  />
                  <div className="input-focus-line"></div>
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <div className="input-focus-line"></div>
                </div>
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input type="checkbox" id="remember" className="checkbox" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link to="#" className="forgot-link">
                  Forgot password?
                </Link>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="submit-button"
              >
                <span className="button-content">
                  {loading ? (
                    <>
                      <div className="loading-spinner"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ChevronRight className="button-icon" />
                    </>
                  )}
                </span>
                <div className="button-ripple"></div>
              </button>
            </form>

            <div className="form-footer">
              <p className="signup-prompt">
                Don't have an account?{' '}
                <Link 
                  to={suggestedRole ? `/register?role=${suggestedRole}` : '/register'} 
                  className="signup-link"
                >
                  Create Account
                </Link>
              </p>
              
              <Link to="/" className="back-home">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 