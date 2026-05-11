import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function AnalyzingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Initializing Analysis...");
  
  // Ref to prevent double execution in React Strict Mode
  const hasCalledAPI = useRef(false);
  const imageData = location.state?.imageData;

  useEffect(() => {
    // Redirect if no image was provided
    if (!imageData) {
      console.error("[ERROR] No image data found in location state.");
      navigate('/analyze');
      return;
    }

    const processImageAndPredict = async () => {
      // Prevent duplicate calls
      if (hasCalledAPI.current) return;
      hasCalledAPI.current = true;

      try {
        setStatus("Processing image for AI model...");
        
        // 1. Prepare the image as a Blob (Binary Large Object)
        const responseImg = await fetch(imageData);
        const blob = await responseImg.blob();
        
        // 2. Create FormData to mimic a file upload
        const formData = new FormData();
        formData.append('file', blob, 'burn_case.jpg');

        setStatus("Communicating with Backend Server...");
        console.log("[DEBUG] Sending request to Python FastAPI...");

        // 3. POST request to the Python backend
        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`HTTP Error! Status: ${response.status}`);
        }

        // 4. Parse JSON results from YOLO
        const data = await response.json();
        console.log("[SUCCESS] Analysis Complete:", data);

        setStatus("Analysis successful! Generating results...");

        // 5. Navigate to results page with prediction data
        setTimeout(() => {
          navigate('/results', { 
            state: { 
              imageData, 
              burnType: data.result, 
              confidence: data.confidence 
            } 
          });
        }, 1000);

      } catch (error) {
        console.error("[FETCH ERROR]:", error);
        setStatus("Connection Failed: Server is unreachable");
        
        // Alert the user and go back
        alert("Failed to connect to the AI server. Please ensure 'main.py' is running on port 8000.");
        navigate('/analyze');
      }
    };

    processImageAndPredict();
  }, [imageData, navigate]);

  return (
    <div style={containerStyle}>
      <h2 style={{ color: '#ef4444', marginBottom: '20px' }}>{status}</h2>
      <div className="loader"></div>
      
      <style>{`
        .loader {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #ef4444;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Simple Layout Styles
const containerStyle: React.CSSProperties = {
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'center', 
  justifyContent: 'center', 
  height: '100vh', 
  backgroundColor: '#fff',
  fontFamily: 'Arial, sans-serif'
};