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
    MoreHorizontal,
    Heart
} from "lucide-react";
import { bannerService } from "@/api/services/banner.service";
import { useAuth } from "@/pages/auth/authContext";
import { handleImgError } from "@/utils/handleImageError";

const BannerDetails = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { id } = useParams();
    const { canEdit } = useAuth();

    const [bannerData, setBannerData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBanner = async () => {
        try {
            const res = await bannerService.getById(id);
            setBannerData(res.data?.data);
        } catch (error) {
            console.error("Error fetching banner details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanner();
    }, [id]);

    const handleBack = () => navigate(-1);
      const handleEditBanner = (banner, event) => {
    event.stopPropagation();
    navigate(`/dashboard/ads/${banner._id}`);
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

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Typography variant="h6" color="blue-gray">
                    Loading banner details...
                </Typography>
            </div>
        );
    }

    if (!bannerData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Typography variant="h6" color="red">
                    Banner not found
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen">
            {/* Breadcrumb */}





            {/* Main Content */}
            <div className="max-w-7xl mx-auto">
                <Card className="mb-10">
                    <CardHeader className="p-4" color="blue">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                            <Button
                                variant="text"
                                size="sm"
                                color="white"
                                onClick={handleBack}
                                className="flex items-center gap-2 "
                            >
                                <ArrowLeft color="white" size={18} /> Back
                            </Button>
                            <Typography variant="h5" md:variant="h4" color="white" className="font-semibold">
                                Banner Details
                            </Typography>
                            <div className="flex gap-3">

                                {canEdit && (
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={(e)=>{handleEditBanner(bannerData , e)}}
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
                                        src={getImageUrl(bannerData.image) || '/img/noimage.jpeg'}
                                        alt={bannerData.name}
                                        className="w-full lg:w-48 h-40 lg:h-32 object-cover rounded-lg border border-gray-200"
                                        onError={handleImgError}
                                    />
                                    <div className="absolute top-2 left-2">
                                        <Chip
                                            size="sm"
                                            value="Featured"
                                            className="bg-blue-600 text-white"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                                    <div className="min-w-0 flex-1">
                                        <Typography variant="h5" lg:variant="h4" color="blue-gray" className="mb-2 capitalize break-words">
                                            {bannerData.name}
                                        </Typography>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <Chip
                                                size="sm"
                                                value={bannerData.category?.name || "Simple"}
                                                variant="outlined"
                                                className="text-blue-600 border-blue-200 capitalize"
                                            />
                                            <Chip
                                                size="sm"
                                                value={bannerData.status}
                                                color={bannerData.status === "active" ? "green" : "red"}
                                                className="capitalize"
                                            />
                                        </div>
                                    </div>
                                    {/* <div className="flex gap-2 flex-shrink-0">
                                        <Button variant="text" size="sm" className="hidden sm:flex">
                                            <MoreHorizontal size={16} />
                                        </Button>
                                        <Button variant="text" size="sm" className="hidden sm:flex">
                                            <Heart size={16} />
                                        </Button>
                                    </div> */}
                                </div>

                                {/* Link */}
                                <div className="mb-4">
                                    <Typography variant="small" className="text-gray-600 mb-1">
                                        Link
                                    </Typography>
                                    <a
                                        href={bannerData.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline flex items-center gap-1 break-all"
                                    >
                                        <ExternalLink size={14} className="flex-shrink-0" />
                                        <span className="truncate sm:break-all">{bannerData.link}</span>
                                    </a>
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
                                                {formatDate(bannerData.createdAt)}
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
                                                {formatDate(bannerData.updatedAt)}
                                            </Typography>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Description */}
                                <div className="mt-4">
                                    <Typography variant="small" className="text-gray-600 mb-1">
                                        Status
                                    </Typography>
                                    <Typography variant="small" className="text-gray-700">
                                        This item is currently {bannerData.status} {bannerData.status === "active" ? "and visible to users" : "and not visible to users"}.
                                    </Typography>
                                </div>
                            </div>
                        </div>
                    </CardBody>
                </Card>

                {/* Additional Info Card */}
                <Card className="mt-6">
                    <CardHeader variant="gradient" color="blue" className="mb-4 p-4">
                        <Typography variant="h6" color="white">
                            Banner Information
                        </Typography>
                    </CardHeader>
                    <CardBody className="pt-0 p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Banner ID
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-all">
                                        {bannerData._id}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Category ID
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-all">
                                        {bannerData.category?._id || "N/A"}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Image Path
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-all">
                                        {bannerData.image}
                                    </Typography>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Full Link URL
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-all">
                                        {bannerData.link}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Created Date (Full)
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-words">
                                        {new Date(bannerData.createdAt).toLocaleString()}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Updated Date (Full)
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-words">
                                        {new Date(bannerData.updatedAt).toLocaleString()}
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

export default BannerDetails;