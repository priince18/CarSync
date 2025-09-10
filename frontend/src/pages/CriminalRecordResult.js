import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const CriminalRecordResult = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  const numberPlate = state?.numberPlate;
  const crimeDetails = state?.crimeDetails;
  const formData = state?.formData;

  if (!numberPlate || !crimeDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-6 rounded shadow w-full max-w-xl text-center">
          <h2 className="text-xl font-semibold mb-2">Invalid access</h2>
          <p className="mb-4">Missing number plate or crime details.</p>
          <button onClick={() => navigate('/sell')} className="px-4 py-2 bg-purple-600 text-white rounded">Go to Sell</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-xl p-6">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Criminal Record Found</h1>
          <p className="mb-2">Number Plate: <span className="font-mono font-semibold">{numberPlate}</span></p>

          <div className="mt-4 p-4 border rounded bg-red-50 border-red-200">
            <p className="mb-1"><span className="font-semibold">Crime Type:</span> {crimeDetails?.crime_type}</p>
            <p className="mb-1"><span className="font-semibold">Date Reported:</span> {crimeDetails?.date_reported}</p>
            <p className="mb-1"><span className="font-semibold">Status:</span> {crimeDetails?.status}</p>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded"
              onClick={() => navigate('/sell')}
            >
              Start Over
            </button>
            {formData && (
              <button
                className="px-4 py-2 bg-gray-200 rounded"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CriminalRecordResult;
