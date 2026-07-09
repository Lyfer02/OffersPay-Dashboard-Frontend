import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, Target, CheckCircle, XCircle } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';

import Loader from '@/utils/Loader';
import { goalsService } from '@/api/services/goals.service';

export const GoalsList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [goalData, setGoalData] = useState([]);
  const [goalToDelete, setGoalToDelete] = useState(null);
  const [selectedGoalIds, setSelectedGoalIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalActiveGoals, setTotalActiveGoals] = useState(0);
  const [totalInActiveGoals, setTotalInActiveGoals] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleAddGoal = () => {
    navigate('/dashboard/products/add-goal');
  };

  const fetchAndProcessGoals = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const res = await goalsService.list(page, filters);
      const fetchedData = res.data?.data.goals || [];
      
      const paginationData = res.data?.data?.pagination;
      
      if (fetchedData.length === 0 && page > 1) {
        return fetchAndProcessGoals(page - 1, filters);
      }
      
      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((page - 1) * 10) + index + 1,
        name: item.name,
        description: item.description,
        status: item.status,
        createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A',
        updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A',
      }));

      setGoalData(mappedData);
      
      // Calculate statistics from fetched data
      const activeCount = fetchedData.filter(item => item.status === 'active').length;
      const inactiveCount = fetchedData.filter(item => item.status === 'inactive').length;
      
      setTotalActiveGoals(activeCount);
      setTotalInActiveGoals(inactiveCount);
      setTotalGoals(paginationData.totalData || fetchedData.length);

      setCurrentPage(paginationData.currentPage);
      setTotalPages(paginationData.totalPages);
      setHasNextPage(paginationData.hasNextPage);
      setHasPrevPage(paginationData.hasPrevPage);

    } catch (error) {
      console.error('Failed to fetch goals:', error);
      toast.error("Failed to fetch goals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditGoal = (goal, event) => {
    event.stopPropagation();
    navigate(`/dashboard/products/edit-goal/${goal._id}`);
  };

  const handleGoalDetails = (goal, event) => {
    event.stopPropagation();
    navigate(`/dashboard/products/details/${goal._id}`);
  };

  const handleDeleteGoal = (goal, event) => {
    event.stopPropagation();
    setGoalToDelete(goal);
  };

  const confirmDeleteGoal = async () => {
    if (goalToDelete) {
      setIsLoading(true);
      try {
        const res = await goalsService.delete([goalToDelete._id]);
      //  console.log("Delete response:", res);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success(`Goal "${goalToDelete.name}" deleted`);
        setGoalToDelete(null);
        fetchAndProcessGoals(currentPage, currentFilters);
      } catch (err) {
        toast.error("Failed to delete goal");
        console.log("Delete error:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectGoal = (id) => {
    setSelectedGoalIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedGoalIds.length === goalData.length) {
      setSelectedGoalIds([]);
    } else {
      setSelectedGoalIds(goalData.map((goal) => goal.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true);
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = goalData
      .filter(goal => selectedGoalIds.includes(goal.id))
      .map(goal => goal._id);

    try {
      const res = await goalsService.delete(selectedRealIds);
    //  console.log("Bulk delete response:", res);
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success(`${selectedRealIds.length} goal(s) deleted`);
      setSelectedGoalIds([]);
      setShowBulkDeleteConfirm(false);
      fetchAndProcessGoals(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected goals");
    }
  };

  const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  const confirmBulkUpdate = async (updates) => {
    setBulkUpdateLoading(true);
    const selectedRealIds = goalData
      .filter(goal => selectedGoalIds.includes(goal.id))
      .map(goal => goal._id);

    try {
      const res = await goalsService.bulkUpdate({ ids: selectedRealIds, updates });
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success(`${selectedRealIds.length} goal(s) updated`);
      setSelectedGoalIds([]);
      setShowBulkUpdateDialog(false);
      await fetchAndProcessGoals(currentPage, currentFilters);
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
    fetchAndProcessGoals(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchAndProcessGoals(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchAndProcessGoals(page, currentFilters);
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

  useEffect(() => {
    fetchAndProcessGoals(1, {});
  }, []);

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Goal Management</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage your goals and objectives
              </Typography>
            </div>
            <div className="flex gap-2">
              {canCreate && (
                <Button variant="outlined" color="white" size="sm"
                  className='flex items-center gap-2 p-3'
                  onClick={handleAddGoal}>
                  <Plus size={16} /> Add Goal
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
                  <Typography className="text-gray-600 text-sm">Total Goals</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalGoals}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Target className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Goals</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveGoals}
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
                  <Typography className="text-gray-600 text-sm">Inactive Goals</Typography>
                  <Typography variant="h4" className="font-bold text-red-700">
                    {totalInActiveGoals}
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
            <Typography variant="h6" color="white">Goal Directory</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">
          <div className="mb-6">
            <TableToolbar
              data={goalData}
              onApplyFilters={handleApplyFilters}
              onClearFilters={resetToInitialData}
              showImportButton={false}
              showExportButton={false}
              showApplyButton={true}
              showCategoryOptions={false}
              showDownloadSample={false}
              exportFileName="goals"
            />
            {canDelete && selectedGoalIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                <Button
                  color="blue"
                  variant="filled"
                  onClick={handleBulkUpdate}
                  className="flex items-center gap-2 p-4"
                >
                  <Edit size={16} /> Update Selected ({selectedGoalIds.length})
                </Button>
                <Button
                  color="red"
                  variant="filled"
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 p-4"
                >
                  <Trash2 size={16} /> Delete Selected ({selectedGoalIds.length})
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
                            selectedGoalIds.length === goalData.length &&
                            goalData.length > 0
                          }
                          onChange={handleSelectAll}
                        />
                      </th>
                    )}
                    {["ID", "Name", "Description", "Status", "Created At", "Actions"].map((el) => (
                      <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                        <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                          {el}
                        </Typography>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {goalData.map((goal, key) => {
                    const className = `p-4 ${key === goalData.length - 1 ? "" : "border-b"}`;
                    const isSelected = selectedGoalIds.includes(goal.id);
                    return (
                      <tr
                        key={goal.id}
                        onClick={(e) => handleGoalDetails(goal, e)}
                        className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                      >
                        {canDelete && (
                          <td className={className}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSelectGoal(goal.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                        )}
                        <td className={className}>{goal.id}</td>
                        <td className={className}>
                          <Typography variant="small" className="font-medium">
                            {goal.name}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="max-w-xs">
                            <Typography variant="small" className="text-gray-600 truncate">
                              {goal.description || "No description"}
                            </Typography>
                          </div>
                        </td>
                        <td className={className}>
                          <Chip
                            variant="gradient"
                            color={getStatusColor(goal.status)}
                            value={goal.status}
                            className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                          />
                        </td>
                        <td className={className}>
                          <Typography variant="small" className="text-gray-600">
                            {goal.createdAt}
                          </Typography>
                        </td>
                        <td className={className}>
                          <div className="flex space-x-2">
                            {canEdit && (
                              <button
                                onClick={(e) => handleEditGoal(goal, e)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit size={18} />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={(e) => handleDeleteGoal(goal, e)}
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

          {goalData.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No goals found matching the search criteria
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
            totalItems={totalGoals}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      <ConfirmationDialog
        isOpen={goalToDelete !== null}
        onClose={() => setGoalToDelete(null)}
        onConfirm={confirmDeleteGoal}
        title="Delete Goal"
        message={`Are you sure you want to delete "${goalToDelete?.name}"? This action cannot be undone.`}
      />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Goals"
        message={`Are you sure you want to delete ${selectedGoalIds.length} selected goal(s)? This action cannot be undone.`}
      />

      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedGoalIds.length}
        loading={bulkUpdateLoading}
        showStatus={true}
      />
    </div>
  );
};

export default GoalsList;