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
} from '@material-tailwind/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { networkService } from '@/api/services/network.service';
import { IpService } from '@/api/services/ipWhiteList.service';

const AddIp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    network: '',
    ip: '',
    status: '',
  });

  const [networks, setNetworks] = useState([]);
  const [isLoadingNetworks, setIsLoadingNetworks] = useState(false);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const fetchNetworks = async () => {
    setIsLoadingNetworks(true);
    try {
      const res = await networkService.list(1, { status: 'active', limit: 1000 });
      const networkData = res.data?.data?.networks || [];
      setNetworks(networkData);
    } catch (error) {
      console.error('Failed to fetch networks:', error);
      toast.error('Failed to load networks');
    } finally {
      setIsLoadingNetworks(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNetworkChange = (id) => {
    setFormData((prev) => ({ ...prev, network: id }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleClose = () => {
    navigate(-1);
  };

  const validateIP = (ip) => {
    const ipPattern =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.network || !formData.ip) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!validateIP(formData.ip)) {
      toast.error('Please enter a valid IP address');
      return;
    }

    try {
      const res = await IpService.create({
        network: formData.network,
        ip: formData.ip,
        status: formData.status || 'draft',
      });
      toast.success('IP Whitelist created successfully');
      console.log('Created IP Whitelist:', res);
      handleClose();
    } catch (error) {
      console.log('error', error);
      toast.error(
        error?.response?.data?.message || 'Failed to create IP whitelist'
      );
    }
  };

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader
        variant="gradient"
        color="blue"
        className="mb-4 p-6 flex justify-between items-center"
      >
        <div>
          <Typography variant="h6" color="white">
            Add IP Whitelist
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Fill the form to add a new IP to whitelist
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
          {/* Network Selector */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-blue-gray-700">
              Network <span className="text-red-500">*</span>
            </Typography>
            {isLoadingNetworks ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Spinner className="h-4 w-4" /> Loading networks...
              </div>
            ) : (
              <Select
                label="Select Network"
                value={formData.network}
                onChange={handleNetworkChange}
                className="capitalize"
              >
                {networks.length > 0 ? (
                  networks.map((network) => (
                    <Option key={network._id} value={network._id}>
                      <div className="flex flex-col">
                        <Typography variant="small" className="font-medium text-gray-900">
                          {network.name}
                        </Typography>
                        <Typography variant="small" className="text-gray-500 text-xs">
                          {network.shortname} • {network.affiliateId}
                        </Typography>
                      </div>
                    </Option>
                  ))
                ) : (
                  <Option disabled>No networks found</Option>
                )}
              </Select>
            )}
          </div>

          {/* IP Address Input */}
          <Input
            label="IP Address"
            name="ip"
            value={formData.ip}
            onChange={handleChange}
            required
            placeholder="e.g., 192.168.1.1"
          />

          {/* Status Selector */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-blue-gray-700">
              Status
            </Typography>
            <Select
              label="Select Status"
              value={formData.status}
              onChange={handleStatusChange}
              className="capitalize"
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
              <Option value="draft">Draft</Option>
            </Select>
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <Button
              type="submit"
              color="blue"
              className="flex items-center gap-2"
            >
              <Save size={18} /> Save
            </Button>
            <Button
              type="button"
              color="gray"
              variant="outlined"
              onClick={handleClose}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default AddIp;
