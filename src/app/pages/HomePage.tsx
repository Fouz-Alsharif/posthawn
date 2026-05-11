import { useNavigate } from 'react-router-dom';
import LogoIcon from '../components/LogoIcon';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto text-center">
      <div className="mb-6 flex justify-center">
        <LogoIcon />
      </div>

      <h1 className="text-2xl mb-3">HAWN</h1>

      <h2 className="text-base text-blue-600 mb-4">AI-Powered Burn Classification</h2>

      <p className="text-gray-700 text-sm mb-6 leading-relaxed">
        Get instant preliminary burn assessment using advanced artificial intelligence technology
      </p>

      <button
        onClick={() => navigate('/analyze')}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mb-8"
      >
        Get Started
      </button>

      <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg text-left">
        <h3 className="text-base mb-3">Medical Disclaimer</h3>
        <p className="text-xs text-gray-700 leading-relaxed mb-2">
          This system is intended for preliminary assessment and educational purposes only.
        </p>
        <p className="text-xs text-gray-700 leading-relaxed mb-2">
          It does not replace professional medical diagnosis or treatment.
        </p>
        <p className="text-xs text-gray-700 leading-relaxed">
          No personally identifiable information (PII) or sensitive medical data is collected or stored without proper user consent. Always seek professional medical care for burn injuries.
        </p>
      </div>
    </div>
  );
}
