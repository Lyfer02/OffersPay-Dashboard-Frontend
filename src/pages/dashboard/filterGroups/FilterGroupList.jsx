import React, { useState, useEffect } from 'react';
import {
  Card, CardHeader, CardBody, Typography, Button, Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, Filter, Truck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

import { filterGroupService } from '@/api/services/filterGroup.service';

import TablePagination from '@/widgets/components/tablePagination';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useTableFilter } from '@/hooks';
import { useAuth } from '@/pages/auth/authContext';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';

const FilterGroupList = () => {
  const navigate = useNavigate();
  const { canEdit, canDelete, canCreate } = useAuth();

  const [filterGroupData, setfilterGroupData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  const [currentFilters, setCurrentFilters] = useState({});
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalData, setTotalData] = useState(0);
    const [isLoading, setIsLoading] = useState(false);



  const fetchFilterGroups = async (page = 1, filters = {}) => {
    setIsLoading(true);
    try {
      const res = await filterGroupService.list(page, filters);
     // console.log("this is filter group data", res);

      const fetchedData = res.data?.data.filterGroups || [];
      if (fetchedData.length === 0 && page > 1) {
        return fetchFilterGroups(page - 1, filters); // recursively call with previous page
      }
      const paginationData = res.data?.data;

      const mappedData = fetchedData.map((item, index) => ({
        _id: item._id,
        id: ((paginationData.currentPage - 1) * 10) + index + 1,
        name: item.name,
        status: item.status,
        category: item.category,
        options: item.options,
        createdAt: new Date(item.createdAt).toLocaleDateString(),
        updatedAt: new Date(item.updatedAt).toLocaleDateString(),
      }));

      setfilterGroupData(mappedData);

      // ✅ Set total counts for dashboard cards (if backend sends)
      // setTotalCategories(paginationData.totalCategories);
      // setTotalActiveFilterGroups(paginationData.totalActiveFilterGroups);
      // setTotalFilterGroups(paginationData.totalData);

      // ✅ Pagination states
      setCurrentPage(paginationData.currentPage || 1);
      setTotalPages(paginationData.totalPages || 1);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);
    } catch (error) {
      console.error('Failed to fetch filter groups:', error);
      toast.error('Failed to fetch filter groups');
    }
  finally {
    setIsLoading(false);
  }

  };

  const handleAdd = () => {
    console.log("navigating to add filter group ");

    navigate('/dashboard/others/add-filter-group');

    console.log("navigated");
  }

  const handleEdit = (item, e) => {
    e.stopPropagation();
    navigate(`/dashboard/others/filter-group/${item._id}`);
  };

  const handleDelete = (item, e) => {
    e.stopPropagation();
    setDeleteConfirm(item);
  };

  const confirmDelete = async () => {
    setIsLoading(true);
    try {
      await filterGroupService.delete([deleteConfirm._id]);
      toast.success(`Filter Group "${deleteConfirm.name}" deleted`);
      setDeleteConfirm(null);
      await fetchFilterGroups(currentPage);
    } catch (err) {
      toast.error('Failed to delete filter group');
    }
  finally {
    setIsLoading(false);
  }

  };

  const handleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filterGroupData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filterGroupData.map(item => item.id));
    }
  };

  const confirmBulkDelete = async () => {
    const idsToDelete = filterGroupData
      .filter(item => selectedIds.includes(item.id))
      .map(item => item._id);

      setIsLoading(true);

    try {
      await filterGroupService.delete(idsToDelete);
      toast.success(`${idsToDelete.length} filter group(s) deleted`);
      setSelectedIds([]);
      setShowBulkDeleteConfirm(false);
      await fetchFilterGroups(currentPage);
    } catch (err) {
      toast.error('Failed to delete selected filter groups');
    }
  finally {
    setIsLoading(false);
  }

  };

    const handleBulkUpdate = () => {
      setShowBulkUpdateDialog(true);
    };
  
    const confirmBulkUpdate = async (updates) => {
      setBulkUpdateLoading(true);
      const selectedRealIds = filterGroupData
        .filter(user => selectedIds.includes(user.id))
        .map(user => user._id);
  
      try {
        await filterGroupService.bulkUpdate({ ids: selectedRealIds, updates });
        toast.success(`${selectedRealIds.length} FilterGroup(s) updated`);
        setSelectedIds([]);
        setShowBulkUpdateDialog(false);
        await fetchFilterGroups(currentPage, currentFilters);
      } catch (err) {
        console.log("this is error ",err);
        
        toast.error(err.response?.data?.message || 'Bulk update failed');
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


    setCurrentFilters(cleanFilters);
    setCurrentPage(1);
    fetchFilterGroups(1, cleanFilters);
  };

  const resetToInitialData = () => {
    setCurrentFilters({});
    setCurrentPage(1);
    fetchFilterGroups(1, {});
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchFilterGroups(page, currentFilters);
  };

  const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
  const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);

  useEffect(() => {
    fetchFilterGroups(1, {});
  }, []);

  return (
    <div className="min-h-screen  mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className="p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">
                Filter Group Management
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage filter groups for categories and attributes
              </Typography>
            </div>
            {canCreate && (
              <Button
                variant="outlined"
                color="white"
                size="sm"
                className="flex items-center gap-2 p-3"
                onClick={handleAdd}
              >
                <Plus size={16} /> Add Filter Group
              </Button>
            )}
          </div>
        </CardHeader>

        <CardBody className="px-6">
          <TableToolbar
            data={filterGroupData}
            onApplyFilters={handleApplyFilters}
            onClearFilters={resetToInitialData}
            showExportButton={false}
            showImportButton={false}
            showCategoryOptions={true}
            showApplyButton={true}
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
                onClick={() => setShowBulkDeleteConfirm(true)}
                className="flex items-center gap-2 p-4"
              >
                <Trash2 size={16} /> Delete Selected ({selectedIds.length})
              </Button>
            </div>
          )}

          {isLoading && <Loader />}

          {!isLoading && (<div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  {canDelete && (
                    <th className="border-b py-3 px-4">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === filterGroupData.length &&
                          filterGroupData.length > 0
                        }
                        onChange={handleSelectAll}
                      />
                    </th>
                  )}
                  {['ID', 'Name', 'Categories', 'Options', 'Status', 'Created At', 'Updated At', 'Actions'].map(el => (
                    <th key={el} className="border-b py-3 px-4 text-left">
                      <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filterGroupData.map((item, key) => {
                  const className = `p-4 ${key === filterGroupData.length - 1 ? "" : "border-b"}`;
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}>
                      {canDelete && (
                        <td className={className}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSelect(item.id)}
                          />
                        </td>
                      )}
                      <td className={className}>{item.id}</td>
                      <td className={className}>{item.name}</td>
                      <td className={className}>
                        {item.category.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.category.map(cat => (
                              <Chip
                                key={cat._id}
                                variant="ghost"
                                color="blue"
                                value={cat.name}
                                className="text-xs"
                              />
                            ))}
                          </div>
                        ) : (
                          <Typography variant="small" color="gray">
                            None
                          </Typography>
                        )}
                      </td>
                      <td className={className}>
                        {item.options.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {item.options.map(opt => (
                              <Chip
                                key={opt}
                                variant="ghost"
                                color="green"
                                value={opt}
                                className="text-xs"
                              />
                            ))}
                          </div>
                        ) : (
                          <Typography variant="small" color="gray">
                            None
                          </Typography>
                        )}
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={item.status === 'active' ? 'green' : 'red'}
                          value={item.status}
                          className="text-xs py-1 px-2  font-medium w-fit"
                        />
                      </td>
                      <td className={className}>{item.createdAt}</td>
                      <td className={className}>{item.updatedAt}</td>
                      <td className={className}>
                        <div className="flex space-x-2">
                          {canEdit && (
                            <button onClick={(e) => handleEdit(item, e)} className="text-blue-500 hover:text-blue-700">
                              <Edit size={18} />
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={(e) => handleDelete(item, e)} className="text-red-500 hover:text-red-700">
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
          </div>)}

          {filterGroupData.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">
                No filter groups found.
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
            totalItems={totalData}
            itemsPerPage={10}
          />
        </CardBody>
      </Card>

      {/* Delete Confirm Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title="Delete Filter Group"
        message={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
      />

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Filter Groups"
        message={`Are you sure you want to delete ${selectedIds.length} selected filter group(s)?`}
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

export default FilterGroupList;
