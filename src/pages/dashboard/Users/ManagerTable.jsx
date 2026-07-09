import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Button,
    Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, User, Calendar, Shield, LogIn, Users, Eye } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useTableFilter } from '@/hooks';
import { useNavigate } from 'react-router-dom';
import { useApi } from '@/hooks/useApi';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import { userService } from '@/api/services/user.service';
import TablePagination from '@/widgets/components/tablePagination';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import Loader from '@/utils/Loader';
const ManagerTable = () => {
    const apiUrl = import.meta.env.VITE_API_URL;
    const navigate = useNavigate();
    const { loginAs } = useAuth();
    // Get permissions directly from auth context
    const { canEdit, canDelete, canCreate, hasPermission, user: currentUser } = useAuth();

    const [userData, setUserData] = useState([]);
    const [userToDelete, setUserToDelete] = useState(null);
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
    const [currentFilters, setCurrentFilters] = useState({});
    const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false);
    const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalAdmins, setTotalAdmins] = useState(0);
    const [totalManagers, setTotalManagers] = useState(0);
    const [totalRoles, setTotalRoles] = useState(0);
      const [isLoading, setIsLoading] = useState(false);


    const handleAddUser = () => {
        navigate('/dashboard/users/add-manager');
    };

    // Create a separate function for fetching and processing data
    const fetchAndProcessUsers = async (page = 1, filters = {}) => {
        setIsLoading(true);
        try {
            const res = await userService.list(page, filters);
            // console.log("this is manager users",res);

            const fetchedData = res.data?.data.users || [];
            if (fetchedData.length === 0 && page > 1) {
                return fetchAndProcessUsers(page - 1, filters); // recursively call with previous page
            }
            const paginationData = res.data?.data;

            const mappedData = fetchedData.map((item, index) => ({
                _id: item._id,
                id: ((paginationData.currentPage - 1) * 10) + index + 1,
                userName: item.userName,
                email: item.email,
                fullName: item.fullName,
                role: item.role,
                permissions: item.permissions,
                canView: item.permissions?.canView || false,
                canEdit: item.permissions?.canEdit || false,
                canDelete: item.permissions?.canDelete || false,
                canCreate: item.permissions?.canCreate || false,
                status: item.status,
                createdAt: new Date(item.createdAt).toLocaleDateString(),
                updatedAt: new Date(item.updatedAt).toLocaleDateString()
            }));

            setUserData(mappedData);
            setCurrentPage(paginationData.currentPage || 1);
            setTotalPages(paginationData.totalPages || 1);
            setHasNextPage(paginationData.hasNextPage || false);
            setHasPrevPage(paginationData.hasPrevPage || false);
            setTotalUsers(paginationData.totalData || 0);
            setTotalAdmins(paginationData.totalAdmins || 0);
            setTotalManagers(paginationData.totalManagers || 0);
            setTotalRoles(paginationData.totalRoles || 0);

            // return { users: mappedData, total: paginationData.totalData };
        } catch (error) {
            console.error('Failed to fetch users:', error);
            toast.error("Failed to fetch users");
            // return { users: [], total: 0 };
        }
  finally {
    setIsLoading(false);
  }
    };

    const handleEditUser = (user, event) => {
        event.stopPropagation();
        navigate(`/dashboard/users/edit-user/${user._id}`);
    };

    const handleDeleteUser = (user, event) => {
        event.stopPropagation();
        setUserToDelete(user);
    };

    const handleLoginAsUser = async (user, event) => {
        event.stopPropagation();

        if (currentUser?.role !== "admin") {
            toast.error("Only administrators can impersonate");
            return;
        }
     
        try {
            const res = await userService.impersonateUser(user._id);
            
            
            const { impersonatedUser, originalUser, accessToken } = res.data.data;
            const originalToken = localStorage.getItem("accessToken");

            loginAs(impersonatedUser, accessToken, originalUser, originalToken);

            // ✅ Ensure LocalStorage is written before opening tab
            setTimeout(() => {
                const url = `${import.meta.env.VITE_USER_DASHBOARD_URL}/dashboard/home?impersonated=true&t=${Date.now().toString()}`;
                window.open(url, "_blank");
            }, 500); // ✅ 500ms delay guarantees localStorage write

            toast.success(`Opening impersonation for ${impersonatedUser.fullName}`);
        } catch (err){
            console.log("impersination error",err);
            toast.error(`${err?.response?.data?.message} | Failed to impersonate user`);
        }
    };

    const confirmDeleteUser = async () => {
        if (userToDelete) {
            setIsLoading(true);
            try {
                const response = await userService.delete([userToDelete._id]);
                //  console.log("single delete response",response);
                // toast.success(` the respose data ${response.data.message}`);
                toast.success(`User "${userToDelete.fullName}" deleted`);
                setUserToDelete(null);

                // Refetch users after delete
                await fetchAndProcessUsers(currentPage, currentFilters);
            } catch (err) {
                console.log("error", err);

                toast.error("Failed to delete user", err.response?.data?.message);
                console.log("this is error ", err.response?.data?.message);
            }
  finally {
    setIsLoading(false);
  }
        }
    };

    const handleSelectUser = (id) => {
        setSelectedUserIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedUserIds.length === userData.length) {
            setSelectedUserIds([]);
        } else {
            setSelectedUserIds(userData.map((user) => user.id));
        }
    };

    const handleDeleteSelected = async () => {
        setShowBulkDeleteConfirm(true)
    };

    const confirmBulkDelete = async () => {
        const selectedRealIds = userData
            .filter(user => selectedUserIds.includes(user.id))
            .map(user => user._id);
        setIsLoading(true);
        try {
            const response = await userService.delete(selectedRealIds);
            console.log("deleted", response);

            toast.success(`${selectedRealIds.length} user(s) deleted`);
            setSelectedUserIds([]);
            setShowBulkDeleteConfirm(false);

            await fetchAndProcessUsers(currentPage, currentFilters);


        } catch (err) {
            console.error("Bulk delete failed", err);
            toast.error("Failed to delete selected users");
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
  const selectedRealIds = userData
    .filter(user => selectedUserIds.includes(user.id))
    .map(user => user._id);

  try {
    await userService.bulkUpdate({ ids: selectedRealIds, updates });
    toast.success(`${selectedRealIds.length} user(s) updated`);
    setSelectedUserIds([]);
    setShowBulkUpdateDialog(false);
    await fetchAndProcessUsers(currentPage, currentFilters);
  } catch (err) {
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

        if (cleanFilters.role) {
            cleanFilters.role = cleanFilters.role;
        }

        if (cleanFilters.status) {
            cleanFilters.status = cleanFilters.status;
        }

        setCurrentFilters(cleanFilters);
        setCurrentPage(1);
        fetchAndProcessUsers(1, cleanFilters);
    };

    const resetToInitialData = () => {
        setCurrentFilters({});
        setCurrentPage(1);
        fetchAndProcessUsers(1, {});
    };



    // Pagination handlers
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchAndProcessUsers(page, currentFilters);
    };

    const handleNextPage = () => hasNextPage && handlePageChange(currentPage + 1);
    const handlePrevPage = () => hasPrevPage && handlePageChange(currentPage - 1);


    //   const handleExport = () => {
    //     exportUsersToJson(userData, 'users_backup.json');
    //   };


    const getRoleChipColor = (role) => {
        switch (role) {
            case 'admin':
                return 'purple';
            case 'manager':
                return 'blue';
            case 'affiliate':
                return 'orange';
            default:
                return 'gray';
        }
    };

    // Update your useEffect to use the new function
    useEffect(() => {
        fetchAndProcessUsers(1, '');
    }, []);

    return (
        <div className=" min-h-screen mt-12 mb-8 flex flex-col gap-12">
            <Card>
                <CardHeader variant="gradient" color="blue" className=" p-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <Typography variant="h6" color="white">User Management</Typography>
                            <Typography variant="small" color="white" className="opacity-80">
                                Manage system users and their permissions
                            </Typography>
                        </div>
                        <div className="flex gap-2">
                            {canCreate && (
                                <Button variant="outlined" color="white" size="sm"
                                    className='flex items-center gap-2 p-3'
                                    onClick={handleAddUser}>
                                    <Plus size={16} /> Add Manager
                                </Button>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardBody className="px-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Typography className="text-gray-600 text-sm">Total Users</Typography>
                                    <Typography variant="h4" className="font-bold text-blue-800">{totalUsers}</Typography>
                                </div>
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <Users className="text-blue-500" size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-4 rounded-lg shadow border border-purple-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Typography className="text-gray-600 text-sm">Admins</Typography>
                                    <Typography variant="h4" className="font-bold text-purple-700">
                                        {totalAdmins}
                                    </Typography>
                                </div>
                                <div className="bg-purple-100 p-2 rounded-full">
                                    <Shield className="text-purple-500" size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Typography className="text-gray-600 text-sm">Managers</Typography>
                                    <Typography variant="h4" className="font-bold text-green-700">
                                        {totalManagers}
                                    </Typography>
                                </div>
                                <div className="bg-green-100 p-2 rounded-full">
                                    <User className="text-green-500" size={20} />
                                </div>
                            </div>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg shadow border border-amber-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Typography className="text-gray-600 text-sm">Active Roles</Typography>
                                    <Typography variant="h4" className="font-bold text-amber-700">
                                        {totalRoles}
                                    </Typography>
                                </div>
                                <div className="bg-amber-100 p-2 rounded-full">
                                    <Shield className="text-amber-500" size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader variant="gradient" color="gray" className=" p-6">
                    <div className="flex justify-between items-center">
                        <Typography variant="h6" color="white"> Users</Typography>
                    </div>
                </CardHeader>
                <CardBody className="px-4">
                    <div className="mb-6 ">
                        <TableToolbar
                            data={userData}
                            onApplyFilters={handleApplyFilters}
                            onClearFilters={resetToInitialData}
                            showImportJson={false}
                            showExportJson={false}
                            exportFileName="users"
                            showExportButton={false}
                            showImportButton={false}
                            showApplyButton={true}
                            showCategoryOptions={false}
                        />
                        {canDelete && selectedUserIds.length > 0 && (
                            <div className="mb-4 mt-2 flex gap-2">
                                <Button
      color="blue"
      variant="filled"
      onClick={handleBulkUpdate}
      className="flex items-center gap-2 p-4"
    >
      <Edit size={16} /> Update Selected ({selectedUserIds.length})
    </Button>
                                <Button
                                    color="red"
                                    variant="filled"
                                    onClick={handleDeleteSelected}
                                    className="flex items-center gap-2 p-4"
                                >
                                    <Trash2 size={16} /> Delete Selected ({selectedUserIds.length})
                                </Button>
                            </div>
                        )}
                    </div>

                    {isLoading && <Loader />}

                    {!isLoading && (<div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-100 rounded-lg">
                                <tr>
                                    {canDelete && (<th className="border-b py-3 px-4 text-left">
                                        <input
                                            type="checkbox"
                                            checked={
                                                selectedUserIds.length === userData.length &&
                                                userData.length > 0
                                            }
                                            onChange={handleSelectAll}
                                        />
                                    </th>)}
                                    {["ID", "Username", "Full Name", "Email", "Role", "Permissions", "status", "Created At", "Updated At", "Actions"].map((el) => (
                                        <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left whitespace-nowrap">
                                            <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                                                {el}
                                            </Typography>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {userData.map((user, key) => {
                                    const className = `p-4 ${key === userData.length - 1 ? "" : "border-b"}`;
                                    const isSelected = selectedUserIds.includes(user.id);
                                    return (
                                        <tr key={user.id} className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}>
                                            {canDelete && (<td className={className}>
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => handleSelectUser(user.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </td>)}
                                            <td className={className}>{user.id}</td>
                                            <td className={className}>
                                                <Typography variant="small" className="font-medium">
                                                    {user.userName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography variant="small" className="font-medium">
                                                    {user.fullName}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography variant="small" className="text-gray-600">
                                                    {user.email}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Chip
                                                    variant="gradient"
                                                    color={getRoleChipColor(user.role)}
                                                    value={user.role}
                                                    className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                                                />
                                            </td>
                                            <td className={className}>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.canView && (
                                                        <Chip
                                                            variant="ghost"
                                                            color="green"
                                                            value="View"
                                                            className="py-1 px-2 text-[10px] font-medium w-fit"
                                                        />
                                                    )}
                                                    {user.canEdit && (
                                                        <Chip
                                                            variant="ghost"
                                                            color="blue"
                                                            value="Edit"
                                                            className="py-1 px-2 text-[10px] font-medium w-fit"
                                                        />
                                                    )}
                                                    {user.canDelete && (
                                                        <Chip
                                                            variant="ghost"
                                                            color="red"
                                                            value="Delete"
                                                            className="py-1 px-2 text-[10px] font-medium w-fit"
                                                        />
                                                    )}
                                                    {user.canCreate && (
                                                        <Chip
                                                            variant="ghost"
                                                            color="purple"
                                                            value="Create"
                                                            className="py-1 px-2 text-[10px] font-medium w-fit"
                                                        />
                                                    )}
                                                    {!user.canView && !user.canEdit && !user.canDelete && !user.canCreate && (
                                                        <Typography variant="small" className="text-gray-400 italic">
                                                            No permissions
                                                        </Typography>
                                                    )}
                                                </div>

                                            </td>
                                            <td className={className}>
                                                <Chip
                                                    variant="gradient"
                                                    color={user.status === 'active' ? "green" : "red"}
                                                    value={user.status}
                                                    className="py-1 px-2 text-[12px] font-medium w-fit capitalize"
                                                />
                                            </td>
                                            <td className={className}>
                                                <Typography variant="small" className="text-gray-600">
                                                    {user.createdAt}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <Typography variant="small" className="text-gray-600">
                                                    {user.updatedAt}
                                                </Typography>
                                            </td>
                                            <td className={className}>
                                                <div className="flex space-x-2">
                                                    {canEdit && (
                                                        <button
                                                            onClick={(e) => handleEditUser(user, e)}
                                                            className="text-blue-500 hover:text-blue-700"
                                                            title="Edit User"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                    )}
                                                    {canDelete && (
                                                        <button
                                                            onClick={(e) => handleDeleteUser(user, e)}
                                                            className="text-red-500 hover:text-red-700"
                                                            title="Delete User"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    )}

                                                    {currentUser?.role === 'admin' && !['admin', 'user'].includes(user.role) && (
                                                    <button
                                                        onClick={(e) => handleLoginAsUser(user, e)}
                                                        className="text-green-500 hover:text-green-700"
                                                        title="Login as User"
                                                    >
                                                        <LogIn size={18} />
                                                    </button>
                                                    )}
                                                   
                                                    {!canEdit && !canDelete && currentUser?.role !== 'admin'&& (
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

                    {userData.length === 0 && (
                        <div className="text-center py-4">
                            <Typography color="blue-gray" className="font-normal">No users found matching the search criteria</Typography>
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
                        totalItems={totalUsers}
                        itemsPerPage={10}
                    />

                </CardBody>
            </Card>

            <ConfirmationDialog
                isOpen={userToDelete !== null}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDeleteUser}
                title="Delete User"
                message={`Are you sure you want to delete "${userToDelete?.fullName}"? This action cannot be undone.`} />

            <ConfirmationDialog
                isOpen={showBulkDeleteConfirm}
                onClose={() => setShowBulkDeleteConfirm(false)}
                onConfirm={confirmBulkDelete}
                title="Delete Selected Users"
                message={`Are you sure you want to delete ${selectedUserIds.length} selected user(s)? This action cannot be undone.`}
            />

            <BulkUpdateComponent
  isOpen={showBulkUpdateDialog}
  onClose={() => setShowBulkUpdateDialog(false)}
  onConfirm={confirmBulkUpdate}
  selectedCount={selectedUserIds.length}
  loading={bulkUpdateLoading}
  showRole={true}
  showStatus={true}
  showPermissions={true}
/>
        </div>
    );
};

export default ManagerTable;