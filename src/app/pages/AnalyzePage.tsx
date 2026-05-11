import { Camera, Upload } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AnalyzePage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 3 * 1024 * 1024; // 3MB
      if (file.size > maxSize) {
        setError('Image size must be 3 MB or less.');
        return;
      }
      setError('');

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        navigate('/confirm', { state: { imageData } });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const maxSize = 3 * 1024 * 1024;
        if (file.size > maxSize) {
          setError('Image size must be 3 MB or less.');
          return;
        }
        setError('');

        const reader = new FileReader();
        reader.onload = (event) => {
          const imageData = event.target?.result as string;
          navigate('/confirm', { state: { imageData } });
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="max-w-md mx-auto">
        <h1 className="text-2xl text-center mb-8">Burn Image Analysis</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <button
            onClick={handleCapture}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-3"
          >
            <Camera className="w-5 h-5" />
            Capture with Camera
          </button>

          <label className="block">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="w-full bg-white text-gray-700 py-3 px-6 rounded-lg border-2 border-gray-300 hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-center gap-3">
              <Upload className="w-5 h-5" />
              Upload from Gallery
            </div>
          </label>
        </div>

        <div className="text-left">
          <h3 className="text-base mb-3">Requirements:</h3>
          <ul className="text-gray-600 text-sm space-y-1">
            <li>Image format: JPEG or PNG</li>
            <li>Maximum file size: 3 MB</li>
            <li>Clear, well-lit image of the burn area</li>
          </ul>
        </div>
      </div>
  );
}
