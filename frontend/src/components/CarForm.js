import React, { useState } from "react";

const CarForm = ({ onSubmit }) => {
  const [form, setForm] = useState({ brand: '', model: '', year: '', price: '', description: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow-md">
      <input name="brand" placeholder="Brand" onChange={handleChange} className="w-full border p-2" required />
      <input name="model" placeholder="Model" onChange={handleChange} className="w-full border p-2" required />
      <input name="year" placeholder="Year" type="number" onChange={handleChange} className="w-full border p-2" required />
      <input name="price" placeholder="Price" type="number" onChange={handleChange} className="w-full border p-2" required />
      <textarea name="description" placeholder="Description" onChange={handleChange} className="w-full border p-2" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Submit</button>
    </form>
  );
};

export default CarForm;
