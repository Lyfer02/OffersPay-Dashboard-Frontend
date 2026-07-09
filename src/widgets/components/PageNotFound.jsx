import { Card, CardBody, Typography, Button } from "@material-tailwind/react";
import { ExclamationTriangleIcon, HomeIcon, ArrowLeftIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";

const PageNotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/dashboard/home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleSearch = () => {
    navigate('/dashboard/search');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="w-full max-w-lg shadow-md">
        <CardBody className="text-center p-8">
          {/* Icon Container with animation */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <ExclamationTriangleIcon className="w-12 h-12 text-red-500" />
            </div>
            
            {/* Animated background circle */}
            <div className="absolute inset-0 w-24 h-24 bg-red-100 rounded-full animate-ping opacity-30 mx-auto"></div>
          </div>
          
          {/* Error Code */}
          <Typography variant="h1" className="text-7xl font-bold text-blue-gray-800 mb-2">
            404
          </Typography>
          
          {/* Main Heading */}
          <Typography variant="h3" className="text-blue-gray-700 mb-4 font-semibold">
            Oops! Page Not Found
          </Typography>
          
          {/* Descriptive Text */}
          <Typography className="text-blue-gray-600 mb-8 text-lg leading-relaxed">
            The page you're looking for doesn't exist, may have been moved, or is temporarily unavailable.
          </Typography>
          
          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 py-3"
              color="blue"
              size="lg"
            >
              <HomeIcon className="w-5 h-5" />
              Go to Dashboard
            </Button>
            
            <div className="flex gap-3">
              <Button
                onClick={handleGoBack}
                variant="outlined"
                className="flex-1 flex items-center justify-center gap-2 py-3"
                color="blue-gray"
                size="lg"
              >
                <ArrowLeftIcon className="w-5 h-5" />
                Go Back
              </Button>
              
              {/* <Button
                onClick={handleSearch}
                variant="outlined"
                className="flex-1 flex items-center justify-center gap-2 py-3"
                color="blue"
                size="lg"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                Search
              </Button> */}
            </div>
          </div>
          
          {/* Help Text */}
          <Typography variant="small" className="text-blue-gray-500 mt-6">
            If you believe this is an error, please contact support or try refreshing the page.
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
};

export default PageNotFound;