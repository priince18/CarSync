import React, { useState } from 'react';

const PricePredictionPage = () => {
  const [carDetails, setCarDetails] = useState({
    make: '',
    model: '',
    year: '',
    kms_driven: '',
    fuel_type: '',
    transmission: '',
  });

  const [predictedPrice, setPredictedPrice] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarDetails({ ...carDetails, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPredictedPrice(null);

    try {
      const response = await fetch('http://localhost:5000/api/predict_price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(carDetails),
      });

      if (!response.ok) {
        throw new Error('Failed to get price prediction');
      }

      const data = await response.json();
      setPredictedPrice(data.predicted_price);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Price Prediction</h1>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto bg-white p-8 rounded-lg shadow-md">
        
        {/* Make */}
        <div className="mb-4">
          <label htmlFor="make" className="block text-gray-700 font-bold mb-2">Make (Brand)</label>
          <input
            type="text"
            id="make"
            name="make"
            value={carDetails.make}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Model */}
        <div className="mb-4">
          <label htmlFor="model" className="block text-gray-700 font-bold mb-2">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={carDetails.model}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Year */}
        <div className="mb-4">
          <label htmlFor="year" className="block text-gray-700 font-bold mb-2">Year</label>
          <input
            type="number"
            id="year"
            name="year"
            max={new Date().getFullYear()}
            min={2010}
            value={carDetails.year}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Kms Driven */}
        <div className="mb-4">
          <label htmlFor="kms_driven" className="block text-gray-700 font-bold mb-2">Kms Driven</label>
          <input
            type="number"
            id="kms_driven"
            name="kms_driven"
            value={carDetails.kms_driven}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        {/* Fuel Type */}
        <div className="mb-4">
          <label htmlFor="fuel_type" className="block text-gray-700 font-bold mb-2">Fuel Type</label>
          <select
            id="fuel_type"
            name="fuel_type"
            value={carDetails.fuel_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select Fuel</option>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="CNG">CNG</option>
            <option value="Electric">Electric</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Transmission */}
        <div className="mb-4">
          <label htmlFor="transmission" className="block text-gray-700 font-bold mb-2">Transmission</label>
          <select
            id="transmission"
            name="transmission"
            value={carDetails.transmission}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select Transmission</option>
            <option value="Manual">Manual</option>
            <option value="Automatic">Automatic</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Predict Price
        </button>
      </form>

      {predictedPrice && (
        <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg shadow-md ">
          <h2 className="text-2xl font-bold text-customBlue">Predicted Price:</h2>
          <p className="text-3xl text-customGold">₹{predictedPrice}</p>
        </div>
      )}

      {error && (
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-red-500">Error:</h2>
          <p className="text-xl">{error}</p>
        </div>
      )}
    </div>
  );
};

export default PricePredictionPage;
