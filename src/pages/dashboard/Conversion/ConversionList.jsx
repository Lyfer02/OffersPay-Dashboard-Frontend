import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { CheckCircle, Clock, DollarSign, TrendingUp, Activity } from 'lucide-react';

import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import Loader from '@/utils/Loader';
import { conversionService } from '@/api/services/conversion.service';
import { TableToolbar } from '@/widgets/forms';

export const ConversionList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [conversionData, setConversionData] = useState([]);
  const [conversionToDelete, setConversionToDelete] = useState(null);
  const [selectedConversionIds, setSelectedConversionIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [todayTotalsConversion, setTodayTotalsConversion] = useState(0);
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [todayPayout, setTodayPayout] = useState(0);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalConversions, setTotalConversions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndProcessConversions = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await conversionService.list(page, filters);
      const fetchedData = res.data?.data?.conversions || [];

      const paginationData = res.data?.data?.pagination;
      
      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessConversions(page - 1, filters);
      }
       console.log("this is fetched conversions", res.data?.data);
      console.log("this is fetched conversions", fetchedData);
      
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        affiliateName: item.affiliate_id?.userName || item.affiliate_id?.email?.split('@')[0] || 'N/A',
        affiliateEmail: item.affiliate_id?.email || 'N/A',
        affiliateId: item.affiliate_id?._id || null,
        // Handle offer_id as either string or object
       offerName: item.offerName|| 'N/A',
        offerId: typeof item.offer_id === 'string' 
          ? item.offer_id 
          : (item.offer_id?._id || null),
        managerName: item.manager_id?.userName || 'N/A',
        managerId: item.manager_id?._id || null,
        clickTransactionId: item.click_transaction_id,
        currency: item.currency,
        payout: item.payout || 0,
        revenue: item.revenue || 0,
        saleAmount: item.sale_amount || 0,
        status: item.status,
        name: item.name,
        conversionIp: item.conversion_ip,
        clickIp: item.click_ip || 'N/A', // Handle missing click_ip
        browserName: item.browser_name || 'N/A',
        country: item.country || 'N/A',
        phno: item.phno || 'N/A',
        memid: item.memid || 'N/A',
        createdAt: new Date(item.createdAt).toLocaleString(),
        updatedAt: new Date(item.updatedAt).toLocaleString(),
      }));

setConversionData(mappedData);
setTotalConversions(paginationData.totalData || 0);
setCurrentPage(paginationData.currentPage);
setTotalPages(paginationData.totalPages);
setHasNextPage(paginationData.hasNextPage);
setHasPrevPage(paginationData.hasPrevPage);
// Handle missing today's statistics
setTodayTotalsConversion(res.data?.data?.todayConversions || paginationData.totalData || 0);
setTodayRevenue(res.data?.data?.todayRevenue || 0);
setTodayPayout(res.data?.data?.todayPayout || 0);

    } catch (error) {
      console.error('Failed to fetch conversions:', error);
      toast.error("Failed to fetch conversions");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConversionDetails = (conversion, event) => {
    event.stopPropagation();
    //navigate(`/dashboard/conversion/details/${conversion._id}`);
  };

  const handleApplyFilters = (filters) => {
    const cleanFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );

    if (cleanFilters.search) {
      cleanFilters.search = cleanFilters.search;
    }

    // Add status filter if provided
    if (cleanFilters.status) {
      cleanFilters.status = cleanFilters.status;
    }

    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchAndProcessConversions(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessConversions(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessConversions(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const truncateText = (text, maxLength = 50) => {
    if (!text) return 'N/A';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const formatCurrency = (amount, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'green';
      case 'pending':
        return 'orange';
      default:
        return 'gray';
    }
  };

  useEffect(() => {
    fetchAndProcessConversions(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Conversion Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Track and manage all affiliate conversions
              </Typography>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Conversions</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalConversions}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <CheckCircle className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Today's Conversions</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">{todayTotalsConversion}</Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <TrendingUp className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            {/* <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg shadow border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Today's Revenue</Typography>
                  <Typography variant="h4" className="font-bold text-purple-700">
                    {formatCurrency(todayRevenue)}
                  </Typography>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <DollarSign className="text-purple-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-lg shadow border border-orange-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Today's Payout</Typography>
                  <Typography variant="h4" className="font-bold text-orange-700">
                    {formatCurrency(todayPayout)}
                  </Typography>
                </div>
                <div className="bg-orange-100 p-2 rounded-full">
                  <Activity className="text-orange-500" size={20} />
                </div>
              </div>
            </div> */}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Conversion Directory</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
          <TableToolbar
              data={conversionData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              showImportButton={false}
              showExportButton={true}
              showExportJson={false}
              showApplyButton={true}
              showStatusOption={true}
              statusOptions={['approved', 'pending']}
              showCategoryOptions={false}
              showDownloadSample={false}
              exportFileName="conversions"
            />
          </div>

          {isLoading && <Loader />}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    {["ID", "Affiliate", "Offer Name", "Status", "Payout", "Revenue", "Sale Amount", "Country", "Created At"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {conversionData.map((conversion, key) => {
                    const className = `p-4 ${key === conversionData.length - 1 ? "" : "border-b"}`;
                    return (
                      <tr
                        key={conversion.id}
                        onClick={(e) => handleConversionDetails(conversion, e)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {conversion.id}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="font-medium truncate">
                              {conversion.affiliateName}
                            </Typography>
                            <Typography variant="small" className="text-gray-500 text-xs">
                              {conversion.affiliateEmail}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <div className="max-w-fit">
                            <Typography variant="small" className="font-medium line-clamp-2" >
                              {truncateText(conversion.offerName, 40)}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Chip
                            size="sm"
                            value={conversion.status}
                            color={getStatusColor(conversion.status)}
                            className="w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-semibold text-green-600">
                            {formatCurrency(conversion.payout, conversion.currency)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-semibold text-blue-600">
                            {formatCurrency(conversion.revenue, conversion.currency)}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {conversion.saleAmount ? formatCurrency(conversion.saleAmount, conversion.currency) : 'N/A'}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {conversion.country}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-700 text-xs">
                            {conversion.createdAt}
                          </Typography>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {conversionData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No conversions found matching the search criteria
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
            totalItems={totalConversions}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>
    </div>
  );
};

export default ConversionList;