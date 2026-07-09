// 🚀 Improved CarouselSettings.jsx with better filters and table rendering

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, ExternalLink, Image } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { bannerService } from '@/api/services/banner.service';
import { toast } from 'react-toastify';
import TablePagination from '@/widgets/components/tablePagination';
import { useAuth } from '@/pages/auth/authContext';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import * as xlsx from 'xlsx';
import Loader from '@/utils/Loader';

export const CarouselSettings = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate, hasPermission } = useAuth();
  const [carouselData, setCarouselData] = useState([]);
  const [bannerToDelete, setBannerToDelete] = useState(null);
  const [selectedBannerIds, setSelectedBannerIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [totalActiveProducts,setTotalActiveProducts]=useState(0);
    const [totalCategories ,setTotalCategories]=useState(0);

       const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
        const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
    
  const [currentFilters, setCurrentFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalBanners, setTotalBanners] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
  
  const fetchAndProcessBanners = async (page = 1, filters = {}) => {
    setIsLoading(true)
    try {
      const res = await bannerService.list(page, filters);
      console.log("this is res",res);
      
      const fetchedData = res.data?.data?.bannerData || [];
                if (fetchedData.length === 0 && page > 1) {
      return fetchAndProcessBanners(page - 1, filters); // recursively call with previous page
    }
      setTotalCategories(res.data.data?.totalCategories)
      setTotalActiveProducts(res.data.data?.totalActiveBanners
)
      const paginationData = res.data?.data;

      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: (paginationData.currentPage - 1) * paginationData.limit + index + 1,
        name: item.name,
        imageUrl: item.image?.startsWith('http')
          ? item.image
          : `${apiUrl}/${item.image?.replace(/^public[\\/]/, '').replace(/\\/g, '/')}`,
        category: item.category?.name || 'No category found',
        url: item.url,
        status: item.status,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
      }));

      setCarouselData(mappedData);
      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);
      setTotalBanners(paginationData.totalData);
    } catch (error) {
      console.error('Failed to fetch banners:', error);
      toast.error('Failed to fetch banners');
    }finally{
      setIsLoading(false)
    }
  };

    // Custom export function to export all data
  const handleExportAllData = () => {
    setIsLoading(true)
    try {
      //console.log("this is  carousalData",carouselData);
      
      // Prepare data for export with all fields from the Banner model
      const exportData = carouselData.map((item, index) => ({
        'id': index + 1,
        'name': item.name || '',
        'imageUrl': item.imageUrl || '',
        'category': item.category|| '',
        'url': item.url || '',
        'status': item.status || '',
      }));

      // Create workbook and worksheet
      const wb = xlsx.utils.book_new();
      const ws = xlsx.utils.json_to_sheet(exportData);

      // Auto-size columns
      const colWidths = [];
      const headers = Object.keys(exportData[0] || {});
      headers.forEach((header, index) => {
        const maxLength = Math.max(
          header.length,
          ...exportData.map(row => String(row[header] || '').length)
        );
        colWidths[index] = { width: Math.min(maxLength + 2, 50) };
      });
      ws['!cols'] = colWidths;

      // Add worksheet to workbook
      xlsx.utils.book_append_sheet(wb, ws, 'Banners');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `banners_export_${timestamp}.xlsx`;

      // Save file
      xlsx.writeFile(wb, filename);

      toast.success(`Data exported successfully as ${filename}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }finally{
      setIsLoading(false)
    }
  };

 const handleImportOffers = async (file) => {
  setIsLoading(true)
  try {
    const res = await bannerService.importData(file);
   // console.log("imported banners are ", res);

    const successCount = res?.data?.data?.successCount || 0;
    const failedCount = res?.data?.data?.failedCount || 0;
    const failedDetails = res?.data?.data?.failedDetails || [];

    // Prepare failed error summaries
    const failedErrors = failedDetails
      .slice(0, 3) // show up to first 3 errors
      .map((f, i) => `Row ${f.index + 2}: ${f.error}`) // +2 to match Excel row number (headers + 1-based index)
      .join('\n');

    // Build toast message
    let message = `${successCount} banner(s) imported successfully.`;

    if (failedCount > 0) {
      toast.success(`${message}\n`)
      toast.error(`\n ${failedCount} Failed : ${failedErrors}`);
    } else {
      toast.success(message);
    }

    // Refresh the data
    await fetchAndProcessBanners();

  } catch (err) {
    console.error("Import failed", err);
    toast.error(err.response?.data?.message || "Failed to import banners");
  }finally{
      setIsLoading(false)
    }
};

  const handleApplyFilters = (filters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );

      // 🟩 Map search term to `name`
  if (cleanFilters.search) {
    cleanFilters.name = cleanFilters.search;
    delete cleanFilters.search;
  }
    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessBanners(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessBanners(1, {});
  };

  const handleAddBanner = () => navigate('/dashboard/ads/add-banners');

  const handleEditBanner = (banner, event) => {
    event.stopPropagation();
    navigate(`/dashboard/ads/${banner._id}`);
  };

  const handleBannerDetails = (banner, event) => {
    event.stopPropagation();
    navigate(`/dashboard/ads/banners/${banner._id}`);
  };

  const handleDeleteBanner = (banner, event) => {
    event.stopPropagation();
    setBannerToDelete(banner);
  };

  const confirmDeleteBanner = async () => {
    if (bannerToDelete) {
      setIsLoading(true)
      try {
        await bannerService.delete([bannerToDelete._id]);
        toast.success(`Banner "${bannerToDelete.name}" deleted`);
        fetchAndProcessBanners(currentPage, currentFilters);
        setBannerToDelete(null);
      } catch (err) {
        toast.error("Failed to delete banner");
      }finally{
      setIsLoading(false)
    }
    }
  };

  const handleSelectBanner = (id) => {
    setSelectedBannerIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedBannerIds.length === carouselData.length) {
      setSelectedBannerIds([]);
    } else {
      setSelectedBannerIds(carouselData.map((b) => b.id));
    }
  };

  const handleDeleteSelected = async () => setShowBulkDeleteConfirm(true);

  const confirmBulkDelete = async () => {
    setIsLoading(true)
    const selectedRealIds = carouselData
      .filter((b) => selectedBannerIds.includes(b.id))
      .map((b) => b._id);

    try {
      await bannerService.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} banner(s) deleted`);
      setSelectedBannerIds([]);
      setShowBulkDeleteConfirm(false);
      fetchAndProcessBanners(currentPage, currentFilters);
    } catch (err) {
      toast.error("Failed to delete selected banners");
    }finally{
      setIsLoading(false)
    }
  };


      const handleBulkUpdate = () => {
        setShowBulkUpdateDialog(true);
      };
    
      const confirmBulkUpdate = async (updates) => {
        setBulkUpdateLoading(true);
        const selectedRealIds = carouselData
          .filter(user => selectedBannerIds.includes(user.id))
          .map(user => user._id);
                                                                                                            
        try {
         const response= await bannerService.bulkUpdate({ ids: selectedRealIds, updates });
         //console.log("bulk update",response);
          
         toast.success(`${selectedRealIds.length} Banner(s) updated`);
          setSelectedBannerIds([]);
          setShowBulkUpdateDialog(false);
          await fetchAndProcessBanners(currentPage, currentFilters);
        } catch (err) {
          console.log("this is error ",err);
          
          toast.error(err.response?.data?.message || 'Bulk update failed');
        } finally {
          setBulkUpdateLoading(false);
        }
      };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessBanners(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  useEffect(() => {
    fetchAndProcessBanners(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Carousel Settings</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage carousel banners for your storefront
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddBanner}>
                  <Plus size={16} /> Add Banner
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
                  <Typography className="text-gray-600 text-sm">Total Banners</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalBanners}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Image className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Banners</Typography>
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
                  <Image className="text-amber-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
         <CardHeader variant="gradient" color="gray" className=" p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Carousel Banners</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6 ">
          <TableToolbar
            data={carouselData}
            onApplyFilters={handleApplyFilters}
            onImportExcel={handleImportOffers}
            onExportExcel={handleExportAllData}
            showImportJson={false}
            showExportJson={false}
            showBannerOptions={true}
            showApplyButton={true}
            exportFileName="banners"
            onClearFilters={resetToInitialData}
          />

          {canDelete && selectedBannerIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                              <Button
                                                color="blue"
                                                variant="filled"
                                                onClick={handleBulkUpdate}
                                                className="flex items-center gap-2 p-4"
                                              >
                                                <Edit size={16} /> Update Selected ({selectedBannerIds.length})
                                              </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedBannerIds.length})
                </Button>
              </div>
            )}
            </div>

                 {isLoading && <Loader/>}

          {!isLoading && (<div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 rounded-lg">
                <tr>
                  {canDelete &&(<th className="border-b py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={selectedBannerIds.length === carouselData.length && carouselData.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>)}
                  {['ID', 'Name', 'Image','Category', 'URL', 'Status', 'Created At', 'Actions'].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                      <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carouselData.map((banner, key) => {
                  const className = `p-4 ${key === carouselData.length - 1 ? '' : 'border-b'}`;
                  const isSelected = selectedBannerIds.includes(banner.id);
                  return (
                    <tr key={banner.id} onClick={(e) => handleBannerDetails(banner, e)} className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}>
                      {canDelete && (<td className={className}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectBanner(banner.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>)}
                      <td className={className}>{banner.id}</td>
                      <td className={className}>{banner.name}</td>
                      <td className={className}>
                        <img src={banner.imageUrl || '/img/noimage.jpeg'} 
                        alt={banner.name} className="w-16 h-10 object-cover rounded"
                         />
                      </td>
                      <td className={className}>{banner.category}</td>
                      <td className={className}>
                        <a href={banner.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs hover:underline flex items-center max-w-32">
                          <span className="truncate">
                            {banner.url?.length > 30 ? `${banner.url.substring(0, 30)}...` : banner.url}
                          </span>
                          <ExternalLink size={12} className="ml-1" />
                        </a>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={banner.status === 'active' ? 'green' : 'red'}
                          value={banner.status}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>{banner.createdAt}</td>
                      <td className={className}>
                        <div className="flex space-x-2">
                         {canEdit && (<button onClick={(e) => handleEditBanner(banner, e)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>)}
                          {canDelete && (<button onClick={(e) => handleDeleteBanner(banner, e)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>)}
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

          {carouselData.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">No banners found matching the search criteria</Typography>
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
            totalItems={totalBanners}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={bannerToDelete !== null}
        onClose={() => setBannerToDelete(null)}
        onConfirm={confirmDeleteBanner}
        title="Delete Banner"
        message={`Are you sure you want to delete "${bannerToDelete?.name}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Banners"
        message={`Are you sure you want to delete ${selectedBannerIds.length} selected banner(s)? This action cannot be undone.`}
      />

                  <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedBannerIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default CarouselSettings;
