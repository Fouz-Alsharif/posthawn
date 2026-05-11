import { CheckCircle, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ConfirmImagePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageData = location.state?.imageData;

  if (!imageData) {
    navigate('/analyze');
    return null;
  }

  const handleConfirm = () => {
    navigate('/preprocessing', { state: { imageData } });
  };

  const handleReplace = () => {
    navigate('/analyze');
  };

  return (
    <div className="max-w-md mx-auto">
        <h1 className="text-2xl text-center mb-8">Confirm Image</h1>

        <div className="mb-6 rounded-2xl overflow-hidden bg-black">
          <img
            src={imageData}
            alt="Burn preview"
            className="w-full h-auto object-contain max-h-96"
          />
        </div>

        <div className="space-y-4">
          <button
            onClick={handleConfirm}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <CheckCircle className="w-5 h-5" />
            Confirm & Analyze
          </button>

          <button
            onClick={handleReplace}
            className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors flex items-center justify-center gap-3"
          >
            <X className="w-5 h-5" />
            Replace Image
          </button>
        </div>
      </div>
  );
}
