import React, { useState } from 'react';

const DescriptionInput = ({ onNext, onBack }) => {
  const [description, setDescription] = useState('');

  const handleNext = () => {
    onNext(description);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add a Description</h2>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe your car's condition, features, and history..."
        className="w-full p-3 border rounded-lg focus:ring-purple-500 focus:border-purple-500"
        rows="6"
      />
      <div className="flex justify-between mt-6">
        <button onClick={onBack} className="px-6 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300">
          Back
        </button>
        <button onClick={handleNext} className="px-6 py-2 rounded-lg font-medium bg-purple-600 text-white hover:bg-customBlue">
          Next
        </button>
      </div>
    </div>
  );
};

export default DescriptionInput;
