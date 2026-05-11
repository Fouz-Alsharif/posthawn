export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl text-center mb-8">About Us</h1>

      <div className="bg-white rounded-lg p-6 md:p-8 shadow-sm border border-gray-200">
        <p className="text-gray-700 text-sm mb-4">
          HAWN is an AI-powered burn assessment system developed as a graduation project by our team members:
        </p>
        <ul className="list-disc list-inside text-gray-700 text-sm mb-4 space-y-1">
          <li>Maria Alamri</li>
          <li>Fouz Alsharif</li>
          <li>Lama Aloufi</li>
          <li>Judy Alomiri</li>
        </ul>
        <p className="text-gray-700 text-sm mb-4">
          The system is designed to provide preliminary burn assessment and educational first aid guidance using artificial intelligence technologies.
        </p>
        <p className="text-gray-700 text-sm">
          HAWN is intended for informational and educational purposes only and does not replace professional medical diagnosis, consultation, or treatment. Users are encouraged to seek medical attention from qualified healthcare professionals for accurate evaluation and proper care.
        </p>
      </div>
    </div>
  );
}
