import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TestDrive = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useContext(AuthContext);
  const car = location.state?.car;
  const isReschedule = location.state?.reschedule;
  const bookingId = location.state?.bookingId;

  // Location selection and input
  const [selectedLocation, setSelectedLocation] = useState('carsync-hub');
  const [myLocation, setMyLocation] = useState('');

  // Date and time selection
  const [selectedDate, setSelectedDate] = useState('tomorrow'); // 'today' | 'tomorrow' | 'saturday' | 'date-YYYY-MM-DD'
  const [showAllDates, setShowAllDates] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  // UX state
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  if (!car) {
    return <div className="text-center py-10">No car selected.</div>;
  }

  // Helpers: Dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const saturday = new Date(today);
  saturday.setDate(saturday.getDate() + ((6 - saturday.getDay() + 7) % 7));

  const toYMD = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  const getSelectedDateObj = () => {
    if (selectedDate === 'today') return today;
    if (selectedDate === 'tomorrow') return tomorrow;
    if (selectedDate === 'saturday') return saturday;
    if (selectedDate.startsWith('date-')) {
      const part = selectedDate.replace('date-', '');
      const d = new Date(part);
      if (!isNaN(d.getTime())) return d;
    }
    return tomorrow; // fallback
  };

  const formatDate = (date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
  const weekday = (date) => date.toLocaleDateString('en-US', { weekday: 'short' });

  const getSelectedDateDisplay = () => {
    const d = getSelectedDateObj();
    const isToday = d.toDateString() === today.toDateString();
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow' : weekday(d);
    return `${formatDate(d)} ${label}`;
  };

  const getLocationDisplay = () => (selectedLocation === 'carsync-hub' ? 'Carsync Hub' : (myLocation || 'My Location'));

  // Base time slots (start minutes from 00:00 for filtering)
  const baseSlots = [
    { start: 10 * 60, label: '10am - 11am' },
    { start: 11 * 60, label: '11am - 12pm' },
    { start: 12 * 60, label: '12pm - 1pm' },
    { start: 13 * 60, label: '1pm - 2pm' },
    { start: 14 * 60, label: '2pm - 3pm' },
    { start: 15 * 60, label: '3pm - 4pm' },
    { start: 16 * 60, label: '4pm - 5pm' },
    { start: 17 * 60, label: '5pm - 6pm' },
    { start: 18 * 60, label: '6pm - 7pm' },
    { start: 19 * 60, label: '7pm - 8pm' },
  ];

  const filteredSlots = (() => {
    const selected = getSelectedDateObj();
    const isToday = selected.toDateString() === today.toDateString();
    if (!isToday) return baseSlots;

    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    return baseSlots.filter((s) => s.start > nowMinutes);
  })();

  // Generate extra dates when user clicks "See all dates"
  const extraDates = (() => {
    const days = [];
    for (let i = 0; i < 14; i += 1) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const key = `date-${toYMD(d)}`;
      // Skip keys represented by the 3 quick buttons to avoid duplicates
      const isQuick = (d.toDateString() === today.toDateString()) || (d.toDateString() === tomorrow.toDateString()) || (d.toDateString() === saturday.toDateString());
      if (!isQuick) {
        days.push({ key, date: d });
      }
    }
    return days;
  })();

  const parseSlotStartToISO = () => {
    const d = getSelectedDateObj();
    if (!selectedTimeSlot) return new Date().toISOString();
    // Parse like "3pm - 4pm"
    const match = selectedTimeSlot.match(/^(\d{1,2})(am|pm)/i);
    if (!match) return new Date().toISOString();
    let hour = parseInt(match[1], 10);
    const period = match[2].toLowerCase();
    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;
    const scheduled = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hour, 0, 0, 0);
    return scheduled.toISOString();
  };

  const handleSubmit = async () => {
    if (!token) {
      setError('Please log in to book a test drive');
      return;
    }
    if (!selectedTimeSlot) {
      setError('Please select a time slot');
      return;
    }
    if (selectedLocation === 'my-location' && !myLocation.trim()) {
      setError('Please enter your location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const requestData = {
        name: user?.username || user?.name || 'User',
        email: user?.email || 'user@example.com',
        phone: user?.phone || '0000000000',
        location: getLocationDisplay(),
        datetime: parseSlotStartToISO(),
      };

      console.log('TestDrive: Sending request with data:', requestData);

      let response;

      if (isReschedule && bookingId) {
        // Update existing booking
        response = await axios.put(
          `http://localhost:5000/api/test-drives/${bookingId}/reschedule`,
          {
            location: getLocationDisplay(),
            datetime: parseSlotStartToISO(),
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new booking
        response = await axios.post(
          `http://localhost:5000/api/cars/${car._id}/test-drive`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }

      if (response.data && response.data.message) {
        // Navigate to confirmation page with booking details
        navigate('/test-drive-confirmation', {
          state: {
            booking: {
              _id: isReschedule ? bookingId : (response.data.booking_id || 'temp-id'),
              name: user?.username || user?.name || 'User',
              email: user?.email || 'user@example.com',
              phone: user?.phone || '0000000000',
              location: getLocationDisplay(),
              scheduled_datetime: parseSlotStartToISO(),
            },
            car: car
          }
        });
      }
    } catch (err) {
      console.error('TestDrive: Error response:', err.response?.data);
      console.error('TestDrive: Error status:', err.response?.status);
      setError(err.response?.data?.error || 'Failed to schedule test drive');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 text-center max-w-md mx-4">
          <div className="text-green-600 text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Drive Scheduled!</h2>
          <p className="text-gray-600 mb-6">Your test drive has been successfully scheduled. You will receive a confirmation email shortly.</p>
          <button onClick={() => navigate('/buy')} className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700">
            Back to Cars
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <img
              src={car.images?.[0] || 'https://placehold.co/80x60/E0E0E0/333333?text=Car'}
              alt={`${car.make} ${car.model}`}
              className="w-20 h-15 object-cover rounded-lg"
            />
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {isReschedule ? 'Reschedule Test Drive' : 'Book Test Drive'} - {car.year} {car.make} {car.model}
              </h1>
              <p className="text-gray-600 text-sm">{car.kms_driven?.toLocaleString('en-IN') || 'N/A'} Km · {car.fuel_type || 'N/A'} · {car.transmission || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Booking Flow */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          {/* Step 1: Select location */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                <div className="w-0.5 h-16 bg-purple-600 mt-2"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select location</h3>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    onClick={() => setSelectedLocation('carsync-hub')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${selectedLocation === 'carsync-hub'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-semibold">CARSYNC HUB</div>
                  </button>
                  <button
                    onClick={() => setSelectedLocation('my-location')}
                    className={`p-4 rounded-lg border-2 text-left transition-colors ${selectedLocation === 'my-location'
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-semibold">MY LOCATION</div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Step 2A: Carsync hub location details */}
          {selectedLocation === 'carsync-hub' && (
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div className="w-0.5 h-16 bg-purple-600 mt-2"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Carsync hub location</h3>
                  <div className="bg-gray-50 rounded-lg p-4 mb-2">
                    <p className="text-gray-700 text-sm">
                      F.P-98, 102 Carsync Park, Swarnim Stone, Near City Mall, Your City, Your State 000000
                    </p>
                  </div>
                  <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">Read More</button>
                </div>
              </div>
            </div>
          )}

          {/* Step 2B: My location input */}
          {selectedLocation === 'my-location' && (
            <div className="relative">
              <div className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                  <div className="w-0.5 h-16 bg-purple-600 mt-2"></div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Enter your location</h3>
                  <input
                    value={myLocation}
                    onChange={(e) => setMyLocation(e.target.value)}
                    placeholder="Type your address or area"
                    className="w-full border-2 border-gray-200 px-4 py-3 rounded-lg focus:border-purple-600 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">We will arrange the test drive at your preferred location.</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select date */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
                <div className="w-0.5 h-16 bg-purple-600 mt-2"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select date</h3>
                <div className="flex gap-3 mb-2">
                  <button
                    onClick={() => setSelectedDate('today')}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${getSelectedDateObj().toDateString() === today.toDateString()
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-2 00 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-semibold">{formatDate(today)}</div>
                    <div className="text-sm">Today</div>
                  </button>
                  <button
                    onClick={() => setSelectedDate('tomorrow')}
                    className={`px-4 py-3 rounded-lg border-2 transition-colors ${getSelectedDateObj().toDateString() === tomorrow.toDateString()
                        ? 'border-purple-600 bg-purple-50 text-purple-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    <div className="font-semibold">{formatDate(tomorrow)}</div>
                    <div className="text-sm">Tomorrow</div>
                  </button>

                </div>
                <button
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  onClick={() => setShowAllDates((v) => !v)}
                >
                  {showAllDates ? 'Hide dates' : 'See all dates'}
                </button>
                {showAllDates && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-3">
                    {extraDates.map(({ key, date }) => (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(key)}
                        className={`px-3 py-2 rounded-lg border-2 text-center transition-colors ${getSelectedDateObj().toDateString() === date.toDateString()
                            ? 'border-purple-600 bg-purple-50 text-purple-700'
                            : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                          }`}
                      >
                        <div className="text-sm font-semibold">{formatDate(date)}</div>
                        <div className="text-xs">{weekday(date)}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Select time slot */}
          <div className="relative">
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <div className="w-4 h-4 bg-purple-600 rounded-full"></div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select time slot</h3>
                {filteredSlots.length === 0 ? (
                  <p className="text-sm text-gray-600 mb-2">No slots available for the rest of today. Please choose a different date.</p>
                ) : null}
                <div className="grid grid-cols-2 gap-3">
                  {filteredSlots.map((slot) => (
                    <button
                      key={slot.label}
                      onClick={() => setSelectedTimeSlot(slot.label)}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${selectedTimeSlot === slot.label
                          ? 'border-purple-600 bg-purple-50 text-purple-700'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                        }`}
                    >
                      <div className="font-semibold">{slot.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Schedule Test Drive Button */}
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedTimeSlot || (selectedLocation === 'my-location' && !myLocation.trim())}
            className="w-full bg-pink-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-pink-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Scheduling...' : (isReschedule ? 'Reschedule Test Drive' : 'Schedule Test Drive')}
          </button>
          {selectedTimeSlot && (
            <p className="text-center text-gray-600 mt-2 text-sm">
              {getLocationDisplay()} on {getSelectedDateDisplay()}
            </p>
          )}
          {error && <p className="text-center text-red-600 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default TestDrive;
