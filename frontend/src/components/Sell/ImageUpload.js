import React, { useState, useRef } from 'react';

const ImageUpload = ({ onBack, onUpload }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

  // const handleImageSelect = (event) => {
  //   const files = Array.from(event.target.files);
  //   if (files.length === 0) return;

  //   // Validate file types
  //   const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  //   const validFiles = files.filter(file => validTypes.includes(file.type));

  //   if (validFiles.length !== files.length) {
  //     alert('Please select only JPEG, JPG, or PNG images');
  //     return;
  //   }

  //   setSelectedImages(validFiles);

  //   // Create preview URLs
  //   const previewUrls = validFiles.map(file => URL.createObjectURL(file));
  //   setPreviews(previewUrls);
  // };

  const removeImage = (index) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);

    // Revoke the URL to free memory
    URL.revokeObjectURL(previews[index]);

    setSelectedImages(newImages);
    setPreviews(newPreviews);
  };

  // const handleUpload = () => {
  //   if (selectedImages.length === 0) {
  //     alert('Please select at least one image');
  //     return;
  //   }
  //   onUpload(selectedImages);
  // };
const handleImageSelect = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    setSelectedImages(files);
    setPreviews(files.map(file => URL.createObjectURL(file)));
  };

  const handleUpload = async () => {
    if (!selectedImages.length) {
      alert('Select images first!');
      return;
    }
    const formData = new FormData();
    selectedImages.forEach(img => formData.append('images', img));

    const res = await fetch('http://localhost:5000/api/upload_images', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    console.log('UPLOADED paths ->', data.uploaded);
    onUpload(data.uploaded);   // forward paths to parent
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
          Upload Car Images
        </h2>
      </div>

      <div className="mb-6">
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-customBlue transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="text-6xl mb-4">📷</div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Upload Car Images
          </h3>
          <p className="text-gray-500 mb-4">
            Click to select images or drag and drop
          </p>
          <p className="text-sm text-gray-400">
            Supported formats: JPEG, JPG, PNG (Max 10MB each)
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleImageSelect}
          className="hidden"
        />
      </div>

      {previews.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-700 mb-4">Selected Images:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <h4 className="font-medium text-blue-800 mb-2">📋 Important Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Take photos from multiple angles (front, back, sides, interior)</li>
          <li>• Ensure good lighting and focus</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleUpload}
          disabled={selectedImages.length === 0}
          className={`px-6 py-3 rounded-lg font-medium transition-all ${selectedImages.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-purple-600 text-white hover:bg-customBlue shadow-lg hover:shadow-xl'
            }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;