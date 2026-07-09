import React, { useState, useEffect } from "react";
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
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { networkService } from "@/api/services/network.service";
// import { networkService } from "@/api/services/networks.service";

const EditNetwork = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    shortname: "",
    namespace: "",
    affiliateId: "",
    websiteId: "",
    confirmDays: 90,
    confirmDuration: "+90 days",
    enabled: true,
    currency: "USD",
    networkPlatform: "",
    networkUniqueKey: "",
    apiBaseUrl: "",
    authType: "none",
    apiKey: "",
    apiSecret: "",
    authToken: "",
    refreshToken: "",
    status: "draft",
    credentials: {},
  });

  const [credentialPairs, setCredentialPairs] = useState([]);

    const fetchNetwork = async () => {
        setIsLoading(true);
      try {
        // Uncomment when service is available
        const res = await networkService.getById(id);
     //   console.log("this is res",res);
        
        if (res?.status === 200 && res.data?.data) {
          const network = res.data.data;
          setForm({
            name: network.name || "",
            shortname: network.shortname || "",
            namespace: network.namespace || "",
            affiliateId: network.affiliateId || "",
            websiteId: network.websiteId || "",
            confirmDays: network.confirmDays || 90,
            confirmDuration: network.confirmDuration || "+90 days",
            enabled: network.enabled || true,
            currency: network.currency || "USD",
            networkPlatform: network.networkPlatform || "",
            networkUniqueKey: network.networkUniqueKey || "",
            apiBaseUrl: network.apiBaseUrl || "",
            authType: network.authType || "none",
            apiKey: network.apiKey || "",
            apiSecret: network.apiSecret || "",
            authToken: network.authToken || "",
            refreshToken: network.refreshToken || "",
            status: network.status || "draft",
            credentials: network.credentials || {},
          });
          
          // Convert credentials object to array of pairs
          const credPairs = Object.entries(network.credentials || {}).map(([key, value]) => ({
            key,
            value
          }));
          setCredentialPairs(credPairs.length > 0 ? credPairs : [{ key: "", value: "" }]);
        }

        // Mock data for now
        // setTimeout(() => {
        //   setForm({
        //     name: "Sample Network",
        //     shortname: "SampleNet",
        //     namespace: "sample",
        //     affiliateId: "AFF123",
        //     websiteId: "WEB456",
        //     confirmDays: 90,
        //     confirmDuration: "+90 days",
        //     enabled: true,
        //     currency: "USD",
        //     networkPlatform: "Commission Junction",
        //     networkUniqueKey: "UNIQUE123",
        //     apiBaseUrl: "https://api.sample.com",
        //     authType: "apiKey",
        //     apiKey: "sample-key",
        //     apiSecret: "sample-secret",
        //     authToken: "",
        //     refreshToken: "",
        //     status: "active",
        //     credentials: { "custom_field": "custom_value" },
        //   });
        //   setCredentialPairs([{ key: "custom_field", value: "custom_value" }]);
        //   setIsLoading(false);
        // }, 1000);
      } catch (err) {
        toast.error("Failed to fetch network data");
        setIsLoading(false);
      }finally {
        setIsLoading(false);
      }
    };
  useEffect(() => {
  
    fetchNetwork();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCredentialChange = (index, field, value) => {
    const updated = [...credentialPairs];
    updated[index][field] = value;
    setCredentialPairs(updated);
  };

  const addCredentialPair = () => {
    setCredentialPairs((prev) => [...prev, { key: "", value: "" }]);
  };

  const removeCredentialPair = (index) => {
    const updated = [...credentialPairs];
    updated.splice(index, 1);
    setCredentialPairs(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Convert credential pairs to object
      const credentialsObj = {};
      credentialPairs.forEach((pair) => {
        if (pair.key.trim() && pair.value.trim()) {
          credentialsObj[pair.key.trim()] = pair.value.trim();
        }
      });

      const payload = {
        ...form,
        credentials: credentialsObj,
      };

      // Uncomment when service is available
      const res = await networkService.updateById(id, payload);
     // console.log("this is updated",res);
      
      toast.success(res.data.message);
      
      // Mock success for now
     // toast.success("Network updated successfully!");
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update network");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
      </div>
    );
  }

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader variant="gradient" color="blue" className="p-4">
        <div className="flex items-center justify-between">
          <Button variant="text" onClick={() => navigate(-1)} className="p-2">
            <ArrowLeft size={24} color="white" />
          </Button>
          <Typography variant="h4" color="white">
            Edit Network
          </Typography>
          <div className="w-6" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardBody className="grid gap-6 p-6 bg-white">
          {/* Basic Information */}
          <div className="grid md:grid-cols-3 gap-6">
            <Input 
              label="Network Name" 
              name="name" 
              value={form.name} 
              required 
              onChange={handleChange} 
            />
            <Input 
              label="Short Name" 
              name="shortname" 
              value={form.shortname} 
              onChange={handleChange} 
            />
            <Input 
              label="Namespace" 
              name="namespace" 
              value={form.namespace} 
              onChange={handleChange} 
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input 
              label="Affiliate ID" 
              name="affiliateId" 
              value={form.affiliateId} 
              onChange={handleChange} 
            />
            <Input 
              label="Website ID" 
              name="websiteId" 
              value={form.websiteId} 
              onChange={handleChange} 
            />
            <Input 
              label="Network Platform" 
              name="networkPlatform" 
              value={form.networkPlatform} 
              onChange={handleChange} 
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Input 
              label="Network Unique Key" 
              name="networkUniqueKey" 
              value={form.networkUniqueKey} 
              onChange={handleChange} 
            />
            <Input 
              label="Confirmation Days" 
              name="confirmDays" 
              type="number" 
              value={form.confirmDays} 
              onChange={handleChange} 
            />
            <Input 
              label="Confirmation Duration" 
              name="confirmDuration" 
              value={form.confirmDuration} 
              onChange={handleChange} 
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Select 
              label="Currency" 
              value={form.currency} 
              onChange={(val) => setForm({ ...form, currency: val })}
            >
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
              <Option value="GBP">GBP</Option>
              <Option value="INR">INR</Option>
            </Select>
            <Select 
              label="Status" 
              value={form.status} 
              onChange={(val) => setForm({ ...form, status: val })}
            >
              <Option value="active">Active</Option>
              <Option value="draft">Draft</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="enabled"
                name="enabled"
                checked={form.enabled}
                onChange={handleChange}
                className="mr-2"
              />
              <label htmlFor="enabled" className="text-sm text-gray-700">
                Network Enabled
              </label>
            </div>
          </div>

          {/* API Integration Section */}
          <div className="border-t pt-6">
            <Typography variant="h6" className="mb-4">API Integration</Typography>
            
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <Input 
                label="API Base URL" 
                name="apiBaseUrl" 
                value={form.apiBaseUrl} 
                onChange={handleChange} 
              />
              <Select 
                label="Authentication Type" 
                value={form.authType} 
                onChange={(val) => setForm({ ...form, authType: val })}
              >
                <Option value="none">None</Option>
                <Option value="apiKey">API Key</Option>
                <Option value="bearerToken">Bearer Token</Option>
                <Option value="basicAuth">Basic Auth</Option>
                <Option value="oauth2">OAuth2</Option>
              </Select>
            </div>

            {form.authType !== "none" && (
              <div className="grid md:grid-cols-2 gap-6">
                {(form.authType === "apiKey" || form.authType === "basicAuth") && (
                  <>
                    <Input 
                      label="API Key" 
                      name="apiKey" 
                      value={form.apiKey} 
                      onChange={handleChange} 
                    />
                    <Input 
                      label="API Secret" 
                      name="apiSecret" 
                      type="password"
                      value={form.apiSecret} 
                      onChange={handleChange} 
                    />
                  </>
                )}
                {(form.authType === "bearerToken" || form.authType === "oauth2") && (
                  <>
                    <Input 
                      label="Auth Token" 
                      name="authToken" 
                      value={form.authToken} 
                      onChange={handleChange} 
                    />
                    {form.authType === "oauth2" && (
                      <Input 
                        label="Refresh Token" 
                        name="refreshToken" 
                        value={form.refreshToken} 
                        onChange={handleChange} 
                      />
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Additional Credentials */}
          <div className="border-t pt-6">
            <Typography variant="h6" className="mb-4">Additional Credentials</Typography>
            {credentialPairs.map((pair, idx) => (
              <div className="grid md:grid-cols-3 gap-4 mb-4" key={idx}>
                <Input 
                  label="Key" 
                  value={pair.key} 
                  onChange={(e) => handleCredentialChange(idx, 'key', e.target.value)} 
                />
                <Input 
                  label="Value" 
                  value={pair.value} 
                  onChange={(e) => handleCredentialChange(idx, 'value', e.target.value)} 
                />
                <Button 
                  color="red" 
                  onClick={() => removeCredentialPair(idx)}
                  disabled={credentialPairs.length === 1}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button onClick={addCredentialPair} variant="outlined" color="blue">
              Add Credential
            </Button>
          </div>
        </CardBody>

        <div className="flex justify-end gap-2 p-6 pt-0">
          <Button variant="outlined" color="red" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" color="blue" size="lg">
            Update Network
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EditNetwork;