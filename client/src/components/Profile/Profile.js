import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [personalEmail, setPersonalEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
    setUser(storedUser);
    setPersonalEmail(storedUser.personalEmail || '');
    setPhoneNumber(storedUser.phoneNumber || '');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const res = await api.put('/api/auth/profile', { personalEmail, phoneNumber }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessage('Profile updated successfully!');
      setUser(res.data.user);
      sessionStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-group">
          <label>Personal Email</label>
          <input
            type="email"
            value={personalEmail}
            onChange={e => setPersonalEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={e => setPhoneNumber(e.target.value)}
            required
          />
        </div>
        <button type="submit">Update Profile</button>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </form>
    </div>
  );
};

export default Profile; 