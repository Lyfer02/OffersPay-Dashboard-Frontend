import React, { useState, useEffect, useRef } from 'react';
import {
  Button, Card, CardBody, CardFooter, Typography,
  Input, Select, Option, CardHeader
} from '@material-tailwind/react';
import { X, Upload, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryService } from '@/api/services/category.service';
import { bannerService } from '@/api/services/banner.service';
import { toast } from 'react-toastify';
import { 
  getImageUrl, 
  getPlaceholderImage, 
  validateImageFile, 
  createBlobUrl, 
  cleanupBlobUrl 
} from '@/utils/imageUtils';


const EditCarouselBanner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [imageKey, setImageKey] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    link: '',
    imageUrl: '',
    status: ''
  });

  // Fetch categories first
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catRes = await categoryService.list();
        setCategoryOptions(catRes.data.data.categories);
      } catch (err) {
        console.error('Error fetching categories:', err);
        toast.error('Failed to fetch categories');
      }
    };

    fetchCategories();
  }, []);

  // Fetch banner data after categories are loaded
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        if (!id) {
          toast.error("Invalid banner ID");
          setIsLoading(false);
          return;
        }

        const res = await bannerService.getById(id);
        console.log("this",res);
        
        if (res?.status === 200 && res.data?.data) {
          const b = res.data.data;
          
          // Set form data with proper category ID
          const newFormData = {
            name: b.name || '',
            category: b.category?._id || '',
            url: b.url || '',
            imageUrl: b.image || '',
            status: b.status || ''
          };
          
          //console.log('Banner data:', b);
          //console.log('Setting category ID:', b.category?._id);
          
          setFormData(newFormData);
          
          // Use the utility function to get the proper image URL
          if (b.image) {
            const imageUrl = getImageUrl(b.image);
            setPreviewImage(imageUrl);
          }
        } else {
          toast.error("Banner not found");
        }
      } catch (err) {
        console.error("Error fetching banner:", err);
        toast.error("Failed to fetch banner data");
      } finally {
        setIsLoading(false);
      }
    };

    // Only fetch banner after categories are loaded
    if (categoryOptions.length > 0) {
      fetchBanner();
    }
  }, [id, categoryOptions]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSelectChange = (name, value) => {
    //console.log(`Setting ${name} to:`, value);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file using utility function
      const validation = validateImageFile(file, {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      setImageFile(file);
      const objectUrl = createBlobUrl(file);
      setPreviewImage(objectUrl);
    }
  };

  const handleRemoveImage = () => {
    // Clean up blob URL if it exists
    cleanupBlobUrl(previewImage);
    setImageFile(null);
    setPreviewImage('');
    setImageKey(prev => prev + 1);
    
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
 
        const payload = {...formData , imageFile}

    console.log("payload data",payload);
    
    const res = await bannerService.update(id, payload);
    
    if (res.status === 200) {
      toast.success('Banner updated successfully');
      navigate(-1);
    }
  } catch (err) {
    console.error('Update error:', err);
    toast.error(err.response?.data?.message || 'Update failed');
  }
};

  const handleClose = () => {
    cleanupBlobUrl(previewImage);
    navigate(-1);
  };

  useEffect(() => {
    return () => {
      cleanupBlobUrl(previewImage);
    };
  }, [previewImage]);


  if (isLoading) {
    return (
      <div className="mt-12 mb-8 flex justify-center">
        <Typography>Loading...</Typography>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="light-blue" className="p-2">
          <div className="flex justify-between items-center">
            <Button variant="text" onClick={handleClose}>
              <ArrowLeft color='black' size={20} />
            </Button>
            <Typography variant="h5" color="black" className='pr-2'>
              Edit Carousel Banner
            </Typography>
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Banner Image */}
            <div key={imageKey} className="space-y-2">
              <Typography variant="small" color="blue-gray" className="font-medium">
                Banner Image
              </Typography>
              <div 
                className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => !previewImage && fileInputRef.current?.click()}
              >
                {previewImage ? (
                  <div className="relative w-full max-w-lg mx-auto mb-4">
                    <img 
                      src={previewImage} 
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
                        className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors  shadow-lg " 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveImage();
                        }}
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
                      Click here browse the images
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
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload size={16}  /> Upload Image
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

            {/* Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Banner Name *
                </Typography>
                <Input 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                  label="Enter banner name"
                />
              </div>

              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Category *
                </Typography>
                <Select 
                  value={formData.category} 
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

            {/* Link and Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Link URL *
                </Typography>
                <Input 
                  name="Url" 
                  value={formData.url} 
                  onChange={handleChange} 
                  required 
                  label="https://example.com"
                  type="url"
                />
              </div>

              <div>
                <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                  Status *
                </Typography>
                <Select 
                  value={formData.status} 
                  onChange={(value) => handleSelectChange('status', value)} 
                  label="Select status"
                  required
                >
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                </Select>
              </div>
            </div>

            {/* Debug information - remove in production */}
            {/* {process.env.NODE_ENV === 'development' && (
              <div className="bg-gray-100 p-4 rounded text-sm">
                <p><strong>Debug Info:</strong></p>
                <p>Selected Category ID: {formData.category}</p>
                <p>Selected Category Name: {selectedCategory?.name || 'Not found'}</p>
                <p>Total Categories: {categoryOptions.length}</p>
              </div>
            )} */}
          </form>
        </CardBody>

        <CardFooter className="flex justify-end gap-2 pt-0">
          <Button variant="outlined" color="red" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="gradient" color="blue" onClick={handleSubmit}>
            Update Banner
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default EditCarouselBanner;