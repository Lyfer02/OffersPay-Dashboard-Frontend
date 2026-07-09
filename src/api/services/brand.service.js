import API from "../axios";
import { endpoints } from "../endpoints";

export const brandService = {
    create: (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("status", data.status);
        
        // ✅ Fix: Send category array elements individually
        if (Array.isArray(data.category)) {
            data.category.forEach((categoryId, index) => {
                formData.append(`category[${index}]`, categoryId);
            });
        }
        
        // Check for BrandImage
        if (data.BrandImage) {
            formData.append("BrandImage", data.BrandImage);
        }

        return API.post(endpoints.brand.create, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters
        };
        
        return API.get(endpoints.brand.list, { params });
    },
    
    delete: (ids) => API.delete(endpoints.brand.delete, {
        data: { ids }
    }),
    
    importData: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return API.post(endpoints.brand.importData, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },
    
    // Get brand by ID
    getById: (id) => API.get(endpoints.brand.getById(id)),

    // Update existing brand
    update: (id, data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("status", data.status);
        
        // ✅ Fix: Send category array elements individually
        if (Array.isArray(data.category)) {
            data.category.forEach((categoryId, index) => {
                formData.append(`category[${index}]`, categoryId);
            });
        }
        
        // Check for BrandImage
        if (data.BrandImage) {
            formData.append("BrandImage", data.BrandImage);
        }

        return API.put(endpoints.brand.update(id), formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    bulkUpdate: (bulkData) => {
        return API.put(endpoints.brand.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },
          sampleData: () => {
    return API.get(endpoints.brand.sample, {
        responseType: "blob" // ✅ ensures we get binary file instead of text
    });
  },
    exportData :()=> API.get(endpoints.brand.exportData)
};