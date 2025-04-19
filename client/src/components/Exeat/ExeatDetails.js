import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import '../../styles/components/ExeatDetails.css';
import html2pdf from 'html2pdf.js';
 
const ExeatDetails = () => {
  const [exeat, setExeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReasonModal, setShowReasonModal] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user') || localStorage.getItem('user') || '{}');
  const componentRef = useRef();

  useEffect(() => {
    const fetchExeat = async () => {
      try {
        const res = await api.get(`/api/exeat/${id}`);
        setExeat(res.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch exeat details');
        setLoading(false);
      }
    };

    fetchExeat();
  }, [id]);

  const handleStatusUpdate = async (status, rejectionReason) => {
    try {
      const data = { status };
      if (status === 'rejected' && rejectionReason) {
        data.rejectionReason = rejectionReason;
      }
      
      await api.patch(`/api/exeat/${id}/status`, data);
      setExeat(prev => ({ ...prev, status, rejectionReason }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const toggleReasonModal = () => {
    setShowReasonModal(!showReasonModal);
  };

  const downloadPdf = () => {
    const element = componentRef.current;
    const options = {
      margin: [10, 10, 10, 10],
      filename: `exeat-${exeat.student?.matricNumber || id}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    html2pdf().set(options).from(element).save();
  };

  if (loading) {
    return <div className="loading">Loading exeat details...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!exeat) {
    return <div className="alert alert-error">Exeat not found</div>;
  }

  const getStatusName = (status) => {
    switch(status) {
      case 'rejected': return 'Denied';
      case 'approved': return 'Approved';
      case 'pending': return 'Pending';
      case 'expired': return 'Expired';
      default: return status;
    }
  };

  return (
    <div className="exeat-page-container">
      <h1 className="exeat-page-title">Exeat Request Details</h1>
      
      <div className="exeat-actions">
        <div className="left-actions">
          <button 
            className="print-button"
            onClick={() => window.print()}
          >
            <i className="fas fa-print"></i> Print Exeat
          </button>
          <button 
            className="download-button"
            onClick={downloadPdf}
          >
            <i className="fas fa-download"></i> Download PDF
          </button>
        </div>
        <button 
          className="back-button"
          onClick={() => navigate('/dashboard')}
        >
          <i className="fas fa-arrow-left"></i> Back to Dashboard
        </button>
      </div>

      <div className="exeat-paper" ref={componentRef}>
        <div className="exeat-header">
          <h2>VERITAS UNIVERSITY</h2>
          <h3>STUDENT EXEAT SLIP</h3>
        </div>
        
        <hr className="exeat-divider" />

        <div className="reason-highlight">
          <div className="reason-icon"><i className="fas fa-comment-alt"></i></div>
          <div className="reason-content">
            <div className="reason-label">Reason for Exeat</div>
            <div className="reason-value">{exeat.reason}</div>
          </div>
        </div>
        
        <div className="exeat-info-grid">
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-user"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Student Name</div>
              <div className="info-value">{exeat.student?.firstName} {exeat.student?.lastName}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-id-card"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Matric Number</div>
              <div className="info-value">{exeat.student?.matricNumber || 'N/A'}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-calendar-minus"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Departure Date</div>
              <div className="info-value">{formatDate(exeat.departureDate)}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Destination</div>
              <div className="info-value">{exeat.destination}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-calendar-plus"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Return Date</div>
              <div className="info-value">{formatDate(exeat.returnDate)}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-tag"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Status</div>
              <div className="info-value">
                <span className={`status-badge status-${exeat.status.toLowerCase()}`}>
                  {getStatusName(exeat.status)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-user-friends"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Emergency Contact</div>
              <div className="info-value">{exeat.emergencyContact?.name}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-phone"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Contact Phone</div>
              <div className="info-value">{exeat.emergencyContact?.phone}</div>
            </div>
          </div>
          
          <div className="info-group">
            <div className="info-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="info-content">
              <div className="info-label">Relationship</div>
              <div className="info-value">{exeat.emergencyContact?.relationship}</div>
            </div>
          </div>

          {exeat.status === 'rejected' && exeat.rejectionReason && (
            <div className="info-group full-width">
              <div className="info-icon">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="info-content">
                <div className="info-label">Denied Reason</div>
                <div className="info-value reason-text">{exeat.rejectionReason}</div>
              </div>
            </div>
          )}
        </div>
        
        {exeat.status === 'rejected' && (
          <div className="approval-section rejected">
            <div className="approval-info rejected">
              <div className="approval-by">
                <i className="fas fa-user-times"></i>
                <span>Denied by: Dean {exeat.approvedBy?.lastName || 'Dean'}</span>
              </div>
              <div className="approval-date">
                <i className="fas fa-calendar-times"></i>
                <span>Date: {formatDate(exeat.updatedAt).split(',')[0]}</span>
              </div>
            </div>
            <div className="stamp-container">
              <div className="stamp rejected">DENIED</div>
            </div>
          </div>
        )}
        
        {exeat.status === 'approved' && (
          <div className="approval-section approved">
            <div className="approval-info approved">
              <div className="approval-by">
                <i className="fas fa-user-check"></i>
                <span>Approved by: Dean {exeat.approvedBy?.lastName || 'Dean'}</span>
              </div>
              <div className="approval-date">
                <i className="fas fa-calendar-check"></i>
                <span>Date: {formatDate(exeat.updatedAt).split(',')[0]}</span>
              </div>
            </div>
            <div className="stamp-container">
              <div className="stamp approved">APPROVED</div>
            </div>
          </div>
        )}
        
        {exeat.status === 'expired' && (
          <div className="approval-section expired">
            <div className="approval-info expired">
              <div className="approval-by">
                <i className="fas fa-clock"></i>
                <span>Expired on: {formatDate(exeat.returnDate).split(',')[0]}</span>
              </div>
            </div>
            <div className="stamp-container">
              <div className="stamp expired">EXPIRED</div>
            </div>
          </div>
        )}
      </div>

      {user.role === 'admin' && exeat.status === 'pending' && (
        <div className="admin-actions">
          <button
            className="approve-button"
            onClick={() => handleStatusUpdate('approved')}
          >
            <i className="fas fa-check"></i> Approve Request
          </button>
          <button
            className="reject-button"
            onClick={() => {
              const reason = prompt('Please enter denial reason:');
              if (reason) {
                handleStatusUpdate('rejected', reason);
              }
            }}
          >
            <i className="fas fa-times"></i> Deny Request
          </button>
        </div>
      )}

      {showReasonModal && (
        <div className="reason-modal-overlay" onClick={toggleReasonModal}>
          <div className="reason-modal" onClick={e => e.stopPropagation()}>
            <div className="reason-modal-header">
              <h3>Denial Reason</h3>
              <button className="close-modal" onClick={toggleReasonModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="reason-modal-content">
              <p>{exeat.rejectionReason}</p>
            </div>
            <div className="reason-modal-footer">
              <button className="modal-close-btn" onClick={toggleReasonModal}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExeatDetails;
 