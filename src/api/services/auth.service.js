import API from "../axios";
import { endpoints } from "../endpoints";

export const authService ={
    login : (formData)=>API.post(endpoints.auth.login,formData),
    getSession : ()=>API.get(endpoints.auth.session),
    logout :()=>API.post(endpoints.auth.logout)
}