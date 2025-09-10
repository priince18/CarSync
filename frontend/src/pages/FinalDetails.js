import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const FinalDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { formData, images } = location.state || {};

  const [finalPrice, setFinalPrice] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!formData) {
    return <div>No details provided.</div>;
  }

  const handleConfirm = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Create new FormData
      const fd = new FormData();

      // Copy over formData fields
      fd.append("seller_id", localStorage.getItem("userId"));

      fd.append("company", formData.company);
      fd.append("model", formData.model);
      fd.append("year", formData.year);
      fd.append("kms_driven", formData.kms_driven);
      fd.append("fuel_type", formData.fuel_type);
      fd.append("transmission", formData.transmission);
      fd.append("description", formData.description || "");
      fd.append("owner", formData.ownership);

      fd.append("price", finalPrice);
      fd.append("variant", formData.variant);
      fd.append("features", JSON.stringify(formData.features));
      fd.append('image_urls', JSON.stringify(images)); 



      const res = await axios.post("http://localhost:5000/api/cars", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Car saved:", res.data);
      alert("Car listed successfully!");
      navigate("/"); // redirect if needed
    } catch (err) {
      console.error("Error saving car:", err.response?.data || err.message);
      alert("Failed to save car.");
    }
  };


  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto bg-gray-50">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <h1 className="text-3xl font-extrabold text-customGold mb-6 text-center p-6 border-b">
          {formData.company} {formData.model}
        </h1>

        <div className="p-6">
          <div className="mb-4">
            <img
              src={
                images && images.length > 0
                  ? `http://localhost:5000/${images[selectedImageIndex]}` // for preview before upload
                  : "https://placehold.co/800x500/E0E0E0/333333?text=Car+Image"
              }
              alt={`${formData.company} ${formData.model}`}
              className="w-full h-96 object-cover rounded-lg shadow-md"
             
            />
          </div>

          {/* Thumbnail Gallery */}
          {images && images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000/${img}`}
                  alt={`${formData.company} ${formData.model} - ${index + 1}`}
                  className={`w-20 h-16 object-cover rounded cursor-pointer border-2 transition-all ${selectedImageIndex === index
                    ? "border-purple-500"
                    : "border-gray-300 hover:border-purple-300"
                    }`}
                  onClick={() => setSelectedImageIndex(index)}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "https://placehold.co/80x64/E0E0E0/333333?text=Image";
                  }}
                />
              ))}
            </div>
          )}
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
        {/* Car Details */}
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Car Specifications</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Brand</p>
                <p className="font-semibold">{formData.company}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Model</p>
                <p className="font-semibold">{formData.model}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Year</p>
                <p className="font-semibold">{formData.year}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kms Driven</p>
                <p className="font-semibold">{formData.kms_driven?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Fuel Type</p>
                <p className="font-semibold">{formData.fuel_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Transmission</p>
                <p className="font-semibold">{formData.transmission}</p>
              </div>
            </div>
          </div>

          {formData.description && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700">{formData.description}</p>
            </div>
          )}
        </div>
        <div className="p-6 bg-gray-50 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Price Details</h2>

          <input
            type="number"
            placeholder="Enter your selling price"
            value={finalPrice}
            onChange={(e) => setFinalPrice(e.target.value)}
            className="border p-2 w-full mb-3"
          />
        </div>



        {/* Features + Confirm */}
        <div className="space-y-6 bg-gray-50 rounded-lg shadow-md">
          {formData.features && (
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Features</h3>
              <ul className="list-disc list-inside text-gray-700">
                {formData.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}

        </div>
        <div className="p-6">
          <button
            onClick={handleConfirm}
            className="w-full py-3  bg-purple-700 text-white rounded-lg font-semibold hover:bg-customBlue transition-colors text-lg"
          >
            Confirm For Sell
          </button>
        </div>

      </div>
    </div>

  );
};

export default FinalDetails;
