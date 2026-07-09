import API from "../axios"
import { endpoints } from "../endpoints"


export const postbackLogService = {
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
      
        return API.get(endpoints.postbackLog.list, { params });
      },
}

