export const onSaveSignature = (signaturePadRef, callback) => {
  if (!signaturePadRef.current || signaturePadRef.current.isEmpty()) {
    alert("Please provide a signature first.");
    return;
  }

  const dataURL = signaturePadRef.current.toDataURL("image/png");
  if (typeof callback === "function") {
    callback(dataURL);
  } else {
    console.warn("onSaveSignature: No callback function provided.");
  }
};
