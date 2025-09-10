import React, { useState } from 'react';

const allFeatures = [
  'Air Conditioning',
  'Power Steering',
  'Power Windows',
  'ABS',
  'Airbags',
  'Sunroof',
  'Alloy Wheels',
  'Touchscreen Infotainment',
  'Reverse Camera',
  'Cruise Control',
  'Bluetooth Connectivity',
  'Leather Seats'
];

const FeaturesSelection = ({ selected = [], onSelect, onBack, onNext }) => {
  const [features, setFeatures] = useState(selected);

  const toggleFeature = (feature) => {
    let updated;
    if (features.includes(feature)) {
      updated = features.filter((f) => f !== feature);
    } else {
      updated = [...features, feature];
    }
    setFeatures(updated);
    onSelect(updated);
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
        <h2 className="text-2xl font-bold text-gray-800">Select Car Features</h2>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allFeatures.map((feature) => (
          <button
            key={feature}
            onClick={() => toggleFeature(feature)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
              features.includes(feature)
                ? 'border-customBlue bg-purple-50 text-customBlue'
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <span>{feature}</span>
            {features.includes(feature) && (
              <span className="text-purple-600 font-bold">✓</span>
            )}
          </button>
        ))}
      </div>

      {/* Next Button */}
      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-customBlue transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default FeaturesSelection;
