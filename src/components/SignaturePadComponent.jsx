import React, { useRef, useEffect } from "react";
import SignaturePad from "signature_pad";
import { onSaveSignature } from "../utils/signatureUtils"; // Correct import

const SignaturePadComponent = ({ onSave }) => {
  const canvasRef = useRef(null);
  const sigPadRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = 400;
    canvas.height = 200;
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, canvas.width, canvas.height);

    sigPadRef.current = new SignaturePad(canvas);
  }, []);

  const handleClear = () => {
    sigPadRef.current?.clear();
  };

  const handleSave = () => {
    onSaveSignature(sigPadRef, onSave);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Sign Below</h2>
      <canvas
        ref={canvasRef}
        className="border border-gray-400 rounded mb-2"
      ></canvas>
      <div className="space-x-2">
        <button
          onClick={handleClear}
          className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
        >
          Clear
        </button>
        <button
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Save Signature
        </button>
      </div>
    </div>
  );
};

export default SignaturePadComponent;
