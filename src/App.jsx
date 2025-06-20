// src/App.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LandingForm from './components/DataForm';
import SignaturePadComponent from './components/SignaturePadComponent';

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: '', email: '', program: '' });
  const [signatureData, setSignatureData] = useState(null);

  const navigate = useNavigate();

  const handleFormSubmit = (data) => {
    setFormData(data);
    setStep(2);
  };

  const handleSignatureSubmit = (signature) => {
    setSignatureData(signature);
    // Navigate to /sign page and pass formData + signature
    navigate('/sign', {
      state: {
        formData,
        signatureData: signature,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
      {step === 1 && <LandingForm onSubmit={handleFormSubmit} />}
      {step === 2 && <SignaturePadComponent onSave={handleSignatureSubmit} />}
    </div>
  );
}
