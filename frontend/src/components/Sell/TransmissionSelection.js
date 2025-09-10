import React from 'react';

const TransmissionSelection = ({ selected, onSelect, onBack }) => {
  const transmissions = ['Manual', 'Automatic'];

  return (
    <div className="p-6">
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
        <h2 className="text-2xl font-bold text-gray-800">Select Transmission</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {transmissions.map((type) => (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`p-6 rounded-lg border-2 transition-all duration-200 hover:shadow-lg text-left ${
              selected === type
                ? 'border-customBlue bg-purple-50 text-customBlue'
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-lg">{type}</span>
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-gray-600">
                  {type.charAt(0)}
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TransmissionSelection;
