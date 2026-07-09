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
} from '@material-tailwind/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { categoryService } from '@/api/services/category.service';

const EditCategory = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    status: 'active',
  });

  const handleClose = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  // ✅ Fetch category by ID
  const fetchCategory = async () => {
    try {
    console.log("this is fiunction ");
    
      const res = await categoryService.getById(id);
      console.log("this is category Details ",res);
      
      const data = res?.data?.data;

      if (data) {
        setFormData({
          name: data.name,
          status: data.status,
        });
      }
    } catch (error) {
      toast.error('Failed to fetch category');
      handleClose();
    }
  };

  useEffect(() => {
    if (id) {
      fetchCategory();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name ) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      const res = await categoryService.update(id, {
        name: formData.name,
        status: formData.status,
      });
      console.log("res",res);
      
      toast.success('Category updated successfully');
      handleClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Failed to update category'
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
            Edit Category
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Update the category information
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
          <div className="grid grid-cols-1  gap-6">
            <Input
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            {/* <Input
              label="Position"
              name="position"
              type="number"
              value={formData.position}
              onChange={handleChange}
              required
            /> */}
          </div>

          <div className="w-full">
            <Select
              label="Status"
              value={formData.status}
              onChange={handleStatusChange}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>

          <div className="flex gap-4">
            <Button
              type="submit"
              color="blue"
              className="flex items-center gap-2"
            >
              <Save size={18} /> Update
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

export default EditCategory;
