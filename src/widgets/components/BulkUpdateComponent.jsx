import React, { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Select,
  Option,
  Card,
  CardBody,
  Chip
} from '@material-tailwind/react';
import { Edit, X, Check } from 'lucide-react';

const BulkUpdateComponent = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount = 0,
  loading = false,
  showIsUpcoming = false,
  showInStock = false,
  showStatus = true,
  showRole = false,
  showPermissions = false
}) => {
  const [updates, setUpdates] = useState({});
  const [errors, setErrors] = useState({});
  useEffect(() => {
    if (isOpen) {
      setUpdates({});
      setErrors({});
    }
  }, [isOpen]);

  const updateOptions = {
    status: {
      label: 'Status',
      values: [
        { value: 'active', label: 'Active', color: 'green' },
        { value: 'draft', label: 'Draft', color: 'yellow' },
         { value: 'inactive', label: 'Inactive', color: 'red' }
      ]
    },
    role: {
      label: 'Role',
      values: [
        { value: 'admin', label: 'Admin', color: 'purple' },
        { value: 'manager', label: 'Manager', color: 'blue' }
      ]
    },
    inStock: {
      label: 'In Stock',
      values: [
        { value: 'yes', label: 'Yes', color: 'green' },
        { value: 'no', label: 'No', color: 'red' }
      ]
    },
    isUpcoming: {
      label: 'Is Upcoming',
      values: [
        { value: 'true', label: 'Yes', color: 'purple' },
        { value: 'false', label: 'No', color: 'gray' }
      ]
    },
    permissions: {
      label: 'Permissions',
      multi: true,
      values: [
        { value: 'canView', label: 'View', color: 'green' },
        { value: 'canEdit', label: 'Edit', color: 'blue' },
        { value: 'canDelete', label: 'Delete', color: 'red' },
        { value: 'canCreate', label: 'Create', color: 'purple' }
      ]
    }
  };

  const handleUpdateChange = (field, value) => {
    setUpdates((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handlePermissionToggle = (perm) => {
    setUpdates((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: !prev.permissions?.[perm]
      }
    }));
  };

  const handleRemoveUpdate = (field) => {
    const newUpdates = { ...updates };
    delete newUpdates[field];
    setUpdates(newUpdates);
  };

  const handleSubmit = () => {
    if (Object.keys(updates).length === 0) {
      setErrors({ general: 'Please select at least one field to update' });
      return;
    }

    const processedUpdates = { ...updates };
    if ('isUpcoming' in processedUpdates) {
      processedUpdates.isUpcoming = processedUpdates.isUpcoming === 'true';
    }

      // ✅ Convert string to boolean for inStock
  if ('inStock' in processedUpdates) {
    processedUpdates.inStock = processedUpdates.inStock === 'yes';
  }
    onConfirm(processedUpdates);
  };

  const handleClose = () => {
    setUpdates({});
    setErrors({});
    
    onClose();
  };

  const getSelectedValueLabel = (field, value) => {
    const option = updateOptions[field];
    const selected = option.values.find((v) => v.value === String(value));
    return selected?.label || value;
  };

  const getSelectedValueColor = (field, value) => {
    const option = updateOptions[field];
    const selected = option.values.find((v) => v.value === String(value));
    return selected?.color || 'gray';
  };

  const fieldsToDisplay = Object.keys(updateOptions).filter((field) => {
    if (field === 'status') return showStatus;
    if (field === 'role') return showRole;
    if (field === 'inStock') return showInStock;
    if (field === 'isUpcoming') return showIsUpcoming;
    if (field === 'permissions') return showPermissions;
    return false;
  });

  return (
    <Dialog open={isOpen} handler={handleClose} size="md">
      <DialogHeader className="flex items-center gap-2">
        <Edit size={20} />
        <Typography variant="h5">Bulk Update ({selectedCount} selected)</Typography>
      </DialogHeader>

      <DialogBody divider className="max-h-[60vh] overflow-y-auto">
        {errors.general && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Typography variant="small" color="red">
              {errors.general}
            </Typography>
          </div>
        )}

        {Object.keys(updates).length > 0 && (
          <Card className="bg-blue-50 border border-blue-200">
            <CardBody className="p-4">
              <Typography variant="h6" className="mb-3 text-blue-800">
                Selected Updates:
              </Typography>
              <div className="flex flex-wrap gap-2">
                {Object.entries(updates).map(([field, value]) => (
                  <div
                    key={field}
                    className="flex items-center gap-2 bg-white p-2 rounded-lg border"
                  >
                    <Typography variant="small" className="font-medium">
                      {updateOptions[field]?.label}:
                    </Typography>
                    {field === 'permissions' ? (
                      Object.entries(value).map(([perm, enabled]) =>
                        enabled ? (
                          <Chip
                            key={perm}
                            variant="gradient"
                            color={getSelectedValueColor('permissions', perm)}
                            value={getSelectedValueLabel('permissions', perm)}
                          />
                        ) : null
                      )
                    ) : (
                      <Chip
                        variant="gradient"
                        color={getSelectedValueColor(field, value)}
                        value={getSelectedValueLabel(field, value)}
                      />
                    )}
                    <button
                      onClick={() => handleRemoveUpdate(field)}
                      className="text-red-500 hover:text-red-700 ml-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-4 mt-6">
          {fieldsToDisplay.map((field) => {
            const option = updateOptions[field];
            if (field === 'permissions') {
              return (
                <div key={field} className="space-y-2">
                  <Typography variant="h6" className="text-gray-700">
                    {option.label}
                  </Typography>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((perm) => (
                      <Chip
                        key={perm.value}
                        value={perm.label}
                        color={updates.permissions?.[perm.value] ? perm.color : 'gray'}
                        variant="filled"
                        onClick={() => handlePermissionToggle(perm.value)}
                        className="cursor-pointer"
                      />
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div key={field} className="space-y-2">
                <Typography variant="h6" className="text-gray-700">
                  {option.label}
                </Typography>
                <Select
                  label={`Select ${option.label}`}
                  value={updates[field] ?? ''}
                  onChange={(value) => handleUpdateChange(field, value)}
                  className="bg-white"
                >
                  {option.values.map((valueOption) => (
                    <Option key={valueOption.value} value={valueOption.value}>
                      <div className="flex items-center gap-2">
                        <Chip
                          variant="ghost"
                          color={valueOption.color}
                          value={valueOption.label}
                          className="py-1 px-2 text-[12px] font-medium"
                        />
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>
            );
          })}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <Typography variant="small" className="text-amber-800">
              <strong>Note:</strong> This will update all {selectedCount} selected item(s). Only the fields you choose will be updated.
            </Typography>
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="gap-2">
        <Button variant="text" color="gray" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="gradient"
          color="blue"
          onClick={handleSubmit}
          disabled={loading || Object.keys(updates).length === 0}
          className="flex items-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Updating...
            </>
          ) : (
            <>
              <Check size={16} />
              Update {selectedCount} Selected
            </>
          )}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default BulkUpdateComponent;
