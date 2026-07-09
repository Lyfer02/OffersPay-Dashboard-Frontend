// ✅ UPDATED EditStore.jsx - Updated according to store.model.js
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Select,
  Option,
  Textarea,
} from "@material-tailwind/react";
import { Upload, ImageIcon, X, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  getImageUrl,
  createBlobUrl,
  cleanupBlobUrl,
  validateImageFile,
} from "@/utils/imageUtils";
import { storeService } from "@/api/services/stores.service";
import { networkService } from "@/api/services/network.service";

const EditStore = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  const [imageKey, setImageKey] = useState(0);
  const [networks, setNetworks] = useState([]);
  const [loadingNetworks, setLoadingNetworks] = useState(false);

  const [form, setForm] = useState({
    name: "",
    status: "draft",
    rating: "4",
    imageUrl: "",
    trackingSpeed: "24 hours",
    confirmation: "90 Days",
    earn: "",
    about: "",
    apiKey: "",
    authTokens: "",
    credentials: "",
    network: "",
    subIds: "",
    networkSubId: "",
    campainInfoUrl: "",
    networkUniqueKey: "",
    earningRates: [],
    termsAndConditions: [],
  });

  useEffect(() => {
    fetchNetworks();
    fetchStore();
  }, [id]);

  const fetchNetworks = async () => {
    setLoadingNetworks(true);
    try {
      const res = await networkService.list(1, {source:"", limit: 100 });
      const networkData = res.data?.data?.networks || [];
      setNetworks(networkData);
    } catch (error) {
      console.error("Failed to fetch networks:", error);
      toast.error("Failed to load networks");
    } finally {
      setLoadingNetworks(false);
    }
  };

  const fetchStore = async () => {
    try {
      const res = await storeService.getById(id);
      if (res?.status === 200 && res.data?.data) {
        const store = res.data.data;
        setForm({
          name: store.name || "",
          status: store.status || "draft",
          rating: store.rating?.toString() || "4",
          imageUrl: store.image || "",
          trackingSpeed: store.trackingSpeed || "24 hours",
          confirmation: store.confirmation || "90 Days",
          earn: store.earn?.toString() || "",
          about: store.about || "",
          apiKey: store.apiKey || "",
          authTokens: store.authTokens || "",
          credentials: store.credentials || "",
          network: store.network?._id || store.network || "",
          subIds: store.subIds || "",
          networkSubId: store.networkSubId || "",
          campainInfoUrl: store.campainInfoUrl || "",
          networkUniqueKey: store.networkUniqueKey || "",
          earningRates: store.earningRates || [],
          termsAndConditions: store.termsAndConditions || [],
        });
        if (store.image) {
          setPreviewImage(getImageUrl(store.image));
        }
      }
    } catch (err) {
      toast.error("Failed to fetch store data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleArrayChange = (index, field, value, key) => {
    const updated = [...form[key]];
    updated[index][field] = value;
    setForm({ ...form, [key]: updated });
  };

  const addArrayItem = (key, template) => {
    setForm((prev) => ({ ...prev, [key]: [...prev[key], template] }));
  };

  const removeArrayItem = (key, index) => {
    const updated = [...form[key]];
    updated.splice(index, 1);
    setForm({ ...form, [key]: updated });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error);
      return;
    }
    setImageFile(file);
    setPreviewImage(createBlobUrl(file));
  };

  const handleRemoveImage = () => {
    cleanupBlobUrl(previewImage);
    setPreviewImage("");
    setImageFile(null);
    setForm((prev) => ({ ...prev, imageUrl: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        imageFile,
      };
      if (!previewImage && !imageFile) payload.removeImage = true;
      const res = await storeService.update(id, payload);
      toast.success(res.data.message);
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update store");
    }
  };

  if (isLoading) return (
    <div className="w-full h-screen flex items-center justify-center">
      <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
    </div>
  );

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader variant="gradient" color="blue" className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="text" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft size={24} color="white" />
          </Button>
          <Typography variant="h4" color="white">Edit Store</Typography>
          <div className="w-6" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <CardBody className="grid gap-6 p-6 bg-white">
          {/* Basic Information */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input 
              label="Store Name" 
              name="name" 
              value={form.name} 
              required 
              onChange={handleChange} 
            />
            <Input 
              label="Rating" 
              name="rating" 
              type="number" 
              min="1" 
              max="5" 
              value={form.rating} 
              onChange={handleChange} 
            />
            <Select 
              label="Status" 
              value={form.status} 
              onChange={(val) => setForm({ ...form, status: val })}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="draft">Draft</Option>
            </Select>
          </div>

          {/* Store Details */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input 
              label="Tracking Speed" 
              name="trackingSpeed" 
              value={form.trackingSpeed} 
              onChange={handleChange} 
            />
            <Input 
              label="Confirmation" 
              name="confirmation" 
              value={form.confirmation} 
              onChange={handleChange} 
            />
            <Input 
              label="Earn" 
              name="earn" 
              type="number" 
              value={form.earn} 
              onChange={handleChange} 
            />
          </div>

          <Textarea 
            label="About" 
            name="about" 
            value={form.about} 
            onChange={handleChange} 
            required 
          />

          {/* Network Selection */}
          <div className="grid md:grid-cols-1 gap-6">
            <Select 
              label={loadingNetworks ? "Loading Networks..." : "Select Network"} 
              value={form.network} 
              onChange={(val) => setForm({ ...form, network: val })}
              disabled={loadingNetworks}
               selected={(element) => {
                                        const selectedNetwork= networks.find(s => s._id === form.network);
                                        return selectedNetwork ? selectedNetwork.name : '';
                                    }}
            >
              <Option value="">Select a Network</Option>
              {networks.map((network) => (
                <Option key={network._id} value={network._id}>
                  {network.name}
                </Option>
              ))}
            </Select>
          </div>

          {/* API Configuration */}
          <div className="space-y-4">
            <Typography variant="h6">API Configuration</Typography>
            <div className="grid md:grid-cols-2 gap-6">
              <Input 
                label="API Key" 
                name="apiKey" 
                value={form.apiKey} 
                onChange={handleChange} 
              />
              <Input 
                label="Auth Tokens" 
                name="authTokens" 
                value={form.authTokens} 
                onChange={handleChange} 
              />
              <Input 
                label="Credentials" 
                name="credentials" 
                value={form.credentials} 
                onChange={handleChange} 
              />
              <Input 
                label="Network Unique Key" 
                name="networkUniqueKey" 
                value={form.networkUniqueKey} 
                onChange={handleChange} 
              />
              <Input 
                label="Sub IDs" 
                name="subIds" 
                value={form.subIds} 
                onChange={handleChange} 
              />
              <Input 
                label="Network Sub ID" 
                name="networkSubId" 
                value={form.networkSubId} 
                onChange={handleChange} 
              />
            </div>
            <Input 
              label="Campaign Info URL" 
              name="campainInfoUrl" 
              value={form.campainInfoUrl} 
              onChange={handleChange} 
            />
          </div>

          {/* Earning Rates */}
          <div className="space-y-4">
            <Typography variant="h6">Earning Rates</Typography>
            {form.earningRates.length === 0 ? (
              <div className="text-gray-500 italic">No earning rates added yet</div>
            ) : (
              form.earningRates.map((item, idx) => (
                <div className="grid md:grid-cols-3 gap-4" key={idx}>
                  <Input 
                    label="Description" 
                    value={item.description} 
                    onChange={(e) => handleArrayChange(idx, 'description', e.target.value, 'earningRates')} 
                  />
                  <Input 
                    label="Rate" 
                    value={item.rate} 
                    onChange={(e) => handleArrayChange(idx, 'rate', e.target.value, 'earningRates')} 
                  />
                  <Button 
                    color="red" 
                    onClick={() => removeArrayItem('earningRates', idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
            <Button onClick={() => addArrayItem('earningRates', { description: '', rate: '' })}>
              Add Rate
            </Button>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <Typography variant="h6">Terms & Conditions</Typography>
            {form.termsAndConditions.length === 0 ? (
              <div className="text-gray-500 italic">No terms and conditions added yet</div>
            ) : (
              form.termsAndConditions.map((term, idx) => (
                <div className="flex gap-2" key={idx}>
                  <Input 
                    label={`Term ${idx + 1}`}
                    value={term} 
                    onChange={(e) => {
                      const updated = [...form.termsAndConditions];
                      updated[idx] = e.target.value;
                      setForm({ ...form, termsAndConditions: updated });
                    }} 
                  />
                  <Button 
                    color="red" 
                    onClick={() => removeArrayItem('termsAndConditions', idx)}
                  >
                    Remove
                  </Button>
                </div>
              ))
            )}
            <Button onClick={() => addArrayItem('termsAndConditions', '')}>
              Add Term
            </Button>
          </div>

          {/* Image Upload */}
          <div key={imageKey}>
            <Typography variant="small" className="mb-2 font-medium text-gray-700">
              Store Image
            </Typography>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100"
            >
              {previewImage ? (
                <div className="relative">
                  <img 
                    src={previewImage} 
                    className="w-full h-48 object-contain" 
                    alt="Preview" 
                  />
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleRemoveImage(); 
                    }} 
                    className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <ImageIcon size={48} className="text-blue-gray-300 mb-2" />
                  <Typography variant="lead" className="text-center text-blue-gray-500">
                    Click here to upload store image
                  </Typography>
                </>
              )}
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </div>
          </div>
        </CardBody>

        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button variant="outlined" color="red" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" color="blue" size="lg">
            Update Store
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EditStore;