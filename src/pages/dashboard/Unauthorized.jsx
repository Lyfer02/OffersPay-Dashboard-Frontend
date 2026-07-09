// src/pages/Unauthorized.jsx
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, Home, Mail } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // You can replace this with your actual support contact method
    window.location.href = 'mailto:support@yourcompany.com';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8">
          <Shield className="w-16 h-16 text-amber-500 mx-auto" />
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Access Restricted
          </h1>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            You don't have permission to access this page. This might be because:
          </p>

          <ul className="text-left text-gray-600 mb-8 space-y-2">
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              You need to log in or your session has expired
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              Your account doesn't have the required permissions
            </li>
            <li className="flex items-start">
              <span className="text-amber-500 mr-2">•</span>
              The page may have been moved or is temporarily unavailable
            </li>
          </ul>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoBack}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </button>
            
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Home
            </button>
            
            <button
              onClick={handleContactSupport}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-gray-500 text-sm mt-6">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default Unauthorized;