import React, { useState } from 'react';
import { 
  QrCode, 
  Camera, 
  Check, 
  X, 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  LogIn,
  LogOut
} from 'lucide-react';

const QRScanner = () => {
  const [qrResult, setQrResult] = useState(null);
  const [exeatData, setExeatData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState(null);
  const [location, setLocation] = useState('');
  const [securityNotes, setSecurityNotes] = useState('');

  const handleManualQRInput = (qrCode) => {
    try {
      const qrData = JSON.parse(qrCode);
      setQrResult(qrData);
      fetchExeatData(qrData.exeatId);
    } catch (err) {
      setError('Invalid QR code format');
    }
  };

  const fetchExeatData = async (exeatId) => {
    setLoading(true);
    setError('');
    
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/exeat/verify-qr/${exeatId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify QR code');
      }

      const data = await response.json();
      setExeatData(data);
      
      if (data.valid && !data.exeat.checkedOut) {
        setAction('check-out');
      } else if (data.valid && data.exeat.checkedOut && !data.exeat.checkedIn) {
        setAction('check-in');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!location.trim()) {
      setError('Location is required for check-out');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`/api/exeat/${qrResult.exeatId}/check-out`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          location: location.trim(),
          securityNotes: securityNotes.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Check-out failed');
      }

      await fetchExeatData(qrResult.exeatId);
      setLocation('');
      setSecurityNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetScanner = () => {
    setQrResult(null);
    setExeatData(null);
    setError('');
    setAction(null);
    setLocation('');
    setSecurityNotes('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <QrCode className="w-8 h-8 mr-3 text-blue-600" />
          QR Code Scanner
        </h1>
        <p className="text-gray-600 mt-2">Scan student exeat QR codes for check-in/check-out</p>
      </div>

      {!qrResult ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-6">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ready to Scan QR Code
            </h2>
            
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manual QR Code Input (for demo)
              </label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Paste QR code data here..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.target.value) {
                      handleManualQRInput(e.target.value);
                    }
                  }}
                />
                <button
                  onClick={() => {
                    const input = document.querySelector('input[type="text"]');
                    if (input.value) {
                      handleManualQRInput(input.value);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                >
                  Scan
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {exeatData && (
            <>
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                    <User className="w-6 h-6 mr-2 text-blue-600" />
                    Student Information
                  </h2>
                  
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    exeatData.valid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {exeatData.valid ? 'Valid QR Code' : 'Invalid QR Code'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-medium text-gray-900">{exeatData.student.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Matric Number</label>
                    <p className="text-lg font-medium text-gray-900">{exeatData.student.matricNumber}</p>
                  </div>
                </div>
              </div>

              {exeatData.valid && action && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    {action === 'check-out' ? (
                      <LogOut className="w-5 h-5 mr-2 text-red-600" />
                    ) : (
                      <LogIn className="w-5 h-5 mr-2 text-green-600" />
                    )}
                    {action === 'check-out' ? 'Check-out Student' : 'Check-in Student'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Security Gate/Location *
                      </label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g., Main Gate, Back Gate"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    
                    <div className="flex space-x-4">
                      <button
                        onClick={handleCheckOut}
                        disabled={loading || !location.trim()}
                        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                          loading || !location.trim()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {loading ? 'Processing...' : `Confirm ${action === 'check-out' ? 'Check-out' : 'Check-in'}`}
                      </button>
                      
                      <button
                        onClick={resetScanner}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          <div className="text-center">
            <button
              onClick={resetScanner}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
            >
              Scan Another QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRScanner; 