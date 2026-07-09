import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Button,
  Chip
} from '@material-tailwind/react';
import { Edit, Plus, Trash2, ExternalLink, Image, Package, Star } from 'lucide-react';
import { TableToolbar } from '@/widgets/forms';
import { ConfirmationDialog } from '@/widgets/confirmationDialogBox';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../auth/authContext';
import { productService } from '@/api/services/product.service';
import { getImageUrl, getPlaceholderImage } from '@/utils/imageUtils';
import TablePagination from '@/widgets/components/tablePagination';
import FilterDialogComponent from '@/widgets/components/AdditionalFilters';
import { debugFilterMapping, hasActiveFilters, mapProductFiltersToBackend } from '@/utils/filters/productFilterMapping';
import BulkUpdateComponent from '@/widgets/components/BulkUpdateComponent';
import { StarRating } from '@/utils/StarRating';
import Loader from '@/utils/Loader';
 const ProductList = () => {
  const navigate = useNavigate();
  // Get permissions directly from auth context
  const { canEdit, canDelete, canCreate, hasPermission } = useAuth();
  
const [currentFilters, setCurrentFilters] = useState({});
  const [carouselData, setCarouselData] = useState([]);
  const [productToDelete, setProductToDelete] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [showBulkUpdateDialog, setShowBulkUpdateDialog] = useState(false); // New state for bulk update
  const [bulkUpdateLoading, setBulkUpdateLoading] = useState(false); // Loading state for bulk update
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalUpcomingProducts, setTotalUpcomingProducts] = useState(0);
  const [totalActiveProducts,setTotalActiveProducts]=useState(0);
  const [totalCategories ,setTotalCategories]=useState(0);
  const [additionalFilters, setAdditionalFilters] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAddProduct = () => {
   // console.log("go to add produts");
    
    navigate('/dashboard/products/add-products');
  };

  // Create a separate function for fetching and processing data
  const fetchAndProcessProducts = async (page = 1, filters = {}) => {
    setIsLoading(true);
  try {
    const res = await productService.list(page, filters);
    console.log("the data is product", res);
      
      const fetchedData = res.data.data?.products || [];
                if (fetchedData.length === 0 && page > 1) {
      return fetchAndProcessProducts(page - 1, filters); // recursively call with previous page
    }
      setTotalCategories(res.data.data?.statistics?.uniqueCategories || 0)
      setTotalActiveProducts(res.data.data?.statistics?.totalActive|| 0)
      setTotalUpcomingProducts(res.data.data?.statistics?.totalUpcoming || 0)
      const paginationData = res.data.data.pagination;
      // Update pagination state
      setCurrentPage(paginationData.currentPage || 1);
      setTotalPages(paginationData.totalPages || 1);
      setHasNextPage(paginationData.hasNextPage || false);
      setHasPrevPage(paginationData.hasPrevPage || false);
      setTotalProducts(paginationData.totalProducts || 0);
      
 const mappedData = fetchedData.map((item, index) => ({
      _id: item._id,
      id: ((paginationData.currentPage - 1) * 10) + index + 1,
      name: item.name,
      brand: item.brand?.name || 'N/A',
      store: item.store?.name || 'N/A',
      // Updated image mapping - using logo and sliderImages from API
      logo: item.logo || 
                (item.sliderImages && item.sliderImages.length > 0 ? item.sliderImages[0] : '') ||
                getPlaceholderImage(64, 40, "No Image"),
      category: item.category?.name || 'N/A',
      // Updated price fields to match API response
      startingPrice: item.startingPrice || 0, // API uses startingPrice instead of retailPrice
      //ratings: item.ratings || 0, // API doesn't seem to have ratings in the response
      sellingPrice: item.sellingPrice,
      earningRate:item.earningRate,
      description: item.description,
      productUrl: item.productUrl,
      trackingUrl: item.trackingUrl,
      // Updated stock field - API uses boolean inStock instead of string
      inStock: item.inStock ? 'yes' : 'no',
      status: item.status,
      isUpcoming: item.isUpcoming,
      // API doesn't have releaseDate, using empty string or createdAt
      releaseDate: item.releaseDate ? new Date(item.releaseDate).toLocaleDateString() : 
                   (item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ''),
      // API has expiryDate as null, handling it properly
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'No Expiry',
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Not provided'
    }));
      setCarouselData(mappedData);
      
      // Clear selected items when page changes
      setSelectedProductIds([]);
    } catch (error) {
      console.error('Failed to fetch products:', error.response.data);
      toast.error(error.response?.data?.message || "Something went wrong fetching products.");
    }
    finally{
      setIsLoading(false)
    }
  };

const handleAdditionalFiltersChange = (filters) => {
  setAdditionalFilters(filters);
  
  // Combine all filters and map them properly
  const combinedFilters = {
    ...currentFilters,
    ...filters
  };
  
  const backendFilters = mapProductFiltersToBackend(combinedFilters);
  
  // Debug logging
  debugFilterMapping(combinedFilters, backendFilters);
  
  setCurrentFilters(backendFilters);
  setCurrentPage(1);
  fetchAndProcessProducts(1, backendFilters);
};

const handleImportOffers = async (file) => {
  setIsLoading(true);
  try {
    const res = await productService.importData(file);
    console.log("the result of import is", res);

    const successCount = res?.data?.data?.importedCount || 0;
    const failedCount = res?.data?.data?.failedCount || 0;
    const failedDetails = res?.data?.data?.failedDetails || [];

    // Show first 3 failure messages (customize as needed)
    const failedErrors = failedDetails
      .slice(0, 3)
      .map((f) => `Row ${f.row}: ${f.reason}`)
      .join('\n');

    const message = `${successCount} product(s) imported successfully.`;

    if (failedCount > 0) {
      toast.success(`${message}`);
      toast.error(`${failedCount} Import Errors:\n${failedErrors}`);
    } else {
      toast.success(message);
    }

    await fetchAndProcessProducts();
  } catch (err) {
    console.error("Import failed", err);
    toast.error(err.response?.data?.message || "Failed to import products");
  }
  finally {
    setIsLoading(false);
  }

}; 

 const handleExportData = async () => {
  setIsLoading(true);
  try {
    const res = await productService.export();

    // Create a blob from the response
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_data.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Free the object URL after download
    window.URL.revokeObjectURL(url);

    toast.success("Product data downloaded successfully");
  } catch (error) {
    console.error("Error downloading data:", error);
    toast.error("Failed to download data");
  } finally {
    setIsLoading(false);
  }
};


  const handleEditProduct = (product, event) => {
    event.stopPropagation();
    navigate(`/dashboard/products/edit-product/${product._id}`);
  };

  const handleDeleteProduct = (product, event) => {
    event.stopPropagation();
    setProductToDelete(product);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      setIsLoading(true);
      try {
        const deletedData = await productService.delete([productToDelete._id]);
       // console.log("deleted Data",deletedData);
        
        toast.success(`Product "${productToDelete.name}" deleted`);
        setProductToDelete(null);
        
        // Refresh the data after deletion
        await fetchAndProcessProducts(currentPage, currentFilters);
      } catch (err) {
        toast.error("Failed to delete product", err.response?.data?.message);
        console.log("this is error ", err.response?.data?.message);
      }
      finally {
    setIsLoading(false);
  }
    }
  };

  const handleSelectProduct = (id) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedProductIds.length === carouselData.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(carouselData.map((product) => product.id));
    }
  };

  const handleDeleteSelected = async () => {
    setShowBulkDeleteConfirm(true)
  };

  const confirmBulkDelete = async () => {
    const selectedRealIds = carouselData
      .filter(product => selectedProductIds.includes(product.id))
      .map(product => product._id);

      setIsLoading(true)
    try {
      await productService.delete(selectedRealIds);
      toast.success(`${selectedRealIds.length} product(s) deleted`);
      setSelectedProductIds([]);
      setShowBulkDeleteConfirm(false);
      
      // Refresh the data after bulk deletion
      await fetchAndProcessProducts(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk delete failed", err);
      toast.error("Failed to delete selected products");
    }finally {
    setIsLoading(false);
  }
  };

const handleBulkUpdate = () => {
    setShowBulkUpdateDialog(true);
  };

  // New function to confirm bulk update
  const confirmBulkUpdate = async (updates) => {
    setIsLoading(true)
    setBulkUpdateLoading(true);
    
    // Get the actual MongoDB IDs of selected products
    const selectedRealIds = carouselData
      .filter(product => selectedProductIds.includes(product.id))
      .map(product => product._id);

    try {
    //  console.log("productService",productService);
      
      // Call the bulk update API
      const response = await productService.bulkUpdate({
        ids: selectedRealIds,
        updates: updates
      });
      

    //  console.log("this is updated response ",response);
      

      toast.success(`${selectedRealIds.length} product(s) updated successfully`);
      setSelectedProductIds([]);
      setShowBulkUpdateDialog(false);
      
      // Refresh the data after bulk update
      await fetchAndProcessProducts(currentPage, currentFilters);
    } catch (err) {
      console.error("Bulk update failed", err);
      toast.error(err.response?.data?.message || "Failed to update selected products");
    }finally {
    setIsLoading(false);
    setBulkUpdateLoading(false);
  }
  };

// Update your handleApplyFilters function to include additional filters
const handleApplyFilters = (filters) => {
  setIsLoading(true);
  // Use the mapping utility to convert frontend filters to backend filters
try {
    const backendFilters = mapProductFiltersToBackend(filters);
    
    // Debug logging (remove in production)
    debugFilterMapping(filters, backendFilters);
    
    if (!hasActiveFilters(filters)) {
      resetToInitialData();
      return;
    }
    
    setCurrentFilters(backendFilters);
    setCurrentPage(1);
    fetchAndProcessProducts(1, backendFilters);
} catch (error) {
  console.log("Error Applying Filter");
  toast.error("Error Applying filter")
  
}
finally {
    setIsLoading(false);
  }
};

// Update your resetToInitialData function
const resetToInitialData = () => {
  setIsLoading(true)
 try {
   setCurrentFilters({});
   setAdditionalFilters({});
   setCurrentPage(1);
   fetchAndProcessProducts(1, {});
 } catch (error) {
  console.log("this is error",err);
  
 } // Fetch without any filters
 finally {
    setIsLoading(false);
  }
};

  // Pagination handlers
 const handlePageChange = (page) => {
  setCurrentPage(page);
  fetchAndProcessProducts(page, currentFilters);
};

const handleNextPage = () => {
  if (hasNextPage) {
    handlePageChange(currentPage + 1);
  }
};

const handlePrevPage = () => {
  if (hasPrevPage) {
    handlePageChange(currentPage - 1);
  }
};

  const handleProductDetails =(id)=>{
  //  console.log("started navigating");
    
    navigate(`/dashboard/products/all-products/${id}`)
  };

 const downloadSample = async () => {
  setIsLoading(true);
  try {
    const res = await productService.sampleData();

    // Create a blob from the response
    const blob = new Blob([res.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    });

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(blob);

    // Create a link and trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = "product_template.xlsx";
    document.body.appendChild(a);
    a.click();
    a.remove();

    // Free the object URL after download
    window.URL.revokeObjectURL(url);

    toast.success("Sample template downloaded successfully");
  } catch (error) {
    console.error("Error downloading sample:", error);
    toast.error("Failed to download sample template");
  } finally {
    setIsLoading(false);
  }
};

  // Update your useEffect to use the new function
  useEffect(() => {
    fetchAndProcessProducts(1, {});
  }, []); 

  return (
    <div className="min-h-screen mt-12 mb-8 flex flex-col gap-12">
      <Card>
        <CardHeader variant="gradient" color="blue" className=" p-6">
          <div className="flex justify-between items-center">
            <div>
              <Typography variant="h6" color="white">Products Settings</Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Manage products from here
              </Typography>
            </div>
           { canCreate && (<Button variant="outlined" color="white" size="sm"
              className='flex items-center gap-2 p-3'
              onClick={handleAddProduct}>
              <Plus size={16} /> Add Product
            </Button>)}
          </div>
        </CardHeader>
        <CardBody className="px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg shadow border border-blue-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Total Products</Typography>
                  <Typography variant="h4" className="font-bold text-blue-800">{totalProducts}</Typography>
                </div>
                <div className="bg-blue-100 p-2 rounded-full">
                  <Package className="text-blue-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-teal-50 p-4 rounded-lg shadow border border-green-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Active Products</Typography>
                  <Typography variant="h4" className="font-bold text-green-700">
                    {totalActiveProducts}
                  </Typography>
                </div>
                <div className="bg-green-100 p-2 rounded-full">
                  <ExternalLink className="text-green-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg shadow border border-amber-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Categories</Typography>
                  <Typography variant="h4" className="font-bold text-amber-700">
                    {totalCategories}
                  </Typography>
                </div>
                <div className="bg-amber-100 p-2 rounded-full">
                  <Image className="text-amber-500" size={20} />
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg shadow border border-purple-100">
              <div className="flex items-start justify-between">
                <div>
                  <Typography className="text-gray-600 text-sm">Upcoming </Typography>
                  <Typography variant="h4" className="font-bold text-purple-700">
                    {totalUpcomingProducts}
                  </Typography>
                </div>
                <div className="bg-purple-100 p-2 rounded-full">
                  <Star className="text-purple-500" size={20} />
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader variant="gradient" color="gray" className=" p-6">
          <div className="flex justify-between items-center">
            <Typography variant="h6" color="white">Products</Typography>
          </div>
        </CardHeader>
        <CardBody className="px-4">

          <div className="mb-6 ">
            <TableToolbar
              data={carouselData}
              onApplyFilters={handleApplyFilters}
              onImportExcel={handleImportOffers}
              onExportExcel={handleExportData}
              showImportJson={false}
              showExportJson={false}
              showCategoryOptions={true}
              showApplyButton={true}
              exportFileName="products"
              onClearFilters={resetToInitialData}
              showAdditionalFilters={true}
              FilterDialogComponent={FilterDialogComponent}
              onAdditionalFiltersChange={handleAdditionalFiltersChange}
              showDownloadSample={true}
              onDownloadSample={downloadSample}

            />
            


            {/* Bulk Action Buttons */}
            {selectedProductIds.length > 0 && (
              <div className="mb-4 mt-2 flex gap-2">
                {canEdit && (
                  <Button
                    color="blue"
                    variant="filled"
                    onClick={handleBulkUpdate}
                    className="flex items-center gap-2 p-4"
                  >
                    <Edit size={16} /> Update Selected ({selectedProductIds.length})
                  </Button>
                )}
                {canDelete && (
                  <Button
                    color="red"
                    variant="filled"
                    onClick={handleDeleteSelected}
                    className="flex items-center gap-2 p-4"
                  >
                    <Trash2 size={16} /> Delete Selected ({selectedProductIds.length})
                  </Button>
                )}
              </div>
            )}
          </div>

            {isLoading && <Loader/>}

          {!isLoading &&(<div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 rounded-lg">
                <tr>
                  {canDelete &&(<th className="border-b py-3 px-4 text-left">
                    <input
                      type="checkbox"
                      checked={
                        selectedProductIds.length === carouselData.length &&
                        carouselData.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>)}
                  {[ "ID", "Image","Name", "Brand", "Platform",  "Category", 
  "Starting Price", // Changed from "Retail Price" to match API
  "Selling Price", "In Stock", "Status", "Is Upcoming", 
  "Product URL", "Tracking URL", "Release Date", "Expiry Date", "Actions"
].map((el) => (
                    <th key={el} className="border-b border-blue-gray-50 py-3 px-4 text-left">
                      <Typography variant="small" className="font-bold uppercase text-blue-gray-900">
                        {el}
                      </Typography>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {carouselData.map((product, key) => { 

                  const className = `p-4 ${key === carouselData.length - 1 ? "" : "border-b"}`;
                  const isSelected = selectedProductIds.includes(product.id);
                  return (
                    <tr key={product.id} className={`hover:bg-gray-50 cursor-pointer ${isSelected ? 'bg-blue-50' : ''}`}
                    onClick={() => handleProductDetails(product._id)}
                    >
                      {canDelete && (<td className={className}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectProduct(product.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>)}
                      <td className={className}>{product.id}</td>
                      
                      <td className={className}>
                        <img 
                          src={product.logo || '/img/noimage.jpeg'} 
                          alt={product.name} 
                          className="w-16 h-10 object-cover rounded"
                          onError={(e) => {
                            e.target.src = getPlaceholderImage(64, 40, "No Image");
                          }}
                        />
                      </td>

                      <td className={className}>
                        <div className="min-w-fit">
                          <Typography variant="small" className="font-medium line-clamp-2 ">
                            {product.name}
                          </Typography>
                        </div>
                      </td>

                      
                      <td className={className}>
  {product.brand && product.brand !== 'N/A' ? (
    <Chip
      variant="ghost"
      color="blue"
      value={product.brand}
      className="py-1 px-2 text-[12px] font-medium w-fit"
    />
  ) : (
    <Typography variant="small" className="text-gray-600">
      N/A
    </Typography>
  )}
</td>
                      <td className={className}>
  <div className="flex flex-wrap gap-1">
     <Chip
           // Using index as key is acceptable here since order doesn't change and items are simple strings
          variant="ghost"
          color="green"
          value={product.store}
          className="py-1 px-2 text-[12px] font-medium w-fit"
        />
     
  </div>
</td>
 {/* <td className={className}> */}
                        {/* Fixed: Display actual rating with star component */}
                        {/* <StarRating rating={product.ratings} /> */}
                      {/* </td> */}
{/* ... other table cells after platformType ... */}



                      
                      <td className={className}>
                        <Chip
           // Using index as key is acceptable here since order doesn't change and items are simple strings
          variant="ghost"
          color="amber"
          value={product.category}
          className="py-1 px-2 text-[12px] font-medium w-fit"
        />
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="font-medium">
                          ₹{product.startingPrice?.toLocaleString()}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="font-medium text-green-600">
                          ₹{product.sellingPrice?.toLocaleString()}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={product.inStock === 'yes' ? "green" : "red"}
                          value={product.inStock === 'yes' ? 'In Stock' : 'Out of Stock'}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={product.status === 'active' ? "green" :product.status === 'draft'? 'yellow': "red"}
                          value={product.status}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <Chip
                          variant="gradient"
                          color={product.isUpcoming ? "purple" : "gray"}
                          value={product.isUpcoming ? "Upcoming" : "Regular"}
                          className="py-1 px-2 text-[12px] font-medium w-fit"
                        />
                      </td>
                      <td className={className}>
                        <a 
                          href={product.productUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 text-xs hover:underline flex items-center max-w-32"
                        >
                          <span className="truncate">
                            {product.productUrl?.length > 20 ? 
                              `${product.productUrl.substring(0, 20)}...` : 
                              product.productUrl
                            }
                          </span>
                          <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                        </a>
                      </td>
                      <td className={className}>
                        <a 
                          href={product.trackingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 text-xs hover:underline flex items-center max-w-32"
                        >
                          <span className="truncate">
                            {product.trackingUrl?.length > 20 ? 
                              `${product.trackingUrl.substring(0, 20)}...` : 
                              product.trackingUrl
                            }
                          </span>
                          <ExternalLink size={12} className="ml-1 flex-shrink-0" />
                        </a>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-gray-600">
                          {product.releaseDate || ''}
                        </Typography>
                      </td>
                      <td className={className}>
                        <Typography variant="small" className="text-gray-600">
                          {product.expiryDate}
                        </Typography>
                      </td>
                      <td className={className}>
                        <div className="flex space-x-2">
                          {canEdit &&(<button onClick={(e) => handleEditProduct(product, e)} className="text-blue-500 hover:text-blue-700"><Edit size={18} /></button>)}
                          {canDelete && (<button onClick={(e) => handleDeleteProduct(product, e)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>)}
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

          {carouselData.length === 0 && (
            <div className="text-center py-4">
              <Typography color="blue-gray" className="font-normal">No products found matching the search criteria</Typography>
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
            totalItems={totalProducts}
            itemsPerPage={10}
          />
        </CardBody>

      </Card>

      <ConfirmationDialog
        isOpen={productToDelete !== null}
        onClose={() => setProductToDelete(null)}
        onConfirm={confirmDeleteProduct}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`} />

      <ConfirmationDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Selected Products"
        message={`Are you sure you want to delete ${selectedProductIds.length} selected product(s)? This action cannot be undone.`}
      />

            {/* Bulk Update Dialog */}
      <BulkUpdateComponent
        isOpen={showBulkUpdateDialog}
        onClose={() => setShowBulkUpdateDialog(false)}
        onConfirm={confirmBulkUpdate}
        selectedCount={selectedProductIds.length}
        loading={bulkUpdateLoading}
        showInStock={true}
        showIsUpcoming={true}
      />
    </div>
  );
};

export default ProductList;