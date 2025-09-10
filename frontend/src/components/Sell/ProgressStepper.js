import React from 'react';

const ProgressStepper = ({ steps, currentStep }) => {
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
            index + 1 === currentStep 
              ? 'bg-customBlue border-customBlue text-white' 
              : index + 1 < currentStep 
                ? 'bg-green-500 border-green-500 text-white'
                : 'bg-white border-gray-300 text-gray-500'
          }`}>
            {index + 1 < currentStep ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <span className="text-sm font-semibold">{index + 1}</span>
            )}
          </div>
          <div className="ml-2 mr-4">
            <div className={`text-sm font-medium ${
              index + 1 === currentStep ? 'text-customBlue' : 
              index + 1 < currentStep ? 'text-green-500' : 'text-gray-500'
            }`}>
              {step}
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`w-8 h-0.5 ${
              index + 1 < currentStep ? 'bg-green-500' : 'bg-gray-300'
            }`} />
          )}
        </div>
      ))}
    </div>
  );
};

export default ProgressStepper;
