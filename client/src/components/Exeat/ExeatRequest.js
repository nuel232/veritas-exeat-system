import React, { useState, useEffect } from 'react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const navigate = useNavigate();

  const {
    reason,
    destination,
    departureDate,
    returnDate
  } = formData;

  const { name: emergencyName, phone: emergencyPhone } = formData.emergencyContact;

  // Validate form fields
  const validateField = (name, value) => {
    let error = '';
    
    switch(name) {
      case 'reason':
        if (!value) error = 'Reason is required';
        else if (value.length < 5) error = 'Please provide a detailed reason';
        break;
      case 'destination':
        if (!value) error = 'Destination is required';
        break;
      case 'departureDate':
        if (!value) error = 'Departure date is required';
        break;
      case 'returnDate':
        if (!value) error = 'Return date is required';
        else if (new Date(value) <= new Date(departureDate)) {
          error = 'Return date must be after departure date';
        }
        break;
      case 'emergencyname':
        if (!value) error = 'Emergency contact name is required';
        break;
      case 'emergencyphone':
        if (!value) error = 'Emergency contact phone is required';
        else if (!/^\d{10,}$/.test(value.replace(/\D/g, ''))) {
          error = 'Please enter a valid phone number';
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
    const fields = [
      'reason', 
      'destination', 
      'departureDate', 
      'returnDate', 
      'emergencyname', 
      'emergencyphone'
    ];
    
    fields.forEach(field => {
      let value;
      if (field.startsWith('emergency')) {
        const subfield = field.replace('emergency', '').toLowerCase();
        value = formData.emergencyContact[subfield];
      } else {
        value = formData[field];
      }
      
      const error = validateField(field, value);
      if (error) {
        errors[field] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onChange = e => {
    const { name, value } = e.target;
    
    // Mark field as touched
    if (!touchedFields[name]) {
      setTouchedFields(prev => ({
        ...prev,
        [name]: true
      }));
    }
    
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
    
    // Real-time validation
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const onBlur = e => {
    const { name, value } = e.target;
    
    // Mark field as touched
    setTouchedFields(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate on blur
    const error = validateField(name, value);
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const onSubmit = async e => {
    e.preventDefault();
    
    // Mark all fields as touched
    const fieldsToTouch = [
      'reason', 'destination', 'departureDate', 'returnDate', 
      'emergencyname', 'emergencyphone'
    ];
    const allTouched = fieldsToTouch.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {});
    setTouchedFields(allTouched);
    
    // Validate all fields
    if (!validateForm()) {
      // Scroll to the first error
      const firstErrorField = document.querySelector('.form-input.error');
      if (firstErrorField) {
        firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstErrorField.focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="exeat-request-container">
      <div className="exeat-request-header">
        <h1 className="exeat-request-title">New Exeat Request</h1>
      </div>

      <form onSubmit={onSubmit} className="exeat-request-form" noValidate>
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        <div className="form-grid">
          <div className="form-group full-width">
            <label htmlFor="reason" className="form-label">Reason for Exeat</label>
            <input
              id="reason"
              type="text"
              name="reason"
              value={reason}
              onChange={onChange}
              onBlur={onBlur}
              className={`form-input ${touchedFields.reason && validationErrors.reason ? 'error' : ''}`}
              placeholder="Enter your reason for requesting exeat"
              aria-invalid={touchedFields.reason && validationErrors.reason ? 'true' : 'false'}
              aria-describedby={validationErrors.reason ? 'reason-error' : undefined}
            />
            {touchedFields.reason && validationErrors.reason && (
              <span className="form-error" id="reason-error">{validationErrors.reason}</span>
            )}
          </div>

          <div className="form-group full-width">
            <label htmlFor="destination" className="form-label">Destination</label>
            <input
              id="destination"
              type="text"
              name="destination"
              value={destination}
              onChange={onChange}
              onBlur={onBlur}
              className={`form-input ${touchedFields.destination && validationErrors.destination ? 'error' : ''}`}
              placeholder="Where will you be going?"
              aria-invalid={touchedFields.destination && validationErrors.destination ? 'true' : 'false'}
              aria-describedby={validationErrors.destination ? 'destination-error' : undefined}
            />
            {touchedFields.destination && validationErrors.destination && (
              <span className="form-error" id="destination-error">{validationErrors.destination}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="departureDate" className="form-label">Departure Date</label>
            <input
              id="departureDate"
              type="datetime-local"
              name="departureDate"
              value={departureDate}
              onChange={onChange}
              onBlur={onBlur}
              className={`form-input ${touchedFields.departureDate && validationErrors.departureDate ? 'error' : ''}`}
              aria-invalid={touchedFields.departureDate && validationErrors.departureDate ? 'true' : 'false'}
              aria-describedby={validationErrors.departureDate ? 'departureDate-error' : undefined}
            />
            {touchedFields.departureDate && validationErrors.departureDate && (
              <span className="form-error" id="departureDate-error">{validationErrors.departureDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="returnDate" className="form-label">Return Date</label>
            <input
              id="returnDate"
              type="datetime-local"
              name="returnDate"
              value={returnDate}
              onChange={onChange}
              onBlur={onBlur}
              className={`form-input ${touchedFields.returnDate && validationErrors.returnDate ? 'error' : ''}`}
              aria-invalid={touchedFields.returnDate && validationErrors.returnDate ? 'true' : 'false'}
              aria-describedby={validationErrors.returnDate ? 'returnDate-error' : undefined}
            />
            {touchedFields.returnDate && validationErrors.returnDate && (
              <span className="form-error" id="returnDate-error">{validationErrors.returnDate}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="emergencyname" className="form-label">Emergency Contact Name</label>
            <input
              id="emergencyname"
              type="text"
              name="emergencyname"
              value={emergencyName}
              onChange={onChange}
              onBlur={onBlur}
              className={`form-input ${touchedFields.emergencyname && validationErrors.emergencyname ? 'error' : ''}`}
              placeholder="Name of emergency contact"
              aria-invalid={touchedFields.emergencyname && validationErrors.emergencyname ? 'true' : 'false'}
              aria-describedby={validationErrors.emergencyname ? 'emergencyname-error' : undefined}
            />
            {touchedFields.emergencyname && validationErrors.emergencyname && (
              <span className="form-error" id="emergencyname-error">{validationErrors.emergencyname}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="emergencyphone" className="form-label">Emergency Contact Phone</label>
            <input
              id="emergencyphone"
              type="tel"
              name="emergencyphone"
              value={emergencyPhone}
              onChange={onChange}
              onBlur={onBlur}
              className={`form-input ${touchedFields.emergencyphone && validationErrors.emergencyphone ? 'error' : ''}`}
              placeholder="Emergency contact phone number"
              aria-invalid={touchedFields.emergencyphone && validationErrors.emergencyphone ? 'true' : 'false'}
              aria-describedby={validationErrors.emergencyphone ? 'emergencyphone-error' : undefined}
            />
            {touchedFields.emergencyphone && validationErrors.emergencyphone && (
              <span className="form-error" id="emergencyphone-error">{validationErrors.emergencyphone}</span>
            )}
            <div className="form-help-text">Enter a valid phone number with country code if international</div>
          </div>
        </div>

        <button 
          type="submit" 
          className={`exeat-request-button ${isSubmitting ? 'loading' : ''}`}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default ExeatRequest; 