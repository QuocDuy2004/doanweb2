import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AppRoutes from "./routes";

function App() {
  return (
    <>
      <AppRoutes />
      <ToastContainer
        position="top-right" // Vị trí toast xuất hiện
        autoClose={3000} // Tự động đóng sau 3 giây
        hideProgressBar={false} // Hiển thị thanh tiến trình
        newestOnTop // Toast mới nhất ở trên cùng
        closeOnClick // Đóng khi nhấp vào toast
        rtl={false} // Hỗ trợ chữ từ trái sang phải
        pauseOnFocusLoss={false} // Không tạm dừng khi mất tiêu điểm (đảm bảo tự động tắt)
        draggable // Cho phép kéo toast
        pauseOnHover={false} // Không tạm dừng khi di chuột qua (đảm bảo tự động tắt)
        theme="light" // Chủ đề sáng
        transition="Slide" // Hiệu ứng trượt mượt mà
        limit={3} // Giới hạn tối đa 3 toast
        className="elegant-toast-container" // Lớp CSS cho container
        toastClassName="elegant-toast" // Lớp CSS cho mỗi toast
        progressClassName="elegant-toast-progress" // Lớp CSS cho thanh tiến trình
        closeButtonClassName="elegant-toast-close" // Lớp CSS cho nút đóng
      />
    </>
  );
}

export default App;