import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// ✅ Import auth hook/context (adjust path if needed)
import { useAuth } from "../context/AuthContext";

const CarDetailsPage = () => {
  const { carId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ current logged-in user

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:5000/api/cars/${carId}`
        );
        setCar(response.data);
      } catch (err) {
        setError(
          "Failed to load car details. It might not exist or there was a network error."
        );
      } finally {
        setLoading(false);
      }
    };

    if (carId) {
      fetchCarDetails();
    } else {
      setError("No car ID provided.");
      setLoading(false);
    }
  }, [carId]);

  if (loading) {
    return (
      <div className="text-center text-xl text-gray-700 mt-10">
        Loading car details...
      </div>
    );
  }
  if (error) {
    return (
      <div className="text-center text-red-600 text-xl mt-10">{error}</div>
    );
  }
  if (!car) {
    return (
      <div className="text-center text-gray-500 text-xl mt-10">
        Car not found.
      </div>
    );
  }

  // 🔐 Robust seller-id extraction (supports multiple shapes)
  const normalizeId = (val) => {
    if (!val) return null;
    if (typeof val === "object") {
      // Possible shapes: { _id: "..." } or { $oid: "..." }
      if (val._id) return String(val._id);
      if (val.$oid) return String(val.$oid);
    }
    return String(val);
  };

  const currentUserId = user ? user.userId : null;
  const carSellerId = car.seller_id;
  const isSeller = currentUserId && carSellerId && currentUserId === carSellerId;

  const carsold = car.status === "sold";
  // Get all available images
  const images =
    car.images && Array.isArray(car.images) && car.images.length > 0
      ? car.images
      : ["https://placehold.co/800x500/E0E0E0/333333?text=Car+Image"];

  const seller = car.seller || {};

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto bg-gray-50">
      <button
        onClick={() => navigate("/buy")}
        className="mb-6 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors flex items-center"
      >
        <svg
          className="w-4 h-4 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          ></path>
        </svg>
        Back to Buy
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h1 className="text-3xl font-extrabold text-purple-800 mb-6 text-center p-6 border-b">
          {car.make} {car.model}
        </h1>

        {/* Image Gallery */}
        <div className="p-6">
          <div className="mb-4">
            <img
              src={`http://localhost:5000/${car.images[selectedImageIndex]}`}
              alt={`${car.make} ${car.model}`}
              className="w-full h-96 object-cover rounded-lg shadow-md"
            />
          </div>

          {/* Thumbnail Gallery */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/${image}`}
                  alt={`${car.make} ${car.model} - Image ${index + 1}`}
                  className={`w-20 h-16 object-cover rounded cursor-pointer border-2 transition-all ${selectedImageIndex === index
                    ? "border-purple-500"
                    : "border-gray-300 hover:border-purple-300"
                    }`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://placehold.co/80x64/E0E0E0/333333?text=Image";
                  }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
          {/* Car Details */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Car Specifications
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Brand</p>
                  <p className="font-semibold">{car.make}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Model</p>
                  <p className="font-semibold">{car.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-xl font-bold text-purple-700">
                    ₹ {car.price?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Owner</p>
                  <p className="font-semibold">{car.owner}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Year</p>
                  <p className="font-semibold">{car.year}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">kms_driven</p>
                  <p className="font-semibold">
                    {car.kms_driven?.toLocaleString()} km
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fuel Type</p>
                  <p className="font-semibold">{car.fuel_type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Transmission</p>
                  <p className="font-semibold">{car.transmission}</p>
                </div>
              </div>
            </div>
            {car.features && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Features
                </h3>
                <ul className="list-disc list-inside text-gray-700">
                  {car.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                  ))}
                </ul>
              </div>
            )}
            {car.description && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700">{car.description}</p>
              </div>
            )}
          </div>

          {/* Seller Details and Actions */}
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Seller Information
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Name</p>
                  <p className="font-semibold">{seller.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{seller.email || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone</p>
                  <p className="font-semibold">{seller.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="font-semibold">{seller.address || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* ✅ Action Buttons Section (ONLY seller check as requested) */}
            <div className="space-y-4">
              {carsold ? (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-semibold text-red-600 mb-2">
                    This car has already been sold.
                  </h3>
                  <p className="text-gray-600">
                    You can no longer buy or edit this car.
                  </p>
                </div>
              ) : (
                <>{isSeller ? (

                  <button
                    onClick={() => navigate(`/edit-car/${car._id}`)}
                    className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
                  >
                    Edit Car Details
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => navigate("/buy-car", { state: { car } })}
                      className="w-full py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors text-lg"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => navigate("/test-drive", { state: { car } })}
                      className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-lg"
                    >
                      Book Test Drive
                    </button>
                  </>
                )}</>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetailsPage;
