import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  Upload,
  Download,
  X,
  FileSpreadsheet,
  FileCode,
  ChevronDown,
  Filter,
  Calendar,
} from 'lucide-react';
import * as xlsx from 'xlsx';
import {
  Button,
  Input,
  Select,
  Option,
} from '@material-tailwind/react';
import { categoryService } from '@/api/services/category.service';

export const TableToolbar = ({
  data = [],
  onExportExcel,
  onExportJson,
  onImportExcel,
  onImportJson,
  showCategoryOptions = true,
  exportFileName = 'export',

  showStatusOption = true,
  statusOptions = ['active', 'draft', 'inactive'], // ✅ Now configurable
  showImportExcel = true,
  showImportJson = true,
  showExportExcel = true,
  showExportJson = true,

  showImportButton = true,
  showExportButton = true,
  onApplyFilters,
  onClearFilters,
  showApplyButton = true,

  showDownloadSample = false,
  onDownloadSample = null,
  
  // Date filter props
  showDateFilter = false,
  dateFilterLabel = 'Date Range',
  dateFilterType = 'range', // 'range', 'single', 'from', 'to'
  
  // Additional filters
  showAdditionalFilters = true,
  FilterDialogComponent = null,
  onAdditionalFiltersChange,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [importDropdownOpen, setImportDropdownOpen] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [additionalFilters, setAdditionalFilters] = useState({});
  const [hasAdditionalFilters, setHasAdditionalFilters] = useState(false);
  
  const [categoryOptions, setCategoryOptions] = useState([]);

  const excelInputRef = useRef(null);
  const jsonInputRef = useRef(null);
  const importDropdownRef = useRef(null);
  const exportDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (importDropdownRef.current && !importDropdownRef.current.contains(event.target)) {
        setImportDropdownOpen(false);
      }
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(event.target)) {
        setExportDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.listDefault();
        if (response.status === 200) {
          setCategoryOptions(response.data.data.categories);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategoryOptions([]);
      }
    };

    fetchCategories();
  }, []);

  // Check if there are any additional filters applied
  useEffect(() => {
    const hasFilters = Object.keys(additionalFilters).some(key => {
      const value = additionalFilters[key];
      return value !== null && value !== undefined && value !== '' && 
             (Array.isArray(value) ? value.length > 0 : true);
    });
    setHasAdditionalFilters(hasFilters);
  }, [additionalFilters]);

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  const handleCategoryFilter = (category) => {
    setFilterCategory(category);
  };

  const handleStatusFilter = (status) => {
    setFilterStatus(status);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterCategory('');
    setFilterStatus('');
    setDateFrom('');
    setDateTo('');
    setAdditionalFilters({});
    
    if (onClearFilters) {
      onClearFilters();
    } else {
      onApplyFilters?.({
        search: '',
        category: '',
        status: '',
        dateFrom: '',
        dateTo: '',
        additionalFilters: {}
      });
    }
  };

  const handleApplyFilters = () => {
    const allFilters = {
      search: searchTerm,
      category: filterCategory,
      status: filterStatus,
      dateFrom: dateFrom,
      dateTo: dateTo,
      additionalFilters: additionalFilters
    };
    
    onApplyFilters?.(allFilters);
  };

  const handleAdditionalFiltersApply = (filters) => {
    setAdditionalFilters(filters);
    setFilterDialogOpen(false);
    
    if (onAdditionalFiltersChange) {
      onAdditionalFiltersChange(filters);
    }
  };

  const handleAdditionalFiltersClear = () => {
    setAdditionalFilters({});
    setFilterDialogOpen(false);
    
    if (onAdditionalFiltersChange) {
      onAdditionalFiltersChange({});
    }
  };

  const triggerExcelInput = () => {
    setImportDropdownOpen(false);
    excelInputRef.current?.click();
  };

  const triggerJsonInput = () => {
    setImportDropdownOpen(false);
    jsonInputRef.current?.click();
  };

  const removeIdFromData = (data) => data.map(({ _id, ...rest }) => rest);

  const processArrayFields = (data) => {
    return data.map(item => {
      const processedItem = {};
      
      Object.keys(item).forEach(key => {
        const value = item[key];
        
        if (Array.isArray(value) && value.length > 0) {
          processedItem[key] = value.map(arrayItem => {
            if (typeof arrayItem === 'object' && arrayItem !== null) {
              return arrayItem.name || arrayItem.title || arrayItem.label || JSON.stringify(arrayItem);
            }
            return arrayItem;
          }).join(', ');
        }
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          processedItem[key] = value.name || value.title || value.label || JSON.stringify(value);
        }
        else {
          processedItem[key] = value;
        }
      });
      
      return processedItem;
    });
  };

  const handleExportExcel = () => {
    setExportDropdownOpen(false);
    
    const cleanedData = removeIdFromData(data);
    const processedData = processArrayFields(cleanedData);
    
    if (typeof onExportExcel === 'function') {
      onExportExcel(processedData);
    } else {
      const worksheet = xlsx.utils.json_to_sheet(processedData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
      xlsx.writeFile(
        workbook,
        `${exportFileName}_${new Date().toISOString().split('T')[0]}.xlsx`
      );
    }
  };

  const handleExportJson = () => {
    setExportDropdownOpen(false);
    
    const cleanedData = removeIdFromData(data);
    const processedData = processArrayFields(cleanedData);
    
    if (typeof onExportJson === 'function') {
      onExportJson(processedData);
    } else {
      const blob = new Blob([JSON.stringify(processedData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${exportFileName}_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    if (type === 'excel') {
      onImportExcel?.(file);
    } else if (type === 'json') {
      onImportJson?.(file);
    }

    e.target.value = '';
  };

  const handleDownloadSample = async () => {
    if (typeof onDownloadSample === "function") {
      try {
        await onDownloadSample();
      } catch (error) {
        console.error("Error downloading sample:", error);
      }
    }
  };

  const hasActiveFilters =
    searchTerm !== '' || 
    filterCategory !== '' || 
    filterStatus !== '' || 
    dateFrom !== '' || 
    dateTo !== '' || 
    hasAdditionalFilters;

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4 mb-4">
        <div className="relative flex-grow w-full max-w-xl">
          <Input
            type="text"
            label="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            icon={<Search className="text-gray-400" />}
          />
        </div>

        {categoryOptions.length > 0 && showCategoryOptions && (
          <Select
            label="Categories"
            value={filterCategory}
            onChange={handleCategoryFilter}
          >
            {categoryOptions.map((category) => (
              <Option 
                key={category._id || category.id} 
                value={category._id || category.id}
              >
                {category.name || category}
              </Option>
            ))}
          </Select>
        )}
        
        {showStatusOption && statusOptions.length > 0 && (
          <Select
            label="Status"
            value={filterStatus}
            onChange={handleStatusFilter}
          >
            {statusOptions.map((status) => (
              <Option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Option>
            ))}
          </Select>
        )}

        {/* Date Filter */}
        {showDateFilter && (
          <>
            {(dateFilterType === 'range' || dateFilterType === 'from') && (
              <div className="relative">
                <Input
                  type="date"
                  label={dateFilterType === 'range' ? 'From Date' : dateFilterLabel}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  icon={<Calendar className="text-gray-400" size={18} />}
                />
              </div>
            )}
            
            {(dateFilterType === 'range' || dateFilterType === 'to') && (
              <div className="relative">
                <Input
                  type="date"
                  label={dateFilterType === 'range' ? 'To Date' : dateFilterLabel}
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  icon={<Calendar className="text-gray-400" size={18} />}
                />
              </div>
            )}

            {dateFilterType === 'single' && (
              <div className="relative">
                <Input
                  type="date"
                  label={dateFilterLabel}
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  icon={<Calendar className="text-gray-400" size={18} />}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Button Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <Button
            variant="gradient"
            color="red"
            onClick={handleClearFilters}
            className="flex items-center gap-2"
          >
            <X size={20} />
            Clear All
          </Button>
        )}

        {/* Additional Filters Button */}
        {showAdditionalFilters && FilterDialogComponent && (
          <Button
            variant={hasAdditionalFilters ? "filled" : "outlined"}
            color={hasAdditionalFilters ? "orange" : "gray"}
            onClick={() => setFilterDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Filter size={20} />
            Additional Filters
            {hasAdditionalFilters && (
              <span className="ml-1 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                Active
              </span>
            )}
          </Button>
        )}

        {/* Import Dropdown */}
        {showImportButton && (showImportExcel || showImportJson) && (
          <div className="relative" ref={importDropdownRef}>
            <Button
              variant="gradient"
              color="green"
              className="flex items-center gap-2"
              onClick={() => setImportDropdownOpen(!importDropdownOpen)}
            >
              <Upload size={20} />
              Import
              <ChevronDown size={16} className={`transition-transform duration-200 ${importDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>

            {importDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {showImportExcel && (
                  <button
                    onClick={triggerExcelInput}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 rounded-t-lg transition-colors duration-200"
                  >
                    <FileSpreadsheet size={18} className="text-green-600" />
                    Import Excel
                  </button>
                )}
                {showImportJson && (
                  <button
                    onClick={triggerJsonInput}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                      showImportExcel ? 'rounded-b-lg' : 'rounded-lg'
                    } transition-colors duration-200`}
                  >
                    <FileCode size={18} className="text-yellow-600" />
                    Import JSON
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Export Dropdown */}
        {showExportButton && (showExportExcel || showExportJson) && (
          <div className="relative" ref={exportDropdownRef}>
            <Button
              variant="gradient"
              color="blue"
              className="flex items-center gap-2"
              onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
            >
              <Download size={20} />
              Export
              <ChevronDown size={16} className={`transition-transform duration-200 ${exportDropdownOpen ? 'rotate-180' : ''}`} />
            </Button>

            {exportDropdownOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                {showExportExcel && (
                  <button
                    onClick={handleExportExcel}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 rounded-t-lg transition-colors duration-200"
                  >
                    <FileSpreadsheet size={18} className="text-green-600" />
                    Export Excel
                  </button>
                )}
                {showExportJson && (
                  <button
                    onClick={handleExportJson}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 ${
                      showExportExcel ? 'rounded-b-lg' : 'rounded-lg'
                    } transition-colors duration-200`}
                  >
                    <FileCode size={18} className="text-yellow-600" />
                    Export JSON
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Apply Filters Button */}
        {showApplyButton && (
          <Button
            variant="gradient"
            color="indigo"
            onClick={handleApplyFilters}
            className="flex items-center gap-2"
          >
            Apply Filters
          </Button>
        )}

        {/* Download Sample Button */}
        {showDownloadSample && (
          <Button
            variant="outlined"
            color="purple"
            onClick={handleDownloadSample}
            className="flex items-center gap-2"
          >
            Sample
            <Download size={20} />
          </Button>
        )}
      </div>

      {/* Filter Dialog */}
      {FilterDialogComponent && (
        <FilterDialogComponent
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          onApply={handleAdditionalFiltersApply}
          onClear={handleAdditionalFiltersClear}
          currentFilters={additionalFilters}
        />
      )}

      {/* Hidden File Inputs */}
      <input
        ref={excelInputRef}
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => handleImport(e, 'excel')}
        className="hidden"
      />
      <input
        ref={jsonInputRef}
        type="file"
        accept=".json"
        onChange={(e) => handleImport(e, 'json')}
        className="hidden"
      />
    </div>
  );
};

export default TableToolbar;