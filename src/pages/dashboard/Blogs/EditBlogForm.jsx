import React, { useState, useEffect, useRef } from "react";
import {
    Card, CardHeader, CardBody, Input, Button, Typography, Select, Option
} from "@material-tailwind/react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Upload, ImageIcon, X, ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { categoryService } from "@/api/services/category.service";
import { blogService } from "@/api/services/blog.service";
import {
    getImageUrl,
    getPlaceholderImage,
    validateImageFile,
    createBlobUrl,
    cleanupBlobUrl
} from '@/utils/imageUtils';

const EditBlogForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [imageKey, setImageKey] = useState(0);
    const [imageChanged, setImageChanged] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState('');
    const [categories, setCategories] = useState([]);

    const [formData, setFormData] = useState({
        author: "",
        title: "",
        category: "",
        status: "active",
        content: "",
        imageUrl: "",
    });

    // Fetch categories first
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const catRes = await categoryService.list();
                setCategories(catRes.data.data.categories);
            } catch (err) {
                console.error('Error fetching categories:', err);
                toast.error('Failed to fetch categories');
            }
        };

        fetchCategories();
    }, []);

    // Fetch blog data after categories are loaded
    useEffect(() => {
        const fetchBlog = async () => {
            try {
                if (!id) {
                    toast.error("Invalid blog ID");
                    setIsLoading(false);
                    return;
                }

                const res = await blogService.getById(id);

                if (res?.status === 200 && res.data?.data) {
                    const blog = res.data.data;

                    // Set form data with proper category ID
                    const newFormData = {
                        author: blog.author || '',
                        title: blog.title || '',
                        category: blog.category?._id || '',
                        status: blog.status || 'active',
                        content: blog.content || '',
                        imageUrl: blog.titleImage || '',
                    };

                    setFormData(newFormData);

                    // Use the utility function to get the proper image URL
                    if (blog.titleImage) {
                        const imageUrl = getImageUrl(blog.titleImage);
                        setPreviewImage(imageUrl);
                    }
                } else {
                    toast.error("Blog not found");
                }
            } catch (err) {
                console.error("Error fetching blog:", err);
                toast.error("Failed to fetch blog data");
            } finally {
                setIsLoading(false);
            }
        };

        // Only fetch blog after categories are loaded
        if (categories.length > 0) {
            fetchBlog();
        }
    }, [id, categories]);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSelectChange = (name, value) => {
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
            setImageChanged(true);
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

        // Validation
        if (!formData.title.trim()) {
            toast.error("Please enter blog title");
            return;
        }
        if (!formData.author.trim()) {
            toast.error("Please enter author name");
            return;
        }
        if (!formData.category) {
            toast.error("Please select a category");
            return;
        }
        if (!formData.content.trim()) {
            toast.error("Please enter blog content");
            return;
        }

        try {
            // Create payload similar to editCarouselForm
            const payload = { ...formData }

            if (imageChanged) {
                payload.titleImage = imageFile; // ✅ CORRECTED: match backend field name
            }


        //    console.log("payload data", payload);

            const res = await blogService.update(id, payload);

            if (res.status === 200) {
                toast.success('Blog updated successfully');
                navigate(-1);
            }
        } catch (err) {
            console.error('Update error:', err);
            toast.error(err.response?.data?.message || 'Update failed');
        }
    };

    const handleClose = () => {
        // Clean up blob URL before closing
        cleanupBlobUrl(previewImage);
        navigate(-1);
    };

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            cleanupBlobUrl(previewImage);
        };
    }, [previewImage]);

    if (isLoading) {
        return (
            <div className="w-full h-screen flex items-center justify-center">
                <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            </div>
        );
    }

    return (
        <Card className="min-h-screen max-w-7xl mx-auto my-10 rounded-2xl">
            <CardHeader variant="gradient" color="blue" className="p-4">
                <div className="flex items-center justify-between">
                    <Button variant="text" onClick={handleClose} className="p-2">
                        <ArrowLeft size={24} color="white" />
                    </Button>
                    <Typography variant="h4" color="white">
                        Edit Blog
                    </Typography>
                    <div className="w-6" />
                </div>
            </CardHeader>

            <CardBody className="flex flex-col gap-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Blog Image */}
                    <div key={imageKey} className="space-y-2">
                        <Typography variant="small" color="blue-gray" className="font-medium">
                            Blog Image
                        </Typography>
                        <div
                            className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => !previewImage && fileInputRef.current?.click()}
                        >
                            {previewImage ? (
                                <div className="relative w-full max-w-lg mx-auto mb-4">
                                    <img
                                        src={previewImage}
                                        alt="Blog preview"
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
                                            className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
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
                                            fileInputRef.current?.click();
                                        }}
                                    >
                                        <Upload size={16} /> Upload Image
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

                    {/* Author and Title */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                Author Name *
                            </Typography>
                            <Input
                                name="author"
                                value={formData.author}
                                onChange={handleChange}
                                required
                                label="Enter author name"
                            />
                        </div>

                        <div>
                            <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                                Blog Title *
                            </Typography>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                                label="Enter blog title"
                            />
                        </div>
                    </div>

                    {/* Category and Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {categories.map((cat) => (
                                    <Option key={cat._id} value={cat._id}>
                                        {cat.name}
                                    </Option>
                                ))}
                            </Select>
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

                    {/* Rich Text Editor */}
                    <div>
                        <Typography variant="small" color="blue-gray" className="mb-2 font-medium">
                            Blog Content *
                        </Typography>
                        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
                            <ReactQuill
                                theme="snow"
                                value={formData.content}
                                onChange={(value) => setFormData(prev => ({ ...prev, content: value }))}
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
                            />
                        </div>
                    </div>

                    <style>
                        {`.ql-editor { min-height: 200px; }`}
                    </style>
                </form>
            </CardBody>

            <div className="flex justify-end gap-2 p-6 pt-0">
                <Button variant="outlined" color="red" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="gradient" color="blue" onClick={handleSubmit}>
                    Update Blog
                </Button>
            </div>
        </Card>
    );
};

export default EditBlogForm;