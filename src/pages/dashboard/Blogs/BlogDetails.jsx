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
    Calendar,
    User,
    Tag,
    Eye
} from "lucide-react";
import { blogService } from "@/api/services/blog.service";
import { useAuth } from "@/pages/auth/authContext";
import { handleImgError } from "@/utils/handleImageError";

const BlogDetails = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { id } = useParams();
    const { canEdit } = useAuth();

    const [blogData, setBlogData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchBlog = async () => {
        try {
            const res = await blogService.getById(id);
            //console.log("this is res",res);
            
            setBlogData(res.data?.data);
        } catch (error) {
            console.error("Error fetching blog details:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBlog();
    }, [id]);

    const handleBack = () => navigate(-1);
    
    const handleEditBlog = (blog, event) => {
        event.stopPropagation();
       navigate(`/dashboard/blogs/${blog._id}`);
    };

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
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
                    Loading blog details...
                </Typography>
            </div>
        );
    }

    if (!blogData) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Typography variant="h6" color="red">
                    Blog post not found
                </Typography>
            </div>
        );
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 min-h-screen">
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
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft color="white" size={18} /> Back
                            </Button>
                            <Typography variant="h5" md:variant="h4" color="white" className="font-semibold">
                                Blog Details
                            </Typography>
                            <div className="flex gap-3">
                                {canEdit && (
                                    <Button
                                        variant="outlined"
                                        size="sm"
                                        onClick={(e) => { handleEditBlog(blogData, e) }}
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
                        <div className="flex flex-col gap-6">
                            {/* Title Image */}
                            {blogData.titleImage && (
                                <div className="w-full">
                                    <img
                                        src={getImageUrl(blogData.titleImage) || '/img/noimage.jpeg'}
                                        alt={blogData.title}
                                        className="w-full h-64 md:h-80 object-cover rounded-lg border border-gray-200"
                                        onError={handleImgError}
                                    />
                                </div>
                            )}

                            {/* Header Info */}
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
                                    <div className="min-w-0 flex-1">
                                        <Typography variant="h4" lg:variant="h3" color="blue-gray" className="mb-3 capitalize break-words">
                                            {blogData.title}
                                        </Typography>
                                        <div className="flex flex-wrap items-center gap-4 mb-3 text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <User size={16} />
                                                <Typography variant="small" className="font-medium">
                                                    {blogData.author}
                                                </Typography>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar size={16} />
                                                <Typography variant="small">
                                                    {formatDate(blogData.createdAt)}
                                                </Typography>
                                            </div>
                                            {blogData.category && (
  <div className="flex items-center gap-1">
    <Tag size={16} />
    <Typography variant="small">
      {blogData.category?.name || "Uncategorized"}
    </Typography>
  </div>
)}
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <Chip
                                                size="sm"
                                                value={blogData.status}
                                                color={blogData.status === "active" ? "green" : "red"}
                                                className="capitalize"
                                            />
                                            <Chip
                                                size="sm"
                                                value="Blog Post"
                                                variant="outlined"
                                                className="text-blue-600 border-blue-200"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Blog Content */}
                                <div className="prose prose-lg max-w-none">
                                    <Typography variant="small" className="text-gray-600 mb-3 font-semibold">
                                        Content
                                    </Typography>
                                    <div 
                                        className="text-gray-800 leading-relaxed"
                                        dangerouslySetInnerHTML={{ __html: blogData.content }}
                                    />
                                </div>

                                {/* Status Description */}
                                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                    <Typography variant="small" className="text-gray-600 mb-1 font-semibold">
                                        Publication Status
                                    </Typography>
                                    <Typography variant="small" className="text-gray-700">
                                        This blog post is currently {blogData.status} {blogData.status === "active" ? "and visible to readers" : "and not visible to readers"}.
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
                            Blog Information
                        </Typography>
                    </CardHeader>
                    <CardBody className="pt-0 p-4 md:p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
                            <div className="space-y-4">
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Blog ID
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-all">
                                        {blogData._id}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Author
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900">
                                        {blogData.author}
                                    </Typography>
                                </div>
                                <div>
  <Typography variant="small" className="text-gray-600 font-semibold">
    Category
  </Typography>
  <Typography variant="small" className="text-gray-900">
    {blogData.category?.name || "Uncategorized"}
  </Typography>
</div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Title Image Path
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-all">
                                        {blogData.titleImage || "No image"}
                                    </Typography>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Publication Status
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 capitalize">
                                        {blogData.status}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Created Date (Full)
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-words">
                                        {new Date(blogData.createdAt).toLocaleString()}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Updated Date (Full)
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900 break-words">
                                        {new Date(blogData.updatedAt).toLocaleString()}
                                    </Typography>
                                </div>
                                <div>
                                    <Typography variant="small" className="text-gray-600 font-semibold">
                                        Content Length
                                    </Typography>
                                    <Typography variant="small" className="text-gray-900">
                                        {blogData.content ? `${blogData.content.replace(/<[^>]*>/g, '').length} characters` : "0 characters"}
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

export default BlogDetails;