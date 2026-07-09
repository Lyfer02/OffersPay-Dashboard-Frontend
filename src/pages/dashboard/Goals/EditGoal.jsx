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
  Textarea,
} from '@material-tailwind/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Loader from '@/utils/Loader';
import { goalsService } from '@/api/services/goals.service';

const EditGoal = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);



  const fetchGoalDetails = async () => {
    setIsLoading(true);
    try {
      const res = await goalsService.getById(id);
      console.log("this is response ",res);
      
      const goalData = res.data?.data?.goals || res.data?.data;
      
      setFormData({
        name: goalData.name || '',
        description: goalData.description || '',
        status: goalData.status || 'active',
      });
    } catch (error) {
      console.error('Failed to fetch goal details:', error);
      toast.error('Failed to load goal details');
      navigate('/dashboard/goal/list');
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
     fetchGoalDetails();
   }, [id]);


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

    setIsLoading(true);
    try {
      await goalsService.updateById(id, {
        name: formData.name,
        description: formData.description,
        status: formData.status,
      });
      toast.success('Goal updated successfully');
      handleClose();
    } catch (error) {
      console.log("error", error);
      toast.error(
        error?.response?.data?.message || 'Failed to update goal'
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !formData.name) {
    return <Loader />;
  }

  return (
    <Card className='min-h-screen max-w-7xl mx-auto my-10 rounded-2xl'>
      <CardHeader
        variant="gradient"
        color="blue"
        className="mb-4 p-6 flex justify-between items-center"
      >
        <div>
          <Typography variant="h6" color="white">
            Edit Goal
          </Typography>
          <Typography variant="small" color="white" className="opacity-80">
            Update the goal details
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
        {isLoading ? (
          <Loader />
        ) : (
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
                disabled={isLoading}
              >
                <Save size={18} /> {isLoading ? 'Updating...' : 'Update'}
              </Button>
              <Button
                type="button"
                color="gray"
                variant="outlined"
                onClick={handleClose}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardBody>
    </Card>
  );
};

export default EditGoal;