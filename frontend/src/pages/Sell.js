import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CompanySelection from '../components/Sell/CompanySelection';
import ModelSelection from '../components/Sell/ModelSelection';
import FuelTypeSelection from '../components/Sell/FuelTypeSelection';
import VariantSelection from '../components/Sell/VariantSelection';
import TransmissionSelection from '../components/Sell/TransmissionSelection';
import OwnershipSelection from '../components/Sell/OwnershipSelection';
import KilometersSelection from '../components/Sell/KilometersSelection';
import FeaturesSelection from '../components/Sell/FeaturesSelection';
import DescriptionInput from '../components/Sell/DescriptionInput';
import ImageUpload from '../components/Sell/ImageUpload';
import ProgressStepper from '../components/Sell/ProgressStepper';
import { AuthContext } from '../context/AuthContext';

const Sell = () => {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    company: '',
    model: '',
    year: '',
    fuel_type: '',
    variant: '',
    transmission: '',
    ownership: '',
    kms_driven: '',
    features: [],
    description: '',
    images: []
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    'Company',
    'Model',
    'Fuel Type',
    'Variant + Year',
    'Transmission',
    'Ownership',
    'Kilometers',
    'Features',
    'Description',
    'Images'
  ];

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      company: '', model: '', year: '', fuel_type: '', variant: '',
      ownership: '', kms_driven: '', description: '', images: [],features:[]
    });
    setError('');
  };

  const handleSubmit = async (images) => {
    navigate('/sell/final-details', { state: { formData, images } });
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanySelection
            selected={formData.company}
            onSelect={(company) => {
              updateFormData('company', company);
              nextStep();
            }}
          />
        );
      case 2:
        return (
          <ModelSelection
            company={formData.company}
            selected={formData.model}
            onSelect={(model) => {
              updateFormData('model', model);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 3:
        return (
          <FuelTypeSelection
            selected={formData.fuel_type}
            onSelect={(fuel) => {
              updateFormData('fuel_type', fuel);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 4:
        return (
          <VariantSelection
            company={formData.company}
            model={formData.model}
            fuelType={formData.fuel_type}
            year={formData.year}
            onYearSelect={(year) => updateFormData('year', year)}
            selected={formData.variant}
            onSelect={(variant) => {
              updateFormData('variant', variant);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 5:
        return (
          <TransmissionSelection
            selected={formData.transmission}
            onSelect={(t) => {
              updateFormData('transmission', t);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 6:
        return (
          <OwnershipSelection
            selected={formData.ownership}
            onSelect={(owner) => {
              updateFormData('ownership', owner);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 7:
        return (
          <KilometersSelection
            selected={formData.kms_driven}
            onSelect={(kms) => {
              updateFormData('kms_driven', kms);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 8: 
        return (
          <FeaturesSelection
            selected={formData.features}
            onSelect={(features) => updateFormData('features', features)}
            onNext={nextStep}
            onBack={prevStep}
          />
        );
      case 9:
        return (
          <DescriptionInput
            onNext={(desc) => {
              updateFormData('description', desc);
              nextStep();
            }}
            onBack={prevStep}
          />
        );
      case 10:
        return (
          <ImageUpload
            onUpload={handleSubmit}
            onBack={prevStep}
            loading={loading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-800 text-center mb-8">Sell Your Car</h1>
          <ProgressStepper steps={steps} currentStep={currentStep} />
          <div className="bg-white rounded-lg shadow-xl p-6 mt-8">
            {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sell;
