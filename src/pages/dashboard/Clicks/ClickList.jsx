import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, MousePointerClick, TrendingUp, Activity } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import Loader from '@/utils/Loader';
import { trackingService } from '@/api/services/tracking.service';

export const ClickList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [clickData, setClickData] = useState([]);
  const [clickToDelete, setClickToDelete] = useState(null);
  const [selectedClickIds, setSelectedClickIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [todayTotalsClick,setTodayTotalsClick]=useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalClicks, setTotalClicks] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndProcessClicks = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await trackingService.clicks(page, filters);
      const fetchedData = res.data?.data?.clicks || [];
      const paginationData = res.data?.data?.pagination;
      
      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessClicks(page - 1, filters);
      }
      
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        clickId: item.clickId,
        userName: item.aid?.userName || 'N/A',
        userEmail: item.aid?.email || 'N/A',
        userId: item.aid?._id || null,
        offerName: item.oid?.name || 'N/A',
        offerId: item.oid?._id || null,
        offerClickCount: item.oid?.clickCount || 0,
        discountPercentage: item.oid?.discountPercentage || 0,
        ipAddress: item.ipAddress,
        userAgent: item.userAgent,
        clickedAt: new Date(item.clickedAt).toLocaleString(),
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      }));

      setClickData(mappedData);
      setTotalClicks(paginationData.totalData);
      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);
      setTodayTotalsClick(res.data?.data?.todayClicks);

    } catch (error) {
      console.error('Failed to fetch clicks:', error);
      toast.error("Failed to fetch clicks");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClickDetails = (click, event) => {
    event.stopPropagation();
   // navigate(`/dashboard/click/details/${click._id}`);
  };

//   const handleDeleteClick = (click, event) => {
//     event.stopPropagation();
//     setClickToDelete(click);
//   };

//   const confirmDeleteClick = async () => {
//     if (clickToDelete) {
//       setIsLoading(true);
//       try {
//        // const res = await clickService.delete([clickToDelete._id]);
//         console.log("Delete response", res);
        
//         await new Promise(resolve => setTimeout(resolve, 1000));
//         toast.success(`Click deleted successfully`);
//         setClickToDelete(null);
//         fetchAndProcessClicks(currentPage, currentFilters);
//       } catch (err) {
//         toast.error("Failed to delete click");
//         console.log("Delete error:", err);
//       } finally {
//         setIsLoading(false);
//       }
//     }
//   };

//   const handleSelectClick = (id) => {
//     setSelectedClickIds((prev) =>
//       prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedClickIds.length === clickData.length) {
//       setSelectedClickIds([]);
//     } else {
//       setSelectedClickIds(clickData.map((click) => click.id));
//     }
//   };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true);
  };

//   const confirmBulkDelete = async () => {
//     const selectedRealIds = clickData
//       .filter(click => selectedClickIds.includes(click.id))
//       .map(click => click._id);

//     try {
//      // const res = await clickService.delete(selectedRealIds);
//       console.log("Bulk delete response", res);
      
//       await new Promise(resolve => setTimeout(resolve, 1500));
//       toast.success(`${selectedRealIds.length} click(s) deleted`);
//       setSelectedClickIds([]);
//       setShowBulkDeleteConfirm(false);
//       fetchAndProcessClicks(currentPage, currentFilters);
//     } catch (err) {
//       console.error("Bulk delete failed", err);
//       toast.error("Failed to delete selected clicks");
//     }
//   };

  const handleApplyFilters = (filters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );

    if (cleanFilters.search) {
      cleanFilters.search = cleanFilters.search;
    }

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessClicks(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessClicks(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessClicks(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  useEffect(() => {
    fetchAndProcessClicks(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Click Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Track and manage all affiliate clicks
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Clicks</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalClicks}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <MousePointerClick className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Today's Clicks</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">{todayTotalsClick || 0}</Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg shadow border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Offers</Typography>
                  <Typography variant="h4" className="font-bold text-purple-700">0</Typography>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <Activity className="text-purple-500" size={20} />
                </div>
              </div>
            </div> */}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Click Directory</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={clickData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              showImportButton={false}
              showExportButton={false}
              showApplyButton={true}
              showStatusOption={false}
              showCategoryOptions={false}
              showDownloadSample={false}
              exportFileName="clicks"
            />
            {canDelete && selectedClickIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedClickIds.length})
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
                    {/* {canDelete && (
                      <th className="border-b py-3 px-4 text-left">
                        <input
                          type="checkbox"
                          checked={
                            selectedClickIds.length === clickData.length &&
                            clickData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                    )} */}
                    {["ID","User", "Offer Name","IP Address", "Clicked At"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {clickData.map((click, key) => {
                    const className = `p-4 ${key === clickData.length - 1 ? "" : "border-b"}`;
                    const isSelected = selectedClickIds.includes(click.id);
                    return (
                      <tr
                        key={click.id}
                        onClick={(e) => handleClickDetails(click, e)}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        {/* {canDelete && (
                          <td className={className}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectClick(click.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )} */}
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {click.id}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="font-medium truncate">
                              {click.userName}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs">
                              {click.userEmail}
                            </Typography>
                          </div>
                        </td>
                        
                        <td className={className}>
                          <div className="max-w-md">
                            <Typography variant="small" className="font-medium">
                              {truncateText(click.offerName, 40)}
                            </Typography>
                            {click.discountPercentage > 0 && (
                              <Chip
                                size="sm"
                                value={`${click.discountPercentage}% OFF`}
                                color="green"
                                className="w-fit mt-1"
                              />
                            )}
                          </div>
                        </td>
                        {/* <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {click.offerClickCount}
                          </Typography>
                        </td> */}
                        <td className={className}>
                          <Typography variant="small" className="font-mono text-xs">
                            {click.ipAddress}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-700">
                            {click.clickedAt}
                          </Typography>
                        </td>
                        {/* <td className={className}>
                          <div className="flex space-x-2">
                            {canDelete && (
                              <button
                                onClick={(e) => handleDeleteClick(click, e)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                            {!canDelete && (
                              <span className="text-gray-400 text-sm">No actions available</span>
                            )}
                          </div>
                        </td> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {clickData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No clicks found matching the search criteria
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
            totalItems={totalClicks}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      {/* <ConfirmationDialog
        isOpen={clickToDelete !== null}
        onClose={() => setClickToDelete(null)}
        onConfirm={confirmDeleteClick}
        title="Delete Click"
        message={`Are you sure you want to delete this click record? This action cannot be undone.`}
      /> */}

      {/* <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Clicks"
        message={`Are you sure you want to delete ${selectedClickIds.length} selected click(s)? This action cannot be undone.`}
      /> */}
    </div>
  );
};

export default ClickList;