import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
  Spinner,
  Alert,
} from '@material-tailwind/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { offerAffiliateservice } from '@/api/services/offerAffiliate.service';
import { userService } from '@/api/services/user.service';
import { productService } from '@/api/services/product.service';

const EditOfferAffiliate = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get offer affiliate ID from URL params

  const [formData, setFormData] = useState({
    affiliate_id: '',
    offer_id: '',
    goalId: '',
    default_payout: '',
    default_revenue: '',
    currency: 'INR',
    status : 'draft'
  });

  const [affiliates, setAffiliates] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isLoadingAffiliates, setIsLoadingAffiliates] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAffiliates();
    fetchProducts();
    fetchOfferAffiliateData();
  }, [id]);

  const fetchOfferAffiliateData = async () => {
    setIsLoadingData(true);
    try {
      const res = await offerAffiliateservice.getById(id);
    //  console.log("this is affiliate Data",res);
      
      const offerData = res.data?.data;
      
      if (offerData) {
        setFormData({
          affiliate_id: offerData.affiliate_id || offerData.affiliate?._id || '',
          offer_id: offerData.offer_id || offerData.offer?._id || '',
          goalId: offerData.goalId || offerData.goal?.goalId || '',
          default_payout: offerData.default_payout || '',
          default_revenue: offerData.default_revenue || '',
          currency: offerData.currency || 'INR',
          status  : offerData.status ||'draft'
        });

        

        // Set selected product if offer_id is available
        if (offerData.offer_id || offerData.offer?._id) {
          
            setSelectedProduct(offerData.offer);
          
        }
      }
    } catch (error) {
      console.error('Failed to fetch offer affiliate data:', error);
      toast.error('Failed to load offer affiliate data');
      navigate(-1);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchAffiliates = async () => {
    setIsLoadingAffiliates(true);
    try {
     const res = await userService.list({
            role: 'affiliate',
            status: 'active',
            limit: 1000,
            source: 'user'
          });
      const affiliateData = res.data?.data?.users || [];
      setAffiliates(affiliateData);
    } catch (error) {
      console.error('Failed to fetch affiliates:', error);
      toast.error('Failed to load affiliates');
    } finally {
      setIsLoadingAffiliates(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
        const res = await productService.list({ limit: 1000, source: 'user' });
    //  console.log("this is products" ,res);
      
      const productData = res.data?.data?.products || [];
      setProducts(productData);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Update selected product when products are loaded and formData has offer_id
  // useEffect(() => {
  //   if (products.length > 0 && formData.offer_id && !selectedProduct) {
  //     const product = products.find((p) => p._id === formData.offer_id);
  //     if (product) {
  //       setSelectedProduct(product);
  //     }
  //   }
  // }, [products, formData.offer_id]);

  useEffect(() => {
    if (products.length && formData.offer_id) {
      const product = products.find(p => p._id === formData.offer_id);
      if (product) {
        setSelectedProduct(product);
      }
    }
  }, [products, formData.offer_id]);

  const handleAffiliateChange = (id) => {
    setFormData((prev) => ({ ...prev, affiliate_id: id }));
  };

  const handleProductChange = (id) => {
    const product = products.find((p) => p._id === id);
    setSelectedProduct(product);
    setFormData((prev) => ({
      ...prev,
      offer_id: id,
      goalId: '',
      default_payout: '',
      default_revenue: '',
      currency: 'INR',
    }));
  };

  const handleGoalChange = (goalId) => {
    const goal = selectedProduct?.goals?.find((g) => g.goalId === goalId);
    if (goal) {
      setFormData((prev) => ({
        ...prev,
        goalId: goalId,
        default_payout: goal.payout,
        default_revenue: goal.revenue,
        currency: goal.currency,
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClose = () => {
    navigate(-1);
  };

  const validateForm = () => {
    if (!formData.affiliate_id) {
      toast.error('Please select an affiliate');
      return false;
    }
    if (!formData.offer_id) {
      toast.error('Please select a product/offer');
      return false;
    }
    if (!formData.goalId) {
      toast.error('Please select a goal');
      return false;
    }
    if (!formData.default_payout || formData.default_payout <= 0) {
      toast.error('Payout must be greater than 0');
      return false;
    }
    if (!formData.default_revenue || formData.default_revenue <= 0) {
      toast.error('Revenue must be greater than 0');
      return false;
    }
    if (parseFloat(formData.default_payout) > parseFloat(formData.default_revenue)) {
      toast.error('Payout cannot exceed revenue');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const res = await offerAffiliateservice.update(id, {
        affiliate_id: formData.affiliate_id,
        offer_id: formData.offer_id,
        goalId: formData.goalId,
        default_payout: parseFloat(formData.default_payout),
        default_revenue: parseFloat(formData.default_revenue),
        currency: formData.currency,
        status: formData.status,
      });
      toast.success('Affiliate offer updated successfully');
      console.log('Updated Affiliate Offer:', res);
      handleClose();
    } catch (error) {
      console.log('error', error);
      toast.error(
        error?.response?.data?.message || 'Failed to update affiliate offer'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasGoals = selectedProduct?.goals && selectedProduct.goals.length > 0;

  // console.log("this has goals",hasGoals);
  // console.log("this is selected Product",selectedProduct);
  
  

  if (isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader
        variant="gradient"
        color="blue"
        className="mb-4 p-6 flex justify-between items-center"
      >
        <div>
          <Typography variant="h6" color="white">
            Edit Affiliate Offer
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Update the affiliate offer details
          </Typography>
        </div>
        <Button
          variant="outlined"
          color="white"
          size="sm"
          onClick={handleClose}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} /> Back
        </Button>
      </CardHeader>

      <CardBody className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Affiliate Selector */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-blue-gray-700">
              Select Affiliate <span className="text-red-500">*</span>
            </Typography>
            {isLoadingAffiliates ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Spinner className="h-4 w-4" /> Loading affiliates...
              </div>
            ) : (
              <Select
                label="Select Affiliate"
                value={formData.affiliate_id}
                onChange={handleAffiliateChange}
                className="capitalize"
              >
                {affiliates.length > 0 ? (
                  affiliates.map((affiliate) => (
                    <Option key={affiliate._id} value={affiliate._id}>
                      <div className="flex flex-col">
                        <Typography variant="small" className="font-medium text-gray-900">
                          {affiliate.name || affiliate.userName}
                        </Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">
                          {affiliate.email}
                        </Typography>
                      </div>
                    </Option>
                  ))
                ) : (
                  <Option disabled>No active affiliates found</Option>
                )}
              </Select>
            )}
          </div>

          {/* Product/Offer Selector */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-blue-gray-700">
              Select Product/Offer <span className="text-red-500">*</span>
            </Typography>
            {isLoadingProducts ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Spinner className="h-4 w-4" /> Loading products...
              </div>
            ) : (
              <Select
                label="Select Product"
                value={formData.offer_id}
                onChange={handleProductChange}
                className="capitalize"
              >
                {products.length > 0 ? (
                  products.map((product) => (
                    <Option key={product._id} value={product._id}>
                      <div className="flex flex-col">
                        <Typography variant="small" className="font-medium text-gray-900">
                          {product.name}
                        </Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">
                          {product.store?.name} • ₹{product.sellingPrice}
                        </Typography>
                      </div>
                    </Option>
                  ))
                ) : (
                  <Option disabled>No active products found</Option>
                )}
              </Select>
            )}
          </div>

          {/* No Goals Warning */}
          {selectedProduct && !hasGoals && (
            <Alert color="amber" className="flex items-start">
              <div>
                <Typography variant="small" className="font-medium">
                  No Goals Assigned
                </Typography>
                <Typography variant="small" className="mt-1 opacity-80">
                  Please assign goals to this product first before updating the affiliate offer.
                </Typography>
              </div>
            </Alert>
          )}

          {/* Goal Selector */}
          {hasGoals && (
            <div>
              <Typography variant="small" className="mb-2 font-medium text-blue-gray-700">
                Select Goal <span className="text-red-500">*</span>
              </Typography>
              <Select
                label="Select Goal"
                value={formData.goalId}
                onChange={handleGoalChange}
                className="capitalize"
              >
                {selectedProduct.goals.map((goal) => (
                  <Option key={goal.goalId} value={goal.goalId}>
                    <div className="flex flex-col">
                      <Typography variant="small" className="font-medium text-gray-900">
                        {goal.name} - {goal.goalModel}
                      </Typography>
                      <Typography variant="small" className="text-gray-500 text-xs">
                        Revenue: ₹{goal.revenue} • Payout: ₹{goal.payout}
                      </Typography>
                    </div>
                  </Option>
                ))}
              </Select>
              {formData.goalId && (
                <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                  <Typography variant="small" className="text-blue-800">
                    {selectedProduct.goals.find((g) => g.goalId === formData.goalId)?.description}
                  </Typography>
                </div>
              )}
            </div>
          )}

          {/* Payout Input */}
          <Input
            label={`Default Payout (${formData.currency})`}
            name="default_payout"
            type="number"
            value={formData.default_payout}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
            placeholder="Enter payout amount"
          />

          {/* Revenue Input */}
          <Input
            label={`Default Revenue (${formData.currency})`}
            name="default_revenue"
            type="number"
            value={formData.default_revenue}
            onChange={handleInputChange}
            required
            step="0.01"
            min="0"
            placeholder="Enter revenue amount"
          />

          {/* Currency Display */}
          <Input
            label="Currency"
            value={formData.currency}
            disabled
            className="bg-gray-50"
          />

            <div className="w-full">
                     <Select
            label="Status"
            value={formData.status}
            onChange={(value) => setFormData((prev) => ({ ...prev, status: value }))}
          >
            <Option value="draft">Draft</Option>
            <Option value="active">Active</Option>
            <Option value="inactive">Inactive</Option>
          </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              color="blue"
              className="flex items-center gap-2"
              disabled={!hasGoals || isSubmitting}
              loading={isSubmitting}
            >
              <Save size={18} /> {isSubmitting ? 'Updating...' : 'Update'}
            </Button>
            <Button
              type="button"
              color="gray"
              variant="outlined"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default EditOfferAffiliate;