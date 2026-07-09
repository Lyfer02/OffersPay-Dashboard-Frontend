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
  Chip,
  Checkbox,
} from "@material-tailwind/react";
import { Upload, ImageIcon, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { categoryService } from "@/api/services/category.service";
import { brandService } from "@/api/services/brand.service";
 // Assuming you have a brand service

const AddBrand = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    status: "active",
    category: [],
    brandImage: null, // single image (object with file, name, preview)
  });

  // Preview image state
  const [previewImage, setPreviewImage] = useState('');
  const fileInputRef = useRef(null);
  const [imageFile, setImageFile] = useState(null);
  
  // Category related states
  const [categories, setCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  // ✅ Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryService.list();
        if (res.status === 200) {
          setCategories(res.data.data.categories);
        }
      } catch (error) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAreaClick = () => {
    triggerFileInput();
  };

  const handleClose = () => {
    navigate(-1);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewImage(preview);
    setForm((prev) => ({
      ...prev,
      brandImage: { file, name: file.name, preview },
    }));
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      brandImage: null,
    }));
    setPreviewImage("");
    setImageFile(null);
  };

  // ✅ Toggle Category
  const handleToggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      category: prev.category.includes(id)
        ? prev.category.filter((catId) => catId !== id)
        : [...prev.category, id],
    }));
  };

  // ✅ Select All Categories
  const handleSelectAllCategories = () => {
    const allCategoryIds = categories.map(cat => cat._id);
    const isAllSelected = form.category.length === categories.length;
    
    setForm((prev) => ({
      ...prev,
      category: isAllSelected ? [] : allCategoryIds,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare data object that matches your service expectations
    const payload = {
      name: form.name,
      status: form.status,
      category: form.category,
      BrandImage: imageFile // This will be sent as 'image' field by your service
    };
    
  //  console.log("Payload being sent:", payload);
 //console.log("Category IDs:", form.category);
    try {
      const response = await brandService.create(payload);
      toast.success(response.data.message);
      navigate(-1);
    } catch (err) {
      console.error("Error creating brand:", err.response?.data || err);
      toast.error(err.response?.data?.message || "Failed to create brand");
    }
  };

  const isAllCategoriesSelected = form.category.length === categories.length && categories.length > 0;

  return (
    <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
      <CardHeader variant="gradient" color="blue" className="p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="text"
            onClick={handleClose}
            className="p-2">
            <ArrowLeft size={24} color="white" />
          </Button>
          <Typography variant="h4" color="white">
            Add New Brand
          </Typography>
          <div className="w-6" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <CardBody className="grid gap-6 p-6 bg-white">
          
          {/* Brand Name and Status */}
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Brand Name"
              value={form.name}
              required
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Select
              label="Status"
              value={form.status}
              required
              onChange={(val) => setForm({ ...form, status: val })}
            >
              <Option value="active">Active</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
          </div>

          {/* ✅ Category Multi-Select */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-gray-700">
              Select Categories
            </Typography>
            <div
              className="border border-gray-300 rounded-lg p-3 cursor-pointer min-h-[48px] flex items-center"
              onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            >
              {form.category.length > 0
                ? form.category
                    .map(
                      (id) =>
                        categories.find((cat) => cat._id === id)?.name ||
                        "Unknown"
                    )
                    .join(", ")
                : "Select Categories"}
            </div>

            {showCategoryDropdown && (
              <div className="border border-gray-200 rounded-lg p-4 mt-2 bg-white max-h-60 overflow-auto shadow-lg z-50">
                {/* Select All Option */}
                <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-200">
                  <Checkbox
                    label="Select All Categories"
                    checked={isAllCategoriesSelected}
                    onChange={handleSelectAllCategories}
                    className="font-medium"
                  />
                </div>
                
                {categories.map((cat) => (
                  <div key={cat._id} className="flex items-center gap-3 mb-2">
                    <Checkbox
                      label={cat.name}
                      checked={form.category.includes(cat._id)}
                      onChange={() => handleToggleCategory(cat._id)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Selected Categories Chips */}
            <div className="flex flex-wrap gap-2 mt-2">
              {form.category.map((id) => {
                const category = categories.find((c) => c._id === id);
                return (
                  <Chip
                    key={id}
                    value={category?.name || "Unknown"}
                    onClose={() =>
                      setForm((prev) => ({
                        ...prev,
                        category: prev.category.filter((c) => c !== id),
                      }))
                    }
                  />
                );
              })}
            </div>
          </div>

          {/* Brand Image Upload */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-gray-700">
              Brand Image
            </Typography>
            <div
              className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={handleUploadAreaClick}
              style={{ minHeight: "200px" }}
            >
              {previewImage ? (
                <div className="relative w-full max-w-lg mx-auto mb-4">
                  <img
                    src={previewImage || '/img/noimage.jpeg'}
                    alt="Brand preview"
                    className="w-full h-48 object-contain rounded-md border"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      type="button"
                      className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-colors"
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
                    Click here to browse the brand image
                  </Typography>
                  <Typography variant="small" className="text-center text-blue-gray-400 mt-1">
                    Recommended size: 400×400 pixels
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

          <Button type="submit" color="blue" size="lg" className="mt-4">
            Create Brand
          </Button>
        </CardBody>
      </form>
    </Card>
  );
};

export default AddBrand;