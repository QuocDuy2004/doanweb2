// src/api/services/generalService.js
import axiosInstance from "../config/axiosInstance";
import axiosNoAuthInstance from "../config/axiosNoAuthInstance";
import toastService from "../../service/toastService";

const generalService = {
  connectAPI: () =>
    axiosNoAuthInstance.get("/api/ping").then((response) => {
      const data = response.data;
      if (data.success) {
        toastService.success(data.message || "Kết nối API thành công!");
      }
      return data;
    }),

  get: (endpoint, params = {}) =>
    axiosInstance.get(endpoint, { params }).then((res) => res.data),

  post: (endpoint, data) =>
    axiosInstance.post(endpoint, data).then((res) => res.data),

  put: (endpoint, data) =>
    axiosInstance.put(endpoint, data).then((res) => res.data),

  delete: (endpoint) => axiosInstance.delete(endpoint).then((res) => res.data),
};

export default generalService;