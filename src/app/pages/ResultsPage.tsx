import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Retrieve the real-time data passed from AnalyzingPage
  const { imageData, burnType, confidence } = location.state || {};

  // Debugging: Log received data to ensure it's coming from the backend (not mock)
  useEffect(() => {
    console.log("[DEBUG] AI Analysis Result:", { burnType, confidence });
  }, [burnType, confidence]);

  // Map first aid instructions based on the model's output
  const firstAidData: Record<string, string> = {
    "first_degree": "Run cool water over the burn for 10-15 minutes. Apply aloe vera gel and do not use butter or ointments.",
    "second_degree": "Do not pop blisters. Cover loosely with a sterile bandage and seek medical attention if it covers a large area.",
    "third_degree": "Call emergency services immediately. Protect the burn area with a cool, moist, sterile bandage. Do not remove clothes stuck to the burn."
  };

  // Redirect to upload page if no image data is found
  if (!imageData) {
    useEffect(() => { navigate('/analyze'); }, [navigate]);
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-2xl my-10 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-center text-red-600 mb-8 uppercase tracking-wider">
        Analysis Results
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Section: Display the uploaded/processed image */}
        <div className="relative rounded-xl overflow-hidden border-4 border-gray-100 shadow-md h-64 md:h-auto">
          <img src={imageData} alt="Analyzed Burn" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 bg-black/60 text-white text-center w-full py-2 text-xs font-bold">
            PROCESSED IMAGE
          </div>
        </div>

        {/* Right Section: Display real-time AI results */}
        <div className="flex flex-col justify-center space-y-6">
          
          {/* Classification Result Box */}
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <h3 className="text-blue-800 text-sm font-bold uppercase mb-1">AI Classification:</h3>
            <p className="text-2xl font-black text-gray-800 italic">
              {/* Format burnType string (e.g., first_degree -> FIRST DEGREE) */}
              {burnType ? burnType.replace('_', ' ').toUpperCase() : "ANALYZING..."}
            </p>
            {confidence !== undefined ? (
              <p className="text-green-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle size={16} /> Confidence: {(confidence * 100).toFixed(1)}%
              </p>
            ) : (
              <p className="text-gray-500 text-sm">Waiting for AI response...</p>
            )}
          </div>

          {/* First Aid Guidance Box */}
          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 shadow-sm">
            <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
              <AlertCircle size={18} /> First Aid Guidance:
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              {burnType && firstAidData[burnType] 
                ? firstAidData[burnType] 
                : "No specific guidance found. Please consult a doctor immediately."}
            </p>
          </div>

          {/* Action Button: Start a new analysis */}
          <div className="pt-4">
            <button 
              onClick={() => navigate('/analyze')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} /> NEW ANALYSIS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}