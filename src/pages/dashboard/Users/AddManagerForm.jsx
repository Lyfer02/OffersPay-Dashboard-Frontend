import React, { useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Typography,
  Input,
  Select,
  Option,
  Checkbox
} from '@material-tailwind/react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '@/api/services/user.service';
// import { managerService } from '@/api/services/manager.service'; // Create this service similar to bannerService

const AddManagerForm = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    password: '',
    role: 'manager',
    status: 'active',
    permissions: {
      canView: false,
      canEdit: false,
      canCreate: false,
      canDelete: false
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePermissionChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [name]: checked
      }
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    
    try {
      const payload = { ...formData };
      console.log("Submitting payload:", payload);

      // Example API call (uncomment when managerService is implemented)
       const response = await userService.create(payload);
       
      // Mock success response
      // const response = { status: 201 };

      console.log("the created response",response);
      

      // if (response.status === 200 || response.status === 201) {
        toast.success("Manager added successfully!");
        navigate(-1);
      // } else {
      //   toast.error("Failed to add manager.");
      // }
    } catch (error) {
      console.error("Error adding manager:", error);
      toast.error(error.response.data.message);
    }
  };

  const handleClose = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen max-w-7xl mx-auto my-10  rounded-xl">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-4">
          <div className="flex items-center justify-between">
            <Button variant="text" onClick={handleClose} className="p-2">
              <ArrowLeft size={24} color="white" />
            </Button>
            <Typography variant="h4" color="white">
              Add New Manager
            </Typography>
            <div className="w-6" />
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Basic Info */}
            <Typography className=" font-medium">Manager Details</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
              <Input
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                name="userName"
                label="Username"
                value={formData.userName}
                onChange={handleChange}
                required
              />
              <Input
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                name="password"
                label="Password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            {/* Role and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography className="mb-2 font-medium">Role</Typography>
                <Select
                  label="Select Role"
                  value={formData.role}
                  onChange={(val) => handleSelectChange('role', val)}
                >
                  <Option value="manager">Manager</Option>
                  <Option value="admin">Admin</Option>
                  <Option value="affiliate">Affiliate</Option>
                </Select>
              </div>
              <div>
                <Typography className="mb-2 font-medium">Status</Typography>
                <Select
                  label="Select Status"
                  value={formData.status}
                  onChange={(val) => handleSelectChange('status', val)}
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </div>

            {/* Permissions */}
            <div>
              <Typography className="mb-2 font-medium">Permissions</Typography>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Checkbox
                  name="canView"
                  checked={formData.permissions.canView}
                  onChange={handlePermissionChange}
                  label="Can View"
                />
                <Checkbox
                  name="canEdit"
                  checked={formData.permissions.canEdit}
                  onChange={handlePermissionChange}
                  label="Can Edit"
                />
                <Checkbox
                  name="canCreate"
                  checked={formData.permissions.canCreate}
                  onChange={handlePermissionChange}
                  label="Can Create"
                />
                <Checkbox
                  name="canDelete"
                  checked={formData.permissions.canDelete}
                  onChange={handlePermissionChange}
                  label="Can Delete"
                />
              </div>
            </div>
          </form>
        </CardBody>

        <CardFooter className="flex justify-end gap-4">
          <Button variant="outlined" color="red" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="gradient" color="blue" onClick={handleSubmit}>
            Add Manager
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddManagerForm;
