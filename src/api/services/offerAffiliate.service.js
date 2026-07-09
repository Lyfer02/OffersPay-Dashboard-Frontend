import API from "../axios.js";
import { endpoints } from "../endpoints.js";

export const offerAffiliateservice ={
    list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters
        };
        
        return API.get(endpoints.offerAffiliate.list, { params });
    },
    create : (formData) =>{
        return API.post(endpoints.offerAffiliate.create , formData);
    }
    , 
        getById: (id) => API.get(endpoints.offerAffiliate.getById(id)),

    update: (id, formData) => {
       

        return API.put(endpoints.offerAffiliate.update(id), formData);
    },

    delete: (ids) => API.delete(endpoints.offerAffiliate.delete, {
        data: { ids }
    }),

        bulkUpdate: (bulkData) => {
        return API.put(endpoints.offerAffiliate.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },

}