import React, { useState, useEffect, useRef } from 'react';
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
  Textarea,
  Select,
  Option,
  CardHeader
} from '@material-tailwind/react';
import { X, Upload, Image as ImageIcon, ArrowBigLeft, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { bannerService } from '@/api/services/banner.service';
import { toast } from 'react-toastify';
import { categoryService } from '@/api/services/category.service';
import { getPlaceholderImage } from '@/utils/imageUtils';

const AddCarouselBanner = () => {
  const navigate = useNavigate();

  // File input ref - React way to access DOM elements
  const fileInputRef = useRef(null);

  // Force re-render key for image section
  const [imageKey, setImageKey] = useState(0);

  // Define form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    url: '',
    imageUrl: '',
    status: ''
  });

  // Preview image state
  const [previewImage, setPreviewImage] = useState('');
  const [imageFile, setImageFile] = useState(null);

  // Store and category options for select dropdowns
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.list();
        if (response.status === 200) {
          setCategoryOptions(response.data.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle select change - FIXED: Properly handle Material Tailwind Select
  const handleSelectChange = (name, value) => {
     console.log(`Setting ${name} to:`, value); // Debug log
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);
      setPreviewImage(objectUrl);

      setFormData(prev => ({
        ...prev,
        imageUrl: objectUrl
      }));
    }
  };

  // Alternative direct reset function
  const resetImageState = () => {
    // Clean up object URL
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }

    // Clear file input using ref
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    // Force re-render by updating key
    setImageKey(prev => prev + 1);

    // Reset state - do this last
    setPreviewImage('');
    setImageFile(null);
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  // FIXED: Handle removing the current image - simplified approach
  const handleRemoveImage = (e) => {
    // Stop all event propagation
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Call reset function
    resetImageState();
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = { ...formData, imageFile };
      const response = await bannerService.create(payload);
      console.log("create banner",response.data.data);
      
      if (response.status === 200 || response.status === 201) {
        toast.success("Banner Added Successfully");
        navigate(-1);
      } else {
        console.error("Failed to create banner:", response);
      }
    } catch (error) {
      console.error("Error while creating banner:", error);
    }
  };

  // Enhanced close handler
  const handleClose = () => {
    // Clean up object URL to prevent memory leaks
    if (previewImage && previewImage.startsWith('blob:')) {
      URL.revokeObjectURL(previewImage);
    }
    navigate(-1);
  };

  // Function to trigger file input click using ref
  const triggerFileInput = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // FIXED: Handle the upload area click - prevent when image exists
  const handleUploadAreaClick = (e) => {
    // If there's already a preview image, don't trigger file input
    if (previewImage) {
      return; // Just return, don't prevent anything
    }
    // Use ref instead of getElementById
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className=" min-h-screen max-w-7xl mx-auto my-10 ">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-4">
                <div className="flex items-center justify-between">
                  <Button
                    variant="text"
                    onClick={handleClose}
                    className="p-2"
                  >
                    <ArrowLeft size={24} color='white' />
                  </Button>
                  <Typography variant="h4" color="white">
                    Add New Banner
                  </Typography>
                  <div className="w-6" />
                </div>
              </CardHeader>

        <CardBody className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner Image Upload */}
            <div key={imageKey} className="space-y-2">
              <Typography variant="small" color="blue-gray" className="font-medium">
                Banner Image
              </Typography>

              <div
                className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer  hover:bg-gray-100 transition-colors"
                onClick={handleUploadAreaClick}
                style={{ minHeight: '200px' }}
              >
                {previewImage ? (
                  <div className="relative w-full max-w-lg mx-auto mb-4">
                    <img
                      src={previewImage }
                      alt="Banner preview"
                      className="w-full h-48 object-contain rounded-md border"
                      onError={(e) => {
                        console.error('Image failed to load:', previewImage);
                        e.target.src = getPlaceholderImage(400, 200, 'Image not found');
                        toast.error('Failed to load image. Please check the image URL.');
                      }}
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
                        onClick={handleRemoveImage}
                        style={{ zIndex: 10 }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon size={48} className="text-blue-gray-300 mb-2" />
                    <Typography variant="lead" className="text-center text-blue-gray-500">
                      Click here to browse the images
                    </Typography>
                    <Typography variant="small" className="text-center text-blue-gray-400 mt-1">
                      Recommended size: 1200×400 pixels
                    </Typography>

                    <Button
                      variant="outlined"
                      color="blue"
                      className="mt-4 flex items-center gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                    >
                      <Upload size={16} />
                      Upload Image
                    </Button>
                  </div>
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

            {/* Banner Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Banner Name *
                </Typography>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  label="Enter banner name"
                  required
                />
              </div>

              {/* FIXED: Category Select using selected prop instead of value */}
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Category *
                </Typography>
                <Select
                  selected={(element) => {
                    if (element && React.isValidElement(element)) {
                      const selectedCategory = categoryOptions.find(cat => cat._id === formData.category);
                      return selectedCategory ? selectedCategory.name : '';
                    }
                    return '';
                  }}
                  onChange={(value) => handleSelectChange('category', value)}
                  label="Select Category"
                  required
                >
                  {categoryOptions.map((cat) => (
                    <Option key={cat._id} value={cat._id}>
                      {cat.name}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>

            {/* Link URL and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Link URL *
                </Typography>
                <Input
                  name="url"
                  value={formData.url}
                  onChange={handleChange}
                  label="https://example.com/page"
                  required
                  type='url'
                />
              </div>

              {/* FIXED: Status Select using selected prop instead of value */}
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Status *
                </Typography>
                <Select
                  selected={(element) => {
                    if (element && React.isValidElement(element)) {
                      const statusLabels = {
                        'active': 'Active',
                        'inactive': 'Inactive'
                      };
                      return statusLabels[formData.status] || '';
                    }
                    return '';
                  }}
                  onChange={(value) => handleSelectChange('status', value)}
                  label="Select Status"
                  required
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </div>
          </form>
        </CardBody>

        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button variant="outlined" color="red" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="gradient" color="blue" onClick={handleSubmit}>
            Add Banner
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AddCarouselBanner;