// utils/productFilterMapping.js

/**
 * Maps frontend filter structure to backend filter structure
 * @param {Object} frontendFilters - Filters from the frontend components
 * @returns {Object} - Mapped filters for backend API
 */
export const mapProductFiltersToBackend = (filters) => {
  const backendFilters = {};

  // Basic flat fields
  if (filters.search) backendFilters.search = filters.search;
  if (filters.category) backendFilters.category = filters.category;
  if (filters.status) backendFilters.status = filters.status;
  if (filters.platformType) backendFilters.platformType = filters.platformType;
  if (filters.brand) backendFilters.brand = filters.brand;
  
  // 🔧 FIXED: Add missing store filter mapping
  if (filters.store) backendFilters.store = filters.store;
  
  if (filters.inStock) backendFilters.inStock = filters.inStock;
  if (filters.isUpcoming) backendFilters.isUpcoming = filters.isUpcoming;
  if (filters.minPrice) backendFilters.minPrice = filters.minPrice;
  if (filters.maxPrice) backendFilters.maxPrice = filters.maxPrice;
  if (filters.startDate) backendFilters.startDate = filters.startDate;
  if (filters.endDate) backendFilters.endDate = filters.endDate;

  // 🔧 ADDED: Missing filter mappings from your additional filters
  if (filters.hasDiscount) backendFilters.hasDiscount = filters.hasDiscount;
  if (filters.expired) backendFilters.expired = filters.expired;
  if (filters.earningRate) backendFilters.earningRate = filters.earningRate;
  if (filters.tags) backendFilters.tags = filters.tags;
  if (filters.clicksMin) backendFilters.clicksMin = filters.clicksMin;
  if (filters.clicksMax) backendFilters.clicksMax = filters.clicksMax;

  // ✅ Sort handling with alias mapping
  if (filters.sortBy) {
    const order = filters.sortOrder || 'asc';
    let sortField = filters.sortBy;

    if (sortField === 'price') sortField = 'sellingPrice';
    if (sortField === 'date') sortField = 'createdAt';

    backendFilters.sort = `${sortField}:${order}`;
  }

  // ✅ Auto-map any spec filters (like 'specifications.memory.ram')
  Object.entries(filters).forEach(([key, value]) => {
    if (
      key.includes('.') &&
      value !== '' &&
      !backendFilters.hasOwnProperty(key)
    ) {
      backendFilters[key] = value;
    }
  });

  // 🔧 ADDED: Debug logging to help troubleshoot
  //console.log('🔍 Filter Mapping Debug:');
  //console.log('Frontend Filters:', filters);
  //console.log('Backend Filters:', backendFilters);
  
  // Specifically check store filter
 // if (filters.store) {
    //console.log('✅ Store filter mapped:', filters.store, '->', backendFilters.store);
  //}

  return backendFilters;
};


// Helper function to check if filters have meaningful values
export const hasActiveFilters = (filters) => {
  if (!filters || typeof filters !== 'object') return false;
  
  return Object.values(filters).some(value => {
    if (value === null || value === undefined || value === '') return false;
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      return Object.values(value).some(v => v !== '' && v !== null && v !== undefined);
    }
    
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    
    return true;
  });
};

// Debug function to log filter transformations
export const debugFilterMapping = (frontendFilters, backendFilters) => {
  //console.group('Filter Mapping Debug');
  //console.log('Frontend Filters:', frontendFilters);
  //console.log('Backend Filters:', backendFilters);
  //console.log('Has Active Filters:', hasActiveFilters(frontendFilters));
  
  // Check for potential issues
  if (frontendFilters.store && !backendFilters.store) {
    //console.error('❌ Store filter not mapped properly!');
  }
  
  if (frontendFilters.brand && !backendFilters.brand) {
    //console.error('❌ Brand filter not mapped properly!');
  }
  
  //console.groupEnd();
};