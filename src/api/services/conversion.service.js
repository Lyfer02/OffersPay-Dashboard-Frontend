import API from "../axios";
import { endpoints } from "../endpoints";

export const conversionService={
    list: ( page=1, filters = {}) => {
      
        const params = { 
          source: filters.source || 'dashboard',
          page: page,
          ...filters
        };
      
        return API.get(endpoints.conversion.list, { params });
      }

}