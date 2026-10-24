import axios from 'axios'
import { BASE_URL } from './apiPaths'

const axiosInstance = axios.create({
  baseURL:BASE_URL,
  timeout:10000,
  headers:{
    "Content-Type":"application/json",
    Accept:"application/json",
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config)=>{
    const accessToken = localStorage.getItem("token");
    if(accessToken){
      config.headers.Authorization=`Bearer ${accessToken}`;
    }
    return config;

  },(error)=>{
    return Promise.reject(error);
  }
);

// Respponse Interceptor
axiosInstance.interceptors.response.use(
  (response)=>{
    return response;
  },
  (error)=>{
    // Handle common errors globally 

    if(error.response){
      if(error.response.status === 401 && !error.config?.url?.includes("/api/auth/login")){
        //redirect to login page 
        window.location.href="/login";
      }else if(error.response.status === 500){
        console.log("Server Error .Please try later");}
    }
      else if(error.code === 'ENCONNABORTED'){
        console.log("Request timout, Please try again");
      }

      return Promise.reject(error);
    }
  
);

export default axiosInstance;