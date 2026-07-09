import API from "../axios";
import { endpoints } from "../endpoints";

export const productService = {
    create: (data) => {
        const formData = new FormData();
        
        // Basic product information
        formData.append("name", data.name);
        formData.append("brand", data.brand);
        formData.append("store", data.store);
        formData.append("category", data.category);
        formData.append("startingPrice", data.startingPrice);
        formData.append("sellingPrice", data.sellingPrice);
        formData.append("earningRate", data.earningRate);
        formData.append("description", data.description || "");
        formData.append("dealsDetails", data.dealsDetails || "");
        formData.append("productUrl", data.productUrl);
        formData.append("trackingUrl", data.trackingUrl);
        formData.append("inStock", data.inStock);
        formData.append("status", data.status);
        formData.append("isUpcoming", data.isUpcoming);
        formData.append("expiryDate", data.expiryDate || "");
        formData.append("seoTitle", data.seoTitle || "");
        formData.append("seoDescription", data.seoDescription || "");

        // Handle product logo
        if (data.logo && data.logo.file) {
            formData.append("logo", data.logo.file);
        }

        // Handle slider images
        if (data.sliderImages && data.sliderImages.length > 0) {
            data.sliderImages.forEach((imageObj) => {
                if (imageObj.file) {
                    formData.append("sliderImages", imageObj.file);
                }
            });
        }

        // Handle available offers array
        if (data.availableOffers && data.availableOffers.length > 0) {
            data.availableOffers.forEach((offer, index) => {
                if (offer.trim() !== '') {
                    formData.append(`availableOffers[${index}]`, offer);
                }
            });
        }

        // Handle tags array
        if (data.tags && data.tags.length > 0) {
            data.tags.forEach((tag, index) => {
                if (tag.trim() !== '') {
                    formData.append(`tags[${index}]`, tag);
                }
            });
        }

        return API.post(endpoints.product.add, formData, {
            headers: { 
                "Content-Type": "multipart/form-data" 
            }
        });
    },

    list: (pageOrFilters = 1, maybeFilters = {}) => {
        let page = 1;
        let filters = {};
      
        if (typeof pageOrFilters === "object") {
          filters = pageOrFilters;
        } else {
          page = pageOrFilters;
          filters = maybeFilters;
        }
      
        const params = { 
          source: filters.source || 'dashboard',
          page: page,
          ...filters
        };
      
        return API.get(endpoints.product.list, { params });
      },

    getById: (id) => API.get(endpoints.product.getById(id)),

    update: (id, data) => {
        const formData = new FormData();
        
        // Basic product information
        formData.append("name", data.name);
        formData.append("brand", data.brand);
        formData.append("store", data.store);
        formData.append("category", data.category);
        formData.append("startingPrice", data.startingPrice);
        formData.append("sellingPrice", data.sellingPrice);
        formData.append("earningRate", data.earningRate);
        formData.append("description", data.description || "");
        formData.append("dealsDetails", data.dealsDetails || "");
        formData.append("productUrl", data.productUrl);
        formData.append("trackingUrl", data.trackingUrl);
        formData.append("inStock", data.inStock);
        formData.append("status", data.status);
        formData.append("isUpcoming", data.isUpcoming);
        formData.append("expiryDate", data.expiryDate || "");
        formData.append("seoTitle", data.seoTitle || "");
        formData.append("seoDescription", data.seoDescription || "");

        // Handle product logo
        if (data.logo && data.logo.file) {
            formData.append("logo", data.logo.file);
        }

        // Handle slider images
        if (data.sliderImages && data.sliderImages.length > 0) {
            data.sliderImages.forEach((imageObj) => {
                if (imageObj.file) {
                    formData.append("sliderImages", imageObj.file);
                }
            });
        }

        // Handle available offers array
        if (data.availableOffers && data.availableOffers.length > 0) {
            data.availableOffers.forEach((offer, index) => {
                if (offer.trim() !== '') {
                    formData.append(`availableOffers[${index}]`, offer);
                }
            });
        }

        // Handle tags array
        if (data.tags && data.tags.length > 0) {
            data.tags.forEach((tag, index) => {
                if (tag.trim() !== '') {
                    formData.append(`tags[${index}]`, tag);
                }
            });
        }

        return API.put(endpoints.product.updateProduct(id), formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    delete: (ids) => API.delete(endpoints.product.delete, {
        data: { ids }
    }),

    importData: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return API.post(endpoints.product.importData, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    bulkUpdate: (bulkData) => {
        return API.put(endpoints.product.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },
  sampleData: () => {
    return API.get(endpoints.product.sample, {
        responseType: "blob" // ✅ ensures we get binary file instead of text
    });
},
      export: () => {
    return API.get(endpoints.product.export, {
        responseType: "blob" // ✅ ensures we get binary file instead of text
    });
},

assignGoals:(formData)=>{
   return API.post(endpoints.product.assignGoals,formData);
}
}