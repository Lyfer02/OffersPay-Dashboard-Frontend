import API from "../axios";
import { endpoints } from "../endpoints";

export const userService = {
    list: (pageOrFilters = 1, maybeFilters = {}) => {
        let page = 1;
        let filters = {};
      
        if (typeof pageOrFilters === "object") {
          filters = pageOrFilters;
        } else {
          page = pageOrFilters;
          filters = maybeFilters;
        }
      
        const params = { 
          source: filters.source || 'dashboard',
          page: page,
          ...filters
        };
      
        return API.get(endpoints.users.list, { params });
      },
     create: (data) => {
        return API.post(endpoints.users.create, data, {
            headers: { "Content-Type": "application/json" }
        });
    },
     update: (id,data) => {
        return API.post(endpoints.users.update(id),  data, {
            headers: { "Content-Type": "application/json" }
        });
    },

    getUserData :(id)=>{
        return API.get(endpoints.users.getById(id));
    },

    delete: (ids) => API.delete(endpoints.users.delete, {

        data: { ids }
    }),

    impersonateUser : (id) =>{
        return API.post(endpoints.users.impersonate , { userId: id })
    },

    bulkUpdate : (bulkData)=>{
         return API.put(endpoints.users.bulkUpdate, bulkData, {
            headers: { 
                "Content-Type": "application/json" 
            }
        });
    }
}