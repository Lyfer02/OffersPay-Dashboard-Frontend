// ✅ UPDATED AddStore.jsx - Updated according to store.model.js
import React, { useState, useRef, useEffect } from "react";
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
import { Upload, ImageIcon, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { storeService } from "@/api/services/stores.service";
import { networkService } from "@/api/services/network.service";

const AddStore = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    status: "draft",
    rating: "4",
    storeImage: null,
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
    earningRates: [{ description: "", rate: "" }],
    termsAndConditions: [""],
  });

  const [previewImage, setPreviewImage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [networks, setNetworks] = useState([]);
  const [loadingNetworks, setLoadingNetworks] = useState(false);

  // Fetch networks on component mount
  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    setLoadingNetworks(true);
    try {
      const res = await networkService.list(1, {source : '', limit: 100 });
      console.log("this ",res);
      
      const networkData = res.data?.data?.networks || [];
     
      
      setNetworks(networkData);
     
      
    } catch (error) {
      console.error("Failed to fetch networks:", error);
      toast.error("Failed to load networks");
    } finally {
      setLoadingNetworks(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (index, field, value, arrayKey) => {
    const updated = [...form[arrayKey]];
    updated[index][field] = value;
    setForm({ ...form, [arrayKey]: updated });
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
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);
    setForm((prev) => ({
      ...prev,
      storeImage: { file, name: file.name, preview },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        imageFile: imageFile,
      };
      const res = await storeService.create(payload);
      toast.success(res.data.message);
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create store");
    }
  };

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader variant="gradient" color="blue" className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="text" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft size={24} color="white" />
          </Button>
          <Typography variant="h4" color="white">
            Add New Store
          </Typography>
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
            {form.earningRates.map((item, idx) => (
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
                  disabled={form.earningRates.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => addArrayItem('earningRates', { description: '', rate: '' })}>
              Add Rate
            </Button>
          </div>

          {/* Terms & Conditions */}
          <div className="space-y-4">
            <Typography variant="h6">Terms & Conditions</Typography>
            {form.termsAndConditions.map((term, idx) => (
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
                  disabled={form.termsAndConditions.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={() => addArrayItem('termsAndConditions', '')}>
              Add Term
            </Button>
          </div>

          {/* Image Upload */}
          <div>
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
                      setImageFile(null); 
                      setPreviewImage(""); 
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

          <Button type="submit" color="blue" size="lg">
            Create Store
          </Button>
        </CardBody>
      </form>
    </Card>
  );
};

export default AddStore;