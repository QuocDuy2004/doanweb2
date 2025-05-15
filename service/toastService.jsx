import { toast } from "react-toastify";

const toastService = {
  success: (message) =>
    toast.success(message, {
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: () => (
        <i
          className="bi bi-check-circle-fill"
          style={{
            fontSize: "22px",
            color: "#28a745",
            filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))",
          }}
        ></i>
      ),
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",

        padding: "12px 16px",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#333",
      },
      progressStyle: {
        background: "linear-gradient(90deg, #28a745, #34d058)",
        height: "4px",
        borderRadius: "2px",
      },
    }),

  error: (message) =>
    toast.error(message, {
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: () => (
        <i
          className="bi bi-x-circle-fill"
          style={{
            fontSize: "22px",
            color: "#dc3545",
            filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))",
          }}
        ></i>
      ),
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #f8d7da",
        padding: "12px 16px",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#721c24",
      },
      progressStyle: {
        background: "linear-gradient(90deg, #dc3545, #f14668)",
        height: "4px",
        borderRadius: "2px",
      },
    }),

  info: (message) =>
    toast.info(message, {
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: () => (
        <i
          className="bi bi-info-circle-fill"
          style={{
            fontSize: "22px",
            color: "#0dcaf0",
            filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))",
          }}
        ></i>
      ),
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #cff4fc",
        padding: "12px 16px",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#055160",
      },
      progressStyle: {
        background: "linear-gradient(90deg, #0dcaf0, #31d6ff)",
        height: "4px",
        borderRadius: "2px",
      },
    }),

  warning: (message) =>
    toast.warning(message, {
      autoClose: 3500,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      icon: () => (
        <i
          className="bi bi-exclamation-triangle-fill"
          style={{
            fontSize: "22px",
            color: "#ffc107",
            filter: "drop-shadow(0px 2px 2px rgba(0, 0, 0, 0.1))",
          }}
        ></i>
      ),
      style: {
        borderRadius: "12px",
        background: "#ffffff",
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
        border: "1px solid #fff3cd",
        padding: "12px 16px",
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', sans-serif",
        color: "#664d03",
      },
      progressStyle: {
        background: "linear-gradient(90deg, #ffc107, #ffd43b)",
        height: "4px",
        borderRadius: "2px",
      },
    }),
};

export default toastService;