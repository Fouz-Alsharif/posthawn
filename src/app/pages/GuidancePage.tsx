import { useNavigate, useLocation } from 'react-router-dom';
import firstAidData from '../data/firstAidGuidance.json';

export default function GuidancePage() {
  const navigate = useNavigate();
  const location = useLocation();

  // ====================================================================
  // MOCK CLASSIFICATION RESULT - Replace this with actual YOLOv11 output
  // ====================================================================
  // When YOLOv11 is connected, replace this line with:
  // const classificationResult = location.state?.classification || 'first_degree';

  const mockClassification = 'second_degree'; // Options: 'first_degree', 'second_degree', 'third_degree'
  const classificationResult = location.state?.classification || mockClassification;

  // ====================================================================

  // Get the guidance data based on classification result
  const guidance = firstAidData[classificationResult as keyof typeof firstAidData];

  if (!guidance) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-2xl mb-4">Error</h1>
        <p className="text-gray-600 mb-6">Unable to load first aid guidance.</p>
        <button
          onClick={() => navigate('/analyze')}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Analysis
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl text-center mb-8">First Aid Guidance</h1>

      <div className="bg-white rounded-lg p-6 mb-6 border border-gray-200">
        <h2 className="text-xl mb-4">{guidance.title}</h2>

        {guidance.description && (
          <p className="text-gray-700 text-sm mb-6 leading-relaxed">
            {guidance.description}
          </p>
        )}

        {/* Do Section */}
        <div className="mb-6">
          <h3 className="text-base mb-4 text-green-700 font-semibold">First Aid Instructions - Do:</h3>
          <div className="space-y-3">
            {guidance.do.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-green-700 text-xs mt-0.5">
                  ✓
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Do Not Section */}
        <div className="mb-4">
          <h3 className="text-base mb-4 text-red-700 font-semibold">Do Not:</h3>
          <div className="space-y-3">
            {guidance.doNot.map((instruction, index) => (
              <div key={index} className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-red-700 text-xs mt-0.5">
                  ✗
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">{instruction}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medical Attention Notice for severe burns */}
        {(classificationResult === 'second_degree' || classificationResult === 'third_degree') && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-base text-red-900 mb-2 font-semibold">⚠️ Seek Medical Attention</h3>
            <p className="text-red-900 text-sm">
              {classificationResult === 'third_degree'
                ? 'Call emergency medical services immediately. Third-degree burns require urgent professional medical treatment.'
                : 'Seek immediate medical attention. Second-degree burns require professional evaluation and treatment.'}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate('/analyze')}
        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors mb-6"
      >
        Analyze Another Image
      </button>

      <div className="p-4 bg-gray-100 border border-gray-300 rounded-lg">
        <h4 className="text-base mb-2">Medical Disclaimer:</h4>
        <p className="text-sm text-gray-700">
          This system provides preliminary guidance only and does not replace professional medical diagnosis or treatment. No PII or sensitive data is collected without consent. Always seek professional medical care for burn injuries.
        </p>
      </div>
    </div>
  );
}
