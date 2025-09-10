import React from 'react';
import { carData } from '../../data/carData';

const CompanySelection = ({ selected, onSelect }) => {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Select Your Car Company
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {carData.companies.map((company) => (
          <button
            key={company}
            onClick={() => onSelect(company)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
              selected === company
                ? 'border-customBlue bg-purple-50 text-customBlue '
                : 'border-gray-200 bg-white text-gray-700 hover:border-customBlue'
            }`}
          >
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xl font-bold text-gray-600">
                  {company.charAt(0)}
                </span>
              </div>
              <span className="text-sm font-medium">{company}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CompanySelection;
