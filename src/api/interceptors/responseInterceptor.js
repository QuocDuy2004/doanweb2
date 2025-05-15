// src/api/interceptors/responseInterceptor.js
import toastService from "../../service/toastService";

const setupResponseInterceptor = (axiosInstance) => {
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data.message ||
        (error.request
          ? "Không thể kết nối đến server. Kiểm tra server hoặc CORS."
          : `Lỗi: ${error.message}`);
      console.error("Response Error:", error.config?.url, error.message);
      toastService.error(message);
      throw { message, status: error.response?.status };
    }
  );
};

export default setupResponseInterceptor;