// src/api/interceptors/requestInterceptor.js
const setupRequestInterceptor = (axiosInstance) => {
    axiosInstance.interceptors.request.use((config) => {
      const token = localStorage.getItem("authToken");
      if (token) config.headers.Authorization = `Bearer ${token}`;
      console.log("Request URL:", config.url);
      return config;
    });
  };
  
  export default setupRequestInterceptor;