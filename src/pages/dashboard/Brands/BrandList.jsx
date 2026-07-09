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
import { Edit, Plus, Trash2, Tag, Package, Star, Loader } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import { brandService } from '@/api/services/brand.service';

export const BrandList = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  // Get permissions directly from auth context
  const { canEdit, canDelete, canCreate, hasPermission } = useAuth();

  const [brandData, setBrandData] = useState([]);
  const [brandToDelete, setBrandToDelete] = useState(null);
  const [selectedBrandIds, setSelectedBrandIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActiveBrands, setTotalActiveBrands] = useState(0);
  const [totalInActiveBrands, setTotalInActiveBrands] = useState(0);
  const [totalBrands, setTotalBrands] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

  const handleAddBrand = () => {
    navigate('/dashboard/stores/add-brands');
  };

  // Create a separate function for fetching and processing data
  const fetchAndProcessBrands = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await brandService.list(page, filters);
    // console.log("this is res", res);

      const fetchedData = res.data?.data.brandData || [];
      const paginationData = res.data?.data;

      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessBrands(page - 1, filters); // recursively call with previous page
      }
     // console.log("this is paginated data", paginationData);

      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((paginationData.currentPage - 1) * 10) + index + 1,
        name: item.name,
        // Use 'brandImage' field from API response
        imageUrl:item.logo,
        status: item.status,
        // Handle category as object or string
        category:  item.category ,
       createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString()
      }));

      setBrandData(mappedData);
      setTotalActiveBrands(paginationData.totalActiveBrands || 0);
      setTotalInActiveBrands(paginationData.totalInactiveBrands || 0);
      setTotalBrands(paginationData.totalData || 0);

      setCurrentPage(paginationData.currentPage || 1);
      setTotalPages(paginationData.totalPages || 1);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);

    } catch (error) {
      console.error('Failed to fetch brands:', error);
      toast.error("Failed to fetch brands");
    }finally{
      setIsLoading(false)
    }
  };

  const handleImportBrands = async (file) => {
    setIsLoading(true);
    try {
      const res = await brandService.importData(file);
     console.log("Imported brands response", res);

      const successCount = res?.data?.data?.successCount || 0;
      const errorCount = res?.data?.data?.errorCount || 0;
      const errors = res?.data?.data?.errors || [];

      // Build main toast message
      let message = `${successCount} brand(s) imported successfully.`;

      if (errorCount > 0) {
        // Show success + error summary toast
        toast.success(message);

        // Show up to 3 detailed errors
        const errorSummary = errors
          .slice(0, 3)
          .map(e => `Row ${e.row}: ${e.reason}`)
          .join('\n');

        toast.error(`${errorCount} failed: ${errorSummary}`);
      } else {
        toast.success(message);
      }

      // Refresh brand list
      await fetchAndProcessBrands();
      
    } catch (err) {
      console.error("Import failed", err);
      toast.error("Failed to import brands");
    }finally{
      setIsLoading(false)
    }
  };

  const handleEditBrand = (brand, event) => {
    event.stopPropagation();
    navigate(`/dashboard/stores/edit-brand/${brand._id}`);
  };

  const handleBrandDetails = (brand, event) => {
    event.stopPropagation();
    // navigate(`/dashboard/brands/all-brands/${brand._id}`);
  }

  const handleDeleteBrand = (brand, event) => {
    event.stopPropagation();
    setBrandToDelete(brand);
  };

  const confirmDeleteBrand = async () => {
    if (brandToDelete) {
      setIsLoading(true);
      try {
        const deleteBrand = await brandService.delete([brandToDelete._id]);
       // console.log("Deleted Brand ", deleteBrand);

        toast.success(`Brand "${brandToDelete.name}" deleted`);
        setBrandToDelete(null);
        fetchAndProcessBrands(currentPage, currentFilters)

      } catch (err) {
        toast.error("Failed to delete brand", err.response?.data?.message);
        console.error("this is error ",err.response?.data?.message || err );
      }finally{
      setIsLoading(false)
    }
    }
  };

  const handleSelectBrand = (id) => {
    setSelectedBrandIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBrandIds.length === brandData.length) {
      setSelectedBrandIds([]);
    } else {
      setSelectedBrandIds(brandData.map((brand) => brand.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true)
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = brandData
      .filter(brand => selectedBrandIds.includes(brand.id))
      .map(brand => brand._id);
      setIsLoading(true);

    try {
      await brandService.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} brand(s) deleted`);
      setSelectedBrandIds([]);
      setShowBulkDeleteConfirm(false);

      fetchAndProcessBrands(currentPage, currentFilters);

    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected brands");
    }finally{
      setIsLoading(false)
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = brandData
      .filter(brand => selectedBrandIds.includes(brand.id))
      .map(brand => brand._id);

    try {
      await brandService.bulkUpdate({ ids: selectedRealIds, updates });
      toast.success(`${selectedRealIds.length} Brand(s) updated`);
      setSelectedBrandIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessBrands(currentPage, currentFilters);
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

    if (cleanFilters.status) {
      cleanFilters.status = cleanFilters.status;
    }

    if (cleanFilters.category) {
      cleanFilters.category = cleanFilters.category;
    }

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessBrands(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessBrands(1, {});
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessBrands(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);


     const downloadSample = async () => {
      setIsLoading(true);
      try {
        const res = await brandService.sampleData();
    
        console.log("this is res",res);
        
        // Create a blob from the response
        const blob = new Blob([res.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
    
        // Create a temporary URL for the blob
        const url = window.URL.createObjectURL(blob);
    
        // Create a link and trigger download
        const a = document.createElement("a");
        a.href = url;
        a.download = "brand_template.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
    
        // Free the object URL after download
        window.URL.revokeObjectURL(url);
    
        toast.success("Sample template downloaded successfully");
      } catch (error) {
        console.error("Error downloading sample:", error);
        toast.error("Failed to download sample template");
      } finally {
        setIsLoading(false);
      }
    };

  // Update your useEffect to use the new function
  useEffect(() => {
    fetchAndProcessBrands(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Brand Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage your brand catalog and categories
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddBrand}>
                  <Plus size={16} /> Add Brand
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Brands</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalBrands}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Tag className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Brands</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveBrands}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Package className="text-green-500" size={20} />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg shadow border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Inactive Brands</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalInActiveBrands}
                  </Typography>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <Package className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Brand Catalog</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={brandData}
              onApplyFilters={handleApplyFilters}
              onImportExcel={handleImportBrands}
              onClearFilters={resetToInitialData}
              onDownloadSample={downloadSample}
              showImportJson={false}
              showExportJson={false}
              showApplyButton={true}
              showCategoryOptions={true}
              showDownloadSample={true}
              exportFileName="brands"
            />
            {canDelete && selectedBrandIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedBrandIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedBrandIds.length})
                </Button>
              </div>
            )}
          </div>

          {isLoading && <Loader />}

          {!isLoading && (<div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 rounded-lg">
                <tr>
                  {canDelete && (
                    <th className="border-b py-3 px-4 text-left">
                      <input
                        type="checkbox"
                        checked={
                          selectedBrandIds.length === brandData.length &&
                          brandData.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {["ID", "Name", "Brand Image", "Category", "Status", "Created At", "Actions"].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                      <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {brandData.map((brand, key) => {
                  const className = `p-4 ${key === brandData.length - 1 ? "" : "border-b"}`;
                  const isSelected = selectedBrandIds.includes(brand.id);
                  return (
                    <tr key={brand.id}
                      onClick={(e) => { handleBrandDetails(brand, e) }}
                      className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}>
                      {canDelete && (
                        <td className={className}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelectBrand(brand.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                      )}
                      <td className={className}>{brand.id}</td>
                      <td className={className}>
                        <div className="max-w-xs">
                          <Typography variant="small" className="font-medium truncate">
                            {brand.name}
                          </Typography>
                        </div>
                      </td>
                      <td className={className}>
                        <img 
                          src={brand.imageUrl } 
                          alt={brand.name} 
                          className="w-16 h-10 object-cover rounded" 
                        />
                      </td>
                      <td className={className}>
                        {brand.category?.length > 0 ? (
                                                  <div className="flex flex-wrap gap-2">
                                                    {brand.category.map(cat => (
                                                      <Chip
                                                        key={cat._id}
                                                        variant="ghost"
                                                        color="blue"
                                                        value={cat.name}
                                                        className="text-xs"
                                                      />
                                                    ))}
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center gap-2">
                          <Package size={14} className="text-gray-500" />
                          <Typography variant="small" className="font-normal">
                            {brand.category || 'Uncategorized'}
                          </Typography>
                        </div>
                                                )}
                        
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={brand.status === 'active' ? "green" : brand.status ==='draft' ? 'yellow' :  "red"}
                          value={brand.status}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="font-normal text-blue-gray-600">
                          {brand.createdAt}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex space-x-2">
                          {canEdit && (
                            <button 
                              onClick={(e) => handleEditBrand(brand, e)} 
                              className="text-blue-500 hover:text-blue-700"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button 
                              onClick={(e) => handleDeleteBrand(brand, e)} 
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

          {brandData.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No brands found matching the search criteria
              </Typography>
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
            totalItems={totalBrands}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={brandToDelete !== null}
        onClose={() => setBrandToDelete(null)}
        onConfirm={confirmDeleteBrand}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brandToDelete?.name}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Brands"
        message={`Are you sure you want to delete ${selectedBrandIds.length} selected brand(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedBrandIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default BrandList;