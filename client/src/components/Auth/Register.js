import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  Loader, 
  GraduationCap, 
  Users, 
  User, 
  Shield, 
  BookOpen,
  Plus,
  X,
  Mail,
  Phone,
  Lock,
  IdCard,
  Building
} from 'lucide-react';
import api from '../../utils/api';
import logo from '../../assets/logo-desk.png';
import '../../styles/components/Register.css';

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
    role: searchParams.get('role') || 'student',
    // Student fields
    department: '',
    matricNumber: '',
    gender: '',
    parentEmail: '',
    year: '',
    // Staff fields
    office: '',
    staffId: '',
    staffType: '',
    // Dean fields (office inherited from staff)
    // Security fields
    // Parent fields
    children: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Student search states for parent role
  const [studentSearchResults, setStudentSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [showSearchResults, setShowSearchResults] = useState({});
  
  // Ref for search dropdown to handle click outside
  const searchDropdownRefs = useRef({});

  // Update role when URL param changes
  useEffect(() => {
    const role = searchParams.get('role') || 'student';
    setSelectedRole(role);
    setFormData(prev => ({ ...prev, role }));
  }, [searchParams]);

  // Handle click outside to close search results
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(showSearchResults).forEach(index => {
        const dropdownRef = searchDropdownRefs.current[index];
        if (dropdownRef && !dropdownRef.contains(event.target) && showSearchResults[index]) {
          setShowSearchResults(prev => ({ ...prev, [index]: false }));
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const roles = [
    { id: 'student', name: 'Student', icon: GraduationCap, color: '#2F54EB' },
    { id: 'parent', name: 'Parent', icon: Users, color: '#10B981' },
    { id: 'staff', name: 'Staff', icon: User, color: '#8B5CF6' },
    { id: 'security', name: 'Security', icon: Shield, color: '#EF4444' }
  ];

  const staffTypes = [
    { id: 'father', name: 'Father (Boys Hostel)', gender: 'male' },
    { id: 'sister', name: 'Sister (Girls Hostel)', gender: 'female' },
    { id: 'hostel_admin', name: 'Hostel Administrator', gender: 'both' }
  ];

  const departments = [
    { id: 'CSC', name: 'Computer Science' },
    { id: 'ENG', name: 'Engineering' },
    { id: 'MED', name: 'Medicine' },
    { id: 'LAW', name: 'Law' },
    { id: 'BUS', name: 'Business Administration' },
    { id: 'EDU', name: 'Education' },
    { id: 'ART', name: 'Arts' },
    { id: 'SCI', name: 'Science' }
  ];

  // Generate VUG ID format helper
  const generateVUGId = (role, department, year) => {
    const currentYear = new Date().getFullYear().toString().slice(-2);
    let deptCode = department;
    
    // For non-students, use role-based department codes
    if (role === 'security') deptCode = 'SEC';
    if (role === 'staff') deptCode = 'STAFF';
    
    return `VUG/${deptCode}/${year || currentYear}/`;
  };

  // Extract year from ID format
  const extractYearFromId = (id) => {
    const parts = id.split('/');
    return parts.length >= 3 ? parts[2] : '';
  };

  // Auto-populate office based on staff type
  const getOfficeFromStaffType = (staffType) => {
    const officeMap = {
      'father': 'Boys Hostel Administration',
      'sister': 'Girls Hostel Administration', 
      'hostel_admin': 'Hostel Administration Office'
    };
    return officeMap[staffType] || '';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let updates = { [name]: value };
    
    // Auto-populate office when staff type changes
    if (name === 'staffType' && selectedRole === 'staff') {
      updates.office = getOfficeFromStaffType(value);
    }
    
    // Auto-extract year when ID is entered
    if ((name === 'matricNumber' || name === 'staffId') && value) {
      const extractedYear = extractYearFromId(value);
      if (extractedYear) {
        updates.year = extractedYear;
      }
    }
    
    setFormData(prev => ({ ...prev, ...updates }));
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
      year: '',
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
      children: [...prev.children, { matricNumber: '', firstName: '', lastName: '', searchQuery: '' }]
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
    
    // Trigger search when user types in search field
    if (field === 'searchQuery' && value.length >= 2) {
      searchStudents(value, index);
    } else if (field === 'searchQuery' && value.length < 2) {
      setShowSearchResults(prev => ({ ...prev, [index]: false }));
      setStudentSearchResults([]);
    }
  };

  // Search for students
  const searchStudents = async (query, childIndex) => {
    if (query.length < 2) return;
    
    setIsSearching(true);
    try {
      const response = await api.get(`/api/auth/search-students?query=${encodeURIComponent(query)}`);
      setStudentSearchResults(response.data.students || []);
      setShowSearchResults(prev => ({ ...prev, [childIndex]: true }));
      setActiveSearchIndex(-1);
    } catch (error) {
      console.error('Error searching students:', error);
      setStudentSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Select a student from search results
  const selectStudent = (student, childIndex) => {
    setFormData(prev => ({
      ...prev,
      children: prev.children.map((child, i) => 
        i === childIndex ? {
          matricNumber: student.matricNumber,
          firstName: student.firstName,
          lastName: student.lastName,
          searchQuery: `${student.firstName} ${student.lastName} (${student.matricNumber})`
        } : child
      )
    }));
    setShowSearchResults(prev => ({ ...prev, [childIndex]: false }));
    setStudentSearchResults([]);
  };

  // Handle keyboard navigation in search results
  const handleSearchKeyDown = (e, childIndex) => {
    if (!showSearchResults[childIndex] || studentSearchResults.length === 0) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveSearchIndex(prev => 
          prev < studentSearchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveSearchIndex(prev => 
          prev > 0 ? prev - 1 : studentSearchResults.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (activeSearchIndex >= 0 && activeSearchIndex < studentSearchResults.length) {
          selectStudent(studentSearchResults[activeSearchIndex], childIndex);
        }
        break;
      case 'Escape':
        setShowSearchResults(prev => ({ ...prev, [childIndex]: false }));
        setActiveSearchIndex(-1);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Additional validation for parent role
      if (selectedRole === 'parent') {
        if (formData.children.length === 0) {
          setError('Please add at least one child');
          setLoading(false);
          return;
        }
        
        // Check if all children have valid data (from search results)
        const invalidChildren = formData.children.filter(child => 
          !child.matricNumber || !child.firstName || !child.lastName
        );
        
        if (invalidChildren.length > 0) {
          setError('Please select valid students from the search results for all children');
          setLoading(false);
          return;
        }
      }

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
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="department" className="input-label">Department</label>
                <select
                  id="department"
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="matricNumber" className="input-label">
                  Matric Number 
                  {formData.department && (
                    <span className="id-preview">
                      Format: VUG/{formData.department}/YY/###
                    </span>
                  )}
                </label>
                <input
                  id="matricNumber"
                  name="matricNumber"
                  type="text"
                  required
                  value={formData.matricNumber}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder={formData.department ? 
                    `VUG/${formData.department}/24/001` : 
                    "e.g., VUG/CSC/22/001"}
                />
              </div>
            </div>

            <div className="input-row">
              <div className="input-group">
                <label htmlFor="gender" className="input-label">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  required
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="parentEmail" className="input-label">Parent Email</label>
              <input
                id="parentEmail"
                name="parentEmail"
                type="email"
                required
                value={formData.parentEmail}
                onChange={handleInputChange}
                className="form-input"
                placeholder="parent@example.com"
              />
            </div>
          </>
        );

      case 'parent':
        return (
          <div className="children-section">
            <div className="children-header">
              <label className="section-label">Children Information</label>
              <button
                type="button"
                onClick={addChild}
                className="add-child-btn"
              >
                <Plus size={16} />
                Add Child
              </button>
            </div>

            {formData.children.length === 0 && (
              <div className="empty-children">
                <Users className="empty-icon" size={48} />
                <p>No children added yet</p>
                <button
                  type="button"
                  onClick={addChild}
                  className="add-first-child-btn"
                >
                  Add your first child
                </button>
              </div>
            )}
            
            {formData.children.map((child, index) => (
              <div key={index} className="child-card">
                <div className="child-header">
                  <h4>Child {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeChild(index)}
                    className="remove-child-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                <div className="child-inputs">
                  <div 
                    className="search-input-wrapper"
                    ref={el => searchDropdownRefs.current[index] = el}
                  >
                    <input
                      type="text"
                      placeholder="Search by name or matric number..."
                      value={child.searchQuery || ''}
                      onChange={(e) => updateChild(index, 'searchQuery', e.target.value)}
                      onKeyDown={(e) => handleSearchKeyDown(e, index)}
                      className="form-input search-input"
                      autoComplete="off"
                    />
                    {isSearching && (
                      <div className="search-loading">
                        <Loader size={16} className="loading-icon" />
                      </div>
                    )}
                    
                    {showSearchResults[index] && studentSearchResults.length > 0 && (
                      <div className="search-results-dropdown">
                        {studentSearchResults.map((student, resultIndex) => (
                          <div
                            key={student._id}
                            className={`search-result-item ${resultIndex === activeSearchIndex ? 'active' : ''}`}
                            onClick={() => selectStudent(student, index)}
                            onMouseEnter={() => setActiveSearchIndex(resultIndex)}
                          >
                            <div className="student-info">
                              <div className="student-name">
                                {student.firstName} {student.lastName}
                              </div>
                              <div className="student-details">
                                {student.matricNumber} • {student.department}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {showSearchResults[index] && child.searchQuery && child.searchQuery.length >= 2 && studentSearchResults.length === 0 && !isSearching && (
                      <div className="search-results-dropdown">
                        <div className="no-results">
                          No students found matching "{child.searchQuery}"
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Matric Number"
                    value={child.matricNumber}
                    onChange={(e) => updateChild(index, 'matricNumber', e.target.value)}
                    className="form-input"
                    required
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={child.firstName}
                    onChange={(e) => updateChild(index, 'firstName', e.target.value)}
                    className="form-input"
                    required
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={child.lastName}
                    onChange={(e) => updateChild(index, 'lastName', e.target.value)}
                    className="form-input"
                    required
                    readOnly
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'staff':
        return (
          <>
            <div className="input-row">
              <div className="input-group">
                <label htmlFor="staffType" className="input-label">Staff Type</label>
                <select
                  id="staffType"
                  name="staffType"
                  required
                  value={formData.staffType}
                  onChange={handleInputChange}
                  className="form-input"
                >
                  <option value="">Select Staff Type</option>
                  {staffTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="office" className="input-label">
                  Office/Department
                  {formData.staffType && (
                    <span className="id-preview">
                      Auto-populated from staff type
                    </span>
                  )}
                </label>
                <input
                  id="office"
                  name="office"
                  type="text"
                  required
                  value={formData.office}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Will auto-populate when you select staff type"
                  readOnly={!!formData.staffType}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="staffId" className="input-label">
                Staff ID
                <span className="id-preview">
                  Format: VUG/STAFF/YY/### (Year will be extracted from ID)
                </span>
              </label>
              <input
                id="staffId"
                name="staffId"
                type="text"
                required
                value={formData.staffId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., VUG/STAFF/24/001"
              />
            </div>
          </>
        );

      case 'security':
        return (
          <>
            <div className="input-group">
              <label htmlFor="staffId" className="input-label">
                Security ID
                <span className="id-preview">
                  Format: VUG/SEC/YY/### (Year will be extracted from ID)
                </span>
              </label>
              <input
                id="staffId"
                name="staffId"
                type="text"
                required
                value={formData.staffId}
                onChange={handleInputChange}
                className="form-input"
                placeholder="e.g., VUG/SEC/24/001"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-card">
          {/* Logo Section */}
          <div className="logo-section">
            <img src={logo} alt="Veritas University Logo" className="university-logo" />
          </div>

          {/* Header Section */}
          <div className="header-section">
            <h1 className="welcome-heading">Join Veritas Exeat System</h1>
            <p className="welcome-subtitle">Create your account to get started with the university exeat management system</p>
        </div>

          {/* Role Selection */}
          <div className="role-selection">
            <label className="section-label">Select Your Role</label>
            <div className="role-grid">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleChange(role.id)}
                    className={`role-btn ${selectedRole === role.id ? 'active' : ''}`}
                    style={{ '--role-color': role.color }}
                  >
                    <div className="role-icon-wrapper">
                      <Icon size={20} />
                    </div>
                    <span>{role.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Display */}
            {error && (
            <div className="error-message">
              {error}
              </div>
            )}

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="register-form">
            {/* Basic Information */}
            <div className="form-section">
              <label className="section-label">
                <User size={18} />
                Basic Information
              </label>
              
              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="firstName" className="input-label">First Name</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your first name"
                  />
                </div>
                
                <div className="input-group">
                  <label htmlFor="lastName" className="input-label">Last Name</label>
              <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Enter your last name"
                  />
                </div>
              </div>

              <div className="input-row">
                <div className="input-group">
                  <label htmlFor="email" className="input-label">Email Address</label>
                    <input
                    id="email"
                    name="email"
                      type="email"
                    required
                      value={formData.email}
                      onChange={handleInputChange}
                    className="form-input"
                      placeholder="your.email@example.com"
                    />
                </div>
                
                <div className="input-group">
                  <label htmlFor="phoneNumber" className="input-label">Phone Number</label>
                    <input
                    id="phoneNumber"
                    name="phoneNumber"
                      type="tel"
                    required
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                    className="form-input"
                      placeholder="+234 xxx xxx xxxx"
                    />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">Password</label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="form-input password-input"
                    placeholder="At least 6 characters"
              />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="password-toggle-btn"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Role-specific Information */}
            {selectedRole && (
              <div className="form-section">
                <label className="section-label">
                  {selectedRole === 'student' && <GraduationCap size={18} />}
                  {selectedRole === 'parent' && <Users size={18} />}
                  {(selectedRole === 'staff' || selectedRole === 'security') && <Building size={18} />}
                  {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)} Information
                </label>
                {renderRoleSpecificFields()}
              </div>
            )}

            {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
              className={`register-button ${loading ? 'loading' : ''}`}
              >
                {loading ? (
                <>
                  <Loader className="loading-icon" size={20} />
                    Creating Account...
                </>
                ) : (
                  'Create Account'
                )}
            </button>
          </form>

          {/* Footer Section */}
          <div className="footer-section">
            <p className="signin-text">
              Already have an account? <Link to="/login" className="signin-link">Sign In</Link>
            </p>
            <Link to="/" className="back-home-link">
                ← Back to Home
              </Link>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 