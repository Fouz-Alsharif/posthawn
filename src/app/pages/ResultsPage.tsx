import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { mapPredictedClassToBurnDegree } from '@/lib/predictionApi';

function formatBurnTitle(burnType: string): string {
  const withSpaces = burnType.replaceAll('_', ' ');
  if (withSpaces.toLowerCase().endsWith(' degree')) {
    return withSpaces.toUpperCase();
  }
  if (!withSpaces.toLowerCase().includes('degree')) {
    return `${withSpaces.toUpperCase()} DEGREE`;
  }
  return withSpaces.toUpperCase();
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const { imageData, burnType, confidence, predictedClass } =
    (location.state || {}) as {
      imageData?: string;
      burnType?: string;
      confidence?: number;
      predictedClass?: string;
    };

  useEffect(() => {
    if (!imageData) {
      navigate('/analyze', { replace: true });
    }
  }, [imageData, navigate]);

  const firstAidData: Record<string, string> = {
    first_degree:
      'Run cool water over the burn for 10-15 minutes. Apply aloe vera gel and do not use butter or ointments.',
    second_degree:
      'Do not pop blisters. Cover loosely with a sterile bandage and seek medical attention if it covers a large area.',
    third_degree:
      'Call emergency services immediately. Protect the burn area with a cool, moist, sterile bandage. Do not remove clothes stuck to the burn.',
  };

  if (!imageData || !burnType) {
    return null;
  }

  const aidKey =
    mapPredictedClassToBurnDegree(burnType) ??
    mapPredictedClassToBurnDegree(predictedClass || '') ??
    burnType;
  const firstAidText =
    firstAidData[aidKey] ||
    firstAidData[burnType] ||
    'No specific guidance found. Please consult a doctor immediately.';

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-2xl rounded-2xl my-10 border border-gray-100">
      <h1 className="text-3xl font-extrabold text-center text-red-600 mb-8 uppercase tracking-wider">
        Analysis Results
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative rounded-xl overflow-hidden border-4 border-gray-100 shadow-md h-64 md:h-auto">
          <img
            src={imageData}
            alt="Analyzed burn"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 bg-black/60 text-white text-center w-full py-2 text-xs font-bold">
            PROCESSED IMAGE
          </div>
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500 shadow-sm">
            <h3 className="text-blue-800 text-sm font-bold uppercase mb-1">
              AI classification
            </h3>
            <p className="text-2xl font-black text-gray-800 italic">
              {formatBurnTitle(burnType)}
            </p>
            {confidence !== undefined ? (
              <p className="text-green-600 font-semibold mt-1 flex items-center gap-1">
                <CheckCircle size={16} /> Confidence:{' '}
                {(confidence * 100).toFixed(2)}%
              </p>
            ) : (
              <p className="text-gray-500 text-sm">Confidence not available.</p>
            )}
          </div>

          <div className="p-4 bg-amber-50 rounded-lg border-l-4 border-amber-500 shadow-sm">
            <h3 className="text-amber-800 font-bold flex items-center gap-2 mb-2">
              <AlertCircle size={18} /> First aid guidance
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{firstAidText}</p>
          </div>

          <div className="pt-4">
            <button
              type="button"
              onClick={() => navigate('/analyze')}
              className="w-full bg-red-600 hover:bg-red-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={20} /> New analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
