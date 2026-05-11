import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export default function PreprocessingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const imageData = location.state?.imageData;

  useEffect(() => {
    if (!imageData) {
      navigate('/analyze');
      return;
    }

    const timer = setTimeout(() => {
      navigate('/analyzing', { state: { imageData } });
    }, 800);

    return () => clearTimeout(timer);
  }, [imageData, navigate]);

  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[50vh]">
      <div className="w-16 h-16 mb-6">
        <svg className="animate-spin" viewBox="0 0 50 50">
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="4"
            strokeDasharray="80, 120"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <h2 className="text-xl mb-3">Preprocessing Image</h2>
      <p className="text-gray-600 text-center text-sm">
        Resizing, normalizing, and isolating burn region...
      </p>
    </div>
  );
}
