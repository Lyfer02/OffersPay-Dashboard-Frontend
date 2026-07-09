import API from "../axios";
import { endpoints } from "../endpoints";

export const categoryService = {

    create: (data) => API.post(endpoints.category.create, data),
    update: (id, data) => API.put(endpoints.category.update(id), data),
    getById: (id) => API.get(endpoints.category.getById(id)),
list: (page = 1, filters = {}) => {
  const params = { 
    source: 'dashboard',
    page: page,
    ...filters  // Spread all filters as individual parameters
  };
  

  return API.get(endpoints.category.list, { params });
},

listDefault: (page = 1, filters = {}) => {
  const params = { 
    source: '',
    page: page,
    ...filters  // Spread all filters as individual parameters
  };
  

  return API.get(endpoints.category.list, { params });
},
    delete: (ids) => API.delete(endpoints.category.delete, {

        data: { ids }
    } ),

        bulkUpdate : (bulkData)=>{
         return API.put(endpoints.category.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    }
}