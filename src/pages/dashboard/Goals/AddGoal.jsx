import React, { useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Input,
  Button,
  Select,
  Option,
  Textarea,
} from '@material-tailwind/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { goalsService } from '@/api/services/goals.service';

const AddGoal = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (value) => {
    setFormData((prev) => ({ ...prev, status: value }));
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      const res =await goalsService.create({
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      toast.success('Goal created successfully');
      console.log("this is created goal",res);
      
      handleClose();
    } catch (error) {
      console.log("error", error);
      toast.error(
        error?.response?.data?.message || 'Failed to create goal'
      );
    }
  };

  return (
    <Card className='min-h-screen max-w-7xl mx-auto my-10 rounded-2xl'>
      <CardHeader
        variant="gradient"
        color="blue"
        className="mb-4 p-6 flex justify-between items-center"
      >
        <div>
          <Typography variant="h6" color="white">
            Add Goal
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Fill the form to add a new goal
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
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Goal Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <Textarea
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <div className="w-full">
            <Select
              label="Status"
              value={formData.status}
              onChange={handleStatusChange}
            >
              <Option value="draft">Draft</Option>
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

export default AddGoal;