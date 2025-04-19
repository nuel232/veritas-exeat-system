import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../utils/api';
import '../../styles/components/ExeatRequest.css';

const ExeatDetails = () => {
  const [exeat, setExeat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const user = JSON.parse(sessionStorage.getItem('user'));
  const componentRef = useRef();

  useEffect(() => {
    const fetchExeat = async () => {
      try {
        const res = await api.get(`/api/exeat/${id}`);
        const exeatData = res.data;
        
        // Check if the exeat should be marked as expired
        if (exeatData.status === 'approved') {
          const returnDate = new Date(exeatData.returnDate);
          const currentDate = new Date();
          
          if (returnDate < currentDate) {
            try {
              // Update the exeat status to expired
              const token = sessionStorage.getItem('token') || localStorage.getItem('token');
              const updateRes = await api.patch(`/api/exeat/${id}/status`, 
                { status: 'expired' },
                {
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                  }
                }
              );
              setExeat(updateRes.data);
            } catch (updateErr) {
              console.error('Failed to update expired status:', updateErr);
              setExeat(exeatData);
            }
          } else {
            setExeat(exeatData);
          }
        } else {
          setExeat(exeatData);
        }
        
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
      setExeat({ ...exeat, status, rejectionReason });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPDF = async () => {
    const element = componentRef.current;
    
    // Add a loading state for better UX
    setLoading(true);
    
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // Increase scale for better quality
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const data = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
      
      pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`exeat-request-${exeat.student?.matricNumber || 'slip'}-${new Date().toISOString().split('T')[0]}.pdf`);
      
      // Show success message or notification here if needed
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Handle error appropriately
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!exeat) {
    return <div className="alert alert-error">Exeat request not found</div>;
  }

  return (
    <>
      <div className="exeat-request-container">
        <div className="exeat-request-header">
          <h1 className="exeat-request-title">Exeat Request Details</h1>
          <div className="header-actions">
            <button 
              className="btn btn-secondary"
              onClick={handlePrint}
            >
              <i className="fas fa-print"></i> Print Exeat
            </button>
            <button 
              className="btn btn-primary download-btn"
              onClick={handleDownloadPDF}
              disabled={loading}
            >
              <i className="fas fa-file-pdf"></i> {loading ? 'Generating...' : 'Download PDF'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/dashboard')}
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="alert alert-danger">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <div className="exeat-request-form" ref={componentRef}>
          <div className="exeat-header">
            <h2>VERITAS UNIVERSITY</h2>
            <h3>STUDENT EXEAT SLIP</h3>
            {exeat.status === 'used' && (
              <div className="exeat-used-stamp">USED</div>
            )}
            {exeat.status === 'expired' && (
              <div className="exeat-expired-stamp">EXPIRED</div>
            )}
          </div>
          <div className="exeat-details">
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-user"></i> Student Name
              </label>
              <p className="detail-value">{exeat.student?.firstName} {exeat.student?.lastName}</p>
            </div>
            
            {exeat.student?.department && (
              <div className="detail-group">
                <label className="detail-label">
                  <i className="fas fa-building"></i> Department
                </label>
                <p className="detail-value">{exeat.student.department}</p>
              </div>
            )}
            
            {exeat.student?.matricNumber && (
              <div className="detail-group">
                <label className="detail-label">
                  <i className="fas fa-id-card"></i> Matric Number
                </label>
                <p className="detail-value">{exeat.student.matricNumber}</p>
              </div>
            )}
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-comment-alt"></i> Reason
              </label>
              <p className="detail-value">{exeat.reason}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-map-marker-alt"></i> Destination
              </label>
              <p className="detail-value">{exeat.destination}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-plane-departure"></i> Departure Date
              </label>
              <p className="detail-value">{formatDate(exeat.departureDate)}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-plane-arrival"></i> Return Date
              </label>
              <p className="detail-value">{formatDate(exeat.returnDate)}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-user-shield"></i> Emergency Contact Name
              </label>
              <p className="detail-value">{exeat.emergencyContact?.name}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-phone"></i> Emergency Contact Phone
              </label>
              <p className="detail-value">{exeat.emergencyContact?.phone}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-people-arrows"></i> Emergency Contact Relationship
              </label>
              <p className="detail-value">{exeat.emergencyContact?.relationship}</p>
            </div>
            
            <div className="detail-group">
              <label className="detail-label">
                <i className="fas fa-tag"></i> Status
              </label>
              <p className={`status-badge status-${exeat.status.toLowerCase()}`}>
                {exeat.status}
              </p>
            </div>

            {exeat.used && (
              <div className="detail-group">
                <label className="detail-label">
                  <i className="fas fa-calendar-check"></i> Used On
                </label>
                <p className="detail-value">{formatDate(exeat.usedAt)}</p>
              </div>
            )}

            {exeat.status === 'approved' && (
              <div className="approval-section">
                <div className="signature-line">
                  <p><i className="fas fa-check-circle"></i> Approved by: {exeat.approvedBy?.firstName} {exeat.approvedBy?.lastName}</p>
                  <p><i className="fas fa-calendar"></i> Date: {new Date(exeat.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="stamp">APPROVED</div>
              </div>
            )}

            {exeat.status === 'rejected' && (
              <div className="rejection-section">
                <div className="signature-line">
                  <p><i className="fas fa-times-circle"></i> Rejected by: {exeat.approvedBy?.firstName} {exeat.approvedBy?.lastName}</p>
                  <p><i className="fas fa-calendar"></i> Date: {new Date(exeat.updatedAt).toLocaleDateString()}</p>
                </div>
                <div className="rejection-reason">
                  <p>
                    <i className="fas fa-exclamation-triangle"></i> <strong>Reason for Rejection:</strong> {exeat.rejectionReason || 'No reason provided'}
                  </p>
                </div>
                <div className="stamp rejected-stamp">REJECTED</div>
              </div>
            )}
          </div>
        </div>

        {user && user.role === 'admin' && exeat.status === 'pending' && (
          <div className="form-actions">
            <button
              className="submit-button"
              onClick={() => handleStatusUpdate('approved')}
            >
              <i className="fas fa-check"></i> Approve Request
            </button>
            <button
              className="cancel-button"
              onClick={() => {
                const reason = prompt('Please enter rejection reason:');
                if (reason) {
                  handleStatusUpdate('rejected', reason);
                }
              }}
            >
              <i className="fas fa-times"></i> Reject Request
            </button>
          </div>
        )}
      </div>
      
      {/* Floating Download Button - Moved outside container */}
      <div className="floating-download-btn">
        <button
          onClick={handleDownloadPDF}
          disabled={loading}
          title="Download as PDF"
        >
          {loading ? (
            <i className="fas fa-spinner fa-spin"></i>
          ) : (
            <i className="fas fa-download"></i>
          )}
        </button>
      </div>
    </>
  );
};

export default ExeatDetails; 