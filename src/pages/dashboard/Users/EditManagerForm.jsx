import React, { useEffect, useState } from 'react';
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
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userService } from '@/api/services/user.service';

const EditManagerForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    userName: '',
    role: 'manager',
    status: 'active',
    permissions: {
      canView: false,
      canEdit: false,
      canCreate: false,
      canDelete: false
    }
  });

  // Fetch user data by ID
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userService.getUserData(id);
        const user = response.data.data;
        setFormData({
          fullName: user.fullName,
          email: user.email,
          userName: user.userName,
          role: user.role,
          status: user.status,
          permissions: {
            canView: user.permissions?.canView || false,
            canEdit: user.permissions?.canEdit || false,
            canCreate: user.permissions?.canCreate || false,
            canDelete: user.permissions?.canDelete || false
          }
        });
      } catch (error) {
        console.error('Error fetching user:', error);
        toast.error('Failed to load user data');
      }
    };

    if (id) fetchUser();
  }, [id]);

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
      const payload = {
        userName: formData.userName,
        status: formData.status,
        permissions: formData.permissions
      };

      const response =await userService.update(id, payload);
        console.log("the response is res",response);
        
      toast.success('Manager updated successfully');
      navigate(-1);
    } catch (error) {
      console.error('Error updating manager:', error.response.data.message);
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
              Edit Manager
            </Typography>
            <div className="w-6" />
          </div>
        </CardHeader>

        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Typography className="font-medium">Manager Details</Typography>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                name="fullName"
                label="Full Name"
                value={formData.fullName}
                onChange={() => {}}
                disabled
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
                onChange={() => {}}
                value={formData.email}
                disabled
              />
              <Input
                name="password"
                label="Password"
                type="password"
                onChange={() => {}}
                value="********"
                disabled
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography className="mb-2 font-medium">Role</Typography>
                <Select label="Role" value={formData.role}
                 disabled
                 onChange={() => {}}
                 >
                  <Option value="manager">Manager</Option>
                  <Option value="admin">Admin</Option>
                </Select>
              </div>

              <div>
                <Typography className="mb-2 font-medium">Status</Typography>
                <Select
                  label="Select Status"
                  value={formData.status}
                  onChange={(val) => handleSelectChange('status', val)}
                  required
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="affiliate">Affiliate</Option>
                </Select>
              </div>
            </div>

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
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditManagerForm;
