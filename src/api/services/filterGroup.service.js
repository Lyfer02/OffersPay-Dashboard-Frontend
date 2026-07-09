import API from "../axios";
import { endpoints } from "../endpoints";

export const filterGroupService = {
    list: (page = 1, filters = {}) => {
  const params = { 
    source: 'dashboard',
    page: page,
    ...filters  // Spread all filters as individual parameters
  };
  
  return API.get(endpoints.filterGroup.list, { params });
},
     create: (data) => {
        return API.post(endpoints.filterGroup.create, data);
    },
     update: (id,data) => {
        return API.put(endpoints.filterGroup.update(id),  data);
    },

    getDetails :(id)=>{
        return API.get(endpoints.filterGroup.getById(id));
    },

    delete: (ids) => API.delete(endpoints.filterGroup.delete, {

        data: { ids }
    }),

        bulkUpdate : (bulkData)=>{
         return API.put(endpoints.filterGroup.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    }

}