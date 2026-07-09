import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, Shield, CheckCircle, XCircle } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';
import { IpService } from '@/api/services/ipWhiteList.service';

export const IpList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [ipData, setIpData] = useState([]);
  const [ipToDelete, setIpToDelete] = useState(null);
  const [selectedIpIds, setSelectedIpIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActiveIps, setTotalActiveIps] = useState(0);
  const [totalInActiveIps, setTotalInActiveIps] = useState(0);
  const [totalIps, setTotalIps] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddIp = () => {
    navigate('/dashboard/ip-whitelist/add');
  };

  const fetchAndProcessIps = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await IpService.list(page, filters);
      const fetchedData = res.data?.data?.ips || [];
      
      const paginationData = res.data?.data?.pagination;
      
      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessIps(page - 1, filters);
      }
      
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        network: item.network?.name || 'N/A',
        networkShortname: item.network?.shortname || '',
        ip: item.ip,
        status: item.status,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A',
      }));

      setIpData(mappedData);
      
      // Calculate statistics from fetched data
      const activeCount = fetchedData.filter(item => item.status === 'active').length;
      const inactiveCount = fetchedData.filter(item => item.status === 'inactive').length;
      
      setTotalActiveIps(activeCount);
      setTotalInActiveIps(inactiveCount);
      setTotalIps(paginationData.totalData || fetchedData.length);

      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);

    } catch (error) {
      console.error('Failed to fetch IP whitelist:', error);
      toast.error("Failed to fetch IP whitelist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditIp = (ip, event) => {
    event.stopPropagation();
    navigate(`/dashboard/ip-whitelist/edit/${ip._id}`);
  };

  const handleIpDetails = (ip, event) => {
    event.stopPropagation();
   // navigate(`/dashboard/ip-whitelist/details/${ip._id}`);
  };

  const handleDeleteIp = (ip, event) => {
    event.stopPropagation();
    setIpToDelete(ip);
  };

  const confirmDeleteIp = async () => {
    if (ipToDelete) {
      setIsLoading(true);
      try {
        const res = await IpService.delete([ipToDelete._id]);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`IP "${ipToDelete.ip}" deleted`);
        setIpToDelete(null);
        fetchAndProcessIps(currentPage, currentFilters);
      } catch (err) {
        toast.error("Failed to delete IP");
        console.log("Delete error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectIp = (id) => {
    setSelectedIpIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIpIds.length === ipData.length) {
      setSelectedIpIds([]);
    } else {
      setSelectedIpIds(ipData.map((ip) => ip.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = ipData
      .filter(ip => selectedIpIds.includes(ip.id))
      .map(ip => ip._id);

    try {
      const res = await IpService.delete(selectedRealIds);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedRealIds.length} IP(s) deleted`);
      setSelectedIpIds([]);
      setShowBulkDeleteConfirm(false);
      fetchAndProcessIps(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected IPs");
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = ipData
      .filter(ip => selectedIpIds.includes(ip.id))
      .map(ip => ip._id);

    try {
      const res = await IpService.bulkUpdate({ ids: selectedRealIds, updates });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${selectedRealIds.length} IP(s) updated`);
      setSelectedIpIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessIps(currentPage, currentFilters);
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

    if (cleanFilters.search) {
      cleanFilters.search = cleanFilters.search;
    }

    if (cleanFilters.status) {
      cleanFilters.status = cleanFilters.status;
    }

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessIps(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessIps(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessIps(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return "green";
      case 'inactive':
        return "red";
      default:
        return "yellow";
    }
  };

  useEffect(() => {
    fetchAndProcessIps(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">IP Whitelist Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage your IP whitelist entries
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddIp}>
                  <Plus size={16} /> Add IP
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
                  <Typography className="text-gray-600 text-sm">Total IPs</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalIps}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Shield className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active IPs</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveIps}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg shadow border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Inactive IPs</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalInActiveIps}
                  </Typography>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <XCircle className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">IP Whitelist Directory</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={ipData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              showImportButton={false}
              showExportButton={false}
              showApplyButton={true}
              showCategoryOptions={false}
              showDownloadSample={false}
              exportFileName="ip-whitelist"
            />
            {canDelete && selectedIpIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedIpIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedIpIds.length})
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
                            selectedIpIds.length === ipData.length &&
                            ipData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {["ID", "Network", "IP Address", "Status", "Created At", "Actions"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ipData.map((ip, key) => {
                    const className = `p-4 ${key === ipData.length - 1 ? "" : "border-b"}`;
                    const isSelected = selectedIpIds.includes(ip.id);
                    return (
                      <tr
                        key={ip.id}
                        onClick={(e) => handleIpDetails(ip, e)}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        {canDelete && (
                          <td className={className}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectIp(ip.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td className={className}>{ip.id}</td>
                        <td className={className}>
                          <div>
                            <Typography variant="small" className="font-medium">
                              {ip.network}
                            </Typography>
                            {ip.networkShortname && (
                              <Typography variant="small" className="text-gray-500 text-xs">
                                ({ip.networkShortname})
                              </Typography>
                            )}
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-mono font-medium">
                            {ip.ip}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(ip.status)}
                            value={ip.status}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-600">
                            {ip.createdAt}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex space-x-2">
                            {canEdit && (
                              <button
                                onClick={(e) => handleEditIp(ip, e)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={(e) => handleDeleteIp(ip, e)}
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

          {ipData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No IP whitelist entries found matching the search criteria
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
            totalItems={totalIps}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={ipToDelete !== null}
        onClose={() => setIpToDelete(null)}
        onConfirm={confirmDeleteIp}
        title="Delete IP Whitelist"
        message={`Are you sure you want to delete IP "${ipToDelete?.ip}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected IPs"
        message={`Are you sure you want to delete ${selectedIpIds.length} selected IP(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedIpIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default IpList;