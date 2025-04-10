import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const ExeatRequest = () => {
  const [formData, setFormData] = useState({
    reason: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    emergencyContact: '',
    parentContact: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    reason,
    destination,
    departureDate,
    returnDate,
    emergencyContact,
    parentContact
  } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await api.post('/api/exeat', formData, {
        headers: { 'x-auth-token': token }
      });
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="form-container">
      <div>
        <h2 className="form-title">New Exeat Request</h2>
        <p style={{ textAlign: 'center', color: '#666' }}>Submit your exeat request details</p>
      </div>
      <form onSubmit={onSubmit}>
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        <div className="form-group">
          <label htmlFor="reason" className="form-label">Reason for Leave</label>
          <textarea
            id="reason"
            name="reason"
            required
            className="form-input"
            placeholder="Please provide a detailed reason for your leave"
            value={reason}
            onChange={onChange}
            rows="4"
          />
        </div>
        <div className="form-group">
          <label htmlFor="destination" className="form-label">Destination</label>
          <input
            id="destination"
            name="destination"
            type="text"
            required
            className="form-input"
            placeholder="Where will you be staying?"
            value={destination}
            onChange={onChange}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label htmlFor="departureDate" className="form-label">Departure Date</label>
            <input
              id="departureDate"
              name="departureDate"
              type="datetime-local"
              required
              className="form-input"
              value={departureDate}
              onChange={onChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="returnDate" className="form-label">Return Date</label>
            <input
              id="returnDate"
              name="returnDate"
              type="datetime-local"
              required
              className="form-input"
              value={returnDate}
              onChange={onChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="emergencyContact" className="form-label">Emergency Contact</label>
          <input
            id="emergencyContact"
            name="emergencyContact"
            type="tel"
            required
            className="form-input"
            placeholder="Emergency contact number"
            value={emergencyContact}
            onChange={onChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="parentContact" className="form-label">Parent/Guardian Contact</label>
          <input
            id="parentContact"
            name="parentContact"
            type="tel"
            required
            className="form-input"
            placeholder="Parent/Guardian contact number"
            value={parentContact}
            onChange={onChange}
          />
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            Submit Request
          </button>
          <button
            type="button"
            className="btn btn-danger"
            style={{ flex: 1 }}
            onClick={() => navigate('/dashboard')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExeatRequest; 