import React from 'react';
import { carData } from '../../data/carData';

const FuelTypeSelection = ({ selected, onSelect, onBack }) => {
  const fuelTypeIcons = {
    'Petrol': '⛽',
    'Diesel': '🚛',
    'CNG': '🔋',
    'Electric': '⚡',
    'Hybrid': '🌱'
  };

  return (
    <div className="p-6">
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
          Select Fuel Type
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {carData.fuelTypes.map((fuelType) => (
          <button
            key={fuelType}
            onClick={() => onSelect(fuelType)}
            className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
              selected === fuelType
                ? 'border-customBlue bg-purple-50 text-customBlue'
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">
                {fuelTypeIcons[fuelType]}
              </div>
              <span className="text-lg font-medium">{fuelType}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default FuelTypeSelection;
