import React, { useState } from 'react';

const KilometersSelection = ({ selected, onSelect, onBack }) => {
  const [inputKm, setInputKm] = useState(selected || "");

  const handleInputChange = (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) { // allow only numbers
      setInputKm(value);
    }
  };

  const handleConfirm = () => {
    if (inputKm) {
      onSelect(inputKm);
    }
  };

  return (
    <div className="p-6">
      {/* Back button & Title */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">
          How many kilometers has your car run?
        </h2>
      </div>

      {/* Input Field */}
      <div className="mb-4">
        <input
          type="text"
          value={inputKm}
          onChange={handleInputChange}
          placeholder="Enter kilometers (e.g. 25430)"
          className="w-full p-3 border-2 rounded-lg focus:outline-none focus:border-customBlue"
        />
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleConfirm}
        disabled={!inputKm}
        className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
          inputKm
            ? "bg-customBlue text-white hover:bg-purple-700"
            : "bg-gray-300 text-gray-500 cursor-not-allowed"
        }`}
      >
        Confirm
      </button>

      {/* Tip Section */}
      <div className="mt-6 p-4 bg-yellow-50 rounded-lg">
        <p className="text-sm text-yellow-700">
          <span className="font-medium">Tip:</span> Lower kilometers generally mean better resale value. 
          Check your odometer reading for accuracy.
        </p>
      </div>
    </div>
  );
};

export default KilometersSelection;
