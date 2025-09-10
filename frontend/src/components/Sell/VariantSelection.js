import React, { useState } from 'react';
import { carData } from '../../data/carData';

const VariantSelection = ({ company, model, fuelType, selected, onSelect, onBack, year, onYearSelect }) => {
  const [localYear, setLocalYear] = useState(year || '');
  const [error, setError] = useState('');
  const currentYear = new Date().getFullYear();

  // Get variants based on company, model, and fuel type
  const getVariants = () => {
    if (
      carData.variants[company] &&
      carData.variants[company][model] &&
      carData.variants[company][model][fuelType]
    ) {
      return carData.variants[company][model][fuelType];
    }
    return ['Base', 'Mid', 'Top', 'Top+'];
  };

  const variants = getVariants();

  const handleYearChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      setLocalYear(value);
    }
  };

  const validateYear = () => {
    const yearAsNumber = parseInt(localYear, 10);
    if (
      !localYear ||
      isNaN(yearAsNumber) ||
      localYear.length !== 4 ||
      yearAsNumber < 2000 ||
      yearAsNumber > currentYear
    ) {
      setError(`Please enter a valid 4-digit year between 2000 and ${currentYear}.`);
      return false;
    }
    setError('');
    onYearSelect(localYear);
    return true;
  };

  const handleVariantSelect = (variant) => {
    if (validateYear()) {
      onSelect(variant);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button
          onClick={onBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg
            className="w-6 h-6 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Select {model} Variant</h2>
          <p className="text-gray-600 mt-1">
            {company} • {model} • {fuelType}
          </p>
        </div>
      </div>

      {/* Year Input */}
      <div className="mb-6">
        <label className="block text-gray-700 font-medium mb-2">
          Car Manufacturing Year
        </label>
        <input
          type="text"
          value={localYear}
          onChange={handleYearChange}
          placeholder="YYYY"
          maxLength="4"
          className="w-full md:w-1/2 px-4 py-3 rounded-lg border-2 border-gray-200 
                     focus:outline-none focus:border-customBlue text-center text-lg"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Variants */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {variants.map((variant) => (
          <button
            key={variant}
            onClick={() => handleVariantSelect(variant)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg text-left ${
              selected === variant
                ? 'border-customBlue bg-purple-50 text-customBlue'
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-lg">{variant}</span>
                <p className="text-sm text-gray-500 mt-1">
                  {company} {model} {variant}
                </p>
              </div>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  {variant.charAt(0)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Don't know your variant?</span> Check
          your car's registration certificate or look for variant badges on your
          vehicle.
        </p>
      </div>
    </div>
  );
};

export default VariantSelection;
