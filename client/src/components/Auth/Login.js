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
  Sparkles,
  Home,
  Loader2
} from 'lucide-react';
import api from '../../utils/api';

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
  const [rememberMe, setRememberMe] = useState(false);
  const [logoError, setLogoError] = useState(false);

  const suggestedRole = searchParams.get('role');

  useEffect(() => {
    // Animate page entrance
    setTimeout(() => setIsVisible(true), 100);
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
      {/* Animated Background Elements */}
      <div className="login-background">
        {/* Floating Geometric Shapes */}
        <div className="floating-shape floating-shape-1 animate-pulse"></div>
        <div className="floating-shape floating-shape-2 animate-spin-slow"></div>
        <div className="floating-shape floating-shape-3 animate-bounce"></div>
        <div className="floating-shape floating-shape-4 animate-pulse"></div>
        
        {/* Gradient Orbs */}
        <div className="gradient-orb-1 animate-float"></div>
        <div className="gradient-orb-2 animate-float-delayed"></div>
      </div>

      {/* Main Container */}
      <div className="login-main">
        <div className={`login-grid ${isVisible ? 'visible' : ''}`}>
          
          {/* Left Side - Branding & Info */}
          <div className="login-sidebar">
            {/* University Branding */}
            <div className="university-branding animate-slide-in-left">
              <div className="brand-header">
                <div className="logo-container">
                  {!logoError ? (
                    <img 
                      src="/logo.png" 
                      alt="Veritas University"
                      onError={() => setLogoError(true)}
                    />
                  ) : (
                    <GraduationCap />
                  )}
                  <Sparkles className="logo-sparkle animate-pulse" />
                </div>
                <div className="brand-text">
                  <h1>Veritas University</h1>
                  <p>Student Exeat Management</p>
                </div>
              </div>
            </div>

            {/* Role Showcase */}
            {roleInfo && (
              <div className="role-showcase animate-slide-in-left animation-delay-200">
                <div className="role-header">
                  <div className={`role-icon ${roleInfo.color}`}>
                    <roleInfo.icon />
                  </div>
                  <div className="role-info">
                    <h3>{roleInfo.title}</h3>
                    <p>{roleInfo.description}</p>
                  </div>
                </div>
                <div className="role-features">
                  {roleInfo.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <ChevronRight className="feature-icon" />
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid animate-slide-in-left animation-delay-400">
              {[
                { number: '1000+', label: 'Active Students' },
                { number: '500+', label: 'Approved Requests' },
                { number: '99.9%', label: 'System Uptime' }
              ].map((stat, index) => (
                <div key={index} className="stat-card">
                  <h4 className="stat-number">{stat.number}</h4>
                  <p className="stat-label">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="login-form-section">
            <div className={`login-form-container ${isVisible ? 'visible' : ''}`}>
              
              {/* Login Card */}
              <div className="login-card">
                
                {/* Card Header */}
                <div className="card-header animate-fade-in">
                  <h2 className="card-title">Welcome Back</h2>
                  <p className="card-subtitle">
                    Sign in to continue to your {roleInfo ? roleInfo.title.toLowerCase() : 'dashboard'}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="error-banner animate-shake">
                    <AlertCircle className="error-icon" />
                    <span className="error-text">{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="login-form">
                  
                  {/* Email Field */}
                  <div className="form-group animate-slide-up animation-delay-100">
                    <label htmlFor="email" className="form-label">
                      Email Address
                    </label>
                    <div className="input-wrapper group">
                      <div className="input-icon-left">
                        <Mail />
                      </div>
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
                      <div className="input-focus-border"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="form-group animate-slide-up animation-delay-200">
                    <label htmlFor="password" className="form-label">
                      Password
                    </label>
                    <div className="input-wrapper group">
                      <div className="input-icon-left">
                        <Lock />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="form-input password-input"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="input-icon-right"
                      >
                        {showPassword ? <EyeOff /> : <Eye />}
                      </button>
                      <div className="input-focus-border"></div>
                    </div>
                  </div>

                  {/* Form Options */}
                  <div className="form-options animate-slide-up animation-delay-300">
                    <label className="checkbox-wrapper">
                      <div className="checkbox-container">
                        <input 
                          type="checkbox" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="checkbox-input"
                        />
                        <div className={`checkbox-custom ${rememberMe ? 'checked' : 'unchecked'}`}>
                          {rememberMe && (
                            <svg className="checkbox-icon" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="checkbox-label">Remember me</span>
                    </label>
                    <Link to="/forgot-password" className="forgot-link">
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="submit-button animate-slide-up animation-delay-400"
                  >
                    <div className="button-content">
                      {loading ? (
                        <>
                          <Loader2 className="loading-icon animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ChevronRight className="chevron-icon" />
                        </>
                      )}
                    </div>
                    <div className="button-ripple"></div>
                  </button>
                </form>

                {/* Form Footer */}
                <div className="form-footer animate-slide-up animation-delay-500">
                  <div>
                    <p className="signup-text">
                      Don't have an account?{' '}
                      <Link 
                        to={suggestedRole ? `/register?role=${suggestedRole}` : '/register'} 
                        className="signup-link"
                      >
                        Create Account
                      </Link>
                    </p>
                  </div>
                  
                  <div className="footer-divider">
                    <Link to="/" className="home-link">
                      <Home className="home-icon" />
                      <span>Back to Home</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 