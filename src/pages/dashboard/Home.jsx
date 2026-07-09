import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Avatar,
  Chip,
  Button,
} from "@material-tailwind/react";
import {
  EllipsisVerticalIcon,
  UserGroupIcon,
  ShoppingBagIcon,
  DocumentTextIcon,
  FolderIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { StatisticsChart } from "@/widgets/charts";
import { statisticsChartsData } from "@/data";
import { useAuth } from "../auth/authContext";
import { dashboardService } from "@/api/services/dashboard.home.service";
import { TrendingUp } from "lucide-react";
import Loader from "@/utils/Loader";

export function Home() {
  const { user } = useAuth(); 
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await dashboardService.home();
       // console.log("this is dashboard Data", res);
        //console.log("this is res.sucess", res.data?.data);
       // ("this is  sucess ", res.data?.data?.success);
        if (res.data?.success) {
          setDashboardData(res.data?.data);
        } else {
          setError(res.message || "Failed to fetch dashboard data");
        }
      } catch (err) {
        setError("Error fetching dashboard data");
        console.error("Dashboard API Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Navigation handlers
  const handleViewAllUsers = () => {
    navigate("/dashboard/users/managers");
  };

  const handleViewAllProducts = () => {
    navigate("/dashboard/products/all-products");
  };

  const handleViewAllBlogs = () => {
    navigate("/dashboard/blogs/all-blogs");
  };

  const handleViewAllCategories = () => {
    navigate("/dashboard/others/category");
  };

  const handleProductDetails = (productId) => {
    navigate(`/dashboard/products/all-products/${productId}`);
  };

  const handleBlogDetails = (blogId) => {
    navigate(`/dashboard/blogs/all-blogs/${blogId}`);
  };

  const handleUserDetails = (userId) => {
    navigate(`/dashboard/users/managers`);
  };

  const handleCategoryDetails = (categoryId) => {
    navigate(`/dashboard/others/category`);
  };

  // Generate statistics cards data from API
  const getStatisticsCardsData = () => {
    if (!dashboardData) return [];

    return [
      {
        icon: UserGroupIcon,
        title: "Total Users",
        value: dashboardData.counts.totalUsers.toLocaleString(),
        color: "blue",
        footer: {
          value: `${dashboardData.users.length}`,
          label: "registered users",
        },
        viewAllHandler: handleViewAllUsers,
        trend: "+12%",
      },
      {
        icon: ShoppingBagIcon,
        title: "Total Products",
        value: dashboardData.counts.totalProducts.toLocaleString(),
        color: "purple",
        footer: {
          value: `${dashboardData.products.length}`,
          label: "recent products",
        },
        viewAllHandler: handleViewAllProducts,
        trend: "+8%",
      },
      {
        icon: DocumentTextIcon,
        title: "Total Blogs",
        value: dashboardData.counts.totalBlogs.toLocaleString(),
        color: "green",
        footer: {
          value: `${dashboardData.blogs.length}`,
          label: "recent blogs",
        },
        viewAllHandler: handleViewAllBlogs,
        trend: "+24%",
      },
      {
        icon: FolderIcon,
        title: "Total Categories",
        value: dashboardData.counts.totalCategories.toLocaleString(),
        color: "red",
        footer: {
          value: `${dashboardData.categories.length}`,
          label: "active categories",
        },
        viewAllHandler: handleViewAllCategories,
        trend: "+5%",
      },
    ];
  };

  const renderStatisticsCards = () => {
    const statisticsData = getStatisticsCardsData();

    return (
      <div className="mb-12 mt-4 grid gap-6 md:grid-cols-2 2xl:grid-cols-4">
        {statisticsData.map(({
          icon,
          title,
          value,
          footer,
          viewAllHandler,
          trend,
          color,
        }) => (
          <Card 
            key={title} 
            className={` mb-4 border-none shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-${color}-50 to-${color}-100 transform hover:-translate-y-1`}
          >
            <CardHeader className={`p-4  bg-gradient-to-br from-${color}-50 to-${color}-100`}>
               <Typography
                      variant="small"
                      className={`font-semibold text-${color}-800 uppercase tracking-wider`}
                    >
                      {title}
                    </Typography>
            </CardHeader>
            <CardBody className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                   
                    <div className="flex items-center gap-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <Typography variant="small" className="font-semibold">
                        {trend}
                      </Typography>
                    </div>
                  </div>
                  <Typography
                    variant="h2"
                    className="font-bold text-gray-900"
                  >
                    {value}
                  </Typography>
                </div>
                <div className={`p-3 rounded-xl bg-${color}-100`}>
                  {React.createElement(icon, {
                    className: `w-7 h-7 text-${color}-600`,
                  })}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Typography className="text-sm text-gray-600">
                  <strong className="text-gray-800">{footer.value}</strong>
                  &nbsp;{footer.label}
                </Typography>
                <Button
                  size="sm"
                  variant="gradient"
                  color={color}
                  className="flex items-center gap-2 font-medium"
                  onClick={viewAllHandler}
                >
                  <EyeIcon className="w-4 h-4" />
                  View All
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    );
  };

  const renderRecentProducts = () => (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 p-6 bg-transparent"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-100">
              <ShoppingBagIcon className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <Typography variant="h5" className="text-gray-900 font-bold">
                Recent Products
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Latest product additions
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              value={`${dashboardData.products.length} items`}
              variant="gradient"
              color="purple"
              size="sm"
              className="font-medium"
            />
            <IconButton
              variant="gradient"
              color="purple"
              size="sm"
              className="rounded-full"
              onClick={handleViewAllProducts}
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {dashboardData.products.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.products.map((product) => (
              <div
                key={product._id}
                className="group flex items-center justify-between p-5 hover:bg-purple-50/50 cursor-pointer transition-all duration-200"
                onClick={() => handleProductDetails(product._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-purple-100 text-purple-600 group-hover:bg-purple-200">
                    <ShoppingBagIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      className="font-semibold text-gray-900"
                    >
                      {product.name}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                      <Typography variant="small" className="text-gray-600">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-purple-500 group-hover:text-purple-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <ShoppingBagIcon className="w-16 h-16 text-purple-200 mx-auto mb-4" />
            <Typography variant="h5" className="text-gray-700 mb-2 font-semibold">
              No Products Yet
            </Typography>
            <Typography variant="small" className="text-gray-500">
              Start adding your first product to see it here
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderRecentBlogs = () => (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 p-6 bg-transparent"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-green-100">
              <DocumentTextIcon className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <Typography variant="h5" className="text-gray-900 font-bold">
                Recent Blogs
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Latest blog posts
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              value={`${dashboardData.blogs.length} posts`}
              variant="gradient"
              color="green"
              size="sm"
              className="font-medium"
            />
            <IconButton
              variant="gradient"
              color="green"
              size="sm"
              className="rounded-full"
              onClick={handleViewAllBlogs}
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {dashboardData.blogs.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.blogs.map((blog) => (
              <div
                key={blog._id}
                className="group p-5 hover:bg-green-50/50 cursor-pointer transition-all duration-200"
                onClick={() => handleBlogDetails(blog._id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="p-2 rounded-lg bg-green-100 text-green-600 group-hover:bg-green-200">
                      <DocumentTextIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <Typography
                        variant="small"
                        className="font-semibold text-gray-900 mb-2 line-clamp-2"
                      >
                        {blog.title}
                      </Typography>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          <Typography variant="small" className="text-gray-600">
                            {blog.author}
                          </Typography>
                        </div>
                        <div className="flex items-center gap-2">
                          <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                          <Typography variant="small" className="text-gray-600">
                            {new Date(blog.createdAt).toLocaleDateString()}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  </div>
                  <ArrowTopRightOnSquareIcon className="w-5 h-5 text-green-500 group-hover:text-green-700 ml-2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <DocumentTextIcon className="w-16 h-16 text-green-200 mx-auto mb-4" />
            <Typography variant="h5" className="text-gray-700 mb-2 font-semibold">
              No Blogs Yet
            </Typography>
            <Typography variant="small" className="text-gray-500">
              Create your first blog post to see it here
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderUsers = () => (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 p-6 bg-transparent"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-100">
              <UserGroupIcon className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <Typography variant="h5" className="text-gray-900 font-bold">
                Users
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Registered community members
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              value={`${dashboardData.users.length} users`}
              variant="gradient"
              color="blue"
              size="sm"
              className="font-medium"
            />
            <IconButton
              variant="gradient"
              color="blue"
              size="sm"
              className="rounded-full"
              onClick={handleViewAllUsers}
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {dashboardData.users.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.users.map((user) => (
              <div
                key={user._id}
                className="group flex items-center justify-between p-5 hover:bg-blue-50/50 cursor-pointer transition-all duration-200"
                onClick={() => handleUserDetails(user._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar
                      src={`https://ui-avatars.com/api/?name=${user.email}&background=3b82f6&color=fff&bold=true`}
                      alt={user.email}
                      size="md"
                      className="border-2 border-white shadow-sm"
                    />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      className="font-semibold text-gray-900"
                    >
                      {user.email}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                      <Typography variant="small" className="text-gray-600">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-blue-500 group-hover:text-blue-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <UserGroupIcon className="w-16 h-16 text-blue-200 mx-auto mb-4" />
            <Typography variant="h5" className="text-gray-700 mb-2 font-semibold">
              No Users Yet
            </Typography>
            <Typography variant="small" className="text-gray-500">
              Invite users to join your platform
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );

  const renderCategories = () => (
    <Card className="border-none shadow-lg bg-gradient-to-br from-white to-gray-50 hover:shadow-xl transition-all duration-300">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 p-6 bg-transparent"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-orange-100">
              <FolderIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <Typography variant="h5" className="text-gray-900 font-bold">
                Categories
              </Typography>
              <Typography variant="small" className="text-gray-600">
                Content organization
              </Typography>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Chip
              value={`${dashboardData.categories.length} categories`}
              variant="gradient"
              color="orange"
              size="sm"
              className="font-medium"
            />
            <IconButton
              variant="gradient"
              color="orange"
              size="sm"
              className="rounded-full"
              onClick={handleViewAllCategories}
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </CardHeader>
      <CardBody className="p-0">
        {dashboardData.categories.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {dashboardData.categories.map((category) => (
              <div
                key={category._id}
                className="group flex items-center justify-between p-5 hover:bg-orange-50/50 cursor-pointer transition-all duration-200"
                onClick={() => handleCategoryDetails(category._id)}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-orange-100 text-orange-600 group-hover:bg-orange-200">
                    <TagIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <Typography
                      variant="small"
                      className="font-semibold text-gray-900"
                    >
                      {category.name}
                    </Typography>
                    <div className="flex items-center gap-2 mt-1">
                      <CalendarDaysIcon className="w-4 h-4 text-gray-500" />
                      <Typography variant="small" className="text-gray-600">
                        Created {new Date(category.createdAt).toLocaleDateString()}
                      </Typography>
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="w-5 h-5 text-orange-500 group-hover:text-orange-700" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FolderIcon className="w-16 h-16 text-orange-200 mx-auto mb-4" />
            <Typography variant="h5" className="text-gray-700 mb-2 font-semibold">
              No Categories Yet
            </Typography>
            <Typography variant="small" className="text-gray-500">
              Create categories to organize your content
            </Typography>
          </div>
        )}
      </CardBody>
    </Card>
  );

  // Loading state
  if (loading) {
    return <Loader />
  }

  // Error state
  if (error) {
    return (
      <div className="mt-12 flex items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md border-none shadow-lg bg-red-50/90 backdrop-blur-sm">
          <CardBody className="text-center p-8">
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-2xl">⚠️</span>
            </div>
            <Typography variant="h5" className="text-gray-800 mb-2 font-semibold">
              Error Loading Dashboard
            </Typography>
            <Typography variant="small" className="text-gray-600">
              {error}
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="mt-12 flex items-center justify-center min-h-[400px] bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardBody className="text-center p-8">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-600 text-2xl">📊</span>
            </div>
            <Typography variant="h5" className="text-gray-800 mb-2 font-semibold">
              No Dashboard Data
            </Typography>
            <Typography variant="small" className="text-gray-600">
              Unable to load dashboard information.
            </Typography>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-12 space-y-12 px-4 lg:px-8 min-h-screen">
      {/* Welcome Section */}
      {user?.role === "admin" ? (
      <Card className="border-none shadow-lghover:shadow-xl transition-all duration-300">
        <CardHeader className="p-8">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h3" className="font-bold text-gray-900 mb-2">
                Welcome back, {user?.role || 'Admin'}!
              </Typography>
              <Typography variant="lead" className="text-gray-600">
                Here's what's happening with your dashboard today
              </Typography>
            </div>
            <Avatar
              src={`https://ui-avatars.com/api/?name=${user?.email || 'Admin'}&background=3b82f6&color=fff&bold=true`}
              alt="User"
              size="lg"
              className="border-2 border-white shadow-sm"
            />
          </div>
        </CardHeader>
      
<CardBody>
      {/* Statistics Cards */}
      {renderStatisticsCards()}

      {/* Statistics Charts */}
      {/* <div className="mb-12">
        <Typography variant="h4" className="font-bold text-gray-900 mb-8">
          Analytics Overview
        </Typography>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
          {statisticsChartsData.map((props) => (
            <div key={props.title} className="transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
              <StatisticsChart
                {...props}
                footer={
                  <Typography
                    variant="small"
                    className="flex items-center font-medium text-gray-600"
                  >
                    <ClockIcon strokeWidth={2} className="h-5 w-5 text-gray-500 mr-2" />
                    {props.footer}
                  </Typography>
                }
              />
            </div>
          ))}
        </div>
      </div> */}

      {/* Data Overview Section */}
      <div className="space-y-12">
        <Typography variant="h4" className="font-bold text-gray-900">
          Recent Activity
        </Typography>
        
        {/* Recent Products and Blogs Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {renderRecentProducts()}
          {renderUsers()}
          {/* {renderRecentBlogs()} */}
        </div>

        {/* Users and Categories Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          
          {/* {renderCategories()} */}
        </div>
      </div>

      {/* Simple CSS for line clamp and custom animations */}
      <style>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
</CardBody>
      </Card>
      ) : (
      <div className="text-center py-32">
        <Typography variant="h2" className="text-gray-700 font-bold mb-4">
          Role Dashboard
        </Typography>
        <Typography variant="lead" className="text-gray-500">
          You do not have access to admin dashboard data.
        </Typography>
      </div>
    )}
    </div>
  );
}

export default Home;