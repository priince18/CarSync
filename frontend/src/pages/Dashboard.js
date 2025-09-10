import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const navigate = useNavigate();
  // 🔥 Get user, token, isLoggedIn, and setUser directly from AuthContext
  const { user, token, isLoggedIn, setUser: setAuthUser, api } = useContext(AuthContext);
  const [localUser, setLocalUser] = useState(null);
  const [purchasedCars, setPurchasedCars] = useState([]);
  const [soldCars, setSoldCars] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedEmail, setEditedEmail] = useState('');
  const [editedMobileNumber, setEditedMobileNumber] = useState('');
  const [editedStreet, setEditedStreet] = useState(''); // New state for address
  const [editedCity, setEditedCity] = useState('');     // New state for address
  const [editedState, setEditedState] = useState('');   // New state for address
  const [editedZipCode, setEditedZipCode] = useState('');// New state for address
  const [profileMessage, setProfileMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [activeTab, setActiveTab] = useState('buy');

  // Initialize localUser and editable fields from AuthContext's user (no redirects here; route guard handles auth)
  useEffect(() => {
    if (!user) return;
    setLocalUser(user);
    setEditedName(user?.username || user?.name || '');
    setEditedEmail(user?.email || '');
    setEditedMobileNumber(user?.phone || '');
    setEditedStreet(user?.address?.street || '');
    setEditedCity(user?.address?.city || '');
    setEditedState(user?.address?.state || '');
    setEditedZipCode(user?.address?.zip_code || '');
  }, [user]);

  const hasFetchedRef = useRef(false);
  useEffect(() => {
    const fetchData = async () => {
      if (!token || hasFetchedRef.current) {
        setLoading(false);
        return;
      }
      hasFetchedRef.current = true;

      setLoading(true);
      setError(null);
      setProfileMessage('');

      try {
        // Fetch user data from /api/user (returns comprehensive details)
        const userResponse = await api.get(`/user`);
        const userData = userResponse.data.user;

        setLocalUser(userData);
        setEditedName(userData.username || userData.name || '');
        setEditedEmail(userData.email || '');
        setEditedMobileNumber(userData.phone || '');
        setEditedStreet(userData.address?.street || '');
        setEditedCity(userData.address?.city || '');
        setEditedState(userData.address?.state || '');
        setEditedZipCode(userData.address?.zip_code || '');

        // Only update global user if the id changed or profile picture missing/changed to reduce rerenders
        if (!user || user.userId !== userData.userId || user.userProfilePic !== userData.userProfilePic) {
          setAuthUser(userData);
        }

        const uid = userData.userId;
        const [purchasesResponse, salesResponse, testDrivesResponse] = await Promise.all([
          api.get(`/user/${uid}/purchases`),
          api.get(`/user/${uid}/sales`),
          api.get(`/user/${uid}/test-drives`),
        ]);

        setPurchasedCars(purchasesResponse.data || []);
        setSoldCars(salesResponse.data || []);
        setTestDrives(testDrivesResponse.data || []);
      } catch (err) {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

  // Handle profile update submission
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMessage('Updating profile...');
    console.log("Dashboard: Attempting to update profile for userId:", user.userId);

    if (!user || !token) {
      setProfileMessage('Authentication required to update profile.');
      return;
    }

    try {
      const response = await api.put(`/user/${user.userId}`, {
        name: editedName,
        email: editedEmail,
        phone: editedMobileNumber, // Send as 'phone'
        address: { // Send address as an object
          street: editedStreet,
          city: editedCity,
          state: editedState,
          zip_code: editedZipCode,
        }
      });

      const data = response.data;

      setProfileMessage(data.message || 'Profile updated successfully!');

      // 💡 Update AuthContext's user state directly
      setAuthUser(prevAuthUser => ({
        ...prevAuthUser,
        username: editedName,
        email: editedEmail,
        phone: editedMobileNumber,
        address: {
          street: editedStreet,
          city: editedCity,
          state: editedState,
          zip_code: editedZipCode,
        }
      }));

      // Update local state too
      setLocalUser(prevLocalUser => ({
        ...prevLocalUser,
        username: editedName,
        email: editedEmail,
        phone: editedMobileNumber,
        address: {
          street: editedStreet,
          city: editedCity,
          state: editedState,
          zip_code: editedZipCode,
        }
      }));


      setEditMode(false);
      console.log("Dashboard: Profile updated successfully.");
    } catch (err) {
      console.error("Dashboard: Error updating profile:", err.response ? err.response.data : err.message);
      setProfileMessage(err.response?.data?.message || 'Failed to update profile.');
    }
  };

  // Handle file selection for profile picture
  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setProfileMessage('');
    console.log("Dashboard: File selected for upload.");
  };

  // Handle profile picture upload
  const handleUploadProfilePic = async () => {
    if (!selectedFile) {
      setProfileMessage('Please select a file to upload.');
      return;
    }
    if (!user || !token) {
      setProfileMessage('Authentication required to upload profile picture.');
      return;
    }

    setProfileMessage('Uploading profile picture...');
    console.log("Dashboard: Uploading profile picture...");
    const formData = new FormData();
    formData.append('profilePic', selectedFile);

    try {
      const response = await api.post(`/user/${user.userId}/upload-profile-pic`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = response.data;

      setProfileMessage(data.message || 'Profile picture uploaded successfully!');
      const newProfilePicUrl = data.profilePicUrl;

      // 💡 Update AuthContext's user state with the new profile pic URL
      setAuthUser(prevAuthUser => ({
        ...prevAuthUser,
        userProfilePic: newProfilePicUrl, // Use the correct key for profile pic
      }));

      // Update local state
      setLocalUser(prevLocalUser => ({
        ...prevLocalUser,
        userProfilePic: newProfilePicUrl,
      }));

      setSelectedFile(null);
      console.log("Dashboard: Profile picture uploaded successfully. New URL:", newProfilePicUrl);
    } catch (err) {
      console.error("Dashboard: Error uploading profile picture:", err.response ? err.response.data : err.message);
      setProfileMessage(err.response?.data?.message || 'Failed to upload profile picture.');
    }
  };

  // Handle click on a car to view details
  const handleCarClick = (carId) => {
    navigate(`/car-details/${carId}`);
    console.log("Dashboard: Navigating to car details for carId:", carId);
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen text-xl">Loading dashboard...</div>;
  }

  if (!localUser) {
    return <div className="flex justify-center items-center min-h-screen text-gray-600 text-xl">User data not found. Please log in again.</div>;
  }

  const currentOrders = activeTab === 'buy' ? purchasedCars : activeTab === 'sell' ? soldCars : testDrives;
  console.log("Dashboard: Current tab:", activeTab);
  console.log("Dashboard: Current orders:", currentOrders);
  console.log("Dashboard: Purchased cars:", purchasedCars);
  console.log("Dashboard: Sold cars:", soldCars);
  console.log("Dashboard: Test drives:", testDrives);

  const emptyMessage = activeTab === 'buy' ? "You haven't purchased any cars yet." :
    activeTab === 'sell' ? "You haven't sold any cars yet." :
      "You haven't booked any test drives yet.";
  const emptyActionText = activeTab === 'buy' ? "Browse Cars" :
    activeTab === 'sell' ? "List a Car" :
      "Book Test Drive";
  const emptyActionLink = activeTab === 'buy' ? "/buy" :
    activeTab === 'sell' ? "/sell" :
      "/buy";

  return (
    <div className="flex flex-col lg:flex-row px-4 py-6 max-w-7xl mx-auto gap-6 font-inter">
      {/* Left Sidebar - Profile and Edit */}
      <div className="w-full lg:w-1/3 bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-customGold text-center">My Profile</h2>

        <div className="flex flex-col items-center mb-6">
          <img
            src={localUser.userProfilePic || "https://placehold.co/100x100/CCCCCC/000000?text=User"} // Use userProfilePic
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-4 border-customGold shadow-lg"
          />
          <h3 className="text-xl font-semibold mt-4 text-gray-900">{localUser.username || localUser.name}</h3>
          <p className="text-gray-600">{localUser.email}</p>
        </div>

        {profileMessage && (
          <p className={`text-center text-sm mb-4 ${profileMessage.includes('successful') ? 'text-green-600' : 'text-red-500'}`}>
            {profileMessage}
          </p>
        )}

        {/* Profile Details / Edit Form */}
        {!editMode ? (
          <div className="space-y-3">
            <p className="text-gray-700"><span className="font-medium">Email:</span> {localUser.email}</p>
            <p className="text-gray-700"><span className="font-medium">Mobile:</span> {localUser.phone}</p> {/* Use phone */}
            <p className="text-gray-700">
              <span className="font-medium">Address:</span> <br />
              {localUser.address?.street}<br />
              {localUser.address?.city}, {localUser.address?.state} {localUser.address?.zip_code}
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="mt-6 w-full py-2 px-4 bg-customBlue text-white rounded-md hover:bg-customGold transition-colors"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="editName" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="editName"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
                required
              />
            </div>
            <div>
              <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="editEmail"
                value={editedEmail}
                onChange={(e) => setEditedEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
                required
              />
            </div>
            <div>
              <label htmlFor="editMobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
              <input
                type="tel"
                id="editMobile"
                value={editedMobileNumber}
                onChange={(e) => setEditedMobileNumber(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
                maxLength="10"
                pattern="[0-9]{10}"
                required
              />
            </div>
            {/* New Address Fields */}
            <div>
              <label htmlFor="editStreet" className="block text-sm font-medium text-gray-700">Street</label>
              <input
                type="text"
                id="editStreet"
                value={editedStreet}
                onChange={(e) => setEditedStreet(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="editCity" className="block text-sm font-medium text-gray-700">City</label>
                <input
                  type="text"
                  id="editCity"
                  value={editedCity}
                  onChange={(e) => setEditedCity(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
                />
              </div>
              <div>
                <label htmlFor="editState" className="block text-sm font-medium text-gray-700">State</label>
                <input
                  type="text"
                  id="editState"
                  value={editedState}
                  onChange={(e) => setEditedState(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
                />
              </div>
            </div>
            <div>
              <label htmlFor="editZipCode" className="block text-sm font-medium text-gray-700">Zip Code</label>
              <input
                type="text"
                id="editZipCode"
                value={editedZipCode}
                onChange={(e) => setEditedZipCode(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-customGold focus:border-customGold"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="flex-1 py-2 px-4 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* Profile Picture Upload */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Change Profile Picture</h3>
          <input
            type="file"
            accept="image/png, image/jpeg, image/gif"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-customBlue file:text-white "
          />
          {selectedFile && (
            <button
              onClick={handleUploadProfilePic}
              className="mt-4 w-full py-2 px-4 bg-customBlue text-white rounded-md hover:bg-customBlue-200 transition-colors"
            >
              Upload Picture
            </button>
          )}
        </div>
      </div>

      {/* Right Content - Cars History */}
      <div className="w-full lg:w-2/3 space-y-8">
        <h2 className="text-2xl font-bold mb-4 text-customGold">Your Car History</h2>

        {/* Dashboard Tabs: Buy / Sell / Test Drives */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setActiveTab('buy')}
            className={`px-6 py-2 rounded-l-full text-base md:text-lg font-medium transition-colors duration-200
      ${activeTab === 'buy' ? 'bg-customBlue text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Bought Cars
          </button>

          <button
            onClick={() => setActiveTab('sell')}
            className={`px-6 py-2 text-base md:text-lg font-medium transition-colors duration-200 border-l border-r border-gray-300
      ${activeTab === 'sell' ? 'bg-customBlue text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            My Sell Cars
          </button>

          <button
            onClick={() => setActiveTab('test-drives')}
            className={`px-6 py-2 rounded-r-full text-base md:text-lg font-medium transition-colors duration-200
      ${activeTab === 'test-drives' ? 'bg-customBlue text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            Test Drives
          </button>
        </div>


        {/* Orders Content */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          {currentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <img src={"https://placehold.co/100x100/CCCCCC/000000?text=No+Orders"} alt="No Orders" className="w-24 h-24 mb-4 opacity-70" />
              <p className="text-gray-600 text-lg mb-6">{emptyMessage}</p>
              <button
                onClick={() => navigate(emptyActionLink)}
                className="flex items-center justify-center px-6 py-3 bg-customBlue text-white rounded-full text-lg font-semibold hover:bg-customGold transition-colors shadow-lg"
              >
                {emptyActionText}
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentOrders.map(item => {
                // Handle different data structures for cars vs test drives
                const isTestDrive = activeTab === 'test-drives';
                const car = isTestDrive ? item.car : item;
                const testDrive = isTestDrive ? item : null;

                return (
                  <div
                    key={item._id}
                    className="bg-gray-50 p-4 rounded-md shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow duration-200"
                    onClick={() => {
                      if (isTestDrive) {
                        if (testDrive?.status === 'Confirmed') {
                          navigate('/test-drive-confirmation', { state: { booking: testDrive, car } });
                        } else {
                          navigate('/test-drive', { state: { car, reschedule: true, bookingId: testDrive?._id } });
                        }
                      } else {
                        handleCarClick(car._id);
                      }
                    }}
                  >
                    <h3 className="text-lg font-semibold text-gray-900">{car.make} {car.model}</h3>
                    <p className="text-sm text-gray-600">Year: {car.year}</p>
                    <p className="text-sm text-gray-600">Kms: {parseInt(car.kms_driven || car.kmDriven || 0).toLocaleString('en-IN')}</p>

                    {/* Show test drive information */}
                    {isTestDrive && testDrive && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-blue-600">
                          Test Drive: {new Date(testDrive.scheduled_datetime).toLocaleDateString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500">Time: {new Date(testDrive.scheduled_datetime).toLocaleTimeString('en-IN')}</p>
                        <p className="text-xs text-gray-500">Location: {testDrive.location}</p>
                        <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-1 ${testDrive.status === 'Confirmed' ? 'bg-green-100 text-green-800' :
                            testDrive.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                          }`}>
                          Status: {testDrive.status}
                        </p>
                      </div>
                    )}

                    {/* Show sale information for both buy and sell records */}
                    {!isTestDrive && car.sale_price && (
                      <div className="mt-2 pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-green-600">
                          {activeTab === 'buy' ? 'Purchased for:' : 'Sold for:'} ₹{parseInt(car.sale_price).toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-gray-500">Payment: {car.payment_method || 'N/A'}</p>
                        {car.sale_date && (
                          <p className="text-xs text-gray-500">
                            Date: {new Date(car.sale_date).toLocaleDateString('en-IN')}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Show original price if different from sale price */}
                    {!isTestDrive && car.sale_price && car.price && parseInt(car.sale_price) !== parseInt(car.price) && (
                      <p className="text-xs text-gray-500 line-through mt-1">
                        Original: ₹{parseInt(car.price).toLocaleString('en-IN')}
                      </p>
                    )}

                    {!isTestDrive && car.status && (
                      <p className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-2 ${car.status === 'Available' ? 'bg-green-100 text-green-800' :
                          car.status === 'Sold' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                        }`}>
                        Status: {car.status}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;