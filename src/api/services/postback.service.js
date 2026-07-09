import API from "../axios"
import { endpoints } from "../endpoints"

export const postbackService ={
    generate : (formData)=>{
       return API.post(endpoints.postback.generate_link,formData);
    },
    list: (page = 1, filters = {}) => {
        const params = { 
            source: 'dashboard',
            page: page,
            ...filters
        };
        
        return API.get(endpoints.postback.list, { params });
    },
    create : (formData) =>{
        return API.post(endpoints.postback.create , formData);
    },
    delete: (ids) => API.delete(endpoints.postback.delete, {
        data: { ids }
    }),



}