import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const BuyCar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();
  const car = location.state?.car;
  const [form, setForm] = useState({ name: '', email: '', phone: '', payment_method: 'Cash' });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingAmount, setBookingAmount] = useState(10000);
  const [loanInterest, setLoanInterest] = useState(false);
  const [warranty, setWarranty] = useState(false);

  if (!car) {
    return <div className="text-center py-10">No car selected.</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(
        `http://localhost:5000/api/cars/${car._id}/buy`,
        {
          sale_price: car.price,
          payment_method: form.payment_method,
        },
        {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      if (response.data && response.data.message) {
        setSubmitted(true);
      } else {
        setError('Failed to complete purchase.');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to complete purchase.');
    } finally {
      setLoading(false);
    }
  };

  const handleTestDrive = () => {
    navigate('/test-drive', { state: { car } });
  };

  const transferTax = Math.round((car.price || 0) * 0.006); // 0.6% transfer tax
  const warrantyCost = warranty ? 2992 : 0;
  const finalAmount = (car.price || 0) + transferTax + warrantyCost;
  const emiAmount = Math.round(finalAmount / 60); // 60 months EMI

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-purple-700">Reserve this car for ₹{bookingAmount.toLocaleString('en-IN')}</h1>
              <p className="text-gray-600 mt-1">and find out if it's your perfect match</p>
              <div className="mt-4">
                <span className="text-sm text-gray-500">Experience the car before you buy</span>
              </div>
            </div>
            <div className="hidden md:block">
              {/* Illustration placeholder */}
              <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-2xl">❤️🚗</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Additional Services */}
          <div className="space-y-6">
            {/* Loan Card */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Interested in car loan?</h3>
                <div className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">CAPITAL</div>
              </div>
              <p className="text-gray-600 mb-4">Get your car financed at attractive interest rates.</p>
              <div className="flex justify-between items-center">
                <button className="text-purple-600 hover:text-purple-700 font-medium">Learn more</button>
                <input 
                  type="checkbox" 
                  checked={loanInterest}
                  onChange={(e) => setLoanInterest(e.target.checked)}
                  className="w-5 h-5 text-purple-600 rounded"
                />
              </div>
            </div> */}

            {/* Extended Warranty Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 text-sm">🛡️</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Extended Warranty</h3>
                </div>
                <div className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">+ NEW</div>
              </div>
              <p className="text-gray-600 mb-4">Get up to 1 year of extra protection and total peace of mind.</p>
              <div className="flex justify-between items-center mb-3">
                <span className="text-2xl font-bold text-gray-900">₹2,992</span>
                <button
                  onClick={() => setWarranty(!warranty)}
                  className={`px-4 py-2 rounded-lg font-medium ${warranty
                      ? 'bg-green-600 text-white'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                >
                  {warranty ? 'Added' : '+ Add'}
                </button>
              </div>
              {/* <button className="text-purple-600 hover:text-purple-700 font-medium">View details &gt;</button> */}
            </div>

            {/* Insurance Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-500">⭐</span>
                <h3 className="text-lg font-semibold text-gray-900">Comprehensive insurance available</h3>
              </div>
              <p className="text-gray-600">To purchase the best comprehensive insurance, please contact our support team after booking the car. It typically costs 1-2% of the car's price.</p>
            </div>

            {/* Test Drive Section */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <p className="text-gray-600 mb-4">You haven't taken a test drive yet.</p>
              <div className="flex gap-3">
                <button onClick={handleTestDrive} className="flex-1 bg-purple-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  PICK A SLOT AT CARSYNC HUB
                </button>
                <button className="text-gray-500 hover:text-gray-700 font-medium">Skip</button>
              </div>
            </div>
          </div>

          {/* Right Column - Car Details & Price */}
          <div className="space-y-6">
            {/* Car Information Card */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex gap-4">
                <img
                  src={car.images?.[0] || 'https://placehold.co/120x80/E0E0E0/333333?text=Car'}
                  alt={`${car.make} ${car.model}`}
                  className="w-32 h-24 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{car.year} {car.make} {car.model}</h3>
                  <p className="text-gray-600 text-sm">{car.kms_driven?.toLocaleString('en-IN') || 'N/A'} Km · {car.fuel_type || 'N/A'} · {car.transmission || 'N/A'}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-2xl font-bold text-gray-900">₹{(car.price / 100000).toFixed(2)} Lakh</span>
                    <span className="text-sm text-gray-600">EMI ₹{emiAmount.toLocaleString('en-IN')}/mo</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Amount */}
            {/* <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-sm">✓</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Booking Amount</h3>
                <button className="text-purple-600 hover:text-purple-700">
                  <span className="text-sm">✏️</span>
                </button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">₹{bookingAmount.toLocaleString('en-IN')}</span>
                <span className="text-sm text-gray-600">Reservation will end in 3 days. ℹ️</span>
              </div>
            </div> */}

            {/* Price Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">₹{(car.price - transferTax).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <div>
                    <span className="text-gray-600">Transfer tax</span>
                    <p className="text-xs text-gray-500">Government mandated tax for transfer of ownership</p>
                  </div>
                  <span className="font-semibold">+ ₹{transferTax.toLocaleString('en-IN')}</span>
                </div>
                {warranty && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Extended Warranty</span>
                    <span className="font-semibold">+ ₹{warrantyCost.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Final Amount */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Final amount</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total Amount</span>
                  <span className="text-purple-700">₹{finalAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>RC transfer, insurance & more (worth ₹9,700)</span>
                  <span className="text-green-600">Included ℹ️</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Fixes & upgrades</span>
                  <span className="text-green-600">Included ℹ️</span>
                </div>
              </div>
            </div>

            {/* Purchase Form */}
            {!submitted ? (
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Complete Your Booking</h3>
                <form onSubmit={handleSubmit} className="space-y-4">

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      name="payment_method"
                      value={form.payment_method}
                      onChange={handleChange}
                      className="w-full border border-gray-300 px-3 py-2 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={loading}
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      {/* <option value="Loan">Loan</option> */}
                    </select>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-purple-700 text-white py-3 rounded-lg font-semibold hover:bg-purple-800 transition-colors text-lg"
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : `Buy Now`}
                  </button>
                  {error && <div className="text-red-600 text-sm text-center">{error}</div>}
                </form>
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                <div className="text-green-600 text-6xl mb-4">✓</div>
                <h3 className="text-xl font-bold text-green-800 mb-2">Booking Successful!</h3>
                <p className="text-green-700">Your car has been booked successfully. You will receive a confirmation email shortly.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyCar;
