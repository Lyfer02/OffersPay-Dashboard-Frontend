import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
} from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Calendar,
  Globe,
  Key,
  Shield,
  Server,
  DollarSign,
  Clock,
  CheckCircle,
  Settings,
  Network as NetworkIcon,
  ShoppingBagIcon,
} from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";
import { networkService } from "@/api/services/network.service";
// import { networkService } from "@/api/services/networks.service";

const NetworkDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEdit } = useAuth();

  const [networkData, setNetworkData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchNetwork = async () => {
    setLoading(true);
    try {
      // Uncomment when service is available
      const res = await networkService.getById(id);
    //  console.log("this is  res",res);
      
      setNetworkData(res.data?.data);

      // Mock data for now
    //   setTimeout(() => {
    //     setNetworkData({
    //       _id: "64f7e8a9b1234567890abcde",
    //       name: "Commission Junction",
    //       shortname: "CJ",
    //       namespace: "cj",
    //       affiliateId: "CJ_AFF_123456",
    //       websiteId: "WEB_789012",
    //       confirmDays: 90,
    //       confirmDuration: "+90 days",
    //       enabled: true,
    //       currency: "USD",
    //       networkPlatform: "Commission Junction",
    //       networkUniqueKey: "CJ_UNIQUE_KEY_2024",
    //       apiBaseUrl: "https://api.cj.com/v1",
    //       authType: "apiKey",
    //       apiKey: "api_key_hidden",
    //       apiSecret: "secret_hidden",
    //       authToken: "",
    //       refreshToken: "",
    //       status: "active",
    //       credentials: {
    //         "tracking_domain": "cj.com",
    //         "reporting_key": "rep_key_123",
    //         "custom_param": "custom_value"
    //       },
    //       createdAt: "2024-01-15T10:30:00.000Z",
    //       updatedAt: "2024-03-10T14:45:00.000Z",
    //     });
    //     setLoading(false);
    //   }, 1000);
    } catch (error) {
      console.error("Error fetching network details:", error);
      setLoading(false);
    }
    finally{
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchNetwork();
  }, [id]);

  const handleBack = () => navigate(-1);

  const handleEditNetwork = (network, event) => {
    event.stopPropagation();
    navigate(`/dashboard/network/edit/${network._id}`);
  };

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "N/A";

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green";
      case "draft":
        return "yellow";
      case "inactive":
        return "red";
      default:
        return "gray";
    }
  };

  const getAuthTypeIcon = (authType) => {
    switch (authType) {
      case "apiKey":
        return <Key size={16} className="text-blue-600" />;
      case "bearerToken":
        return <Shield size={16} className="text-green-600" />;
      case "basicAuth":
        return <Shield size={16} className="text-orange-600" />;
      case "oauth2":
        return <Shield size={16} className="text-purple-600" />;
      default:
        return <Settings size={16} className="text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Typography variant="h6" color="blue-gray">
          Loading network details...
        </Typography>
      </div>
    );
  }

  if (!networkData) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Typography variant="h6" color="red">
          Network not found
        </Typography>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-4 md:p-6 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Main Header Card */}
        <Card className="mb-8">
          <CardHeader className="p-4" color="blue">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <Button
                variant="text"
                size="sm"
                color="white"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft color="white" size={18} /> Back
              </Button>
              <Typography variant="h5" md:variant="h4" color="white" className="font-semibold">
                Network Details
              </Typography>
              <div className="flex gap-3">
                {canEdit && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={(e) => handleEditNetwork(networkData, e)}
                    color="white"
                    className="flex items-center gap-2"
                  >
                    <Edit size={16} /> <span className="hidden xs:inline">Edit</span>
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-4 md:p-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Network Icon/Logo Section */}
              <div className="flex-shrink-0 w-full lg:w-auto">
                <div className="relative mx-auto lg:mx-0 w-full max-w-sm lg:max-w-none lg:w-48">
                  <div className="w-full lg:w-48 h-40 lg:h-32 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <ShoppingBagIcon size={48} className="text-blue-600" />
                  </div>
                  <div className="absolute top-2 left-2">
                    <Chip
                      size="sm"
                      value="Network"
                      className="bg-blue-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                  <div className="min-w-0 flex-1">
                    <Typography variant="h5" lg:variant="h4" color="blue-gray" className="mb-2 capitalize break-words">
                      {networkData.name}
                    </Typography>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Chip
                        size="sm"
                        value={networkData.status}
                        color={getStatusColor(networkData.status)}
                        className="capitalize"
                      />
                      {/* <Chip
                        size="sm"
                        value={networkData.enabled ? "Enabled" : "Disabled"}
                        color={networkData.enabled ? "green" : "gray"}
                      /> */}
                      <Chip
                        size="sm"
                        value={networkData.currency}
                        color="blue"
                      />
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-green-600" />
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        Currency
                      </Typography>
                      <Typography variant="small" className="font-semibold text-gray-900">
                        {networkData.currency}
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-blue-600" />
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        Confirmation Days
                      </Typography>
                      <Typography variant="small" className="font-semibold text-gray-900">
                        {networkData.confirmDays} days
                      </Typography>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getAuthTypeIcon(networkData.authType)}
                    <div>
                      <Typography variant="small" className="text-gray-600">
                        Auth Type
                      </Typography>
                      <Typography variant="small" className="font-semibold text-gray-900 capitalize">
                        {networkData.authType}
                      </Typography>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-1">
                      Created At
                    </Typography>
                    <div className="flex items-center gap-1 text-gray-700">
                      <Calendar size={14} className="flex-shrink-0" />
                      <Typography variant="small" className="break-words">
                        {formatDate(networkData.createdAt)}
                      </Typography>
                    </div>
                  </div>
                  <div>
                    <Typography variant="small" className="text-gray-600 mb-1">
                      Updated At
                    </Typography>
                    <div className="flex items-center gap-1 text-gray-700">
                      <Calendar size={14} className="flex-shrink-0" />
                      <Typography variant="small" className="break-words">
                        {formatDate(networkData.updatedAt)}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Network Configuration */}
        <Card className="mb-8">
          <CardHeader variant="gradient" color="green" className="mb-4 p-4">
            <Typography variant="h6" color="white">
              Network Configuration
            </Typography>
          </CardHeader>
          <CardBody className="pt-0 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Short Name
                  </Typography>
                  <Typography variant="small" className="text-gray-900">
                    {networkData.shortname || "Not set"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Namespace
                  </Typography>
                  <Typography variant="small" className="text-gray-900">
                    {networkData.namespace || "Not set"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Network Platform
                  </Typography>
                  <Typography variant="small" className="text-gray-900">
                    {networkData.networkPlatform || "Not specified"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Confirmation Duration
                  </Typography>
                  <Typography variant="small" className="text-gray-900">
                    {networkData.confirmDuration}
                  </Typography>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Affiliate ID
                  </Typography>
                  <Typography variant="small" className="text-gray-900 break-all">
                    {networkData.affiliateId || "Not set"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Website ID
                  </Typography>
                  <Typography variant="small" className="text-gray-900 break-all">
                    {networkData.websiteId || "Not set"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Network Unique Key
                  </Typography>
                  <Typography variant="small" className="text-gray-900 break-all">
                    {networkData.networkUniqueKey || "Not set"}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Network Status
                  </Typography>
                  <Typography variant="small" className="text-gray-900">
                    This network is currently {networkData.status} and {networkData.enabled ? "enabled" : "disabled"}.
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* API Integration Details */}
        {networkData.apiBaseUrl && (
          <Card className="mb-6">
            <CardHeader variant="gradient" color="orange" className="mb-4 p-4">
              <Typography variant="h6" color="white">
                API Integration
              </Typography>
            </CardHeader>
            <CardBody className="pt-0 p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Typography variant="small" className="text-gray-600 font-semibold">
                      API Base URL
                    </Typography>
                    <Typography variant="small" className="text-gray-900 break-all">
                      {networkData.apiBaseUrl}
                    </Typography>
                  </div>
                  <div>
                    <Typography variant="small" className="text-gray-600 font-semibold">
                      Authentication Type
                    </Typography>
                    <div className="flex items-center gap-2">
                      {getAuthTypeIcon(networkData.authType)}
                      <Typography variant="small" className="text-gray-900 capitalize">
                        {networkData.authType}
                      </Typography>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {networkData.apiKey && (
                    <div>
                      <Typography variant="small" className="text-gray-600 font-semibold">
                        API Key
                      </Typography>
                      <Typography variant="small" className="text-gray-900">
                        •••••••••••••••••••••••••
                      </Typography>
                    </div>
                  )}
                  {networkData.authToken && (
                    <div>
                      <Typography variant="small" className="text-gray-600 font-semibold">
                        Auth Token
                      </Typography>
                      <Typography variant="small" className="text-gray-900">
                        •••••••••••••••••••••••••
                      </Typography>
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Additional Credentials */}
        {networkData.credentials && Object.keys(networkData.credentials).length > 0 && (
          <Card className="mb-8">
            <CardHeader variant="gradient" color="purple" className="mb-4 p-4">
              <Typography variant="h6" color="white">
                Additional Credentials
              </Typography>
            </CardHeader>
            <CardBody className="pt-0 p-4 md:p-6">
              <div className="space-y-3">
                {Object.entries(networkData.credentials).map(([key, value], index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <Typography variant="small" className="text-gray-700 font-medium">
                      {key}
                    </Typography>
                    <Typography variant="small" className="text-gray-900 break-all">
                      {value}
                    </Typography>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        {/* Technical Information */}
        <Card className="mt-6 mb-4">
          <CardHeader variant="gradient" color="blue" className="mb-4 p-4">
            <Typography variant="h6" color="white">
              Network Information
            </Typography>
          </CardHeader>
          <CardBody className="pt-0 p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              <div className="space-y-4">
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Network ID
                  </Typography>
                  <Typography variant="small" className="text-gray-900 break-all">
                    {networkData._id}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Enabled Status
                  </Typography>
                  <Typography variant="small" className="text-gray-900">
                    {networkData.enabled ? "Enabled" : "Disabled"}
                  </Typography>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Created Date (Full)
                  </Typography>
                  <Typography variant="small" className="text-gray-900 break-words">
                    {new Date(networkData.createdAt).toLocaleString()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="small" className="text-gray-600 font-semibold">
                    Updated Date (Full)
                  </Typography>
                  <Typography variant="small" className="text-gray-900 break-words">
                    {new Date(networkData.updatedAt).toLocaleString()}
                  </Typography>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default NetworkDetails;