import API from "../axios";
import { endpoints } from "../endpoints";


export const networkService ={
    list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters
        };
        
        return API.get(endpoints.network.list, { params });
    },

    create : (formData) =>{
        return API.post(endpoints.network.create , formData);
    }
    , 
        getById: (id) => API.get(endpoints.network.getById(id)),

    updateById: (id, formData) => {
       

        return API.put(endpoints.network.update(id), formData);
    },

    delete: (ids) => API.delete(endpoints.network.delete, {
        data: { ids }
    }),

        bulkUpdate: (bulkData) => {
        return API.put(endpoints.network.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },

    
}