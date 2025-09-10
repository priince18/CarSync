import React from 'react';
import { carData } from '../../data/carData';

const OwnershipSelection = ({ selected, onSelect, onBack }) => {
  const ownershipIcons = {
    '1st owner': '👤',
    '2nd owner': '👥',
    '3rd owner': '👥👤',
    '4th owner': '👥👥',
    'Beyond 4th owner': '👥👥👤',
    'I am a car dealer': '🏢'
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
          How many owners has this car had?
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {carData.ownershipOptions.map((ownership) => (
          <button
            key={ownership}
            onClick={() => onSelect(ownership)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg text-left ${
              selected === ownership
                ? 'border-customBlue bg-purple-50 text-customBlue'
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">
                {ownershipIcons[ownership]}
              </div>
              <div>
                <span className="font-medium text-lg">{ownership}</span>
                {ownership === '1st owner' && (
                  <p className="text-sm text-green-600 mt-1">Best resale value</p>
                )}
                {ownership === 'I am a car dealer' && (
                  <p className="text-sm text-blue-600 mt-1">Commercial seller</p>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OwnershipSelection;
