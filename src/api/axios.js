// src/api/axios.js
import axios from "axios";
import { toast } from "react-toastify";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL, 
  withCredentials: true,
});

// Request interceptor: attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
 // console.log( "the acess token is  ",token);
  
  return config;
}
);

// Response interceptor: catch errors globally
API.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message;
    console.log(message);
    return Promise.reject(err);
  }
);

export default API;
