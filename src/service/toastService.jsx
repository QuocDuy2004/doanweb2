import { toast } from "react-toastify";

// Cấu hình chung cho tất cả toast
const defaultOptions = {
  autoClose: 3000, // Mặc định tự động đóng sau 3 giây
  hideProgressBar: false, // Hiển thị thanh tiến trình
  closeOnClick: true, // Đóng khi nhấp
  pauseOnHover: false, // Không tạm dừng khi di chuột qua
  pauseOnFocusLoss: false, // Không tạm dừng khi mất tiêu điểm
  draggable: true, // Cho phép kéo
  theme: "light", // Chủ đề sáng
  transition: "slide", // Hiệu ứng trượt mượt mà
  className: "elegant-toast", // Lớp CSS tùy chỉnh
  progressClassName: "elegant-toast-progress", // Lớp CSS cho thanh tiến trình
  style: {
    borderRadius: "12px",
    background: "#ffffff",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
    padding: "14px 18px",
    fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
    fontSize: "15px",
    fontWeight: 500,
    color: "#333",
    border: "1px solid transparent",
  },
  progressStyle: {
    height: "4px",
    borderRadius: "2px",
  },
};

const toastService = {
  success: (message) =>
    toast.success(message, {
      ...defaultOptions,
      autoClose: 3000,
      icon: () => (
        <i
          className="bi bi-check-circle-fill"
          style={{
            fontSize: "24px",
            color: "#28a745",
            filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
          }}
        ></i>
      ),
      style: {
        ...defaultOptions.style,
        borderColor: "#d4edda",
        color: "#155724",
      },
      progressStyle: {
        ...defaultOptions.progressStyle,
        background: "linear-gradient(90deg, #28a745, #34d058)",
      },
    }),

  error: (message) =>
    toast.error(message, {
      ...defaultOptions,
      autoClose: 4000,
      icon: () => (
        <i
          className="bi bi-x-circle-fill"
          style={{
            fontSize: "24px",
            color: "#dc3545",
            filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
          }}
        ></i>
      ),
      style: {
        ...defaultOptions.style,
        borderColor: "#f8d7da",
        color: "#721c24",
      },
      progressStyle: {
        ...defaultOptions.progressStyle,
        background: "linear-gradient(90deg, #dc3545, #f14668)",
      },
    }),

  info: (message) =>
    toast.info(message, {
      ...defaultOptions,
      autoClose: 3000,
      icon: () => (
        <i
          className="bi bi-info-circle-fill"
          style={{
            fontSize: "24px",
            color: "#0dcaf0",
            filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
          }}
        ></i>
      ),
      style: {
        ...defaultOptions.style,
        borderColor: "#cff4fc",
        color: "#055160",
      },
      progressStyle: {
        ...defaultOptions.progressStyle,
        background: "linear-gradient(90deg, #0dcaf0, #31d6ff)",
      },
    }),

  warning: (message) =>
    toast.warning(message, {
      ...defaultOptions,
      autoClose: 3500,
      icon: () => (
        <i
          className="bi bi-exclamation-triangle-fill"
          style={{
            fontSize: "24px",
            color: "#ffc107",
            filter: "drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.2))",
          }}
        ></i>
      ),
      style: {
        ...defaultOptions.style,
        borderColor: "#fff3cd",
        color: "#664d03",
      },
      progressStyle: {
        ...defaultOptions.progressStyle,
        background: "linear-gradient(90deg, #ffc107, #ffd43b)",
      },
    }),
};

export default toastService;