// src/components/DataForm.jsx
import React, { useState } from 'react';

const DataForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    program: 'Battery Lease Program',
  });

  const handleChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-center">Start Lease Document</h2>
      <input
        name="name"
        placeholder="Full Name"
        value={formData.name}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded"
      />
      <input
        name="email"
        type="email"
        placeholder="Email Address"
        value={formData.email}
        onChange={handleChange}
        required
        className="border p-2 w-full rounded"
      />
      <select
        name="program"
        value={formData.program}
        onChange={handleChange}
        className="border p-2 w-full rounded"
      >
        <option value="Battery Lease Program">Battery Lease Program</option>
      </select>
      <button
        type="submit"
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
      >
        Continue
      </button>
    </form>
  );
};

export default DataForm;
