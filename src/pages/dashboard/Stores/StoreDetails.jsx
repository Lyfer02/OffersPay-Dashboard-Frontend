import React, { useEffect, useState } from "react";
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Chip,
} from "@material-tailwind/react";
import { useNavigate, useParams } from "react-router-dom";
import {
    ArrowLeft,
    Edit,
    ExternalLink,
    Calendar,
    Star,
    TrendingUp,
    DollarSign,
    Clock,
    CheckCircle,
    Info,
    Network,
    Key,
    Shield,
    Link,
    Hash,
    Globe,
    Settings,
    Eye,
    EyeOff,
    Copy
} from "lucide-react";
import { useAuth } from "@/pages/auth/authContext";
import { handleImgError } from "@/utils/handleImageError";
import { storeService } from "@/api/services/stores.service";
import { toast } from "react-toastify";

const StoreDetails = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { id } = useParams();
    const { canEdit } = useAuth();

    const [storeData, setStoreData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSensitiveData, setShowSensitiveData] = useState({
        apiKey: false,
        authTokens: false,
        credentials: false
    });
    
    const fetchStore = async () => {
        try {
            const res = await storeService.getById(id);
            console.log("Store details response:", res);
            setStoreData(res.data?.data);
        } catch (error) {
            console.error("Error fetching store details:", error);
            toast.error("Failed to fetch store details");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStore();
    }, [id]);

    const handleBack = () => navigate(-1);
    
    const handleEditStore = (store, event) => {
        event.stopPropagation();
        navigate(`/dashboard/stores/edit/${store._id}`);
    };

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            })
            : "N/A";

    const getImageUrl = (image) => {
        if (!image) return "";
        if (image.startsWith("http")) return image;
        return `${apiUrl}/${image}`;
    };

    const renderStarRating = (rating) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        size={16}
                        className={`${
                            i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                        }`}
                    />
                ))}
                <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
            </div>
        );
    };

    const parseTermsAndConditions = (terms) => {
        if (!terms || !Array.isArray(terms)) return [];
        
        const allTerms = [];
        
        terms.forEach(term => {
            try {
                let parsed = term;
                
                // Keep parsing nested JSON until we get to the actual content
                while (typeof parsed === 'string' && (parsed.startsWith('[') || parsed.startsWith('"'))) {
                    try {
                        parsed = JSON.parse(parsed);
                    } catch {
                        break;
                    }
                }
                
                // If parsed is an array, extract all items
                if (Array.isArray(parsed)) {
                    parsed.forEach(item => {
                        let cleanItem = item;
                        // Further parse if needed
                        while (typeof cleanItem === 'string' && (cleanItem.startsWith('[') || cleanItem.startsWith('"'))) {
                            try {
                                cleanItem = JSON.parse(cleanItem);
                            } catch {
                                break;
                            }
                        }
                        
                        // If it's still an array, flatten it
                        if (Array.isArray(cleanItem)) {
                            allTerms.push(...cleanItem.filter(t => typeof t === 'string' && t.trim()));
                        } else if (typeof cleanItem === 'string' && cleanItem.trim()) {
                            allTerms.push(cleanItem.trim());
                        }
                    });
                } else if (typeof parsed === 'string' && parsed.trim()) {
                    allTerms.push(parsed.trim());
                }
            } catch (error) {
                console.error("Error parsing term:", error);
                // If parsing fails, try to use the original term as string
                if (typeof term === 'string' && term.trim()) {
                    allTerms.push(term.trim());
                }
            }
        });
        
        return allTerms;
    };

    const toggleSensitiveDataVisibility = (field) => {
        setShowSensitiveData(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };

    const copyToClipboard = async (text, fieldName) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(`${fieldName} copied to clipboard`);
        } catch (err) {
            toast.error('Failed to copy to clipboard');
        }
    };

    const maskSensitiveData = (data, show) => {
        if (!data) return "Not Set";
        if (show) return data;
        return data.length > 10 ? `${data.substring(0, 10)}${'*'.repeat(data.length - 10)}` : '*'.repeat(data.length);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Typography variant="h6" color="blue-gray">
                    Loading store details...
                </Typography>
            </div>
        );
    }

    if (!storeData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Typography variant="h6" color="red">
                    Store not found
                </Typography>
            </div>
        );
    }

    const parsedTerms = parseTermsAndConditions(storeData.termsAndConditions);

    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                {/* Header Card */}
                <Card className="mb-8">
                    <CardHeader className="p-4" color="blue">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <Button
                                variant="text"
                                size="sm"
                                color="white"
                                onClick={handleBack}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft color="white" size={18} /> Back
                            </Button>
                            <Typography variant="h5" md:variant="h4" color="white" className="font-semibold">
                                Store Details
                            </Typography>
                            <div className="flex gap-3">
                                {canEdit && (
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={(e) => {handleEditStore(storeData, e)}}
                                        color="white"
                                        className="flex items-center gap-2"
                                    >
                                        <Edit size={16} /> <span className="hidden xs:inline">Edit</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                    <CardBody className="p-4 md:p-6">
                        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                            {/* Image */}
                            <div className="flex-shrink-0 w-full lg:w-auto">
                                <div className="relative mx-auto lg:mx-0 w-full max-w-sm lg:max-w-none lg:w-48">
                                    <img
                                        src={getImageUrl(storeData.image) || '/img/noimage.jpeg'}
                                        alt={storeData.name}
                                        className="w-full lg:w-48 h-40 lg:h-32 object-cover rounded-lg border border-gray-200"
                                        onError={handleImgError}
                                    />
                                    <div className="absolute top-2 left-2">
                                        <Chip
                                            size="sm"
                                            value="Store"
                                            className="bg-green-600 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                                    <div className="min-w-0 flex-1">
                                        <Typography variant="h5" lg:variant="h4" color="blue-gray" className="mb-2 capitalize break-words">
                                            {storeData.name}
                                        </Typography>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Chip
                                                size="sm"
                                                value={storeData.status}
                                                color={storeData.status === 'active' ? "green" :  storeData.status ==='draft' ? 'yellow' :  "red"}
                                                className="capitalize"
                                            />
                                            <div className="flex items-center">
                                                {renderStarRating(storeData.rating || 0)}
                                            </div>
                                            {storeData.network && (
                                                <Chip
                                                    size="sm"
                                                    value={storeData.network.name || "Network"}
                                                    color="purple"
                                                    className="capitalize"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Key Metrics */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} className="text-green-600" />
                                        <div>
                                            <Typography variant="small" className="text-gray-600">
                                                Earning
                                            </Typography>
                                            <Typography variant="small" className="font-semibold text-gray-900">
                                                ${storeData.earn || 0}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-blue-600" />
                                        <div>
                                            <Typography variant="small" className="text-gray-600">
                                                Tracking Speed
                                            </Typography>
                                            <Typography variant="small" className="font-semibold text-gray-900">
                                                {storeData.trackingSpeed}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <CheckCircle size={16} className="text-purple-600" />
                                        <div>
                                            <Typography variant="small" className="text-gray-600">
                                                Confirmation
                                            </Typography>
                                            <Typography variant="small" className="font-semibold text-gray-900 truncate">
                                                {storeData.confirmation}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <Typography variant="small" className="text-gray-600 mb-1">
                                            Created At
                                        </Typography>
                                        <div className="flex items-center gap-1 text-gray-700">
                                            <Calendar size={14} className="flex-shrink-0" />
                                            <Typography variant="small" className="break-words">
                                                {formatDate(storeData.createdAt)}
                                            </Typography>
                                        </div>
                                    </div>
                                    <div>
                                        <Typography variant="small" className="text-gray-600 mb-1">
                                            Updated At
                                        </Typography>
                                        <div className="flex items-center gap-1 text-gray-700">
                                            <Calendar size={14} className="flex-shrink-0" />
                                            <Typography variant="small" className="break-words">
                                                {formatDate(storeData.updatedAt)}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Description */}
                                <div className="mt-4">
                                    <Typography variant="small" className="text-gray-600 mb-1">
                                        Status Description
                                    </Typography>
                                    <Typography variant="small" className="text-gray-700">
                                        This store is currently <span className="font-semibold">{storeData.status}</span> 
                                        {storeData.status === "active" ? " and available to users" : " and not available to users"}.
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* About Section */}
                {storeData.about && (
                    <Card className="mb-8">
                        <CardHeader variant="gradient" color="green" className="mb-4 p-4">
                            <Typography variant="h6" color="white">
                                About This Store
                            </Typography>
                        </CardHeader>
                        <CardBody className="pt-0 p-4 md:p-6">
                            <Typography variant="small" className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {storeData.about}
                            </Typography>
                        </CardBody>
                    </Card>
                )}

                {/* Network Information */}
                {storeData.network && (
                    <Card className="mb-8">
                        <CardHeader variant="gradient" color="purple" className="mb-4 p-4">
                            <div className="flex items-center gap-2">
                                <Network size={20} color="white" />
                                <Typography variant="h6" color="white">
                                    Network Information
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Typography variant="h6" className="text-gray-800 mb-2">
                                        {storeData.network.name}
                                    </Typography>
                                    {storeData.network.description && (
                                        <Typography variant="small" className="text-gray-600 mb-4">
                                            {storeData.network.description}
                                        </Typography>
                                    )}
                                    
                                    {/* Network Details */}
                                    <div className="space-y-2">
                                        <div>
                                            <Typography variant="small" className="text-gray-600 font-semibold">
                                                Network ID
                                            </Typography>
                                            <Typography variant="small" className="text-gray-900 font-mono">
                                                {storeData.network._id}
                                            </Typography>
                                        </div>
                                        {storeData.network.status && (
                                            <div>
                                                <Typography variant="small" className="text-gray-600 font-semibold">
                                                    Network Status
                                                </Typography>
                                                <Chip
                                                    size="sm"
                                                    value={storeData.network.status}
                                                    color={storeData.network.status === 'active' ? "green" : "red"}
                                                    className="capitalize w-fit mt-1"
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                {/* Network URLs or additional info */}
                                <div>
                                    {storeData.network.website && (
                                        <div className="mb-3">
                                            <Typography variant="small" className="text-gray-600 font-semibold mb-1">
                                                Network Website
                                            </Typography>
                                            <div className="flex items-center gap-2">
                                                <Globe size={16} className="text-blue-600" />
                                                <a 
                                                    href={storeData.network.website} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-sm break-all"
                                                >
                                                    {storeData.network.website}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* API Configuration */}
                {(storeData.apiKey || storeData.authTokens || storeData.credentials || storeData.networkUniqueKey) && (
                    <Card className="mb-8">
                        <CardHeader variant="gradient" color="indigo" className="mb-4 p-4">
                            <div className="flex items-center gap-2">
                                <Settings size={20} color="white" />
                                <Typography variant="h6" color="white">
                                    API Configuration
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {storeData.apiKey && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Key size={16} className="text-indigo-600" />
                                                <Typography variant="small" className="text-gray-600 font-semibold">
                                                    API Key
                                                </Typography>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => toggleSensitiveDataVisibility('apiKey')}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    {showSensitiveData.apiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(storeData.apiKey, 'API Key')}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <Typography variant="small" className="font-mono text-gray-900 break-all">
                                            {maskSensitiveData(storeData.apiKey, showSensitiveData.apiKey)}
                                        </Typography>
                                    </div>
                                )}
                                
                                {storeData.authTokens && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Shield size={16} className="text-indigo-600" />
                                                <Typography variant="small" className="text-gray-600 font-semibold">
                                                    Auth Tokens
                                                </Typography>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => toggleSensitiveDataVisibility('authTokens')}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    {showSensitiveData.authTokens ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(storeData.authTokens, 'Auth Tokens')}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <Typography variant="small" className="font-mono text-gray-900 break-all">
                                            {maskSensitiveData(storeData.authTokens, showSensitiveData.authTokens)}
                                        </Typography>
                                    </div>
                                )}
                                
                                {storeData.credentials && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <Info size={16} className="text-indigo-600" />
                                                <Typography variant="small" className="text-gray-600 font-semibold">
                                                    Credentials
                                                </Typography>
                                            </div>
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => toggleSensitiveDataVisibility('credentials')}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    {showSensitiveData.credentials ? <EyeOff size={14} /> : <Eye size={14} />}
                                                </button>
                                                <button
                                                    onClick={() => copyToClipboard(storeData.credentials, 'Credentials')}
                                                    className="p-1 rounded hover:bg-gray-200"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                        <Typography variant="small" className="font-mono text-gray-900 break-all">
                                            {maskSensitiveData(storeData.credentials, showSensitiveData.credentials)}
                                        </Typography>
                                    </div>
                                )}
                                
                                {storeData.networkUniqueKey && (
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Hash size={16} className="text-indigo-600" />
                                            <Typography variant="small" className="text-gray-600 font-semibold">
                                                Network Unique Key
                                            </Typography>
                                        </div>
                                        <Typography variant="small" className="font-mono text-gray-900">
                                            {storeData.networkUniqueKey}
                                        </Typography>
                                    </div>
                                )}
                            </div>
                            
                            {/* Additional Tracking Fields */}
                            {(storeData.subIds || storeData.networkSubId || storeData.campainInfoUrl) && (
                                <div className="mt-6 pt-4 border-t border-gray-200">
                                    <Typography variant="h6" className="text-gray-700 mb-4">
                                        Tracking Information
                                    </Typography>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {storeData.subIds && (
                                            <div>
                                                <Typography variant="small" className="text-gray-600 font-semibold mb-1">
                                                    Sub IDs
                                                </Typography>
                                                <Typography variant="small" className="text-gray-900 bg-gray-100 p-2 rounded font-mono">
                                                    {storeData.subIds}
                                                </Typography>
                                            </div>
                                        )}
                                        {storeData.networkSubId && (
                                            <div>
                                                <Typography variant="small" className="text-gray-600 font-semibold mb-1">
                                                    Network Sub ID
                                                </Typography>
                                                <Typography variant="small" className="text-gray-900 bg-gray-100 p-2 rounded font-mono">
                                                    {storeData.networkSubId}
                                                </Typography>
                                            </div>
                                        )}
                                    </div>
                                    
                                    {storeData.campainInfoUrl && (
                                        <div className="mt-4">
                                            <Typography variant="small" className="text-gray-600 font-semibold mb-2">
                                                Campaign Info URL
                                            </Typography>
                                            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
                                                <Link size={16} className="text-blue-600 flex-shrink-0" />
                                                <a 
                                                    href={storeData.campainInfoUrl} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:text-blue-800 underline text-sm break-all flex-1"
                                                >
                                                    {storeData.campainInfoUrl}
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(storeData.campainInfoUrl, 'Campaign URL')}
                                                    className="p-1 rounded hover:bg-gray-200 flex-shrink-0"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardBody>
                    </Card>
                )}

                {/* Earning Rates */}
                {storeData.earningRates && storeData.earningRates.length > 0 && (
                    <Card className="mb-6">
                        <CardHeader variant="gradient" color="orange" className="mb-4 p-4">
                            <div className="flex items-center gap-2">
                                <TrendingUp size={20} color="white" />
                                <Typography variant="h6" color="white">
                                    Earning Rates ({storeData.earningRates.length})
                                </Typography>
                            </div>
                        </CardHeader>
                        <CardBody className="pt-0 p-4 md:p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {storeData.earningRates.map((rate, index) => (
                                    <div key={index} className="p-4 border border-orange-200 rounded-lg bg-orange-50">
                                        <div className="flex justify-between items-start mb-2">
                                            <Typography variant="small" className="text-gray-700 font-medium flex-1">
                                                {rate.description}
                                            </Typography>
                                            <Chip
                                                size="sm"
                                                value={rate.rate}
                                                color="orange"
                                                className="text-white ml-2"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Terms and Conditions */}
                {parsedTerms && parsedTerms.length > 0 && (
                    <Card className="mb-8">
                        <CardHeader variant="gradient" color="red" className="mb-4 p-4">
                            <Typography variant="h6" color="white">
                                Terms and Conditions ({parsedTerms.length})
                            </Typography>
                        </CardHeader>
                        <CardBody className="pt-0 p-4 md:p-6">
                            <div className="space-y-3">
                                {parsedTerms.map((term, index) => (
                                    <div key={index} className="flex gap-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <Typography variant="small" className="text-red-600 font-semibold mt-0.5 flex-shrink-0">
                                            {index + 1}.
                                        </Typography>
                                        <Typography variant="small" className="text-gray-700 flex-1 leading-relaxed">
                                            {term}
                                        </Typography>
                                    </div>
                                ))}
                            </div>
                        </CardBody>
                    </Card>
                )}

                {/* Technical Information */}
                <Card className="mt-6 mb-4">
                    <CardHeader variant="gradient" color="blue" className="mb-4 p-4">
                        <div className="flex items-center gap-2">
                            <Info size={20} color="white" />
                            <Typography variant="h6" color="white">
                                Technical Information
                            </Typography>
                        </div>
                    </CardHeader>
                    <CardBody className="pt-0 p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="small" className="text-blue-700 font-semibold mb-1">
                                        Store ID
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 font-mono break-all">
                                        {storeData._id}
                                    </Typography>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="small" className="text-blue-700 font-semibold mb-1">
                                        Tracking Speed
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900">
                                        {storeData.trackingSpeed}
                                    </Typography>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="small" className="text-blue-700 font-semibold mb-1">
                                        Confirmation Period
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900">
                                        {storeData.confirmation}
                                    </Typography>
                                </div>
                            </div>      
                            <div className="space-y-4">
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="small" className="text-blue-700 font-semibold mb-1">
                                        Rating
                                    </Typography>
                                    <div className="flex items-center gap-2">
                                        <Typography variant="small" className="text-gray-900">
                                            {storeData.rating}/5 Stars
                                        </Typography>
                                        {renderStarRating(storeData.rating || 0)}
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="small" className="text-blue-700 font-semibold mb-1">
                                        Created Date
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900">
                                        {new Date(storeData.createdAt).toLocaleString()}
                                    </Typography>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <Typography variant="small" className="text-blue-700 font-semibold mb-1">
                                        Last Updated
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900">
                                        {new Date(storeData.updatedAt).toLocaleString()}
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </div>
        </div>
    );
};

export default StoreDetails;