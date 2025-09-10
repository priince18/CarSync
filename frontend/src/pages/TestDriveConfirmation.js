import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const TestDriveConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  
  const booking = location.state?.booking;
  const car = location.state?.car;
  
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelled, setCancelled] = useState(false);

  if (!booking || !car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h2>
          <p className="text-gray-600 mb-6">The test drive booking details could not be found.</p>
          <button 
            onClick={() => navigate('/buy')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  const cancelReasons = [
    'Changed my mind',
    'Found a better option',
    'Schedule conflict',
    'Price concerns',
    'Location not convenient',
    'Other'
  ];

  const handleCancel = async () => {
    if (!cancelReason) {
      alert('Please select a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      const reason = cancelReason === 'Other' ? customReason : cancelReason;
      await axios.post(`http://localhost:5000/api/test-drives/${booking._id}/cancel`, {
        reason: reason
      }, { 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setCancelled(true);
      setShowCancelModal(false);
    } catch (err) {
      console.error('Cancel test drive error:', err.response?.data);
      alert('Failed to cancel test drive. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = () => {
    navigate('/test-drive', { 
      state: { 
        car: car,
        reschedule: true,
        bookingId: booking._id 
      } 
    });
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return {
      date: date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    };
  };

  const { date, time } = formatDateTime(booking.scheduled_datetime);

  if (cancelled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <div className="text-red-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Drive Cancelled</h2>
          <p className="text-gray-600 mb-6">Your test drive has been successfully cancelled.</p>
          <button 
            onClick={() => navigate('/buy')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
          >
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Test Drive Confirmation</h1>
            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              Confirmed
            </div>
          </div>
          <p className="text-gray-600">Your test drive has been successfully scheduled. Here are your booking details:</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Car Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Car Details</h2>
            <div className="flex items-start gap-4">
              <img 
                src={car.images?.[0] || 'https://placehold.co/120x80/E0E0E0/333333?text=Car'} 
                alt={`${car.make} ${car.model}`}
                className="w-24 h-16 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{car.year} {car.make} {car.model}</h3>
                <p className="text-gray-600 text-sm">{car.kms_driven?.toLocaleString('en-IN') || 'N/A'} Km · {car.fuel_type || 'N/A'} · {car.transmission || 'N/A'}</p>
                <p className="text-gray-600 text-sm">Price: ₹{(car.price / 100000).toFixed(2)} Lakh</p>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Name:</span>
                <p className="font-medium">{ user?.username || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Email:</span>
                <p className="font-medium">{ user?.email || 'N/A'}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Phone:</span>
                <p className="font-medium">{user?.phone || booking.phone || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Booking Details */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Booking Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 text-sm">Location:</span>
                <p className="font-medium">{booking.location}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Date:</span>
                <p className="font-medium">{date}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Time:</span>
                <p className="font-medium">{time}</p>
              </div>
              <div>
                <span className="text-gray-600 text-sm">Booking ID:</span>
                <p className="font-medium text-sm font-mono">{booking._id}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Actions</h2>
            <div className="space-y-3">
              <button
                onClick={handleReschedule}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Reschedule Test Drive
              </button>
              <button
                onClick={() => setShowCancelModal(true)}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Cancel Test Drive
              </button>
              <button
                onClick={() => navigate('/buy')}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                Back to Cars
              </button>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
          <ul className="text-blue-800 space-y-2 text-sm">
            <li>• Please arrive 10 minutes before your scheduled time</li>
            <li>• Bring a valid driving license and ID proof</li>
            <li>• Test drive duration is approximately 30 minutes</li>
            <li>• You can cancel or reschedule up to 2 hours before the appointment</li>
            <li>• We'll send you a reminder 1 hour before your test drive</li>
          </ul>
        </div>

        {/* Cancel Modal */}
        {showCancelModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Cancel Test Drive</h3>
              <p className="text-gray-600 mb-4">Please select a reason for cancellation:</p>
              
              <div className="space-y-2 mb-4">
                {cancelReasons.map((reason) => (
                  <label key={reason} className="flex items-center">
                    <input
                      type="radio"
                      name="cancelReason"
                      value={reason}
                      checked={cancelReason === reason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-gray-700">{reason}</span>
                  </label>
                ))}
              </div>

              {cancelReason === 'Other' && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify:
                  </label>
                  <textarea
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Enter your reason..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    rows="3"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  disabled={loading || !cancelReason || (cancelReason === 'Other' && !customReason.trim())}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 bg-gray-400 text-white py-2 px-4 rounded-lg font-medium hover:bg-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestDriveConfirmation;
