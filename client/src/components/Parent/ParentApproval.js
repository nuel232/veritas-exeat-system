import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MapPin, 
  Phone, 
  User,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

const ParentApproval = () => {
  const { exeatId, token } = useParams();
  const navigate = useNavigate();
  const [exeatRequest, setExeatRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [approved, setApproved] = useState(null);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchExeatRequest();
  }, [exeatId, token]);

  const fetchExeatRequest = async () => {
    try {
      const response = await fetch(`/api/exeat/${exeatId}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch exeat request');
      }

      const data = await response.json();
      setExeatRequest(data);
      
      // Check if already processed
      if (data.status !== 'pending_parent') {
        setSubmitted(true);
      }
    } catch (err) {
      setError('Unable to load exeat request. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitApproval = async () => {
    if (approved === null) {
      setError('Please select approve or reject');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/exeat/parent-approval/${exeatId}/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approved,
          comments: comments.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit approval');
      }

      setSubmitted(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading exeat request...</p>
        </div>
      </div>
    );
  }

  if (error && !exeatRequest) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Request</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4">
          <div className="text-center">
            {approved ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Approved</h2>
                <p className="text-gray-600 mb-6">
                  You have successfully approved the exeat request. The request will now be forwarded to the academic staff for final approval.
                </p>
              </>
            ) : (
              <>
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Request Rejected</h2>
                <p className="text-gray-600 mb-6">
                  You have rejected the exeat request. The student has been notified of your decision.
                </p>
              </>
            )}
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Parent Approval Required</h1>
              <p className="text-gray-600 mt-1">Review and approve your child's exeat request</p>
            </div>
            <div className="bg-yellow-100 px-3 py-1 rounded-full">
              <span className="text-yellow-800 text-sm font-medium flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Pending Approval
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Student Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <User className="w-5 h-5 mr-2 text-blue-600" />
              Student Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-gray-900">{exeatRequest?.student?.firstName} {exeatRequest?.student?.lastName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Matric Number</label>
                <p className="text-gray-900">{exeatRequest?.student?.matricNumber}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Department</label>
                <p className="text-gray-900">{exeatRequest?.student?.department}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{exeatRequest?.student?.email}</p>
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2 text-blue-600" />
              Request Details
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Reason for Exeat</label>
                <p className="text-gray-900">{exeatRequest?.reason}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Destination</label>
                <p className="text-gray-900">{exeatRequest?.destination}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Departure Date</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(exeatRequest?.departureDate).toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Return Date</label>
                  <p className="text-gray-900 flex items-center">
                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                    {new Date(exeatRequest?.returnDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Duration</label>
                <p className="text-gray-900">
                  {Math.ceil((new Date(exeatRequest?.returnDate) - new Date(exeatRequest?.departureDate)) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="w-5 h-5 mr-2 text-blue-600" />
              Emergency Contact
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Name</label>
                <p className="text-gray-900">{exeatRequest?.emergencyContact?.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-gray-900">{exeatRequest?.emergencyContact?.phone}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Relationship</label>
                <p className="text-gray-900">{exeatRequest?.emergencyContact?.relationship}</p>
              </div>
            </div>
          </div>

          {/* Approval Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
              Your Decision
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-3 block">
                  Do you approve this exeat request?
                </label>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setApproved(true)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      approved === true
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-green-300'
                    }`}
                  >
                    <CheckCircle className={`w-6 h-6 mx-auto mb-2 ${approved === true ? 'text-green-500' : 'text-gray-400'}`} />
                    <span className="font-medium">Approve</span>
                  </button>
                  
                  <button
                    onClick={() => setApproved(false)}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      approved === false
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:border-red-300'
                    }`}
                  >
                    <XCircle className={`w-6 h-6 mx-auto mb-2 ${approved === false ? 'text-red-500' : 'text-gray-400'}`} />
                    <span className="font-medium">Reject</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                  Comments (Optional)
                </label>
                <textarea
                  id="comments"
                  rows={4}
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder={approved === false ? "Please provide a reason for rejection..." : "Any additional comments..."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex">
                    <AlertCircle className="w-5 h-5 text-red-400" />
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <button
                onClick={handleSubmitApproval}
                disabled={submitting || approved === null}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  submitting || approved === null
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : approved === true
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  `${approved === true ? 'Approve' : approved === false ? 'Reject' : 'Select Option'} Request`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Attachments */}
        {exeatRequest?.attachments && exeatRequest.attachments.length > 0 && (
          <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exeatRequest.attachments.map((attachment, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{attachment.originalName}</p>
                      <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                  >
                    View Attachment
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParentApproval; 