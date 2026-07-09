import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, ExternalLink, BookOpen, User, Calendar } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import { blogService } from '@/api/services/blog.service';
import TablePagination from '@/widgets/components/tablePagination';
import { exportBlogsToJson } from '@/utils/exportToJson';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';

export const BlogList = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  // Get permissions directly from auth context
  const { canEdit, canDelete, canCreate, hasPermission } = useAuth();

  const [blogData, setBlogData] = useState([]);
  const [blogToDelete, setBlogToDelete] = useState(null);
  const [selectedBlogIds, setSelectedBlogIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // const { blogData, filterData } = useTableFilter(blogData, ['category', 'id', 'author', 'title']);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActiveProducts, setTotalActiveProducts] = useState(0);
  const [totalCategories, setTotalCategories] = useState(0);
  const [totalAuthors, setTotalAuthors] = useState(0);
  const [totalBlogs, setTotalBlogs] = useState(0);
    const [isLoading, setIsLoading] = useState(false);


  const handleAddBlog = () => {
    navigate('/dashboard/blogs/add-blog');
  };

  // Create a separate function for fetching and processing data
  const fetchAndProcessBlogs = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await blogService.list(page, filters);
      // console.log("this is res",res);

      const fetchedData = res.data?.data.blogData || [];
      const paginationData = res.data?.data;

      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessBlogs(page - 1, filters); // recursively call with previous page
      }
      // console.log("this is paginated data",paginationData);

      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((paginationData.currentPage - 1) * 10) + index + 1,
        title: item.title,
        author: item.author,
        imageUrl: item.titleImage?.startsWith("http")
          ? item.titleImage
          : `${apiUrl}/${item.titleImage?.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`,
        category: item.category?.name || '',
        content: item.content,
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString()
      }));

      setBlogData(mappedData);
      setTotalActiveProducts(paginationData.totalActiveBlogs || 0);
      setTotalCategories(paginationData.totalCategories || 0);
      setTotalAuthors(paginationData.totalAuthors || 0);
      setTotalBlogs(paginationData.totalData || 0)

      setCurrentPage(paginationData.currentPage || 1);
      setTotalPages(paginationData.totalPages || 1);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);

    } catch (error) {
      console.error('Failed to fetch blogs:', error);
      toast.error("Failed to fetch blogs");
    }
    finally{
      setIsLoading(false)
    }
  };


const handleImportBlogs = async (file) => {
  setIsLoading(true);
  try {
    const res = await blogService.importDataJson(file);
   // console.log("Imported blogs response", res);

    const successCount = res?.data?.data?.successCount || 0;
    const errorCount = res?.data?.data?.errorCount || 0;
    const errors = res?.data?.data?.errors || [];

    // Build main toast message
    let message = `${successCount} blog(s) imported successfully.`;

    if (errorCount > 0) {
     

      // Show success + error summary toast
      toast.success(message);

      // Show up to 3 detailed errors
      const errorSummary = errors
        .slice(0, 3)
        .map(e => `Row ${e.row}: ${e.reason}`)
        .join('\n');

      toast.error(`${errorCount} failed :  ${errorSummary}`);
    } else {
      toast.success(message);
    }

    // Refresh blog list
    await fetchAndProcessBlogs();
    
  } catch (err) {
    console.error("Import failed", err);
    toast.error("Failed to import blogs");
  }
    finally{
      setIsLoading(false)
    }
};


  const handleEditBlog = (blog, event) => {
    event.stopPropagation();
    navigate(`/dashboard/blogs/${blog._id}`);
  };

  const handleBlogDetails = (blog, event) => {
    event.stopPropagation();
    navigate(`/dashboard/blogs/all-blogs/${blog._id}`);
  }

  const handleDeleteBlog = (blog, event) => {
    event.stopPropagation();
    setBlogToDelete(blog);
  };

  const confirmDeleteBlog = async () => {
   
    if (blogToDelete) {
      setIsLoading(true);
      try {
        const deleteblog = await blogService.delete([blogToDelete._id]);
       // console.log("Deleted Blog ", deleteblog);

        toast.success(`Blog "${blogToDelete.title}" deleted`);
        setBlogToDelete(null);
        fetchAndProcessBlogs(currentPage, currentFilters)

      } catch (err) {
        toast.error("Failed to delete blog", err.response?.data?.message);
        console.log("this is error ", err);
      }
    finally{
      setIsLoading(false)
    }
    }
  };

  const handleSelectBlog = (id) => {
    setSelectedBlogIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBlogIds.length === blogData.length) {
      setSelectedBlogIds([]);
    } else {
      setSelectedBlogIds(blogData.map((blog) => blog.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true)
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = blogData
      .filter(blog => selectedBlogIds.includes(blog.id))
      .map(blog => blog._id);

      setIsLoading(true);
    try {
      await blogService.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} blog(s) deleted`);
      setSelectedBlogIds([]);
      setShowBulkDeleteConfirm(false);

      fetchAndProcessBlogs(currentPage, currentFilters);


    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected blogs");
    }
    finally{
      setIsLoading(false)
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = blogData
      .filter(user => selectedBlogIds.includes(user.id))
      .map(user => user._id);

    try {
      await blogService.bulkUpdate({ ids: selectedRealIds, updates });
      toast.success(`${selectedRealIds.length} Blog(s) updated`);
      setSelectedBlogIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessBlogs(currentPage, currentFilters);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Bulk update failed');
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );

    if (cleanFilters.search) {
      cleanFilters.search = cleanFilters.search;
    }

    if (cleanFilters.author) {
      cleanFilters.author = cleanFilters.author;
    }

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessBlogs(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessBlogs(1, {});
  };
  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessBlogs(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);


  // const handleExport = () => {
  //   exportBlogsToJson(blogData, 'blog_backup.json');
  // };

  // Update your useEffect to use the new function
  useEffect(() => {
    fetchAndProcessBlogs(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className=" p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Blog Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage blog posts and articles for your website
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddBlog}>
                  <Plus size={16} /> Add Blog
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Blogs</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalBlogs}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <BookOpen className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Blogs</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveProducts}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <ExternalLink className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg shadow border border-amber-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Categories</Typography>
                  <Typography variant="h4" className="font-bold text-amber-700">
                    {totalCategories}
                  </Typography>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <BookOpen className="text-amber-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg shadow border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Authors</Typography>
                  <Typography variant="h4" className="font-bold text-purple-700">
                    {totalAuthors}
                  </Typography>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <User className="text-purple-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className=" p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Blog Posts</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6 ">
            <TableToolbar
              data={blogData}
              onApplyFilters={handleApplyFilters}
              onImportJson={handleImportBlogs}
              onClearFilters={resetToInitialData}
              showImportExcel={false}
              showExportExcel={false}
              showApplyButton={true}
              showCategoryOptions={true}
              exportFileName="blogs"
            />
            {canDelete && selectedBlogIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2 ">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedBlogIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedBlogIds.length})
                </Button>
              </div>
            )}
          </div>

          {
            isLoading &&  <Loader /> 
          }

          {!isLoading && (<div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 rounded-lg">
                <tr>
                  {canDelete && (<th className="border-b py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedBlogIds.length === blogData.length &&
                        blogData.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>)}
                  {["ID", "Title", "Image", "Author", "Category", "Status", "Created At", "Updated At", "Actions"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                      <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogData.map((blog, key) => {
                  const className = `p-4 ${key === blogData.length - 1 ? "" : "border-b"}`;
                  const isSelected = selectedBlogIds.includes(blog.id);
                  return (
                    <tr key={blog.id}
                      onClick={(e) => { handleBlogDetails(blog, e) }}
                      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}>
                      {canDelete && (<td className={className}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectBlog(blog.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>)}
                      <td className={className}>{blog.id}</td>
                      <td className={className}>
                        <div className="max-w-xs">
                          <Typography variant="small" className="font-medium truncate">
                            {blog.title}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <img src={blog.imageUrl || '/img/noimage.jpeg'} alt={blog.title} className="w-16 h-10 object-cover rounded" />
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-gray-600">
                          {blog.author}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="ghost"
                          color="blue"
                          value={blog.category}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={blog.status === 'active' ? "green" : "red"}
                          value={blog.status}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-gray-600">
                          {blog.createdAt}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-gray-600">
                          {blog.updatedAt}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex space-x-2">
                          {canEdit && (<button onClick={(e) => handleEditBlog(blog, e)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>)}
                          {canDelete && (<button onClick={(e) => handleDeleteBlog(blog, e)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>)}
                          {!canEdit && !canDelete && (
                            <span className="text-gray-400 text-sm">No actions available</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>)}

          {blogData.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">No blogs found matching the search criteria</Typography>
            </div>
          )}
          {/* Pagination Component */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onPageChange={handlePageChange}
            totalItems={totalBlogs}
            itemsPerPage={10}
          />

        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={blogToDelete !== null}
        onClose={() => setBlogToDelete(null)}
        onConfirm={confirmDeleteBlog}
        title="Delete Blog"
        message={`Are you sure you want to delete "${blogToDelete?.title}"? This action cannot be undone.`} />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Blogs"
        message={`Are you sure you want to delete ${selectedBlogIds.length} selected blog(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedBlogIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default BlogList;