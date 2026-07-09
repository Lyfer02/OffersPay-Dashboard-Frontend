import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Input,
  Button,
  Typography,
  Select,
  Option,
} from "@material-tailwind/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Upload, ImageIcon, X, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { categoryService } from "@/api/services/category.service";
import { blogService } from "@/api/services/blog.service";

const AddBlogForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    author: "",
    title: "",
    category: "",
    status: "active",
    content: "",
    titleImage: null, // 👈 single image (object with file, name, preview)
  });
   // Preview image state
    const [previewImage, setPreviewImage] = useState('');
  const [categories, setCategories] = useState([]);
  const fileInputRef = useRef(null);

  // Preview image state
  // const [previewImage, setPreviewImage] = useState('');
  const [imageFile, setImageFile] = useState(null);
  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.list();
        if (response.status === 200) {
          setCategories(response.data.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      }
    };

    fetchCategories();
    console.log("Category selected", form.category);

  }, [form.category]);



  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleUploadAreaClick = () => {
    triggerFileInput();
  };

  const handleClose = () => {
    navigate(-1);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    const preview = URL.createObjectURL(file);
    setPreviewImage(preview)
    setForm((prev) => ({
      ...prev,
      titleImage: { file, name: file.name, preview },
    }));
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({
      ...prev,
      titleImage: null,
    }));
    setPreviewImage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, imageFile }
    try {
      const response = await blogService.create(payload);
      console.log("this is response of add blog", response.data.message);


      toast.success(response.data.message);
      navigate(-1);
    }
    catch (err) {
      console.error("Error submitting blog:", err.response.data);
      toast.error(err.response.data.message);
    }
  };

//  const previewImage = form.titleImage?.preview;

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
            Add New Blog
          </Typography>
          <div className="w-6" />
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <CardBody className="grid gap-6 p-6 bg-white">
          <div className="grid md:grid-cols-2 gap-6">
            <Input
              label="Author Name"
              value={form.author}
              required
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />

            <Input
              label="Blog Title"
              value={form.title}
              required
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Select
              label="Select Category"
              required
              onChange={(val) => setForm({ ...form, category: val })}
              selected={(element) => {
                if (element && React.isValidElement(element)) {
                  const selectedCategory = categories.find(cat => cat._id === form.category);
                  return selectedCategory ? selectedCategory.name : '';
                }
                return '';
              }}
            >
              {categories.map((cat) => (
                <Option key={cat._id} value={cat._id}>
                  {cat.name}
                </Option>
              ))}
            </Select>

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

          {/* Title Image Upload - Single Image Only */}
          <div
            className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            onClick={handleUploadAreaClick}
            style={{ minHeight: "200px" }}
          >
            {previewImage ? (
              <div className="relative w-full max-w-lg mx-auto mb-4">
                <img
                  src={previewImage}
                  alt="Banner preview"
                  className="w-full h-48 object-contain rounded-md border"
                  onError={(e) => {
                    console.error("Image failed to load:", previewImage);
                    e.target.src = "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    toast?.error?.("Failed to load image. Please check the image file.");
                  }}
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
                  Click here to browse the image
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

          {/* Rich Text Editor */}
          <div>
            <Typography variant="small" className="mb-2 font-medium text-gray-700">
              Blog Content
            </Typography>
            <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(value) => setForm({ ...form, content: value })}
                className="min-h-[200px] text-gray-800"
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["blockquote", "code-block"],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                formats={[
                  "header",
                  "bold",
                  "italic",
                  "underline",
                  "strike",
                  "list",
                  "bullet",
                  "blockquote",
                  "code-block",
                  "link",
                  "image",
                ]}
              />
            </div>
          </div>
          <style>
            {`
              .ql-editor {
                min-height: 200px;
              }
            `}
          </style>

          <Button type="submit" color="blue" size="lg" className="mt-4">
            Submit Blog
          </Button>
        </CardBody>
      </form>
    </Card>
  );
};


export default AddBlogForm;
