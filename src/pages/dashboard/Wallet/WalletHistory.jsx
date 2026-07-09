import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Download, Wallet, TrendingUp, History } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import { toast } from 'react-toastify';
import Loader from '@/utils/Loader';
import { walletHistory } from '@/api/services/walletHistory.service';

export const WalletHistory = () => {
  const { user } = useAuth();

  const [walletData, setWalletData] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [totalCoinsSpent, setTotalCoinsSpent] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndProcessWalletHistory = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await walletHistory.list(page, filters);
      
      const fetchedData = res.data?.data?.results || [];
      const paginationData = res.data?.data?.pagination || {};
      const statisticsData = res.data?.data?.statistics || {};

      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessWalletHistory(page - 1, filters);
      }

      // Map the response data to the format needed for the table
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * (paginationData.limit || 10)) + index + 1,
        
        // User details
        userId: item.user?._id || 'N/A',
        username: item.user?.fullName || 'Unknown User',
        userEmail: item.user?.email || 'N/A',
        userRole: item.user?.role || 'N/A',
        
        // Offer details (can be null)
        offerId: item.offer?._id || 'N/A',
        offerName: item.offer?.name || item.offer?.offerName || 'N/A',
        
        // Conversion details (can be null)
        conversionId: item.conversion?._id || 'N/A',
        wallet: item.wallet || 'N/A',
        
        // Transaction details
        message: item.message || 'No message',
        amount: item.amount || 0,
        balanceAfter: item.balanceAfter || 0,
        
        // Determine transaction type based on amount
        transactionType: item.amount >= 0 ? 'credit' : 'debit',
        
        // Timestamps
        updatedTime: new Date(item.updatedAt).toLocaleString('en-IN', {
          dateStyle: 'medium',
          timeStyle: 'short'
        }),
        createdAt: new Date(item.createdAt).toLocaleDateString('en-IN', {
          dateStyle: 'medium'
        }),
      }));

      setWalletData(mappedData);
      
      // Set statistics
      setTotalTransactions(paginationData.totalData || 0);
      setTotalCoinsEarned(statisticsData.totalCoinsEarned || 0);
      setTotalCoinsSpent(Math.abs(statisticsData.totalCoinsSpent || 0));

      // Set pagination
      setCurrentPage(paginationData.currentPage || 1);
      setTotalPages(paginationData.totalPages || 1);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);

    } catch (error) {
      console.error('Failed to fetch wallet history:', error);
      toast.error(error.response?.data?.message || "Failed to fetch wallet history");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = async () => {
    setIsLoading(true);
    try {
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
      
      if (currentFilters.transactionType) {
        queryParams.append('transactionType', currentFilters.transactionType);
      }

      const res = await walletHistory.export(queryParams.toString());
      
      const blob = new Blob([res.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      
      let fileName = "wallet_history";
      if (currentFilters.dateFrom && currentFilters.dateTo) {
        fileName = `wallet_history_${currentFilters.dateFrom}_to_${currentFilters.dateTo}`;
      } else {
        fileName = `wallet_history_${new Date().toISOString().split('T')[0]}`;
      }
      fileName += ".xlsx";
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("Wallet history downloaded successfully");
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

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessWalletHistory(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessWalletHistory(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessWalletHistory(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'green' : 'red';
  };

  const getAmountDisplay = (amount, type) => {
    return type === 'credit' ? `+${amount}` : amount;
  };

  useEffect(() => {
    fetchAndProcessWalletHistory(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Wallet History</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Track all wallet transactions and coin movements
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg shadow border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Transactions</Typography>
                  <Typography variant="h4" className="font-bold text-purple-800">
                    {totalTransactions}
                  </Typography>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <History className="text-purple-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Coins Earned</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    +{totalCoinsEarned}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 rounded-lg shadow border border-red-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Coins Spent</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalCoinsSpent}
                  </Typography>
                </div>
                <div className="bg-red-100 p-2 rounded-full">
                  <Wallet className="text-red-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Transaction History</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={walletData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              onExportExcel={handleExportData}
              showImportButton={false}
              showExportButton={true}
              showApplyButton={true}
              showExportJson={false}
              showCategoryOptions={false}
              showStatusOption={false}
              showDateFilter={true}
              dateFilterType='range'
              showDownloadSample={false}
              exportFileName="wallet_history"
            />
          </div>

          {isLoading && <Loader />}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    {["ID", "User", "Wallet", "Message", "Amount", "Balance After", "Type", "Updated Time"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {walletData.map((transaction, key) => {
                    const className = `p-4 ${key === walletData.length - 1 ? "" : "border-b"}`;
                    return (
                      <tr
                        key={transaction._id}
                        className="hover:bg-gray-50"
                      >
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {transaction.id}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="font-medium">
                              {transaction.username}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs">
                              {transaction.userEmail}
                            </Typography>
                            <Typography variant="small" className="text-gray-400 text-xs capitalize">
                              {transaction.userRole}
                            </Typography>
                          </div>
                        </td>
                       
                        <td className={className}>
                          <Typography variant="small" className="font-mono text-xs">
                            {transaction.wallet}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-700 max-w-md truncate" title={transaction.message}>
                            {transaction.message}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography
                            variant="small"
                            className={`font-bold ${transaction.transactionType === 'credit' ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {getAmountDisplay(transaction.amount, transaction.transactionType)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium text-gray-700">
                            {transaction.balanceAfter}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={getTransactionTypeColor(transaction.transactionType)}
                            value={transaction.transactionType}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-600">
                            {transaction.updatedTime}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {walletData.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <Typography color="blue-gray" className="font-normal">
                No wallet transactions found
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
            totalItems={totalTransactions}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default WalletHistory;