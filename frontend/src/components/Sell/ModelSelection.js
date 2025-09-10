import React from 'react';
import { carData } from '../../data/carData';

const ModelSelection = ({ company, selected, onSelect, onBack }) => {
  const models = carData.models[company] || [];

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
          Select {company} Model
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map((model) => (
          <button
            key={model}
            onClick={() => onSelect(model)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg text-left ${
              selected === model
                ? 'border-customBlue bg-purple-50 text-customBlue'
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-bold text-gray-600">
                  {model.charAt(0)}
                </span>
              </div>
              <span className="font-medium">{model}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ModelSelection;
