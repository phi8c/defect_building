import React, { useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";

const API = "http://localhost:8000/scanner/segment";

const CrackScanner: React.FC = () => {

  const webcamRef = useRef<Webcam | null>(null);

  const [overlay, setOverlay] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const captureFrame = async () => {

    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const blob = await fetch(imageSrc).then(res => res.blob());

    const formData = new FormData();
    formData.append("file", blob, "frame.jpg");

    const res = await fetch(API, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.image) {
      setOverlay(`data:image/jpeg;base64,${data.image}`);
    }
  };

 useEffect(() => {

  const interval = setInterval(() => {

    if (isScanning) {
      captureFrame();
    }

  }, 7000);

  return () => clearInterval(interval);

}, [isScanning]);
 return (
  <div style={{ position: "relative", width: "100%" }}>

    <Webcam
      ref={webcamRef}
      screenshotFormat="image/jpeg"
      videoConstraints={{
        facingMode: "environment"
      }}
      style={{
        width: "100%"
      }}
    />

    {overlay && (
      <img
        src={overlay}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          pointerEvents: "none"
        }}
      />
    )}

    {/* CAPTURE BUTTON */}
    <button
      onClick={captureFrame}
      style={{
        position: "absolute",
        bottom: 90,
        left: "50%",
        transform: "translateX(-50%)",
        padding: "16px 28px",
        fontSize: 18,
        borderRadius: 12
      }}
    >
      Capture
    </button>

    {/* STOP / RESUME BUTTON */}
    <button
  onClick={() => setIsScanning(!isScanning)}
  style={{
    position: "absolute",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    padding: "14px 26px",
    fontSize: 16,
    borderRadius: 12,
    background: isScanning ? "#ef4444" : "#22c55e",
    color: "white"
  }}
>
  {isScanning ? "Stop Scan" : "Start Scan"}
</button>

  </div>
);
};

export default CrackScanner;