// src/components/PdfModal.jsx 
import React, { useRef, useState } from 'react';
import Modal from 'react-modal';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
Modal.setAppElement('#root');

// Reusable save logic
const onSave = async ({ signatureCanvasRef, formData, pdfPath = '/EsignLOAform5.pdf' }) => {
  if (!signatureCanvasRef.current || signatureCanvasRef.current.isEmpty()) {
    throw new Error('Signature is missing.');
  }

  const signatureDataUrl = signatureCanvasRef.current.toDataURL();
  const response = await fetch(pdfPath);
  if (!response.ok) throw new Error('Failed to fetch PDF');

  const existingPdfBytes = await response.arrayBuffer();
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  try {
    form.getTextField('Name').setText(formData.name || '');
    form.getTextField('Email').setText(formData.email || '');
    form.getTextField('Program').setText(formData.program || '');
  } catch (err) {
    console.warn('PDF form field error:', err);
  }

  const pngImage = await pdfDoc.embedPng(signatureDataUrl);
  const page = pdfDoc.getPages()[0];

  page.drawImage(pngImage, {
    x: 100,
    y: 200,
    width: 150,
    height: 50,
  });

  const savedBytes = await pdfDoc.save();
  return new Uint8Array(savedBytes); // <-- Ensure correct format
};

// Main Modal Component
const PdfModal = ({ isOpen, onClose, formData }) => {
  const [numPages, setNumPages] = useState(null);
  const [pdfBuffer, setPdfBuffer] = useState(null);
  const sigCanvas = useRef(null);

  const handleDocumentLoad = ({ numPages }) => {
    setNumPages(numPages);
  };

  const handleClear = () => sigCanvas.current?.clear();

  const handleSubmit = async () => {
    try {
      const modifiedPdfBytes = await onSave({
        signatureCanvasRef: sigCanvas,
        formData,
      });

      setNumPages(null); // reset before re-rendering
      setPdfBuffer(modifiedPdfBytes);

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

      // Debug open PDF
      const blobUrl = URL.createObjectURL(blob);
      console.log('Opening signed PDF preview:', blobUrl);
      window.open(blobUrl, '_blank');

      // Email logic
      const emailFormData = new FormData();
      emailFormData.append('pdf', blob, 'SignedLOA.pdf');
      emailFormData.append('to', formData.email);
      emailFormData.append('cc', 'you@example.com, dr.john@example.com');

      const res = await fetch('/api/send-signed-pdf', {
        method: 'POST',
        body: emailFormData,
      });

      if (!res.ok) throw new Error('Email sending failed');
      alert('Signed PDF emailed successfully.');
      onClose();
    } catch (error) {
      console.error('Error:', error);
      alert(error.message || 'An error occurred while processing the PDF.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Sign LOA"
      style={{
        content: {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '95vw',
          height: '95vh',
          overflow: 'auto',
          padding: '2rem',
        },
      }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Review & Sign Your LOA</h2>
        <button onClick={onClose} className="text-red-600 hover:underline">Close</button>
      </div>

      <div className="flex flex-col items-center overflow-auto">
        {!pdfBuffer ? (
          <>
            <Document
              file="/EsignLOAform5.pdf"
              onLoadSuccess={handleDocumentLoad}
              onLoadError={(e) => {
                console.error('Initial PDF load error:', e);
                alert('Could not load original PDF.');
              }}
            >
              {numPages &&
                Array.from(new Array(numPages), (_, i) => (
                  <Page key={`page_${i + 1}`} pageNumber={i + 1} width={800} />
                ))}
            </Document>

            <div className="mt-6 w-full max-w-3xl text-center">
              <h3 className="font-bold mb-2">Sign Below</h3>
              <SignatureCanvas
                penColor="black"
                canvasProps={{ width: 600, height: 200, className: 'border border-gray-400 rounded' }}
                ref={sigCanvas}
              />
              <div className="flex justify-center gap-4 mt-3">
                <button onClick={handleClear} className="text-sm text-gray-600 underline">
                  Clear
                </button>
              </div>
              <button
                onClick={handleSubmit}
                className="mt-4 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Submit & Email PDF
              </button>
            </div>
          </>
        ) : (
          <Document
            file={{ data: pdfBuffer }}
            onLoadSuccess={handleDocumentLoad}
            onLoadError={(err) => {
              console.error('Signed PDF load error:', err);
              alert('Failed to load signed PDF preview.');
            }}
          >
            {numPages &&
              Array.from(new Array(numPages), (_, i) => (
                <Page key={`page_rendered_${i + 1}`} pageNumber={i + 1} width={800} />
              ))}
          </Document>
        )}
      </div>
    </Modal>
  );
};

export default PdfModal;
