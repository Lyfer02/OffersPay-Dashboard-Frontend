import API from "../axios";
import { endpoints } from "../endpoints";

export const  storeService = {
 create: (data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append("name", data.name);
    formData.append("status", data.status);
    formData.append("rating", data.rating);
    formData.append("trackingSpeed", data.trackingSpeed);
    formData.append("confirmation", data.confirmation);
    formData.append("earn", data.earn);
    formData.append("about", data.about);

    // ✅ NEW: API Configuration fields
    if (data.apiKey) formData.append("apiKey", data.apiKey);
    if (data.authTokens) formData.append("authTokens", data.authTokens);
    if (data.credentials) formData.append("credentials", data.credentials);
    if (data.networkUniqueKey) formData.append("networkUniqueKey", data.networkUniqueKey);
    
    // ✅ NEW: Network and tracking fields
    if (data.network) formData.append("network", data.network);
    if (data.subIds) formData.append("subIds", data.subIds);
    if (data.networkSubId) formData.append("networkSubId", data.networkSubId);
    if (data.campainInfoUrl) formData.append("campainInfoUrl", data.campainInfoUrl);

    // ✅ Handle earningRates array properly
    if (Array.isArray(data.earningRates)) {
      data.earningRates.forEach((rate, index) => {
        formData.append(`earningRates[${index}][description]`, rate.description || '');
        formData.append(`earningRates[${index}][rate]`, rate.rate || '');
      });
    }

    // ✅ Handle termsAndConditions array properly
    if (Array.isArray(data.termsAndConditions)) {
      // Filter out empty terms before sending
      const validTerms = data.termsAndConditions.filter(term => term && term.trim() !== '');
      validTerms.forEach((term, index) => {
        formData.append(`termsAndConditions[${index}]`, term.trim());
      });
    }

    // Image upload
    if (data.imageFile) {
      formData.append("StoreImage", data.imageFile);
    }

    return API.post(endpoints.stores.create, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

    list: (page = 1, filters = {}) => {
  const params = { 
    source: 'dashboard',
    page: page,
    ...filters  // Spread all filters as individual parameters
  };
  
  return API.get(endpoints.stores.list, { params });
},

    delete: (ids) => API.delete(endpoints.stores.delete, {

        data: { ids }
    }),
    importData: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return API.post(endpoints.stores.importData, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });


    },
    // ✅ Get banner by ID
    getById: (id) => API.get(endpoints.stores.getById(id)),

    // ✅ Update existing banner
 update: (id, data) => {
    const formData = new FormData();
    
    // Basic fields
    formData.append("name", data.name);
    formData.append("status", data.status);
    formData.append("rating", data.rating);
    formData.append("trackingSpeed", data.trackingSpeed);
    formData.append("confirmation", data.confirmation);
    formData.append("earn", data.earn);
    formData.append("about", data.about);

    // ✅ NEW: API Configuration fields
    if (data.apiKey !== undefined) formData.append("apiKey", data.apiKey);
    if (data.authTokens !== undefined) formData.append("authTokens", data.authTokens);
    if (data.credentials !== undefined) formData.append("credentials", data.credentials);
    if (data.networkUniqueKey !== undefined) formData.append("networkUniqueKey", data.networkUniqueKey);
    
    // ✅ NEW: Network and tracking fields
    if (data.network !== undefined) formData.append("network", data.network);
    if (data.subIds !== undefined) formData.append("subIds", data.subIds);
    if (data.networkSubId !== undefined) formData.append("networkSubId", data.networkSubId);
    if (data.campainInfoUrl !== undefined) formData.append("campainInfoUrl", data.campainInfoUrl);

    // ✅ Handle earningRates array properly
    if (Array.isArray(data.earningRates)) {
      data.earningRates.forEach((rate, index) => {
        formData.append(`earningRates[${index}][description]`, rate.description || '');
        formData.append(`earningRates[${index}][rate]`, rate.rate || '');
      });
    }

    // ✅ Handle termsAndConditions array properly
    if (Array.isArray(data.termsAndConditions)) {
      // Filter out empty terms before sending
      const validTerms = data.termsAndConditions.filter(term => term && term.trim() !== '');
      validTerms.forEach((term, index) => {
        formData.append(`termsAndConditions[${index}]`, term.trim());
      });
    }

    // Image handling
    if (data.imageFile) {
      formData.append("StoreImage", data.imageFile);
    }

    if (data.removeImage) {
      formData.append("removeImage", true);
    }

    return API.put(endpoints.stores.update(id), formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateFields :(data)=>{
    return API.put(endpoints.stores.updateFields ,data )
  },

   bulkUpdatePositions: (storeUpdates) => {
  
      return API.put(endpoints.stores.updatePosition ,{storeUpdates} ) ;
   
  },
    bulkUpdate : (bulkData)=>{
         return API.put(endpoints.stores.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },

      sampleData: () => {
    return API.get(endpoints.stores.sample, {
        responseType: "blob" // ✅ ensures we get binary file instead of text
    });
  }
  ,
   export : ()=>{
     return API.get(endpoints.stores.export, {
        responseType: "blob" // ✅ ensures we get binary file instead of text
    })
  }
}