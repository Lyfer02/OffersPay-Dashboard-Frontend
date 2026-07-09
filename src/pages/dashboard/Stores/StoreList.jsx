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
import { Edit, Plus, Trash2, Store, MapPin, Building, Star, Network, DollarSign, Clock, ShoppingBagIcon, IndianRupeeIcon } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import { storeService } from '@/api/services/stores.service';
import { StarRating } from '@/utils/StarRating';
import Loader from '@/utils/Loader';
import { getImageUrl, getPlaceholderImage } from '@/utils/imageUtils';

export const StoreList = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  // Get permissions directly from auth context
  const { canEdit, canDelete, canCreate, hasPermission } = useAuth();

  const [storeData, setStoreData] = useState([]);
  const [storeToDelete, setStoreToDelete] = useState(null);
  const [selectedStoreIds, setSelectedStoreIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActiveStores, setTotalActiveStores] = useState(0);
  const [totalInActiveStores, setTotalInActiveStores] = useState(0);
  const [totalStores, setTotalStores] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddStore = () => {
    navigate('/dashboard/stores/add-stores');
  };

  // Create a separate function for fetching and processing data
  const fetchAndProcessStores = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await storeService.list(page, filters);
     // console.log("Store API response:", res);

      const fetchedData = res.data?.data.storeData || [];
      const paginationData = res.data?.data;

      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessStores(page - 1, filters);
      }

      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((paginationData.currentPage - 1) * 10) + index + 1,
        name: item.name,
        imageUrl: getImageUrl(item.image),
        about: item.about,
        status: item.status,
        rating: item.rating || 0,
        // Network information
        network: item.network?.name || "No Network",
        networkId: item.network?._id || null,
        // New fields from store.model.js
        trackingSpeed: item.trackingSpeed || "24 hours",
        confirmation: item.confirmation || "90 Days",
        earn: item.earn || 0,
        // API Configuration status
        apiConfigured: !!(item.apiKey || item.authTokens || item.credentials),
        apiKey: item.apiKey ? "Configured" : "Not Set",
        authTokens: item.authTokens ? "Configured" : "Not Set",
        credentials: item.credentials ? "Configured" : "Not Set",
        networkUniqueKey: item.networkUniqueKey || "-",
        subIds: item.subIds || "-",
        networkSubId: item.networkSubId || "-",
        campainInfoUrl: item.campainInfoUrl || "-",
        // Arrays
        earningRatesCount: item.earningRates?.length || 0,
        termsCount: item.termsAndConditions?.length || 0,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString(),
        createdAtFull: new Date(item.createdAt).toLocaleString(),
        updatedAtFull: new Date(item.updatedAt).toLocaleString(),
      }));

      setStoreData(mappedData);
      setTotalActiveStores(paginationData.totalActiveStores || 0);
      setTotalInActiveStores(paginationData.totalInactiveStores || 0);
      setTotalStores(paginationData.totalData || 0);

      setCurrentPage(paginationData.currentPage || 1);
      setTotalPages(paginationData.totalPages || 1);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);

    } catch (error) {
      console.error('Failed to fetch stores:', error);
      toast.error("Failed to fetch stores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportStores = async (file) => {
    setIsLoading(true);
    try {
      const res = await storeService.importData(file);
      console.log("Imported stores response", res);

      const successCount = res?.data?.data?.successCount || 0;
      const errorCount = res?.data?.data?.errorCount || 0;
      const errors = res?.data?.data?.errors || [];

      // Build main toast message
      let message = `${successCount} store(s) imported successfully.`;

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

      // Refresh store list
      await fetchAndProcessStores();
      
    } catch (err) {
      console.error("Import failed", err);
      toast.error("Failed to import stores");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      const res = await storeService.export();

      // Create a blob from the response
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "store_data.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();

      // Free the object URL after download
      window.URL.revokeObjectURL(url);

      toast.success("store data downloaded successfully");
    } catch (error) {
      console.error("Error downloading data:", error);
      toast.error("Failed to download data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStore = (store, event) => {
    event.stopPropagation();
    navigate(`/dashboard/stores/edit/${store._id}`);
  };

  const handleStoreDetails = (store, event) => {
    event.stopPropagation();
    console.log("Navigating to store details");
    navigate(`/dashboard/stores/details/${store._id}`);
  }

  const handleDeleteStore = (store, event) => {
    event.stopPropagation();
    setStoreToDelete(store);
  };

  const confirmDeleteStore = async () => {
    if (storeToDelete) {
      setIsLoading(true);
      try {
        const deleteStore = await storeService.delete([storeToDelete._id]);

        toast.success(`Store "${storeToDelete.name}" deleted`);
        setStoreToDelete(null);
        fetchAndProcessStores(currentPage, currentFilters)

      } catch (err) {
        toast.error("Failed to delete store", err.response?.data?.message);
        console.log("Delete error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectStore = (id) => {
    setSelectedStoreIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedStoreIds.length === storeData.length) {
      setSelectedStoreIds([]);
    } else {
      setSelectedStoreIds(storeData.map((store) => store.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true)
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = storeData
      .filter(store => selectedStoreIds.includes(store.id))
      .map(store => store._id);

    try {
      await storeService.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} store(s) deleted`);
      setSelectedStoreIds([]);
      setShowBulkDeleteConfirm(false);

      fetchAndProcessStores(currentPage, currentFilters);

    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected stores");
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = storeData
      .filter(store => selectedStoreIds.includes(store.id))
      .map(store => store._id);

    try {
      await storeService.bulkUpdate({ ids: selectedRealIds, updates });
      toast.success(`${selectedRealIds.length} Store(s) updated`);
      setSelectedStoreIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessStores(currentPage, currentFilters);
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

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessStores(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessStores(1, {});
  };

  // Pagination handlers
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessStores(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const downloadSample = async () => {
    setIsLoading(true);
    try {
      const res = await storeService.sampleData();

      // Create a blob from the response
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a link and trigger download
      const a = document.createElement("a");
      a.href = url;
      a.download = "store_template.xlsx";
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

  useEffect(() => {
    fetchAndProcessStores(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      {/* Summary Cards */}
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Store Management Dashboard</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage your affiliate stores, networks, and API configurations
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddStore}>
                  <Plus size={16} /> Add Store
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
                  <Typography className="text-gray-600 text-sm">Total Stores</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalStores}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Store className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Stores</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveStores}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Building className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg shadow border border-yellow-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Draft Stores</Typography>
                  <Typography variant="h4" className="font-bold text-yellow-700">
                    {totalStores - totalActiveStores - totalInActiveStores}
                  </Typography>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Clock className="text-yellow-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg shadow border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Inactive Stores</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalInActiveStores}
                  </Typography>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <Building className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Store List */}
      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Store Directory & Network Management</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={storeData}
              onApplyFilters={handleApplyFilters}
              onImportExcel={handleImportStores}
              onClearFilters={resetToInitialData}
              onExportExcel={handleExportData}
              showImportJson={false}
              showExportJson={false}
              showApplyButton={true}
              showCategoryOptions={false}
              showDownloadSample={true}
              onDownloadSample={downloadSample}
              exportFileName="stores"
            />
            {canDelete && selectedStoreIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedStoreIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedStoreIds.length})
                </Button>
              </div>
            )}
          </div>

          {isLoading && <Loader />}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    {canDelete && (
                      <th className="border-b py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedStoreIds.length === storeData.length &&
                            storeData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {["ID", "Name", "Image", "Rating", "Network", "Status", "Earn", "Tracking", "API Status", "Actions"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {storeData.map((store, key) => {
                    const className = `p-4 ${key === storeData.length - 1 ? "" : "border-b"}`;
                    const isSelected = selectedStoreIds.includes(store.id);
                    return (
                      <tr key={store.id}
                        onClick={(e) => { handleStoreDetails(store, e) }}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}>
                        {canDelete && (
                          <td className={className}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectStore(store.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td className={className}>{store.id}</td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="font-medium truncate">
                              {store.name}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs">
                              {store.about?.substring(0, 30)}{store.about?.length > 30 ? '...' : ''}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <img
                            src={store.imageUrl}
                            alt={store.name}
                            className="w-16 h-10 object-cover rounded-md shadow-sm"
                          />
                        </td>
                        <td className={className}>
                          <StarRating rating={store.rating} />
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <ShoppingBagIcon size={14} className="text-purple-600" />
                            <div>
                              <Typography variant="small" className="font-medium truncate max-w-24">
                                {store.network}
                              </Typography>
                            </div>
                          </div>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={store.status === 'active' ? "green" : store.status === 'draft' ? 'yellow' : "red"}
                            value={store.status}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-1">
                            <IndianRupeeIcon size={14} className="text-green-600" />
                            <Typography variant="small" className="font-medium text-green-700">
                              {store.earn}%
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-600">
                            {store.trackingSpeed}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            size="sm"
                            variant="ghost"
                            color={store.apiConfigured ? "green" : "red"}
                            value={store.apiConfigured ? "Configured" : "Not Set"}
                            className="py-1 px-2 text-[10px] font-medium w-fit"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex space-x-2">
                            {canEdit && (
                              <button
                                onClick={(e) => handleEditStore(store, e)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={(e) => handleDeleteStore(store, e)}
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
            </div>
          )}

          {storeData.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No stores found matching the search criteria
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
            totalItems={totalStores}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      {/* Confirmation Dialogs */}
      <ConfirmationDialog
        isOpen={storeToDelete !== null}
        onClose={() => setStoreToDelete(null)}
        onConfirm={confirmDeleteStore}
        title="Delete Store"
        message={`Are you sure you want to delete "${storeToDelete?.name}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Stores"
        message={`Are you sure you want to delete ${selectedStoreIds.length} selected store(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedStoreIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default StoreList;