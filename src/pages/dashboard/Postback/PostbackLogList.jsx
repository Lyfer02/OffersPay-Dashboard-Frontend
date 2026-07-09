import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter
} from '@material-tailwind/react';
import { Eye, RefreshCw } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { toast } from 'react-toastify';
import TablePagination from '@/widgets/components/tablePagination';
import Loader from '@/utils/Loader';
import { postbackLogService } from '@/api/services/postbacklog.service';

export const PostbackLogList = () => {
  const [logData, setLogData] = useState([]);
  const [currentFilters, setCurrentFilters] = useState({});
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalSuccess, setTotalSuccess] = useState(0);
  const [totalFailed, setTotalFailed] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAndProcessLogs = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await postbackLogService.list(page, filters);
      const fetchedData = res.data?.data?.logs || [];
      const paginationData = res.data?.data;

      const mapped = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        network: item.network || 'N/A',
        affiliate: item.affiliate_id?.email || 'N/A',
        affiliateId: item.affiliate_id?._id || 'N/A',
        offer: item.offer_id?._id || 'N/A',
        event: item.event || 'N/A',
        postbackUrl: item.postback || 'N/A',
        status: item.status,
        body: item.body || 'N/A',
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A',
      }));

      setLogData(mapped);

      // Count success (2xx status codes) and failed (non-2xx)
      setTotalSuccess(fetchedData.filter(log => log.status >= 200 && log.status < 300).length);
      setTotalFailed(fetchedData.filter(log => log.status < 200 || log.status >= 300).length);
      setTotalLogs(paginationData.totalData || 0);

      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);
    } catch (error) {
      console.error("Failed to fetch postback logs:", error);
      toast.error("Failed to fetch postback logs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (log, e) => {
    e.stopPropagation();
    setSelectedLog(log);
    setShowDetailsDialog(true);
  };

  const handleApplyFilters = (filters) => {
    const clean = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null)
    );
    setCurrentFilters(clean);
    setCurrentPage(1);
    fetchAndProcessLogs(1, clean);
  };

  const resetFilters = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessLogs(1, {});
  };

  const handlePageChange = (p) => {
    setCurrentPage(p);
    fetchAndProcessLogs(p, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'green';
    if (status >= 400 && status < 500) return 'orange';
    if (status >= 500) return 'red';
    return 'gray';
  };

  const getStatusLabel = (status) => {
    if (status >= 200 && status < 300) return 'Success';
    if (status >= 400 && status < 500) return 'Client Error';
    if (status >= 500) return 'Server Error';
    return 'Unknown';
  };

  const handleRefresh = () => {
    fetchAndProcessLogs(currentPage, currentFilters);
  };

  useEffect(() => {
    fetchAndProcessLogs(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Postback Log Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                View all postback execution logs
              </Typography>
            </div>
            <Button variant="outlined" color="white" size="sm"
              className='flex items-center gap-2 p-3'
              onClick={handleRefresh}>
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
            <div className="bg-blue-50 p-4 rounded-lg border">
              <Typography className="text-gray-600 text-sm">Total Logs</Typography>
              <Typography variant="h4" className="font-bold text-blue-800">{totalLogs}</Typography>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border">
              <Typography className="text-gray-600 text-sm">Successful</Typography>
              <Typography variant="h4" className="font-bold text-green-700">{totalSuccess}</Typography>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border">
              <Typography className="text-gray-600 text-sm">Failed</Typography>
              <Typography variant="h4" className="font-bold text-red-700">{totalFailed}</Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className="p-6">
          <Typography variant="h6" color="white">Postback Log Directory</Typography>
        </CardHeader>
        <CardBody className="px-4">
          <TableToolbar
            data={logData}
            onApplyFilters={handleApplyFilters}
            onClearFilters={resetFilters}
            showImportButton={false}
            showExportButton={true}
            statusOptions={["Success","Failed"]}
            showExportJson={false}
            showApplyButton={true}
            showCategoryOptions={false}
            showDownloadSample={false}
          />

          {isLoading && <Loader />}
          {!isLoading && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 rounded-lg">
                  <tr>
                    {["ID","Affiliate", "Offer", "Event", "Postback URL", "Status", "Created At", "Actions"].map((h) => (
                      <th key={h} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {h}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logData.map((log, i) => {
                    const cls = `p-4 ${i === logData.length - 1 ? '' : 'border-b'}`;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className={cls}>{log.id}</td>
                       
                        <td className={cls}>{log.affiliate}</td>
                        <td className={cls}>{log.offer}</td>
                        <td className={cls}>{log.event}</td>
                        <td className={`${cls} font-mono text-xs max-w-xs truncate`} title={log.postbackUrl}>
                          {log.postbackUrl}
                        </td>
                        <td className={cls}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(log.status)}
                            value={`${log.status} - ${getStatusLabel(log.status)}`}
                            className="py-1 px-2 text-[11px] font-medium w-fit"
                          />
                        </td>
                        <td className={cls}>{log.createdAt}</td>
                        <td className={cls}>
                          <button onClick={(e) => handleViewDetails(log, e)} className="text-blue-500 hover:text-blue-700" title="View Details">
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {logData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray">No postback logs found</Typography>
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
            totalItems={totalLogs}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} handler={() => setShowDetailsDialog(false)} size="lg">
        <DialogHeader>Postback Log Details</DialogHeader>
        <DialogBody className="max-h-96 overflow-y-auto">
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Affiliate:</Typography>
                <Typography className="text-gray-900">{selectedLog.affiliate}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Offer:</Typography>
                <Typography className="text-gray-900">{selectedLog.offer}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Event:</Typography>
                <Typography className="text-gray-900">{selectedLog.event}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Postback URL:</Typography>
                <Typography className="text-gray-900 font-mono text-sm break-all">{selectedLog.postbackUrl}</Typography>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Status Code:</Typography>
                <Chip
                  variant="gradient"
                  color={getStatusColor(selectedLog.status)}
                  value={`${selectedLog.status} - ${getStatusLabel(selectedLog.status)}`}
                  className="py-1 px-2 text-sm font-medium w-fit mt-1"
                />
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Response Body:</Typography>
                <pre className="bg-gray-100 p-3 rounded mt-1 text-xs overflow-x-auto">
                  {selectedLog.body || 'No response body'}
                </pre>
              </div>
              <div>
                <Typography variant="small" className="font-bold text-gray-700">Created At:</Typography>
                <Typography className="text-gray-900">{selectedLog.createdAt}</Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="text" color="gray" onClick={() => setShowDetailsDialog(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default PostbackLogList;