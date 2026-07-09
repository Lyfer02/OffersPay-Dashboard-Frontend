import API from "../axios";
import { endpoints } from "../endpoints";

export const IpService = {
    list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters
        };
        
        return API.get(endpoints.ip.list, { params });
    },
    create : (formData) =>{
        return API.post(endpoints.ip.add , formData);
    }
    , 
        getById: (id) => API.get(endpoints.ip.getById(id)),

    updateById: (id, formData) => {
       

        return API.put(endpoints.ip.update(id), formData);
    },

    delete: (ids) => API.delete(endpoints.ip.delete, {
        data: { ids }
    }),

    getById :(id)=> {
        
        return API.get(endpoints.ip.getById(id))},

        bulkUpdate: (bulkData) => {
        return API.put(endpoints.ip.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },
}