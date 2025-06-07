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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Geometric Shapes */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/20 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-400/20 rounded-lg rotate-45 animate-spin-slow"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-indigo-400/20 rounded-full animate-bounce"></div>
        <div className="absolute bottom-40 right-10 w-12 h-12 bg-pink-400/20 rounded-lg animate-pulse"></div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-indigo-300/30 to-pink-300/30 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className={`w-full max-w-6xl grid lg:grid-cols-5 gap-8 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          
          {/* Left Side - Branding & Info */}
          <div className="lg:col-span-2 hidden lg:flex flex-col justify-center space-y-8 p-8">
            {/* University Branding */}
            <div className="space-y-6 animate-slide-in-left">
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                    {!logoError ? (
                      <img 
                        src="/logo.png" 
                        alt="Veritas University" 
                        className="w-10 h-10 object-contain"
                        onError={() => setLogoError(true)}
                      />
                    ) : (
                      <GraduationCap className="w-10 h-10 text-white" />
                    )}
                  </div>
                  <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Veritas University
                  </h1>
                  <p className="text-gray-600 font-medium">Student Exeat Management</p>
                </div>
              </div>
            </div>

            {/* Role Showcase */}
            {roleInfo && (
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-slide-in-left animation-delay-200">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-br from-${roleInfo.color}-500 to-${roleInfo.color}-600 rounded-xl flex items-center justify-center shadow-lg`}>
                    <roleInfo.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{roleInfo.title}</h3>
                    <p className="text-gray-600">{roleInfo.description}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {roleInfo.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 text-gray-700">
                      <ChevronRight className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 animate-slide-in-left animation-delay-400">
              {[
                { number: '1000+', label: 'Active Students' },
                { number: '500+', label: 'Approved Requests' },
                { number: '99.9%', label: 'System Uptime' }
              ].map((stat, index) => (
                <div key={index} className="bg-white/50 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-white/20 hover:bg-white/70 transition-all duration-300 hover:scale-105">
                  <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {stat.number}
                  </h4>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:col-span-3 flex items-center justify-center">
            <div className={`w-full max-w-lg transform transition-all duration-1000 ${
              isVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'
            }`}>
              
              {/* Login Card */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 space-y-8 hover:shadow-3xl transition-all duration-500">
                
                {/* Card Header */}
                <div className="text-center space-y-2 animate-fade-in">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    Welcome Back
                  </h2>
                  <p className="text-gray-600 font-medium">
                    Sign in to continue to your {roleInfo ? roleInfo.title.toLowerCase() : 'dashboard'}
                  </p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3 animate-shake">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-red-700 font-medium">{error}</span>
                  </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  
                  {/* Email Field */}
                  <div className="space-y-2 animate-slide-up animation-delay-100">
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 font-medium hover:bg-gray-50 focus:bg-white focus:shadow-lg"
                        placeholder="Enter your email address"
                      />
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-focus-within:border-blue-500 pointer-events-none transition-all duration-200"></div>
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2 animate-slide-up animation-delay-200">
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        value={formData.password}
                        onChange={handleInputChange}
                        className="w-full pl-12 pr-12 py-4 bg-gray-50/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400 font-medium hover:bg-gray-50 focus:bg-white focus:shadow-lg"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 focus:text-blue-500 transition-colors duration-200 focus:outline-none"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                      <div className="absolute inset-0 rounded-xl border-2 border-transparent group-focus-within:border-blue-500 pointer-events-none transition-all duration-200"></div>
                    </div>
                  </div>

                  {/* Form Options */}
                  <div className="flex items-center justify-between animate-slide-up animation-delay-300">
                    <label className="flex items-center space-x-3 cursor-pointer group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 transition-all duration-200 ${
                          rememberMe 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300 group-hover:border-gray-400'
                        }`}>
                          {rememberMe && (
                            <svg className="w-3 h-3 text-white absolute top-0.5 left-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        Remember me
                      </span>
                    </label>
                    <Link 
                      to="/forgot-password" 
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  {/* Submit Button */}
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="group relative w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none overflow-hidden animate-slide-up animation-delay-400"
                  >
                    <div className="relative z-10 flex items-center justify-center space-x-2">
                      {loading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Signing In...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </>
                      )}
                    </div>
                    
                    {/* Button Ripple Effect */}
                    <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                  </button>
                </form>

                {/* Form Footer */}
                <div className="space-y-4 animate-slide-up animation-delay-500">
                  <div className="text-center">
                    <p className="text-gray-600 font-medium">
                      Don't have an account?{' '}
                      <Link 
                        to={suggestedRole ? `/register?role=${suggestedRole}` : '/register'} 
                        className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                      >
                        Create Account
                      </Link>
                    </p>
                  </div>
                  
                  <div className="text-center pt-4 border-t border-gray-200">
                    <Link 
                      to="/" 
                      className="inline-flex items-center space-x-2 text-gray-500 hover:text-gray-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded group"
                    >
                      <Home className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
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