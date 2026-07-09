import React, { useEffect, useState } from 'react';
import { Upload, Plus, Minus, ArrowLeft, Package } from 'lucide-react';
import {
    Button,
    Card,
    CardHeader,
    CardBody,
    CardFooter,
    Typography,
    Input,
    Select,
    Option,
    Textarea,
    Checkbox,
    Chip
} from '@material-tailwind/react';
import { useNavigate } from 'react-router-dom';
import { categoryService } from '@/api/services/category.service';
import { brandService } from '@/api/services/brand.service';
import { productService } from '@/api/services/product.service';
import { toast } from 'react-toastify';
import ImagePreviewGallery from '@/widgets/components/ImagePreview';
import { storeService } from '@/api/services/stores.service';

const ProductForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        brand: '',
        store: '',
        category: '',
        startingPrice: '',
        sellingPrice: '',
        earningRate: '',
        description: '',
        dealsDetails: '',
        productUrl: '',
        trackingUrl: '',
        inStock: true,
        status: 'active',
        isUpcoming: false,
        expiryDate: '',
        seoTitle: '',
        seoDescription: '',
        tags: ['']
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const [selectedLogo, setSelectedLogo] = useState(null);
    const [selectedImages, setSelectedImages] = useState([]);
    const [offers, setOffers] = useState(['']);
    const [errors, setErrors] = useState({});

    // Options for select dropdowns
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [brandsOptions, setBrandsOptions] = useState([]);
    const [storeOptions, setStoreOptions] = useState([]);

    // Fetch data on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, brandsRes, storesRes] = await Promise.all([
                    categoryService.list(),
                    brandService.list(),
                    storeService.list()
                ]);

                if (categoriesRes.status === 200) {
                    setCategoryOptions(categoriesRes.data.data.categories);
                }
                if (brandsRes.status === 200) {
                    setBrandsOptions(brandsRes.data.data.brandData || []);
                }
                if (storesRes.status === 200) {
                    setStoreOptions(storesRes.data.data.storeData || []);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                toast.error("Failed to load form data.");
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (formData.store) {
            const selectedStoreObj = storeOptions.find(s => s._id === formData.store);
            if (selectedStoreObj && selectedStoreObj.earn) {
                handleInputChange('earningRate', selectedStoreObj.earn);
            }
        }
    }, [formData.store, storeOptions]);

    const statusOptions = ['active', 'inactive', 'draft'];

    const handleInputChange = (path, value) => {
        const keys = path.split('.');
        setFormData(prev => {
            const newData = { ...prev };
            let current = newData;

            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }

            current[keys[keys.length - 1]] = value;
            return newData;
        });

        // Clear error when user starts typing
        setErrors(prev => ({ ...prev, [path]: '' }));
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedLogo({
                    file: file,
                    preview: e.target.result,
                    name: file.name
                });
            };
            reader.readAsDataURL(file);
        }
        setErrors(prev => ({ ...prev, logo: '' }));
    };

    const handleSliderImagesUpload = (e) => {
        const files = Array.from(e.target.files);
        if (selectedImages.length + files.length > 10) {
            setErrors(prev => ({ ...prev, images: 'Maximum 10 slider images allowed' }));
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setSelectedImages(prev => [...prev, {
                    file: file,
                    preview: e.target.result,
                    name: file.name
                }]);
            };
            reader.readAsDataURL(file);
        });
        setErrors(prev => ({ ...prev, images: '' }));
    };

    const removeImage = (index) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const addOffer = () => {
        setOffers(prev => [...prev, '']);
    };

    const removeOffer = (index) => {
        setOffers(prev => prev.filter((_, i) => i !== index));
    };

    const updateOffer = (index, value) => {
        setOffers(prev => prev.map((offer, i) => i === index ? value : offer));
    };

    const addTag = () => {
        setFormData(prev => ({
            ...prev,
            tags: [...prev.tags, '']
        }));
    };

    const removeTag = (index) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter((_, i) => i !== index)
        }));
    };

    const updateTag = (index, value) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.map((tag, i) => i === index ? value : tag)
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name) newErrors.name = 'Product name is required';
        if (!formData.brand) newErrors.brand = 'Brand is required';
        if (!formData.store) newErrors.store = 'Store is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.startingPrice) newErrors.startingPrice = 'Starting price is required';
        if (!formData.sellingPrice) newErrors.sellingPrice = 'Selling price is required';
        if (!formData.earningRate) newErrors.earningRate = 'Earning rate is required';
        if (!formData.productUrl) newErrors.productUrl = 'Product URL is required';
        if (!formData.trackingUrl) newErrors.trackingUrl = 'Tracking URL is required';
        if (!selectedLogo) newErrors.logo = 'Product logo is required';

        // Validate earning rate format
        if (formData.earningRate && !/^\d+(\.\d+)?%?$/.test(formData.earningRate) && !/^fixed:\d+(\.\d+)?$/.test(formData.earningRate)) {
            newErrors.earningRate = 'Earning rate must be a percentage (e.g., "12.5%") or fixed amount (e.g., "fixed:100")';
        }

        // Validate URLs
        const urlPattern = /^https?:\/\/.+/;
        if (formData.productUrl && !urlPattern.test(formData.productUrl)) {
            newErrors.productUrl = 'Product URL must be a valid HTTP/HTTPS URL';
        }
        if (formData.trackingUrl && !urlPattern.test(formData.trackingUrl)) {
            newErrors.trackingUrl = 'Tracking URL must be a valid HTTP/HTTPS URL';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            toast.error("Please correct the highlighted errors.");
            return;
        }

        try {
            setIsSubmitting(true);

            const productData = {
                ...formData,
                logo: selectedLogo,
                sliderImages: selectedImages,
                availableOffers: offers.filter(offer => offer.trim() !== ''),
                startingPrice: Number(formData.startingPrice),
                sellingPrice: Number(formData.sellingPrice),
                tags: formData.tags.filter(tag => tag.trim() !== '')
            };

            const response = await productService.create(productData);

            if (response.status === 200 || response.status === 201) {
                toast.success('Product created successfully!');
                navigate(-1);
            } else {
                throw new Error('Failed to create product');
            }

        } catch (error) {
            console.error('Error creating product:', error);

            if (error.response) {
                const errorMessage = error.response.data?.message || 'Failed to create product';
                toast.error(`Error: ${errorMessage}`);
                if (error.response.data?.errors) {
                    setErrors(error.response.data.errors);
                }
            } else if (error.request) {
                toast.error('Network error. Please check your connection and try again.');
            } else {
                toast.error('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        navigate(-1);
    };

    return (
        <Card className="min-h-screen max-w-7xl mx-auto mt-6 shadow-lg">
            <CardHeader variant="gradient" color="blue" className="p-4">
                <div className="flex items-center justify-between">
                    <Button
                        variant="text"
                        onClick={handleClose}
                        className="p-2"
                    >
                        <ArrowLeft size={24} />
                    </Button>
                    <Typography variant="h4" color="white">
                        Add New Product
                    </Typography>
                    <div className="w-6" />
                </div>
            </CardHeader>

            <CardBody className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Product Information */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Product Details
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    label="Product Name"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    error={!!errors.name}
                                    required
                                />
                                {errors.name && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.name}
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Select
                                    label="Brand"
                                    value={formData.brand}
                                    onChange={(value) => handleInputChange('brand', value)}
                                    error={!!errors.brand}
                                    required
                                    selected={(element) => {
                                        const selectedBrand = brandsOptions.find(b => b._id === formData.brand);
                                        return selectedBrand ? selectedBrand.name : '';
                                    }}
                                >
                                    {brandsOptions.map((brand) => (
                                        <Option key={brand._id} value={brand._id}>
                                            {brand.name}
                                        </Option>
                                    ))}
                                </Select>
                                {errors.brand && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.brand}
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Select
                                    label="Store"
                                    value={formData.store}
                                    onChange={(value) => handleInputChange('store', value)}
                                    error={!!errors.store}
                                    required
                                    selected={(element) => {
                                        const selectedStore = storeOptions.find(s => s._id === formData.store);
                                        return selectedStore ? selectedStore.name : '';
                                    }}
                                >
                                    {storeOptions.map((store) => (
                                        <Option key={store._id} value={store._id}>
                                            {store.name}
                                        </Option>
                                    ))}
                                </Select>
                                {errors.store && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.store}
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Select
                                    label="Category"
                                    value={formData.category}
                                    onChange={(value) => handleInputChange('category', value)}
                                    error={!!errors.category}
                                    required
                                    selected={(element) => {
                                        const selectedCategory = categoryOptions.find(cat => cat._id === formData.category);
                                        return selectedCategory ? selectedCategory.name : '';
                                    }}
                                >
                                    {categoryOptions.map((cat) => (
                                        <Option key={cat._id} value={cat._id}>
                                            {cat.name}
                                        </Option>
                                    ))}
                                </Select>
                                {errors.category && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.category}
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Pricing
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <Input
                                    type="number"
                                    label="Starting Price"
                                    value={formData.startingPrice}
                                    onChange={(e) => handleInputChange('startingPrice', e.target.value)}
                                    error={!!errors.startingPrice}
                                    required
                                />
                                {errors.startingPrice && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.startingPrice}
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Input
                                    type="number"
                                    label="Selling Price"
                                    value={formData.sellingPrice}
                                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                                    error={!!errors.sellingPrice}
                                    required
                                />
                                {errors.sellingPrice && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.sellingPrice}
                                    </Typography>
                                )}
                            </div>
                            <div>
    <Input
        label="Earning Rate (% or fixed:amount)"
        placeholder="e.g., 12.5% or fixed:100"
        value={formData.earningRate}
        onChange={(e) => handleInputChange('earningRate', e.target.value)}
        error={!!errors.earningRate}
        required
        disabled={!!formData.store} // Disabled if store selected
    />
    {errors.earningRate && (
        <Typography color="red" className="mt-1 text-sm">
            {errors.earningRate}
        </Typography>
    )}
</div>
                        </div>
                    </div>

                    {/* Description & Deal Details */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Product Information
                        </Typography>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Textarea
                                    label="Product Description"
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                />
                            </div>
                            <div>
                                <Textarea
                                    label="Deal Details"
                                    value={formData.dealsDetails}
                                    onChange={(e) => handleInputChange('dealsDetails', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Logo Upload */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Product Logo (Required)
                        </Typography>
                        <div className="mb-4">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <Typography color="gray" className="text-sm">
                                        <span className="font-semibold">Click to upload logo</span>
                                    </Typography>
                                    <Typography color="gray" className="text-xs">
                                        PNG, JPG, GIF up to 10MB
                                    </Typography>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </label>
                            {errors.logo && (
                                <Typography color="red" className="mt-1 text-sm">
                                    {errors.logo}
                                </Typography>
                            )}
                        </div>
                        {selectedLogo && (
                            <div className="mt-4">
                                <img
                                    src={selectedLogo.preview}
                                    alt="Logo preview"
                                    className="h-20 w-20 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>

                    {/* Slider Images */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Slider Images (Max 10)
                        </Typography>
                        <div className="mb-4">
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                    <Typography color="gray" className="text-sm">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </Typography>
                                    <Typography color="gray" className="text-xs">
                                        PNG, JPG, GIF up to 10MB
                                    </Typography>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleSliderImagesUpload}
                                    className="hidden"
                                    disabled={selectedImages.length >= 10}
                                />
                            </label>
                            {errors.images && (
                                <Typography color="red" className="mt-1 text-sm">
                                    {errors.images}
                                </Typography>
                            )}
                        </div>
                        {selectedImages.length > 0 && (
                            <ImagePreviewGallery images={selectedImages} onRemove={removeImage} />
                        )}
                    </div>

                    {/* URLs */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            URLs
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Input
                                    type="url"
                                    label="Product URL"
                                    value={formData.productUrl}
                                    onChange={(e) => handleInputChange('productUrl', e.target.value)}
                                    error={!!errors.productUrl}
                                    required
                                />
                                {errors.productUrl && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.productUrl}
                                    </Typography>
                                )}
                            </div>
                            <div>
                                <Input
                                    type="url"
                                    label="Tracking URL"
                                    value={formData.trackingUrl}
                                    onChange={(e) => handleInputChange('trackingUrl', e.target.value)}
                                    error={!!errors.trackingUrl}
                                    required
                                />
                                {errors.trackingUrl && (
                                    <Typography color="red" className="mt-1 text-sm">
                                        {errors.trackingUrl}
                                    </Typography>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status and Settings */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            Status & Settings
                        </Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center">
                                <Checkbox
                                    label="In Stock"
                                    checked={formData.inStock}
                                    onChange={(e) => handleInputChange('inStock', e.target.checked)}
                                />
                            </div>
                            <div className="flex items-center">
                                <Checkbox
                                    label="Is Upcoming Product"
                                    checked={formData.isUpcoming}
                                    onChange={(e) => handleInputChange('isUpcoming', e.target.checked)}
                                />
                            </div>
                            <div>
                                <Select
                                    label="Status"
                                    value={formData.status}
                                    onChange={(value) => handleInputChange('status', value)}
                                >
                                    {statusOptions.map(status => (
                                        <Option key={status} value={status}>
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                            <div>
                                <Input
                                    type="datetime-local"
                                    label="Expiry Date"
                                    value={formData.expiryDate}
                                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Available Offers */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h5" color="blue-gray">
                                Available Offers
                            </Typography>
                            <Button
                                size="sm"
                                color="blue"
                                onClick={addOffer}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Offer
                            </Button>
                        </div>
                        {offers.map((offer, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <Input
                                    value={offer}
                                    onChange={(e) => updateOffer(index, e.target.value)}
                                    placeholder="Enter offer details"
                                    className="flex-1"
                                />
                                <Button
                                    size="sm"
                                    color="red"
                                    onClick={() => removeOffer(index)}
                                >
                                    <Minus size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* SEO Settings */}
                    <div>
                        <Typography variant="h5" color="blue-gray" className="mb-4">
                            SEO Settings
                        </Typography>
                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <Input
                                    label="SEO Title (max 60 characters)"
                                    value={formData.seoTitle}
                                    onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                                    maxLength={60}
                                />
                                <Typography color="gray" className="text-xs mt-1">
                                    {formData.seoTitle.length}/60 characters
                                </Typography>
                            </div>
                            <div>
                                <Textarea
                                    label="SEO Description (max 160 characters)"
                                    value={formData.seoDescription}
                                    onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                                    maxLength={160}
                                />
                                <Typography color="gray" className="text-xs mt-1">
                                    {formData.seoDescription.length}/160 characters
                                </Typography>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <Typography variant="h5" color="blue-gray">
                                Tags
                            </Typography>
                            <Button
                                size="sm"
                                color="blue"
                                onClick={addTag}
                                className="flex items-center gap-2"
                            >
                                <Plus size={16} />
                                Add Tag
                            </Button>
                        </div>
                        {formData.tags.map((tag, index) => (
                            <div key={index} className="flex items-center gap-2 mb-2">
                                <Input
                                    value={tag}
                                    onChange={(e) => updateTag(index, e.target.value)}
                                    placeholder="Enter tag"
                                    className="flex-1"
                                />
                                <Button
                                    size="sm"
                                    color="red"
                                    onClick={() => removeTag(index)}
                                >
                                    <Minus size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                </form>
            </CardBody>

            <CardFooter className="flex justify-end pt-4 border-t border-gray-200">
                <Button
                    type="submit"
                    color="green"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                >
                    <Package size={16} />
                    {isSubmitting ? 'Creating Product...' : 'Create Product'}
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ProductForm;