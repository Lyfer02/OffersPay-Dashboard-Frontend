import API from "../axios";
import { endpoints } from "../endpoints";

export const trackingService = {
     generateLink : (formData)=>  {
         return API.post(endpoints.tracking.generate_link,formData);
     },
     clicks :(page = 1, filters = {}) => {
        const params = { 
            page: page,
            ...filters
        };
        
        return API.get(endpoints.tracking.clicks, {params});
    }


}