// src/api/index.js
import axiosInstance from "./config/axiosInstance";
import axiosNoAuthInstance from "./config/axiosNoAuthInstance";
import setupRequestInterceptor from "./interceptors/requestInterceptor";
import setupResponseInterceptor from "./interceptors/responseInterceptor";
import authService from "./services/authService";
import generalService from "./services/generalService";

// Thiết lập interceptors
setupRequestInterceptor(axiosInstance);
setupResponseInterceptor(axiosInstance);

export { authService, generalService, axiosInstance, axiosNoAuthInstance };