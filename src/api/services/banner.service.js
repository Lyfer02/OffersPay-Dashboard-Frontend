import API from "../axios";
import { endpoints } from "../endpoints";

export const bannerService = {
    create: (data) => {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("url", data.url);
        formData.append("category", data.category);
        formData.append("status", data.status);
        if (data.imageFile) {
            formData.append("image", data.imageFile);
        }

        return API.post(endpoints.banners.create, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

        list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters  // Spread all filters as individual parameters
        };
        
        return API.get(endpoints.banners.list, { params });
        },
    delete: (ids) => API.delete(endpoints.banners.delete, {

        data: { ids }
    }),
    importData: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return API.post(endpoints.banners.importData, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });


    },
    // ✅ Get banner by ID
    getById: (id) => API.get(endpoints.banners.getById(id)),

    // ✅ Update existing banner
    update: (id, data) => {
      //  console.log("bannerService ",data);
        
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("url", data.url);
        formData.append("category", data.category);
        formData.append("status", data.status);
        if (data.imageFile) {
            formData.append("image", data.imageFile);
        }

               // Debug: Log FormData contents
    // console.log('FormData contents before sending:');
    // for (let [key, value] of formData.entries()) {
    //   console.log(`${key}:`, value);
    // }

        return API.put(endpoints.banners.updateBanner(id), formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },

    bulkUpdate : (bulkData)=>{
         return API.put(endpoints.banners.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    }

};
