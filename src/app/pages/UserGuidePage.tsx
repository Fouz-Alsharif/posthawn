import { Camera, Scan, CheckCircle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function UserGuidePage() {
  const navigate = useNavigate();

  const steps = [
    {
      icon: Camera,
      title: 'Upload or Capture Image',
      description: 'Take a clear photo of the burn area or upload an existing image (JPEG/PNG, max 3 MB).'
    },
    {
      icon: Scan,
      title: 'AI Analysis',
      description: 'Our AI analyzes color patterns, tissue texture, and damage indicators to classify the burn.'
    },
    {
      icon: CheckCircle,
      title: 'Get Results',
      description: 'Receive burn classification with confidence score and severity assessment.'
    },
    {
      icon: Heart,
      title: 'First Aid Guidance',
      description: 'Access immediate first aid recommendations tailored to your burn classification.'
    }
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-2xl mb-3">User Guide</h1>
        <p className="text-gray-600 text-sm">
          Simple steps to get AI-powered burn assessment and first aid guidance
        </p>
      </div>

      <div className="mb-12">
        <h2 className="text-xl text-center mb-8">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-base mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="text-base mb-3 text-blue-900">Medical Disclaimer</h3>
        <p className="text-sm text-blue-900">
          This system provides preliminary guidance only and does not replace professional medical diagnosis or treatment. Always consult a healthcare professional for burn injuries.
        </p>
      </div>

      <div className="text-center">
        <button
          onClick={() => navigate('/analyze')}
          className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Start Analysis
        </button>
      </div>
    </div>
  );
}
