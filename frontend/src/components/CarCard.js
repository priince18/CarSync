import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const CarCard = ({ car, onCarClick, isLiked, onLikeToggle }) => {
  const navigate = useNavigate();
  // Use useContext with AuthContext directly to get the authentication status.
  const { isLoggedIn } = useContext(AuthContext); 
  
  // Local state to manage loading and error states for the like button
  const [isLiking, setIsLiking] = useState(false);
  const [likeError, setLikeError] = useState(null);

  // Guard clause to prevent rendering if 'car' prop is undefined
  if (!car) {
    console.error("CarCard received an undefined 'car' prop and will not render.");
    return null;
  }

  const handleLikeClick = async (e) => {
    // e.stopPropagation(); // Prevents the parent card's click handler from firing

    if (!isLoggedIn) {
      console.log("User not logged in. Redirecting to login page.");
      navigate('/login');
      return;
    }

    // Prevent multiple clicks while the request is in progress
    if (isLiking) return;

    try {
      setIsLiking(true);
      setLikeError(null);
      
      // Call the parent's toggle function and await its result
      // The parent component should handle the API call and return a success/fail state
      await onLikeToggle(car._id);
    } catch (error) {
      console.error("Failed to toggle like status:", error);
      // Set a local error message to display on the card
      setLikeError("Failed to update like status. Please try again.");
      // Automatically clear the error message after 3 seconds
      setTimeout(() => setLikeError(null), 3000);
    } finally {
      setIsLiking(false);
    }
  };

  // Use a placeholder image if no image URL is available
  const imageUrl = (car.images && Array.isArray(car.images) && car.images.length > 0) ? car.images[0] : "https://placehold.co/400x250/E0E0E0/333333?text=Car+Image";

  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 cursor-pointer transform hover:scale-105 transition-transform duration-200"
      onClick={() => onCarClick(car._id)}
    >
      <img
        src={`http://localhost:5000/${imageUrl}`}
        alt={`${car.make} ${car.model}`}
        className="w-full h-48 object-cover"
     />
      <div className="p-4 relative">
        <h2 className="text-lg font-semibold text-gray-900">{car.make} {car.model}</h2>
        <div className="flex justify-between items-center text-sm text-gray-600">
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {car.year}
          </p>
          <p className="flex items-center">
            <svg className="w-4 h-4 mr-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            {car.kms_driven?.toLocaleString('en-IN') || "N/A"} km
          </p>
        </div>
        <p className="text-sm text-gray-600 mt-1">Fuel: {car.fuel_type}</p>
        {car.body_type && <p className="text-sm text-gray-600">Body: {car.body_type}</p>}
        {car.transmission && <p className="text-sm text-gray-600">Trans: {car.transmission}</p>}
        {car.category && (
          <p className="text-sm text-gray-600 flex items-center">
            Category: {car.category}
            {car.category === "Budget" && (
              <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                Budget
              </span>
            )}
          </p>
        )}

        <div className="text-xl font-bold mt-2 text-purple-700">₹ {car.price?.toLocaleString('en-IN') || "N/A"}</div>
        <div className="text-sm text-gray-600">{car.address}</div>
        
        {/* Display the local error message if it exists */}
        {likeError && (
          <p className="mt-2 text-center text-red-500 text-xs font-medium">{likeError}</p>
        )}
      </div>
      {/* Like Button */}
      <button
        onClick={handleLikeClick}
        className={`absolute top-3 right-3 p-2 rounded-full shadow-lg transition-colors ${
          isLiked ? 'bg-red-500 text-white' : 'bg-white text-gray-400 hover:text-red-500'
        } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
        title={isLiking ? "Updating..." : (isLiked ? "Unlike" : "Like")}
        disabled={isLiking}
      >
         <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">

          <path

            fillRule="evenodd"

            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"

            clipRule="evenodd"

          />

        </svg>

      </button>
    </div>
  );
};

export default CarCard;
