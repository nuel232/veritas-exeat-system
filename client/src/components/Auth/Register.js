import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/components/Register.css';

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
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="form-container">
      <div>
        <h2 className="form-title">Create your account</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Register for Veritas University Exeat System</p>
      </div>
      <form onSubmit={onSubmit}>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div className="form-group">
            <input
              id="firstName"
              name="firstName"
              type="text"
              required
              className="form-input"
              placeholder="First Name"
              value={firstName}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <input
              id="lastName"
              name="lastName"
              type="text"
              required
              className="form-input"
              placeholder="Last Name"
              value={lastName}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="form-group">
          <input
            id="email"
            name="email"
            type="email"
            required
            className="form-input"
            placeholder="Email address"
            value={email}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            id="password"
            name="password"
            type="password"
            required
            className="form-input"
            placeholder="Password"
            value={password}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            id="department"
            name="department"
            type="text"
            required
            className="form-input"
            placeholder="Department"
            value={department}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            id="matricNumber"
            name="matricNumber"
            type="text"
            required
            className="form-input"
            placeholder="Matric Number"
            value={matricNumber}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="text"
            required
            className="form-input"
            placeholder="Phone Number"
            value={phoneNumber}
            onChange={onChange}
          />
        </div>

        <div>
          <button
            type="submit"
            className="form-button"
          >
            Register
          </button>
        </div>

        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <Link to="/login" style={{ color: '#4a90e2', textDecoration: 'none' }}>
            Already have an account? Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Register; 