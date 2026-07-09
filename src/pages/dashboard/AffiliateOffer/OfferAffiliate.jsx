import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, Target, DollarSign, TrendingUp } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';
import { offerAffiliateservice } from '@/api/services/offerAffiliate.service';

export const OfferAffiliate = () => {
  const navigate = useNavigate();
  
  const { canEdit, canDelete, canCreate } = useAuth();

  const [offerAffiliateData, setOfferAffiliateData] = useState([]);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAdd = () => {
    navigate('/dashboard/products/add-affiliate-offer');
  };

  const fetchAndProcessData = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await offerAffiliateservice.list(page, filters);
      const fetchedData = res.data?.data?.results || [];
      const paginationData = res.data?.data?.pagination;
      
      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessData(page - 1, filters);
      }
      
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        offerName: item.offer_id?.name || 'N/A',
        offerId: item.offer_id?._id,
        affiliateName: item.affiliate_id?.fullName || 'N/A',
        affiliateUserName: item.affiliate_id?.userName || 'N/A',
        affiliateEmail: item.affiliate_id?.email || 'N/A',
        affiliateId: item.affiliate_id?._id,
        goalName: item.goalName || 'N/A',
        goalModel: item.goalModel || 'N/A',
        productModel: item.product_model || 'N/A',
        defaultPayout: item.default_payout || 0,
        defaultRevenue: item.default_revenue || 0,
        currency: item.currency || 'INR',
        status: item.status || 'N/A',
      }));

      setOfferAffiliateData(mappedData);
      setTotalItems(paginationData?.totalData || 0);
      setCurrentPage(paginationData?.currentPage || 1);
      setTotalPages(paginationData?.totalPages || 1);
      setHasNextPage(paginationData?.hasNextPage || false);
      setHasPrevPage(paginationData?.hasPrevPage || false);

    } catch (error) {
      console.error('Failed to fetch offer affiliates:', error);
      toast.error("Failed to fetch offer affiliates");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item, event) => {
    event.stopPropagation();
    console.log("goign to edit form");
    
    navigate(`/dashboard/products/edit-affiliate-offer/${item._id}`);
  };

  const handleDetails = (item, event) => {
    event.stopPropagation();
    toast.success('navigated to details page')
   // navigate(`/dashboard/offer-affiliate/details/${item._id}`);
  };

  const handleDelete = (item, event) => {
    event.stopPropagation();
    setItemToDelete(item);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      setIsLoading(true);
      try {
        const res = await offerAffiliateservice.delete([itemToDelete._id]);
        toast.success(`Offer affiliate mapping deleted`);
        setItemToDelete(null);
        fetchAndProcessData(currentPage, currentFilters);
      } catch (err) {
        toast.error("Failed to delete offer affiliate");
        console.log("Delete error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === offerAffiliateData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(offerAffiliateData.map((item) => item.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = offerAffiliateData
      .filter(item => selectedIds.includes(item.id))
      .map(item => item._id);

    try {
      const res = await offerAffiliateservice.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} offer affiliate(s) deleted`);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      fetchAndProcessData(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected items");
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = offerAffiliateData
      .filter(item => selectedIds.includes(item.id))
      .map(item => item._id);

    try {
      const res = await offerAffiliateservice.bulkUpdate({ ids: selectedRealIds, updates });
      toast.success(`${selectedRealIds.length} offer affiliate(s) updated`);
      setSelectedIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessData(currentPage, currentFilters);
    } catch (err) {
      toast.error('Bulk update failed');
    } finally {
      setBulkUpdateLoading(false);
    }
  };

  const handleApplyFilters = (filters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessData(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessData(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessData(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return "green";
      case 'draft':
        return 'yellow';
      case 'inactive':
        return "red";
      default:
        return "gray";
    }
  };

  useEffect(() => {
    fetchAndProcessData(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Offer Affiliate Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage affiliate assignments to offers with custom payouts
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAdd}>
                  <Plus size={16} /> Assign Affiliate
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
                  <Typography className="text-gray-600 text-sm">Total Mappings</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalItems}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Target className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Affiliates</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {offerAffiliateData.filter(item => item.status === 'active').length}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg shadow border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Unique Offers</Typography>
                  <Typography variant="h4" className="font-bold text-purple-700">
                    {new Set(offerAffiliateData.map(item => item.offerId)).size}
                  </Typography>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <DollarSign className="text-purple-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Offer-Affiliate Directory</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={offerAffiliateData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              showImportButton={false}
              showExportButton={false}
              showApplyButton={true}
              showCategoryOptions={false}
              showDownloadSample={false}
              exportFileName="offer-affiliates"
            />
            {canDelete && selectedIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedIds.length})
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
                            selectedIds.length === offerAffiliateData.length &&
                            offerAffiliateData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {["ID", "Offer Name", "Affiliate Name", "Goal", "Model", "Payout", "Revenue", "Currency", "Status", "Actions"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {offerAffiliateData.map((item, key) => {
                    const className = `p-4 ${key === offerAffiliateData.length - 1 ? "" : "border-b"}`;
                    const isSelected = selectedIds.includes(item.id);
                    return (
                      <tr
                        key={item.id}
                        onClick={(e) => handleDetails(item, e)}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        {canDelete && (
                          <td className={className}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelect(item.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td className={className}>{item.id}</td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium text-blue-600">
                            {item.offerName}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div>
                            <Typography variant="small" className="font-medium">
                              {item.affiliateName}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs">
                              @{item.affiliateUserName}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <div>
                            <Typography variant="small" className="font-medium">
                              {item.goalName}
                            </Typography>
                            <Chip
                              size="sm"
                              value={item.goalModel}
                              color="blue"
                              className="w-fit mt-1"
                            />
                          </div>
                        </td>
                        <td className={className}>
                          <Chip
                            size="sm"
                            value={item.productModel}
                            color="amber"
                            className="w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-bold text-green-600">
                            {item.currency} {item.defaultPayout}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-bold text-purple-600">
                            {item.currency} {item.defaultRevenue}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            size="sm"
                            value={item.currency}
                            color="blue"
                            className="w-fit"
                          />
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(item.status)}
                            value={item.status}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex space-x-2">
                            {canEdit && (
                              <button
                                onClick={(e) => handleEdit(item, e)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={(e) => handleDelete(item, e)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                            {!canEdit && !canDelete && (
                              <span className="text-gray-400 text-sm">No actions</span>
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

          {offerAffiliateData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No offer affiliate mappings found
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
            totalItems={totalItems}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={itemToDelete !== null}
        onClose={() => setItemToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Offer Affiliate"
        message={`Are you sure you want to delete this offer-affiliate mapping? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Mappings"
        message={`Are you sure you want to delete ${selectedIds.length} selected mapping(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default OfferAffiliate;