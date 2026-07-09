import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Input,
  Select,
  Option,
  Typography,
  Checkbox,
} from '@material-tailwind/react';
import { X, Calendar, DollarSign, SortAsc, SortDesc, Tag, TrendingUp, Target } from 'lucide-react';
import { brandService } from '@/api/services/brand.service';
import { storeService } from '@/api/services/stores.service';

export const FilterDialogComponent = ({ 
  open, 
  onClose, 
  onApply, 
  onClear, 
  currentFilters = {} 
}) => {
  // Initialize filter states
  const [filters, setFilters] = useState({
    priceRange: {
      min: '',
      max: ''
    },
    dateRange: {
      from: '',
      to: ''
    },
    sortBy: '',
    sortOrder: 'asc',
    brand: '',
    store: '',
    inStock: '',
    isUpcoming: '',
    status: '',
    hasDiscount: '',
    clicksRange: {
      min: '',
      max: ''
    },
    earningRate: '',
    expired: '',
    tags: '',
    goals: false, // New goals filter
  });

  // Add state for dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    brands: [],
    stores: [],
    loading: false,
    error: null
  });

  const defaultFilters = {
    priceRange: { min: '', max: '' },
    dateRange: { from: '', to: '' },
    sortBy: '',
    sortOrder: 'asc',
    brand: '',
    store: '',
    inStock: '',
    isUpcoming: '',
    status: '',
    hasDiscount: '',
    clicksRange: { min: '', max: '' },
    earningRate: '',
    expired: '',
    tags: '',
    goals: false, // New goals filter
  };

  // Sort options matching your backend
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'sellingPrice', label: 'Price' },
    { value: 'startingPrice', label: 'Original Price' },
    { value: 'createdAt', label: 'Date Created' },
    { value: 'updatedAt', label: 'Date Updated' },
    { value: 'clickCount', label: 'Click Count' },
  ];

  // Status options
  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];

  // Load current filters when dialog opens
  useEffect(() => {
    if (open) {
      fetchDropdownOptions();
      // Load current filters if provided
      if (Object.keys(currentFilters).length > 0) {
        setFilters(prev => ({
          ...defaultFilters,
          ...currentFilters,
          priceRange: {
            min: currentFilters.minPrice || '',
            max: currentFilters.maxPrice || ''
          },
          dateRange: {
            from: currentFilters.startDate || '',
            to: currentFilters.endDate || ''
          },
          clicksRange: {
            min: currentFilters.clicksMin || '',
            max: currentFilters.clicksMax || ''
          },
          goals: currentFilters.goals || false, // Load goals filter
        }));
      } else {
        setFilters(defaultFilters);
      }
    }
  }, [open, currentFilters]);

  const fetchDropdownOptions = async () => {
    setDropdownOptions(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      // Fetch both brands and stores using your existing services
      const [brandsResponse, storesResponse] = await Promise.all([
        brandService.list(1, { limit: 1000, status: 'active' }),
        storeService.list(1, { limit: 1000, status: 'active' })
      ]);

      // Extract data from your service responses
      const brands = brandsResponse.data?.data?.brandData || [];
      const stores = storesResponse.data?.data?.storeData || [];

      setDropdownOptions({
        brands: Array.isArray(brands) ? brands : [],
        stores: Array.isArray(stores) ? stores : [],
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Error fetching dropdown options:', error);
      setDropdownOptions(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Failed to load options. Please try again.' 
      }));
    }
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: value
    }));
  };

  const handleNestedFilterChange = (filterKey, nestedKey, value) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: {
        ...prev[filterKey],
        [nestedKey]: value
      }
    }));
  };

  const handleApply = () => {
    const cleanedFilters = {};

    // Price range filters
    if (filters.priceRange?.min) cleanedFilters.minPrice = filters.priceRange.min;
    if (filters.priceRange?.max) cleanedFilters.maxPrice = filters.priceRange.max;
    
    // Date range filters
    if (filters.dateRange?.from) cleanedFilters.startDate = filters.dateRange.from;
    if (filters.dateRange?.to) cleanedFilters.endDate = filters.dateRange.to;

    // Clicks range filters
    if (filters.clicksRange?.min) cleanedFilters.clicksMin = filters.clicksRange.min;
    if (filters.clicksRange?.max) cleanedFilters.clicksMax = filters.clicksRange.max;

    // Reference filters
    if (filters.brand) cleanedFilters.brand = filters.brand;
    if (filters.store) cleanedFilters.store = filters.store;

    // Boolean and string filters
    if (filters.inStock) cleanedFilters.inStock = filters.inStock;
    if (filters.isUpcoming) cleanedFilters.isUpcoming = filters.isUpcoming;
    if (filters.status) cleanedFilters.status = filters.status;
    if (filters.hasDiscount) cleanedFilters.hasDiscount = filters.hasDiscount;
    if (filters.expired) cleanedFilters.expired = filters.expired;
    if (filters.earningRate) cleanedFilters.earningRate = filters.earningRate;
    if (filters.tags) cleanedFilters.tags = filters.tags;
    if (filters.goals) cleanedFilters.goals = filters.goals; // Include goals filter
    
    // Sort filters
    if (filters.sortBy) cleanedFilters.sortBy = filters.sortBy;
    if (filters.sortOrder) cleanedFilters.sortOrder = filters.sortOrder;

    // Create sort parameter for backend compatibility
    if (filters.sortBy && filters.sortOrder) {
      cleanedFilters.sort = `${filters.sortBy}:${filters.sortOrder}`;
    }

    onApply(cleanedFilters);
  };

  const handleClear = () => {
    setFilters(defaultFilters);
    onClear();
  };

  const hasActiveFilters = () => {
    return Object.keys(filters).some(key => {
      const value = filters[key];
      if (key === 'priceRange') return value.min || value.max;
      if (key === 'dateRange') return value.from || value.to;
      if (key === 'clicksRange') return value.min || value.max;
      if (key === 'goals') return value === true; // Check goals filter
      return value !== '' && value !== null && value !== undefined;
    });
  };

  const handleRetryLoad = () => {
    fetchDropdownOptions();
  };

  // Helper function to get brand name by ID
  const getBrandName = (brandId) => {
    const brand = dropdownOptions.brands.find(b => b._id === brandId);
    return brand ? brand.name : '';
  };

  // Helper function to get store name by ID
  const getStoreName = (storeId) => {
    const store = dropdownOptions.stores.find(s => s._id === storeId);
    return store ? store.name : '';
  };

  return (
    <Dialog open={open} handler={onClose} size="lg" className="bg-white">
      <DialogHeader className="flex items-center justify-between">
        <Typography variant="h4" color="blue-gray">
          Additional Filters
        </Typography>
        <Button
          variant="text"
          color="blue-gray"
          onClick={onClose}
          className="p-2"
        >
          <X size={20} />
        </Button>
      </DialogHeader>

      <DialogBody className="space-y-6 max-h-96 overflow-y-auto">
        {/* Error display */}
        {dropdownOptions.error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <Typography variant="small" color="red" className="mb-2">
              {dropdownOptions.error}
            </Typography>
            <Button 
              size="sm" 
              variant="outlined" 
              color="red" 
              onClick={handleRetryLoad}
            >
              Retry
            </Button>
          </div>
        )}

        {/* Price Range */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
            <DollarSign size={18} />
            Price Range
          </Typography>
          <div className="flex gap-4">
            <Input
              type="number"
              label="Min Price"
              value={filters.priceRange.min}
              onChange={(e) => handleNestedFilterChange('priceRange', 'min', e.target.value)}
            />
            <Input
              type="number"
              label="Max Price"
              value={filters.priceRange.max}
              onChange={(e) => handleNestedFilterChange('priceRange', 'max', e.target.value)}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
            <Calendar size={18} />
            Date Range
          </Typography>
          <div className="flex gap-4">
            <Input
              type="date"
              label="From Date"
              value={filters.dateRange.from}
              onChange={(e) => handleNestedFilterChange('dateRange', 'from', e.target.value)}
            />
            <Input
              type="date"
              label="To Date"
              value={filters.dateRange.to}
              onChange={(e) => handleNestedFilterChange('dateRange', 'to', e.target.value)}
            />
          </div>
        </div>

        {/* Sort Options */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
            <SortAsc size={18} />
            Sort Options
          </Typography>
          <div className="flex gap-4">
            <Select
              label="Sort By"
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
            >
              {sortOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Select
              label="Order"
              value={filters.sortOrder}
              onChange={(value) => handleFilterChange('sortOrder', value)}
            >
              <Option value="asc">
                <div className="flex items-center gap-2">
                  <SortAsc size={16} />
                  Ascending
                </div>
              </Option>
              <Option value="desc">
                <div className="flex items-center gap-2">
                  <SortDesc size={16} />
                  Descending
                </div>
              </Option>
            </Select>
          </div>
        </div>

        {/* Brand & Store */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">Brand & Store</Typography>
          <div className="flex gap-4">
            <div className="w-1/2">
              <Select
                key={`brand-${filters.brand}-${dropdownOptions.brands.length}`}
                label={dropdownOptions.loading ? "Loading brands..." : "Brand"}
                value={filters.brand || ''}
                onChange={(value) => handleFilterChange('brand', value || '')}
                disabled={dropdownOptions.loading}
                selected={(element) => {
                  if (!filters.brand) return "All Brands";
                  const brandName = getBrandName(filters.brand);
                  return brandName || "All Brands";
                }}
              >
                <Option value="">All Brands</Option>
                {dropdownOptions.brands.map(brand => (
                  <Option key={brand._id} value={brand._id}>
                    {brand.name}
                  </Option>
                ))}
              </Select>
            </div>
            <div className="w-1/2">
              <Select
                key={`store-${filters.store}-${dropdownOptions.stores.length}`}
                label={dropdownOptions.loading ? "Loading stores..." : "Store"}
                value={filters.store || ''}
                onChange={(value) => handleFilterChange('store', value || '')}
                disabled={dropdownOptions.loading}
                selected={(element) => {
                  if (!filters.store) return "All Stores";
                  const storeName = getStoreName(filters.store);
                  return storeName || "All Stores";
                }}
              >
                <Option value="">All Stores</Option>
                {dropdownOptions.stores.map(store => (
                  <Option key={store._id} value={store._id}>
                    {store.name}
                  </Option>
                ))}
              </Select>
            </div>
          </div>
          {dropdownOptions.loading && (
            <Typography variant="small" color="blue-gray" className="text-center">
              Loading options...
            </Typography>
          )}
        </div>

        {/* Status & Stock Filters */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">Status & Stock</Typography>
          <div className="flex gap-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="">Any Status</Option>
              {statusOptions.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
            <Select
              label="In Stock"
              value={filters.inStock || ''}
              onChange={(value) => handleFilterChange('inStock', value)}
            >
              <Option value="">Any</Option>
              <Option value="true">Yes</Option>
              <Option value="false">No</Option>
            </Select>
          </div>
        </div>

        {/* Product State Filters */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray">Product State</Typography>
          <div className="flex gap-4">
            <Select
              label="Is Upcoming"
              value={filters.isUpcoming || ''}
              onChange={(value) => handleFilterChange('isUpcoming', value)}
            >
              <Option value="">Any</Option>
              <Option value="true">Yes</Option>
              <Option value="false">No</Option>
            </Select>
            <Select
              label="Has Discount"
              value={filters.hasDiscount || ''}
              onChange={(value) => handleFilterChange('hasDiscount', value)}
            >
              <Option value="">Any</Option>
              <Option value="true">Yes</Option>
              <Option value="false">No</Option>
            </Select>
          </div>
        </div>

        {/* Goals Filter */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
            <Target size={18} />
            Goals
          </Typography>
          <Checkbox
            label="Show only products with assigned goals"
            checked={filters.goals}
            onChange={(e) => handleFilterChange('goals', e.target.checked)}
          />
        </div>

        {/* Additional Filters */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
            <TrendingUp size={18} />
            Additional Options
          </Typography>
          <div className="flex gap-4">
            <Input
              label="Earning Rate"
              value={filters.earningRate}
              onChange={(e) => handleFilterChange('earningRate', e.target.value)}
              placeholder="e.g., 5%"
            />
            <Select
              label="Expired"
              value={filters.expired || ''}
              onChange={(value) => handleFilterChange('expired', value)}
            >
              <Option value="">Any</Option>
              <Option value="true">Expired</Option>
              <Option value="false">Not Expired</Option>
            </Select>
          </div>
        </div>

        {/* Tags & Clicks Range */}
        <div className="space-y-2">
          <Typography variant="h6" color="blue-gray" className="flex items-center gap-2">
            <Tag size={18} />
            Tags & Performance
          </Typography>
          <div className="flex gap-4 mb-4">
            <Input
              label="Tags"
              value={filters.tags}
              onChange={(e) => handleFilterChange('tags', e.target.value)}
              placeholder="Search by tags"
            />
          </div>
          <div className="flex gap-4">
            <Input
              type="number"
              label="Min Clicks"
              value={filters.clicksRange.min}
              onChange={(e) => handleNestedFilterChange('clicksRange', 'min', e.target.value)}
            />
            <Input
              type="number"
              label="Max Clicks"
              value={filters.clicksRange.max}
              onChange={(e) => handleNestedFilterChange('clicksRange', 'max', e.target.value)}
            />
          </div>
        </div>
      </DialogBody>

      <DialogFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button
            variant="outlined"
            color="red"
            onClick={handleClear}
            disabled={!hasActiveFilters()}
          >
            Clear All
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="gradient" 
            color="blue" 
            onClick={handleApply}
            disabled={dropdownOptions.loading}
          >
            Apply Filters
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
};

export default FilterDialogComponent;