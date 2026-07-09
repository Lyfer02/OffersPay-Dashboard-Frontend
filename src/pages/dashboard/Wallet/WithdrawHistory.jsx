import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Download, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import { toast } from 'react-toastify';
// import { withdrawHistoryService } from '@/api/services/withdrawHistory.service';
import Loader from '@/utils/Loader';
import { withdrawHistory } from '@/api/services/withdrawHistory.service';

export const WithdrawHistory = () => {
  const { user } = useAuth();

  const [withdrawData, setWithdrawData] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalWithdrawals, setTotalWithdrawals] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalRejected, setTotalRejected] = useState(0);
  const [totalCoinsWithdrawn, setTotalCoinsWithdrawn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndProcessWithdrawHistory = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      // Uncomment when service is available
      const res = await withdrawHistory.list(page, filters);
      //console.log("this is withdraw history",res);
      
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      const fetchedData = res.data?.data?.results || [];
      const paginationData = res.data?.data?.pagination;
      const statisticsData = res.data?.data?.statistics;

      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessWithdrawHistory(page - 1, filters);
      }

      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        userId: item.user?._id || 'N/A',
        username: item.user?.username || 'Unknown User',
        userEmail: item.user?.email || 'N/A',
        userPhone: item.user?.phone || 'N/A',
        transactionId: item.transactionId,
        coins: item.coins,
        status: item.status,
        time: new Date(item.time).toLocaleString(),
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
      }));

      setWithdrawData(mappedData);
      setTotalWithdrawals(statisticsData.totalWithdrawals || 0);
      setTotalPending(statisticsData.totalPending || 0);
      setTotalApproved(statisticsData.totalApproved || 0);
      setTotalRejected(statisticsData.totalRejected + statisticsData.totalFailed ||0);
      setTotalCoinsWithdrawn(statisticsData.totalCoinsWithdrawn || 0);

      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);

    } catch (error) {
      console.error('Failed to fetch withdraw history:', error);
      toast.error("Failed to fetch withdraw history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
      // Build query parameters from current filters
      const queryParams = new URLSearchParams();
      
      if (currentFilters.dateFrom) {
        queryParams.append('startDate', currentFilters.dateFrom);
      }
      
      if (currentFilters.dateTo) {
        queryParams.append('endDate', currentFilters.dateTo);
      }
      
      if (currentFilters.search) {
        queryParams.append('search', currentFilters.search);
      }
      


      // Call the export API
      const res = await withdrawHistory.export(queryParams.toString());
      
      // Create blob from response
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      
      // Generate filename with date range if available
      let fileName = "withdraw_history";
      if (currentFilters.dateFrom && currentFilters.dateTo) {
        fileName = `withdraw_history_${currentFilters.dateFrom}_to_${currentFilters.dateTo}`;
      } else {
        fileName = `withdraw_history_${new Date().toISOString().split('T')[0]}`;
      }
      fileName += ".xlsx";
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("withdraw history downloaded successfully");
    } catch (error) {
      console.error("Error downloading data:", error);
      toast.error(error.response?.data?.message || "Failed to download data");
    } finally {
      setIsLoading(false);
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

    if (cleanFilters.dateFrom) {
      cleanFilters.dateFrom = cleanFilters.dateFrom;
    }

    if (cleanFilters.dateTo) {
      cleanFilters.dateTo = cleanFilters.dateTo;
    }

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessWithdrawHistory(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessWithdrawHistory(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessWithdrawHistory(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'rejected':
        return 'red';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'pending':
        return <Clock size={16} className="text-yellow-600" />;
      case 'rejected':
        return <XCircle size={16} className="text-red-500" />;
      case 'failed':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchAndProcessWithdrawHistory(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="green" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Withdraw History</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Track all withdrawal requests and their statuses
              </Typography>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outlined"
                color="white"
                size="sm"
                className='flex items-center gap-2 p-3'
                onClick={handleExportData}
              >
                <Download size={16} /> Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Withdrawals</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">
                    {totalWithdrawals}
                  </Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <DollarSign className="text-blue-500" size={20} />
                </div>
              </div>
              <Typography variant="small" className="text-gray-500 mt-2">
                {totalCoinsWithdrawn} coins total
              </Typography>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg shadow border border-yellow-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Pending</Typography>
                  <Typography variant="h4" className="font-bold text-yellow-700">
                    {totalPending}
                  </Typography>
                </div>
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Clock className="text-yellow-600" size={20} />
                </div>
              </div>
              <Typography variant="small" className="text-gray-500 mt-2">
                Awaiting approval
              </Typography>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Approved</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalApproved}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckCircle className="text-green-500" size={20} />
                </div>
              </div>
              <Typography variant="small" className="text-gray-500 mt-2">
                Successfully processed
              </Typography>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg shadow border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Rejected/Failed</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalRejected}
                  </Typography>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <XCircle className="text-red-500" size={20} />
                </div>
              </div>
              <Typography variant="small" className="text-gray-500 mt-2">
                Not processed
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Withdrawal Requests</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={withdrawData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              onExportExcel={handleExportData}
              showImportButton={false}
              showExportButton={true}
              showExportJson={false}
              statusOptions={["approved","pending","rejected","failed"]}
              showApplyButton={true}
              showCategoryOptions={false}
              showDownloadSample={false}
              exportFileName="withdraw_history"
            />
          </div>

          {isLoading && <Loader />}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    {["ID", "User", "Transaction ID", "Coins", "Status", "Request Time", "Last Updated"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {withdrawData.map((withdrawal, key) => {
                    const className = `p-4 ${key === withdrawData.length - 1 ? "" : "border-b"}`;
                    return (
                      <tr
                        key={withdrawal.id}
                        className="hover:bg-gray-50"
                      >
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {withdrawal.id}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="font-medium">
                              {withdrawal.username}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs">
                              {withdrawal.userEmail}
                            </Typography>
                            <Typography variant="small" className="text-gray-400 text-xs">
                              {withdrawal.userPhone}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-mono font-medium text-blue-600">
                            {withdrawal.transactionId}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} className="text-green-600" />
                            <Typography variant="small" className="font-bold text-green-600">
                              {withdrawal.coins}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(withdrawal.status)}
                            <Chip
                              variant="gradient"
                              color={getStatusColor(withdrawal.status)}
                              value={withdrawal.status}
                              className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                            />
                          </div>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-600">
                            {withdrawal.time}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-500 text-xs">
                            {withdrawal.updatedAt}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {withdrawData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No withdrawal requests found
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
            totalItems={totalWithdrawals}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default WithdrawHistory;