import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, Network as NetworkIcon, Globe, Shield } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
// import { networkService } from '@/api/services/networks.service';

import { networkService } from '@/api/services/network.service';
import Loader from '@/utils/Loader';

export const NetworkList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [networkData, setNetworkData] = useState([]);
  const [networkToDelete, setNetworkToDelete] = useState(null);
  const [selectedNetworkIds, setSelectedNetworkIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActiveNetworks, setTotalActiveNetworks] = useState(0);
  const [totalInActiveNetworks, setTotalInActiveNetworks] = useState(0);
  const [totalNetworks, setTotalNetworks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddNetwork = () => {
    navigate('/dashboard/network/add-network');
  };

  

  const fetchAndProcessNetworks = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      // Uncomment when service is available
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await networkService.list(page, filters);
      const fetchedData = res.data?.data.networks || [];

     // console.log("this is fetched Network", res);
    
      const paginationData = res.data?.data?.pagination;
      const staticsData = res.data?.data?.statistics ;
      
      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessNetworks(page - 1, filters); // recursively call with previous page
      }
      
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        name: item.name,
        shortname: item.shortname,
        affiliateId : item.affiliateId,
        currency: item.currency,
        status: item.status,
        authType: item.authType,
        confirmDays: item.confirmDays,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      }));

      setNetworkData(mappedData);
      setTotalActiveNetworks(staticsData.totalActive);
      setTotalInActiveNetworks(staticsData.totalInactive);
      setTotalNetworks(staticsData.totalCount);

      setCurrentPage(paginationData.currentPage);
      
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);

      
      //console.log("current page",paginationData);

    } catch (error) {
      console.error('Failed to fetch networks:', error);
      toast.error("Failed to fetch networks");
    } finally {
      setIsLoading(false);
    }
  };

//   const handleImportNetworks = async (file) => {
//     setIsLoading(true);
//     try {
//       // Uncomment when service is available
//       // const res = await networkService.importData(file);
//       // const successCount = res?.data?.data?.successCount || 0;
//       // const errorCount = res?.data?.data?.errorCount || 0;
//       // const errors = res?.data?.data?.errors || [];

//       // Mock implementation
//       await new Promise(resolve => setTimeout(resolve, 2000));
//       toast.success("2 network(s) imported successfully.");
//       await fetchAndProcessNetworks();
//     } catch (err) {
//       console.error("Import failed", err);
//       toast.error("Failed to import networks");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleExportData = async () => {
//     setIsLoading(true);
//     try {
//       // Uncomment when service is available
//       // const res = await networkService.export();
//       // const blob = new Blob([res.data], {
//       //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       // });
//       // const url = window.URL.createObjectURL(blob);
//       // const a = document.createElement("a");
//       // a.href = url;
//       // a.download = "network_data.xlsx";
//       // document.body.appendChild(a);
//       // a.click();
//       // a.remove();
//       // window.URL.revokeObjectURL(url);
      
//       // Mock implementation
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success("Network data downloaded successfully");
//     } catch (error) {
//       console.error("Error downloading data:", error);
//       toast.error("Failed to download data");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const downloadSample = async () => {
//     setIsLoading(true);
//     try {
//       // Uncomment when service is available
//       // const res = await networkService.sampleData();
//       // const blob = new Blob([res.data], {
//       //   type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//       // });
//       // const url = window.URL.createObjectURL(blob);
//       // const a = document.createElement("a");
//       // a.href = url;
//       // a.download = "network_template.xlsx";
//       // document.body.appendChild(a);
//       // a.click();
//       // a.remove();
//       // window.URL.revokeObjectURL(url);
      
//       // Mock implementation
//       await new Promise(resolve => setTimeout(resolve, 1000));
//       toast.success("Sample template downloaded successfully");
//     } catch (error) {
//       console.error("Error downloading sample:", error);
//       toast.error("Failed to download sample template");
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const handleEditNetwork = (network, event) => {
    event.stopPropagation();
    navigate(`/dashboard/network/edit/${network._id}`);
  };

  const handleNetworkDetails = (network, event) => {
    event.stopPropagation();
    navigate(`/dashboard/network/details/${network._id}`);
  };

  const handleDeleteNetwork = (network, event) => {
    event.stopPropagation();
    setNetworkToDelete(network);
  };

  const confirmDeleteNetwork = async () => {
    if (networkToDelete) {
      setIsLoading(true);
      try {
        // Uncomment when service is available
         const res =await networkService.delete([networkToDelete._id]);
        console.log("this is demo",res);
        
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Network "${networkToDelete.name}" deleted`);
        setNetworkToDelete(null);
        fetchAndProcessNetworks(currentPage, currentFilters);
      } catch (err) {
        toast.error("Failed to delete network");
        console.log("Delete error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectNetwork = (id) => {
    setSelectedNetworkIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedNetworkIds.length === networkData.length) {
      setSelectedNetworkIds([]);
    } else {
      setSelectedNetworkIds(networkData.map((network) => network.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = networkData
      .filter(network => selectedNetworkIds.includes(network.id))
      .map(network => network._id);

    try {
      // Uncomment when service is available
               const res =await networkService.delete(selectedRealIds);
        console.log("this is demo",res);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedRealIds.length} network(s) deleted`);
      setSelectedNetworkIds([]);
      setShowBulkDeleteConfirm(false);
      fetchAndProcessNetworks(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error( "Failed to delete selected networks");
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = networkData
      .filter(network => selectedNetworkIds.includes(network.id))
      .map(network => network._id);

    try {
      // Uncomment when service is available
     const res= await networkService.bulkUpdate({ ids: selectedRealIds, updates });
    //  console.log("updated Data",res);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${selectedRealIds.length} network(s) updated`);
      setSelectedNetworkIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessNetworks(currentPage, currentFilters);
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
    fetchAndProcessNetworks(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessNetworks(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessNetworks(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getStatusColor = (status) => {
    switch (status) {
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

  const getAuthTypeIcon = (authType) => {
    switch (authType) {
      case 'none':
        return '🔓';
      case 'apiKey':
        return '🔑';
      case 'bearerToken':
        return '🛡️';
      case 'basicAuth':
        return '🔐';
      case 'oauth2':
        return '🔒';
      default:
        return '❓';
    }
  };

  useEffect(() => {
    fetchAndProcessNetworks(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Network Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage your affiliate networks and integrations
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddNetwork}>
                  <Plus size={16} /> Add Network
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
                  <Typography className="text-gray-600 text-sm">Total Networks</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalNetworks}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <NetworkIcon className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Networks</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveNetworks}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <Globe className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg shadow border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Inactive Networks</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalInActiveNetworks}
                  </Typography>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <Shield className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Network Directory</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={networkData}
              onApplyFilters={handleApplyFilters}
            //   onImportExcel={handleImportNetworks}
              onClearFilters={resetToInitialData}
            //   onExportExcel={handleExportData}
              showImportButton={false}
              showExportButton={false}
              showApplyButton={true}
              showCategoryOptions={false}
              showDownloadSample={false}
            //   onDownloadSample={downloadSample}
              exportFileName="networks"
            />
            {canDelete && selectedNetworkIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedNetworkIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedNetworkIds.length})
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
                            selectedNetworkIds.length === networkData.length &&
                            networkData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {["ID", "Name","Affiliate_ID", "Currency", "Auth Type","Confirm Days", "Status",  "Actions"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {networkData.map((network, key) => {
                    const className = `p-4 ${key === networkData.length - 1 ? "" : "border-b"}`;
                    const isSelected = selectedNetworkIds.includes(network.id);
                    return (
                      <tr
                        key={network.id}
                        onClick={(e) => handleNetworkDetails(network, e)}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        {canDelete && (
                          <td className={className}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectNetwork(network.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td className={className}>{network.id}</td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="font-medium truncate">
                              {network.name}
                            </Typography>
                            {network.shortname && (
                              <Typography variant="small" className="text-gray-500">
                                ({network.shortname})
                              </Typography>
                            )}
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {network.affiliateId || "Not specified"}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            size="sm"
                            value={network.currency}
                            color="blue"
                            className="w-fit"
                          />
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            <span>{getAuthTypeIcon(network.authType)}</span>
                            <Typography variant="small" className="capitalize">
                              {network.authType}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {network.confirmDays || "Not specified"} Days
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(network.status)}
                            value={network.status}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        {/* <td className={className}>
                          <Chip
                            size="sm"
                            value={network.enabled ? "Yes" : "No"}
                            color={network.enabled ? "green" : "red"}
                            className="w-fit"
                          />
                        </td> */}
                        <td className={className}>
                          <div className="flex space-x-2">
                            {canEdit && (
                              <button
                                onClick={(e) => handleEditNetwork(network, e)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={(e) => handleDeleteNetwork(network, e)}
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

          {networkData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No networks found matching the search criteria
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
            totalItems={totalNetworks}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={networkToDelete !== null}
        onClose={() => setNetworkToDelete(null)}
        onConfirm={confirmDeleteNetwork}
        title="Delete Network"
        message={`Are you sure you want to delete "${networkToDelete?.name}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Networks"
        message={`Are you sure you want to delete ${selectedNetworkIds.length} selected network(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedNetworkIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default NetworkList;