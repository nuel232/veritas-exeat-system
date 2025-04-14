import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import api from '../../utils/api';

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
      setExeat({ ...exeat, status, rejectionReason });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleMarkAsUsed = async () => {
    try {
      const res = await api.patch(`/api/exeat/${id}/use`);
      setExeat(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark exeat as used');
    }
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const handleDownloadPDF = async () => {
    const element = componentRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');

    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`exeat-request-${exeat.student?.matricNumber || 'slip'}.pdf`);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!exeat) {
    return <div className="alert alert-error">Exeat request not found</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Exeat Request Details</h1>
        <div className="header-actions">
          <button 
            className="btn btn-secondary"
            onClick={handlePrint}
          >
            Print Exeat
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleDownloadPDF}
          >
            Download PDF
          </button>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="dashboard-card" ref={componentRef}>
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
            <label className="detail-label">Student Name</label>
            <p className="detail-value">{exeat.student?.firstName} {exeat.student?.lastName}</p>
          </div>
          {exeat.student?.department && (
            <div className="detail-group">
              <label className="detail-label">Department</label>
              <p className="detail-value">{exeat.student.department}</p>
            </div>
          )}
          {exeat.student?.matricNumber && (
            <div className="detail-group">
              <label className="detail-label">Matric Number</label>
              <p className="detail-value">{exeat.student.matricNumber}</p>
            </div>
          )}
          <div className="detail-group">
            <label className="detail-label">Reason</label>
            <p className="detail-value">{exeat.reason}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Destination</label>
            <p className="detail-value">{exeat.destination}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Departure Date</label>
            <p className="detail-value">{new Date(exeat.departureDate).toLocaleString()}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Return Date</label>
            <p className="detail-value">{new Date(exeat.returnDate).toLocaleString()}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Emergency Contact Name</label>
            <p className="detail-value">{exeat.emergencyContact?.name}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Emergency Contact Phone</label>
            <p className="detail-value">{exeat.emergencyContact?.phone}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Emergency Contact Relationship</label>
            <p className="detail-value">{exeat.emergencyContact?.relationship}</p>
          </div>
          <div className="detail-group">
            <label className="detail-label">Status</label>
            <p className={`status-badge status-${exeat.status.toLowerCase()}`}>
              {exeat.status}
            </p>
          </div>

          {exeat.used && (
            <div className="detail-group">
              <label className="detail-label">Used On</label>
              <p className="detail-value">{new Date(exeat.usedAt).toLocaleString()}</p>
            </div>
          )}

          {exeat.status === 'approved' && (
            <div className="approval-section">
              <div className="signature-line">
                <p>Approved by: {exeat.approvedBy?.firstName} {exeat.approvedBy?.lastName}</p>
                <p>Date: {new Date(exeat.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="stamp">APPROVED</div>
            </div>
          )}

          {exeat.status === 'rejected' && (
            <div className="rejection-section">
              <div className="signature-line">
                <p>Rejected by: {exeat.approvedBy?.firstName} {exeat.approvedBy?.lastName}</p>
                <p>Date: {new Date(exeat.updatedAt).toLocaleDateString()}</p>
              </div>
              <div className="rejection-reason">
                <p><strong>Reason:</strong> {exeat.rejectionReason || 'No reason provided'}</p>
              </div>
              <div className="stamp rejected-stamp">REJECTED</div>
            </div>
          )}
        </div>
      </div>

      {user.role === 'admin' && exeat.status === 'pending' && (
        <div className="action-buttons">
          <button
            className="btn btn-success"
            onClick={() => handleStatusUpdate('approved')}
          >
            Approve Request
          </button>
          <button
            className="btn btn-danger"
            onClick={() => {
              const reason = prompt('Please enter rejection reason:');
              if (reason) {
                handleStatusUpdate('rejected', reason);
              }
            }}
          >
            Reject Request
          </button>
        </div>
      )}

      {user.role === 'admin' && exeat.status === 'approved' && !exeat.used && (
        <div className="action-buttons">
          <button
            className="btn btn-warning"
            onClick={handleMarkAsUsed}
          >
            Mark as Used
          </button>
        </div>
      )}
    </div>
  );
};

export default ExeatDetails; 