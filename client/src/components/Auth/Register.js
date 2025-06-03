import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Shield, 
  User,
  Mail,
  Lock,
  Phone,
  Building,
  IdCard,
  UserCheck,
  Plus,
  X
} from 'lucide-react';
import api from '../../utils/api';
import '../../styles/components/Login.css';
import logoImage from '../../assets/images/logo-desk.png';

const Register = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'student');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: selectedRole,
    // Student fields
    department: '',
    matricNumber: '',
    gender: '',
    parentEmail: '',
    // Staff/Dean/Security fields
    office: '',
    staffId: '',
    staffType: '',
    // Parent fields
    children: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Update role when URL param changes
  useEffect(() => {
    const role = searchParams.get('role') || 'student';
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
  }, [searchParams]);

  const roles = [
    { id: 'student', name: 'Student', icon: GraduationCap, color: 'bg-blue-500' },
    { id: 'parent', name: 'Parent', icon: Users, color: 'bg-green-500' },
    { id: 'staff', name: 'Staff', icon: User, color: 'bg-purple-500' },
    { id: 'dean', name: 'Dean', icon: BookOpen, color: 'bg-indigo-500' },
    { id: 'security', name: 'Security', icon: Shield, color: 'bg-red-500' }
  ];

  const staffTypes = [
    { id: 'father', name: 'Father (Boys Hostel)', gender: 'male' },
    { id: 'sister', name: 'Sister (Girls Hostel)', gender: 'female' },
    { id: 'hostel_admin', name: 'Hostel Administrator', gender: 'both' },
    { id: 'dean', name: 'Dean', gender: 'both' },
    { id: 'security_guard', name: 'Security Guard', gender: 'both' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    setFormData(prev => ({
      ...prev,
    role,
      // Reset role-specific fields when changing roles
      department: '',
      matricNumber: '',
      gender: '',
      parentEmail: '',
      office: '',
      staffId: '',
      staffType: '',
      children: []
    }));
    // Update URL
    navigate(`/register?role=${role}`, { replace: true });
  };

  const addChild = () => {
    setFormData(prev => ({
      ...prev,
      children: [...prev.children, { matricNumber: '', firstName: '', lastName: '' }]
    }));
  };

  const removeChild = (index) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.filter((_, i) => i !== index)
    }));
  };

  const updateChild = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === index ? { ...child, [field]: value } : child
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.post('/api/auth/register', formData);
      sessionStorage.setItem('token', response.data.token);
      sessionStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case 'student':
  return (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matric Number *
                </label>
                <input
                  type="text"
                  name="matricNumber"
                  value={formData.matricNumber}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., CSC/2020/001"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent Email *
                </label>
              <input
                type="email"
                  name="parentEmail"
                  value={formData.parentEmail}
                  onChange={handleInputChange}
                required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="parent@example.com"
                />
              </div>
            </div>
          </>
        );

      case 'parent':
        return (
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Children Information *
              </label>
              <button
                type="button"
                onClick={addChild}
                className="flex items-center text-sm text-blue-600 hover:text-blue-700"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Child
              </button>
            </div>

            {formData.children.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No children added yet</p>
                <button
                  type="button"
                  onClick={addChild}
                  className="mt-2 text-blue-600 hover:text-blue-700"
                >
                  Add your first child
                </button>
              </div>
            )}
            
            {formData.children.map((child, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Child {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Matric Number"
                    value={child.matricNumber}
                    onChange={(e) => updateChild(index, 'matricNumber', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={child.firstName}
                    onChange={(e) => updateChild(index, 'firstName', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
              <input
                    type="text"
                    placeholder="Last Name"
                    value={child.lastName}
                    onChange={(e) => updateChild(index, 'lastName', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
              </div>
            ))}
          </div>
        );

      case 'staff':
      case 'dean':
      case 'security':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office/Department *
              </label>
              <input
                type="text"
                name="office"
                value={formData.office}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Academic Affairs, Security Office"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff ID *
              </label>
              <input
                type="text"
                name="staffId"
                value={formData.staffId}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., ST/2024/001"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Staff Type *
              </label>
              <select
                name="staffType"
                value={formData.staffType}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select Staff Type</option>
                {staffTypes
                  .filter(type => 
                    selectedRole === 'dean' ? type.id === 'dean' :
                    selectedRole === 'security' ? type.id === 'security_guard' :
                    type.id !== 'dean' && type.id !== 'security_guard'
                  )
                  .map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))
                }
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Join the Veritas University Exeat System</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
          {/* Role Selection */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Your Role</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedRole === role.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-8 h-8 ${role.color} rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{role.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <X className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
              <input
                type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+234 xxx xxx xxxx"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                required
                    minLength={6}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="At least 6 characters"
              />
                </div>
              </div>
            </div>

            {/* Role-specific fields */}
            {selectedRole && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  {selectedRole === 'student' && <GraduationCap className="w-5 h-5 mr-2 text-blue-600" />}
                  {selectedRole === 'parent' && <Users className="w-5 h-5 mr-2 text-blue-600" />}
                  {(selectedRole === 'staff' || selectedRole === 'dean' || selectedRole === 'security') && <Building className="w-5 h-5 mr-2 text-blue-600" />}
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Information
                </h3>
                {renderRoleSpecificFields()}
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
            </button>
            </div>

            {/* Footer Links */}
            <div className="text-center space-y-4">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                  Sign In
                </Link>
              </p>

              <Link to="/" className="inline-flex items-center text-gray-500 hover:text-gray-700">
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