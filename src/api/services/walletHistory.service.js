import API from "../axios.js";
import { endpoints } from "../endpoints.js";


export const walletHistory ={
    list: (page = 1, filters = {}) => {
        const params = { 
          source: 'dashboard',
          page: page,
          ...filters  // Spread all filters as individual parameters
        };
    
        return API.get(endpoints.walletHistory.list, { params });
    },

    export: (query) => {
      return API.get(`${endpoints.walletHistory.export}?${query}`, {
        responseType: "blob", // ✅ Correct placement
        withCredentials: true, // if backend requires cookies/auth
      });
    }
}