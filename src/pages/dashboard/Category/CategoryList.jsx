import React, { useEffect, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
} from '@material-tailwind/react';
import { Plus, Edit, Trash2, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import { useTableFilter } from '@/hooks';
import { categoryService } from '@/api/services/category.service'; // Create this service file
import TablePagination from '@/widgets/components/tablePagination';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { TableToolbar } from '@/widgets/forms';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';

const CategoryList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [categories, setCategories] = useState([]);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});
    const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
    const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
    

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
  


  const fetchCategories = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await categoryService.list(page, filters);
     // console.log("this is fetched ", res);

      const fetchedData = res?.data?.data?.categories || [];

          if (fetchedData.length === 0 && page > 1) {
      return fetchCategories(page - 1, filters); // recursively call with previous page
    }
      const paginationData = res?.data?.data;



      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: (paginationData.currentPage - 1) * 10 + index + 1,
        name: item.name,
        position: item.position,
        status: item.status,
        filters: item.filters,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      }));

      setCategories(mappedData);
      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setTotalCategories(paginationData.totalCategory);
      setHasNextPage(paginationData.currentPage < paginationData.totalPages);
      setHasPrevPage(paginationData.currentPage > 1);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      toast.error('Failed to fetch categories');
    }
  finally {
    setIsLoading(false);
  }
  };

  const handleAddCategory = () => {
    navigate('/dashboard/others/add-category');
  };

  const handleEditCategory = (category, event) => {
    event.stopPropagation();
    navigate(`/dashboard/others/category/${category._id}`);
  };

  const handleDeleteCategory = (category, event) => {
    event.stopPropagation();
    setCategoryToDelete(category);
  };

  const confirmDeleteCategory = async () => {
    setIsLoading(true);
    try {
      await categoryService.delete([categoryToDelete._id]);
      toast.success(`Category "${categoryToDelete.name}" deleted`);
      setCategoryToDelete(null);
       fetchCategories(currentPage, currentFilters);
      
    } catch (error) {
      console.error('Delete failed', error);
      toast.error('Failed to delete category');
    }
  finally {
    setIsLoading(false);
  }
  };

  const handleSelectCategory = (id) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedCategoryIds.length === categories.length) {
      setSelectedCategoryIds([]);
    } else {
      setSelectedCategoryIds(categories.map((cat) => cat.id));
    }
  };

  const handleDeleteSelected = async () => {

    const selectedRealIds = categories
      .filter((cat) => selectedCategoryIds.includes(cat.id))
      .map((cat) => cat._id);
    setIsLoading(true);
    try {
      await categoryService.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} category(s) deleted`);
      setSelectedCategoryIds([]);

      // Refetch users after delete
      fetchCategories(currentPage, currentFilters);
      
    } catch (err) {
      console.error('Bulk delete failed', err);
      toast.error('Failed to delete selected categories');
    }
  finally {
    setIsLoading(false);
  }
  };

    const handleBulkUpdate = () => {
      setShowBulkUpdateDialog(true);
    };
  
    const confirmBulkUpdate = async (updates) => {
      setBulkUpdateLoading(true);
      const selectedRealIds = categories
        .filter(user => selectedCategoryIds.includes(user.id))
        .map(user => user._id);
  
      try {
       const response= await categoryService.bulkUpdate({ ids: selectedRealIds, updates });
       //console.log("bulk update",response);
        
       toast.success(`${selectedRealIds.length} Category(s) updated`);
        setSelectedCategoryIds([]);
        setShowBulkUpdateDialog(false);
        await fetchCategories(currentPage, currentFilters);
      } catch (err) {
        console.log("this is error ",err);
        
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



    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchCategories(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchCategories(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchCategories(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);

  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  useEffect(() => {
    fetchCategories(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">
                Category Management
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage product categories and filters
              </Typography>
            </div>
            {canCreate && (
              <Button
                variant="outlined"
                color="white"
                size="sm"
                className="flex items-center gap-2"
                onClick={handleAddCategory}
              >
                <Plus size={16} /> Add Category
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="px-6">
          <TableToolbar
            data={categories}
            showCategoryOptions={false}
            onApplyFilters={handleApplyFilters}
            onClearFilters={resetToInitialData}
            showExportButton={false}
            showImportButton={false}
            showApplyButton={true}
          />

          

          {canDelete && selectedCategoryIds.length > 0 && (
            <div className=" flex mb-4 mt-2 gap-2">
              <Button
                                color="blue"
                                variant="filled"
                                onClick={handleBulkUpdate}
                                className="flex items-center gap-2 p-4"
                              >
                                <Edit size={16} /> Update Selected ({selectedCategoryIds.length})
                              </Button>
              <Button
                color="red"
                variant="filled"
                onClick={handleDeleteSelected}
                className="flex items-center gap-2"
              >
                <Trash2 size={16} /> Delete Selected ({selectedCategoryIds.length})
              </Button>
            </div>
          )}

          {isLoading && <Loader/> }

         {!isLoading && ( <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead className="bg-gray-100 rounded-lg">
                <tr>
                  {canDelete && (
                    <th className="border-b p-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedCategoryIds.length === categories.length &&
                          categories.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {[
                    'ID',
                    'Name',
                    'Status',
                    'Created At',
                    'Updated At',
                    'Actions',
                  ].map((el) => (
                    <th
                      key={el}
                      className="border-b border-blue-gray-50 p-4 text-left"
                    >
                      <Typography
                        variant="small"
                        className="font-bold uppercase text-blue-gray-900"
                      >
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {categories.map((cat, key) => {
                  const className = `p-4 ${key === categories.length - 1 ? '' : 'border-b'
                    }`;
                  const isSelected = selectedCategoryIds.includes(cat.id);
                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''
                        }`}
                    >
                      {canDelete && (
                        <td className={className}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectCategory(cat.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      <td className={className}>{cat.id}</td>
                      <td className={className}>{cat.name}</td>

                      
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={cat.status === 'active' ? 'green' : 'red'}
                          value={cat.status}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>{cat.createdAt}</td>
                      <td className={className}>{cat.updatedAt}</td>

                      <td className={className}>
                        <div className="flex space-x-2">
                          {canEdit && (
                            <button
                              onClick={(e) => handleEditCategory(cat, e)}
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={(e) => handleDeleteCategory(cat, e)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
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

          {categories.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No categories found matching the search criteria
              </Typography>
            </div>
          )}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onPageChange={handlePageChange}
            totalItems={totalCategories}
            itemsPerPage={10}
          />

        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={categoryToDelete !== null}
        onClose={() => setCategoryToDelete(null)}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}"? This action cannot be undone.`}
      />

            <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedCategoryIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default CategoryList;
