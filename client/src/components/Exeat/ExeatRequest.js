import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/components/ExeatRequest.css';

const ExeatRequest = () => {
  const [formData, setFormData] = useState({
    reason: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: 'Family' // Default value
    }
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const {
    reason,
    destination,
    departureDate,
    returnDate
  } = formData;

  const { name: emergencyName, phone: emergencyPhone } = formData.emergencyContact;

  const onChange = e => {
    const { name, value } = e.target;
    if (name.startsWith('emergency')) {
      // Handle emergency contact fields
      const field = name.replace('emergency', '').toLowerCase();
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          [field]: value
        }
      }));
    } else {
      // Handle other fields
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    try {
      // Combine date and time for departure and return
      const submitData = {
        ...formData,
        departureDate: new Date(departureDate).toISOString(),
        returnDate: new Date(returnDate).toISOString()
      };
      
      await api.post('/api/exeat', submitData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="exeat-request-container">
      <div className="exeat-request-header">
        <h1 className="exeat-request-title">New Exeat Request</h1>
      </div>

      <form onSubmit={onSubmit} className="exeat-request-form">
        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Reason for Exeat</label>
            <input
              type="text"
              name="reason"
              value={reason}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Enter your reason for requesting exeat"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Destination</label>
            <input
              type="text"
              name="destination"
              value={destination}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Where will you be going?"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Departure Date</label>
            <input
              type="datetime-local"
              name="departureDate"
              value={departureDate}
              onChange={onChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Return Date</label>
            <input
              type="datetime-local"
              name="returnDate"
              value={returnDate}
              onChange={onChange}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyname"
              value={emergencyName}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Name of emergency contact"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Contact Phone</label>
            <input
              type="tel"
              name="emergencyphone"
              value={emergencyPhone}
              onChange={onChange}
              required
              className="form-input"
              placeholder="Emergency contact phone number"
            />
          </div>
        </div>

        <button type="submit" className="btn btn-primary exeat-request-button">
          Submit Request
        </button>
      </form>
    </div>
  );
};

export default ExeatRequest; 