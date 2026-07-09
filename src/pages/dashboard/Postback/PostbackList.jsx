import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, Link, CheckCircle, XCircle } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';
import { postbackService } from '@/api/services/postback.service';

export const PostbackList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [postbackData, setPostbackData] = useState([]);
  const [postbackToDelete, setPostbackToDelete] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [totalPostbacks, setTotalPostbacks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddPostback = () => navigate('/dashboard/postback/add');

  const fetchAndProcessPostbacks = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await postbackService.list(page, filters);
      const fetchedData = res.data?.data?.postbacks || [];
      const paginationData = res.data?.data;

      const mapped = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        network : item.network.name || 'N/A',
        affiliate: item.affiliate?.name || 'N/A',
        offer: item.offer?.name || 'N/A',
        event: item.event,
        postback: item.postback,
        status: item.status || 'N/A',
        createdAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'N/A',
      }));

      setPostbackData(mapped);

      setTotalActive(fetchedData.filter(pb => pb.status === 1).length);
      setTotalInactive(fetchedData.filter(pb => pb.status === 0).length);
      setTotalPostbacks(paginationData.totalData || 0);

      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);
    } catch (error) {
      console.error("Failed to fetch postbacks:", error);
      toast.error("Failed to fetch postbacks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditPostback = (pb, e) => {
    e.stopPropagation();
   // navigate(`/dashboard/postbacks/edit/${pb._id}`);
  };

  const handleDeletePostback = (pb, e) => {
    e.stopPropagation();
    setPostbackToDelete(pb);
  };

  const confirmDeletePostback = async () => {
    if (postbackToDelete) {
      setIsLoading(true);
      try {
        await postbackService.delete([postbackToDelete._id]);
        toast.success(`Postback for event "${postbackToDelete.event}" deleted`);
        setPostbackToDelete(null);
        fetchAndProcessPostbacks(currentPage, currentFilters);
      } catch {
        toast.error("Failed to delete postback");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === postbackData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(postbackData.map(pb => pb.id));
    }
  };

  const handleDeleteSelected = () => setShowBulkDeleteConfirm(true);

  const confirmBulkDelete = async () => {
    const ids = postbackData
      .filter(pb => selectedIds.includes(pb.id))
      .map(pb => pb._id);

    try {
      await postbackService.delete(ids);
      toast.success(`${ids.length} Postback(s) deleted`);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      fetchAndProcessPostbacks(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected postbacks");
    }
  };

  const handleBulkUpdate = () => setShowBulkUpdateDialog(true);

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const ids = postbackData
      .filter(pb => selectedIds.includes(pb.id))
      .map(pb => pb._id);

    try {
      await postbackService.bulkUpdate({ ids, updates });
      toast.success(`${ids.length} Postback(s) updated`);
      setSelectedIds([]);
      setShowBulkUpdateDialog(false);
      fetchAndProcessPostbacks(currentPage, currentFilters);
    } catch {
      toast.error("Bulk update failed");
    } finally {
      setBulkUpdateLoading(false);
    }
  };


  const handleApplyFilters = (filters) => {
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );
    setCurrentFilters(clean);
    setCurrentPage(1);
    fetchAndProcessPostbacks(1, clean);
  };

  const resetFilters = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessPostbacks(1, {});
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    fetchAndProcessPostbacks(p, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  useEffect(() => {
    fetchAndProcessPostbacks(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Postback Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage all affiliate postbacks
              </Typography>
            </div>
            {canCreate && (
              <Button variant="outlined" color="white" size="sm"
                className='flex items-center gap-2 p-3'
                onClick={handleAddPostback}>
                <Plus size={16} /> Add Postback
              </Button>
            )}
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <Typography className="text-gray-600 text-sm">Total Postbacks</Typography>
              <Typography variant="h4" className="font-bold text-blue-800">{totalPostbacks}</Typography>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border">
              <Typography className="text-gray-600 text-sm">Success</Typography>
              <Typography variant="h4" className="font-bold text-green-700">{totalActive}</Typography>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border">
              <Typography className="text-gray-600 text-sm">Failed</Typography>
              <Typography variant="h4" className="font-bold text-red-700">{totalInactive}</Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <Typography variant="h6" color="white">Postback Directory</Typography>
        </CardHeader>
        <CardBody className="px-4">
          <TableToolbar
            data={postbackData}
            onApplyFilters={handleApplyFilters}
            onClearFilters={resetFilters}
            showImportButton={false}
            showExportButton={false}
            showApplyButton={true}
            statusOptions={["success", "failed" ]}
            showCategoryOptions={false}
            showDownloadSample={false}
          />

          {canDelete && selectedIds.length > 0 && (
            <div className="mb-4 mt-2 flex gap-2">
              <Button color="blue" onClick={handleBulkUpdate} className="flex items-center gap-2 p-4">
                <Edit size={16} /> Update Selected ({selectedIds.length})
              </Button>
              <Button color="red" onClick={handleDeleteSelected} className="flex items-center gap-2 p-4">
                <Trash2 size={16} /> Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {isLoading && <Loader />}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    {canDelete && (
                      <th className="border-b py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === postbackData.length && postbackData.length > 0}
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {["ID","Network", "Affiliate", "Offer", "Event", "Postback URL", "Status", "Created At", "Actions"].map((h) => (
                      <th key={h} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {h}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {postbackData.map((pb, i) => {
                    const cls = `p-4 ${i === postbackData.length - 1 ? '' : 'border-b'}`;
                    const isSel = selectedIds.includes(pb.id);
                    return (
                      <tr key={pb.id} className={`hover:bg-gray-50 ${isSel ? 'bg-blue-50' : ''}`}>
                        {canDelete && (
                          <td className={cls}>
                            <input
                              type="checkbox"
                              checked={isSel}
                              onChange={() => handleSelect(pb.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td className={cls}>{pb.id}</td>
                        <td className={cls}>{pb.network}</td>
                        <td className={cls}>{pb.affiliate}</td>
                        <td className={cls}>{pb.offer}</td>
                        <td className={cls}>{pb.event}</td>
                        <td className={`${cls} font-mono text-xs`}>{pb.postback}</td>
                        <td className={cls}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(pb.status)}
                            value={pb.status}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={cls}>{pb.createdAt}</td>
                        <td className={cls}>
                          <div className="flex space-x-2">
                            {/* {canEdit && (
                              <button onClick={(e) => handleEditPostback(pb, e)} className="text-blue-500 hover:text-blue-700">
                                <Edit size={18} />
                              </button>
                            )} */}
                            {canDelete && (
                              <button onClick={(e) => handleDeletePostback(pb, e)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={18} />
                              </button>
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

          {postbackData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray">No postbacks found</Typography>
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
            totalItems={totalPostbacks}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={postbackToDelete !== null}
        onClose={() => setPostbackToDelete(null)}
        onConfirm={confirmDeletePostback}
        title="Delete Postback"
        message={`Are you sure you want to delete this postback? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Postbacks"
        message={`Are you sure you want to delete ${selectedIds.length} postback(s)?`}
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

export default PostbackList;
