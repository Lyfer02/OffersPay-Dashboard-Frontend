import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from '@material-tailwind/react';
import { 
  Edit, 
  ExternalLink, 
  Calendar, 
  DollarSign, 
  Package, 
  Camera,
  ArrowLeft,
  Share2,
  Percent,
  Link2,
  Copy
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../auth/authContext';
import { productService } from '@/api/services/product.service';
import Loader from '@/utils/Loader';
import { trackingService } from '@/api/services/tracking.service';
import { toast } from 'react-toastify';
import { postbackService } from '@/api/services/postback.service';

export const ProductDetails = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { id } = useParams();
  const { canEdit ,user} = useAuth();
  
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [generatedPostbackUrl, setGeneratedPostbackUrl] = useState('');
  const [isGeneratingPostback, setIsGeneratingPostback] = useState(false);
  const [postbackType ,setPostbackType] = useState('global')

  // Safe array check helper
  const safeArray = (arr) => {
    return Array.isArray(arr) ? arr : [];
  };

  // Safe number check helper
  const safeNumber = (num, fallback = 0) => {
    return typeof num === 'number' && !isNaN(num) ? num : fallback;
  };

  const fetchData = async () => {
    const Details = await productService.getById(id);
    setTimeout(() => {
      setProductData(Details.data?.data);
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEdit = () => {
    navigate(`/dashboard/products/edit-product/${id}`);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(safeNumber(price));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleGenerateLink = async () => {
    try {
      setIsGeneratingLink(true);
      const response = await trackingService.generateLink({offerId :id, userID :user._id});
      
      if (response.data?.success) {
        setGeneratedLink(response.data.data.tracking_url);
        toast.success("Tracking link generated successfully");
      }
    } catch (error) {
      console.error('Error generating link:', error);
      toast.error("Failed to generate tracking link");
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const handleCopyLink = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      toast.success("Link Copied Successfully");
    }
  };

  const handleGeneratePostback = async () => {
    if (!selectedGoal) {
      toast.error("Please select a goal first");
      return;
    }

    try {
      setIsGeneratingPostback(true);
      const response = await postbackService.generate({
        click_id: "click_id",
        product_id: id,
        goal_id: selectedGoal,
        postbackType:postbackType
      });
      
      if (response.data?.success) {
        setGeneratedPostbackUrl(response.data.data.url);
        toast.success("Postback URL generated successfully");
      }
    } catch (error) {
      console.error('Error generating postback URL:', error);
      toast.error("Failed to generate postback URL");
    } finally {
      setIsGeneratingPostback(false);
    }
  };

  const handleCopyPostback = () => {
    if (generatedPostbackUrl) {
      navigator.clipboard.writeText(generatedPostbackUrl);
      toast.success("Postback URL Copied Successfully");
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith("http")) {
      return imagePath;
    }
    return `${apiUrl}/${imagePath.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`;
  };

  if (loading) {
    return <Loader />;
  }

  if (!productData) {
    return (
      <div className="mt-12 mb-8 flex justify-center items-center min-h-[400px]">
        <Typography variant="h6" color="red">Product not found</Typography>
      </div>
    );
  }

  const tabsData = [
    { label: "Overview", value: "overview", icon: Package },
    { label: "Images", value: "images", icon: Camera },
    { label: "Assigned Goals", value: "goals", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-6">
      {/* Header Card */}
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Button
                variant="outlined"
                color="white"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </Button>
            </div>
            <div className="flex gap-2">
              <Button variant="outlined" color="white" size="sm" className="flex items-center gap-2">
                <Share2 size={16} /> Share
              </Button>
              {canEdit && (
                <Button
                  variant="outlined"
                  color="white"
                  size="sm"
                  onClick={handleEdit}
                  className="flex items-center gap-2"
                >
                  <Edit size={16} /> Edit Product
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody>
           {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography className="text-gray-600 text-sm">Selling Price</Typography>
                <Typography variant="h6" className="font-bold text-green-700">
                  {formatPrice(productData.sellingPrice)}
                </Typography>
              </div>
              <div className="bg-green-100 p-2 rounded-full">
                <DollarSign className="text-green-500" size={20} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography className="text-gray-600 text-sm">Starting Price</Typography>
                <Typography variant="h6" className="font-bold text-blue-700">
                  {formatPrice(productData.startingPrice)}
                </Typography>
              </div>
              <div className="bg-blue-100 p-2 rounded-full">
                <DollarSign className="text-blue-500" size={20} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography className="text-gray-600 text-sm">Stock Status</Typography>
                <Chip
                  variant="gradient"
                  color={productData.inStock ? "green" : "red"}
                  value={productData.inStock ? "In Stock" : "Out of Stock"}
                  className="text-xs font-medium w-fit mt-1"
                />
              </div>
              <div className="bg-amber-100 p-2 rounded-full">
                <Package className="text-amber-500" size={20} />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-100">
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <Typography className="text-gray-600 text-sm">Discount</Typography>
                <Typography variant="h6" className="font-bold text-purple-700">
                  {safeNumber(productData.discountPercentage)}%
                </Typography>
              </div>
              <div className="bg-purple-100 p-2 rounded-full">
                <Percent className="text-purple-500" size={20} />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
        </CardBody>
      </Card>

     

      {/* Main Content */}
      <Card>
        <CardBody className="p-6">
          <Tabs value={activeTab} onChange={(val) => setActiveTab(String(val))}>
            <TabsHeader className="rounded-none border-b border-blue-gray-50 bg-transparent p-0">
              {tabsData.map(({ label, value, icon: Icon }) => (
                <Tab
                  key={value}
                  value={value}
                  onClick={() => setActiveTab(value)}
                  className={activeTab === value ? "text-blue-500" : ""}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} />
                    {label}
                  </div>
                </Tab>
              ))}
            </TabsHeader>
            <TabsBody>
              {/* Overview Tab */}
              <TabPanel key="overview" value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
                  {/* Basic Information */}
                  <Card className="border border-gray-200 mb-4">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
                      <Typography variant="h6" className="flex items-center gap-2 text-blue-800">
                        <Package size={20} /> Basic Information
                      </Typography>
                    </CardHeader>
                    <CardBody className="p-4 space-y-4">
                      <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="space-y-3">
                          <div>
                            <Typography className="font-semibold text-blue-800 text-lg">
                             {productData.name}
                            </Typography>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            <Chip 
                              value={`Brand: ${productData.brand?.name || 'unknown'}`} 
                              variant="gradient" 
                              color="blue"
                              size="sm" 
                              className="text-xs"
                            />
                            <Chip 
                              value={`Category: ${productData.category?.name || 'Uncategorized'}`} 
                              variant="gradient" 
                              color="indigo"
                              size="sm" 
                              className="text-xs"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <Typography className="font-medium text-gray-700">Upcoming:</Typography>
                        <Chip 
                          value={productData.isUpcoming ? "Yes" : "No"}
                          color={productData.isUpcoming ? "amber" : "green"}
                          variant="outlined" 
                          size="sm" 
                        />
                      </div>
                      <div className="flex justify-between">
                        <Typography className="font-medium text-gray-700">Status:</Typography>
                        <Chip 
                          value={productData.status}
                          color={productData.status === 'active' ? "green" :productData.status === 'draft' ? 'yellow': "red"}
                          variant="gradient" 
                          size="sm" 
                          className="capitalize"
                        />
                      </div>
                    </CardBody>
                  </Card>

                  {/* Pricing & Dates */}
                  <Card className="border border-gray-200 mb-4">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 p-4">
                      <Typography variant="h6" className="flex items-center gap-2 text-green-800">
                        <Calendar size={20} /> Pricing & Timeline
                      </Typography>
                    </CardHeader>
                    <CardBody className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <Typography className="font-medium text-gray-700">Starting Price:</Typography>
                        <Typography className="text-gray-900 font-semibold">
                          {formatPrice(productData.startingPrice)}
                        </Typography>
                      </div>
                      <div className="flex justify-between">
                        <Typography className="font-medium text-gray-700">Selling Price:</Typography>
                        <Typography className="text-green-600 font-semibold">
                          {formatPrice(productData.sellingPrice)}
                        </Typography>
                      </div>
                      <div className="flex justify-between">
                        <Typography className="font-medium text-gray-700">Earning Rate:</Typography>
                        <Typography className="text-gray-900">
                          {productData.earningRate}%
                        </Typography>
                      </div>
                      <div className="flex justify-between">
                        <Typography className="font-medium text-gray-700">Expiry Date:</Typography>
                        <Typography className="text-gray-900">
                          {formatDate(productData.expiryDate )}
                        </Typography>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Description & Links */}
                  <Card className="border border-gray-200 lg:col-span-2 mb-4">
                    <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 p-4">
                      <Typography variant="h6" className="text-purple-800">Description & Links</Typography>
                    </CardHeader>
                    <CardBody className="p-4 space-y-4">
                      <div>
                        <Typography className="font-medium text-gray-700 mb-2">Description:</Typography>
                        <Typography className="text-gray-900 bg-gray-50 p-3 rounded">
                          {productData.description}
                        </Typography>
                      </div>
                      <div>
                        <Typography className="font-medium text-gray-700 mb-2">Deals Details:</Typography>
                        <Typography className="text-gray-900 bg-gray-50 p-3 rounded">
                          {productData.dealsDetails}
                        </Typography>
                      </div>
                      <div className=" gap-4">
                        <div className='mb-2'>
                          <Typography className="font-medium text-gray-700 mb-2">Product URL:</Typography>
                          <a 
                            href={productData.productUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                          >
                            {productData.productUrl}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                        <div>
                          <Typography className="font-medium text-gray-700 mb-2">Tracking URL:</Typography>
                          <a 
                            href={productData.trackingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
                          >
                            {productData.trackingUrl}
                            <ExternalLink size={14} />
                          </a>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Offers */}
                  {safeArray(productData.availableOffers).length > 0 && (
                    <Card className="border border-gray-200 lg:col-span-2 mb-4">
                      <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4">
                        <Typography variant="h6" className="text-amber-800">Available Offers</Typography>
                      </CardHeader>
                      <CardBody className="p-4">
                        <div className="bg-green-50 border border-green-200 rounded p-3">
                          {safeArray(productData.availableOffers).map((offer, index) => (
                            <Typography key={index} className="text-green-800">
                              • {offer}
                            </Typography>
                          ))}
                        </div>
                      </CardBody>
                    </Card>
                  )}

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:col-span-2">
                     {/* Generate Link Section */}
                  <Card className="border border-gray-200 mb-4">
                    <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4">
                      <Typography variant="h6" className="flex items-center gap-2 text-cyan-800">
                        <Link2 size={20} /> Generate Tracking Link
                      </Typography>
                    </CardHeader>
                    <CardBody className="p-4 space-y-4">
                      <div className="flex gap-3">
                        <Button
                          onClick={handleGenerateLink}
                          disabled={isGeneratingLink}
                          className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                          size="sm"
                        >
                          {isGeneratingLink ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Link2 size={16} />
                              Generate Link
                            </>
                          )}
                        </Button>
                      </div>
                      
                      {generatedLink && (
                        <div className="space-y-2">
                          <Typography className="font-medium text-gray-700">Generated Link:</Typography>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3 font-mono text-sm break-all">
                              {generatedLink}
                            </div>
                            <Button
                              onClick={handleCopyLink}
                              variant="outlined"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Copy size={16} />
                              Copy
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                  {/* Generate Postback URL Section */}
                  <Card className="border border-gray-200  mb-4">
                    <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                      <Typography variant="h6" className="flex items-center gap-2 text-indigo-800">
                        <Link2 size={20} /> Generate Postback URL
                      </Typography>
                    </CardHeader>
                    <CardBody className="p-4 space-y-4">

                       {/* Select Postback Type */}
    <div>
      <Typography className="font-medium text-gray-700 mb-2">
        Select Postback Type:
      </Typography>
      <select
        value={postbackType}
        onChange={(e) => setPostbackType(e.target.value)}
        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
      >
        <option value="global">Global</option>
        <option value="offer">Offer Specific</option>
      </select>
    </div>


                      {safeArray(productData.goals).length > 0 ? (
                        <>
                          <div>
                            <Typography className="font-medium text-gray-700 mb-2">
                              Select Goal:
                            </Typography>
                            <select
                              value={selectedGoal}
                              onChange={(e) => setSelectedGoal(e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            >
                              <option value="">-- Select a Goal --</option>
                              {safeArray(productData.goals).map((goal, index) => (
                                <option key={goal.goalId || index} value={goal.goalId}>
                                  {goal.name || `Goal #${index + 1}`} - {goal.currency} {safeNumber(goal.payout)}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={handleGeneratePostback}
                              disabled={isGeneratingPostback || !selectedGoal}
                              className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400"
                              size="sm"
                            >
                              {isGeneratingPostback ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <Link2 size={16} />
                                  Generate Postback URL
                                </>
                              )}
                            </Button>
                          </div>

                          {generatedPostbackUrl && (
                            <div className="space-y-2">
                              <Typography className="font-medium text-gray-700">Generated Postback URL:</Typography>
                              <div className="flex gap-2">
                                <div className="flex-1 bg-gray-50 border border-gray-300 rounded-lg p-3 font-mono text-sm break-all">
                                  {generatedPostbackUrl}
                                </div>
                                <Button
                                  onClick={handleCopyPostback}
                                  variant="outlined"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Copy size={16} />
                                  Copy
                                </Button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border border-gray-200">
                          <Typography className="text-gray-600">
                            No goals assigned to this product. Please assign goals first to generate postback URLs.
                          </Typography>
                        </div>
                      )}
                    </CardBody>
                  </Card>

                 </div>

                 
                </div>
              </TabPanel>

              {/* Images Tab */}
              <TabPanel key="images" value="images">
                <div className="mt-4">
                  <Typography variant="h6" className="mb-4">Product Images</Typography>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {safeArray(productData.sliderImages).map((image, index) => (
                      <Card key={index} className="border border-gray-200 mb-4">
                        <CardBody className="p-4">
                          <img 
                            src={getImageUrl(image)}
                            alt={`${productData.name} - Image ${index + 1}`}
                            className="w-full h-64 object-cover rounded-lg"
                          />
                          <Typography variant="small" className="text-gray-600 mt-2 text-center">
                            Image {index + 1}
                          </Typography>
                        </CardBody>
                      </Card>
                    ))}
                    <Card className="border border-gray-200 mb-4">
                      <CardBody className="p-4">
                        <img 
                          src={getImageUrl(productData.logo)} 
                          alt={`${productData.name} - Logo`}
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Typography variant="small" className="text-gray-600 mt-2 text-center">
                          Product Logo
                        </Typography>
                      </CardBody>
                    </Card>
                  </div>
                  {safeArray(productData.sliderImages).length === 0 && !productData.logo && (
                    <div className="text-center py-8">
                      <Typography color="blue-gray" className="font-normal">
                        No images available for this product
                      </Typography>
                    </div>
                  )}
                </div>
              </TabPanel>

              {/* Goals Tab */}
              <TabPanel key="goals" value="goals">
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-6">
                    <Typography variant="h6">Assigned Goals</Typography>
                    {canEdit && (
                      <Button
                        size="sm"
                        className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600"
                        onClick={() => navigate(`/dashboard/products/assign-goals`)}
                      >
                        <DollarSign size={16} />
                        Assign Goals
                      </Button>
                    )}
                  </div>

                  {safeArray(productData.goals).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {safeArray(productData.goals).map((goal, index) => (
                        <Card key={index} className="border border-gray-200">
                          <CardBody className="p-4 space-y-3">
                            <div className="flex justify-between items-center">
                              <Typography className="font-semibold text-gray-800">
                                Goal #{index + 1}
                              </Typography>
                              <Chip
                                value={goal.goalModel}
                                color="blue"
                                variant="gradient"
                                size="sm"
                                className="text-xs"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Typography className="text-sm text-gray-600">Goal Name:</Typography>
                                <Typography className="text-sm font-mono text-gray-800">
                                  {goal.name || 'N/A'}
                                </Typography>
                              </div>
                              
                              <div className="flex justify-between">
                                <Typography className="text-sm text-gray-600">Currency:</Typography>
                                <Typography className="text-sm font-semibold text-gray-800">
                                  {goal.currency || 'N/A'}
                                </Typography>
                              </div>
                              
                              <div className="flex justify-between">
                                <Typography className="text-sm text-gray-600">Revenue:</Typography>
                                <Typography className="text-sm font-semibold text-green-600">
                                  {goal.currency} {safeNumber(goal.revenue)}
                                </Typography>
                              </div>
                              
                              <div className="flex justify-between">
                                <Typography className="text-sm text-gray-600">Payout:</Typography>
                                <Typography className="text-sm font-semibold text-blue-600">
                                  {goal.currency} {safeNumber(goal.payout)}
                                </Typography>
                              </div>
                              
                              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                                <div className="flex gap-2">
                                  <Chip
                                    value={goal.isBillable ? "Billable" : "Not Billable"}
                                    color={goal.isBillable ? "green" : "gray"}
                                    variant="outlined"
                                    size="sm"
                                    className="text-xs"
                                  />
                                  {goal.isHold && (
                                    <Chip
                                      value="On Hold"
                                      color="red"
                                      variant="outlined"
                                      size="sm"
                                      className="text-xs"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </CardBody>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border border-gray-200">
                      <CardBody className="p-8">
                        <div className="text-center space-y-4">
                          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <DollarSign size={32} className="text-gray-400" />
                          </div>
                          <div>
                            <Typography variant="h6" className="text-gray-800 mb-2">
                              No Goals Assigned Yet
                            </Typography>
                            <Typography className="text-gray-600 text-sm">
                              This product doesn't have any goals assigned. Click the button below to assign goals.
                            </Typography>
                          </div>
                          {canEdit && (
                            <Button
                              size="sm"
                              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 mx-auto"
                              onClick={() => navigate(`/dashboard/products/assign-goals`)}
                            >
                              <DollarSign size={16} />
                              Assign Goals
                            </Button>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  )}
                </div>
              </TabPanel>
            </TabsBody>
          </Tabs>
        </CardBody>
      </Card>
    </div>
  );
};

export default ProductDetails;