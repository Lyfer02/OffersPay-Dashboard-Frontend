import API from "../axios";
import { endpoints } from "../endpoints";

export const goalsService = {
    list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters
        };
        
        return API.get(endpoints.goals.list, { params });
    },
    create : (formData) =>{
        return API.post(endpoints.goals.add , formData);
    }
    , 
        getById: (id) => API.get(endpoints.goals.getById(id)),

    updateById: (id, formData) => {
       

        return API.put(endpoints.goals.update(id), formData);
    },

    delete: (ids) => API.delete(endpoints.goals.delete, {
        data: { ids }
    }),

    getById :(id)=> {
        
        return API.get(endpoints.goals.getById(id))},

        bulkUpdate: (bulkData) => {
        return API.put(endpoints.goals.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    },
}