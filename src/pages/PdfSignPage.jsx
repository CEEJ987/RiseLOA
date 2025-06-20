import React, { useRef, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import SignatureCanvas from 'react-signature-canvas';
import { PDFDocument } from 'pdf-lib';

import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// ✅ Use this CDN-based fallback that works in Vite
pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js";

const PdfSignPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const formData = state?.formData;

  const [pdfBuffer, setPdfBuffer] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const sigCanvas = useRef(null);

  useEffect(() => {
    if (!formData) {
      navigate('/');
    }
  }, [formData, navigate]);

  const handleDocumentLoad = ({ numPages }) => setNumPages(numPages);
  const handleClear = () => sigCanvas.current?.clear();

  const handleSubmit = async () => {
    try {
      const response = await fetch('/EsignLOAform5.pdf');
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const form = pdfDoc.getForm();

      form.getTextField('Name').setText(formData.name || '');
      form.getTextField('Email').setText(formData.email || '');
      form.getTextField('Program').setText(formData.program || '');

      const signatureDataUrl = sigCanvas.current.toDataURL();
      const pngImage = await pdfDoc.embedPng(signatureDataUrl);
      const page = pdfDoc.getPages()[0];

      page.drawImage(pngImage, {
        x: 100,
        y: 200,
        width: 150,
        height: 50,
      });

      const modifiedPdfBytes = await pdfDoc.save();
      setPdfBuffer(modifiedPdfBytes);

      const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
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
    } catch (err) {
      console.error('Error:', err);
      alert(err.message || 'Error signing PDF');
    }
  };

  if (!formData) return null;

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Sign Your LOA</h1>

      {!pdfBuffer ? (
        <>
          <Document file="/EsignLOAform5.pdf" onLoadSuccess={handleDocumentLoad}>
            {Array.from(new Array(numPages), (_, i) => (
              <Page key={i} pageNumber={i + 1} width={800} />
            ))}
          </Document>

          <div className="mt-6">
            <h3 className="font-bold mb-2">Signature</h3>
            <SignatureCanvas
              penColor="black"
              canvasProps={{ width: 600, height: 200, className: 'border border-gray-400 rounded' }}
              ref={sigCanvas}
            />
            <div className="flex gap-4 mt-3">
              <button onClick={handleClear} className="text-sm text-gray-600 underline">
                Clear
              </button>
              <button onClick={handleSubmit} className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
                Submit & Email PDF
              </button>
            </div>
          </div>
        </>
      ) : (
        <Document file={{ data: pdfBuffer }} onLoadSuccess={handleDocumentLoad}>
          {Array.from(new Array(numPages), (_, i) => (
            <Page key={i} pageNumber={i + 1} width={800} />
          ))}
        </Document>
      )}
    </div>
  );
};

export default PdfSignPage;
