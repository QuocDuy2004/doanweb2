import { useState } from "react";
import { Mail, X } from "lucide-react";
import { authService } from "../../api";
import toastService from "../../service/toastService";

const ForgotPassword = ({ setModalType, onClose }) => {
  const [forgotForm, setForgotForm] = useState({ email: "" });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const handleForgotChange = (e) => {
    setForgotForm({ ...forgotForm, [e.target.name]: e.target.value });
  };

  const validateForgot = () => {
    const newErrors = {};
    if (!forgotForm.email) newErrors.email = "Email là bắt buộc";
    else if (!emailRegex.test(forgotForm.email)) newErrors.email = "Email không hợp lệ";
    return newErrors;
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForgot();
    if (Object.keys(newErrors).length === 0) {
      setIsLoading(true);
      try {
        const response = await authService.requestPasswordReset({
          email: forgotForm.email,
        });
        if (response.status === 200) {
          toastService.success("Link đặt lại mật khẩu đã được gửi đến email của bạn!");
          onClose();
          setErrors({});
        } else {
          throw new Error("Không thể gửi link đặt lại. Vui lòng thử lại.");
        }
      } catch (error) {
        const errorMessage = error.message || "Không thể gửi link đặt lại. Vui lòng thử lại.";
        setErrors({ api: errorMessage });
        toastService.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(newErrors);
    }
  };

  return (
    <div className="animate-fade-in relative">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 text-[var(--text-primary)] hover:text-[var(--primary-blue)] transition-colors"
        aria-label="Đóng modal"
      >
        <X className="h-6 w-6" />
      </button>
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8 text-center tracking-tight">
        Quên mật khẩu
      </h2>
      <form onSubmit={handleForgotSubmit}>
        <div className="mb-6">
          <label
            htmlFor="email"
            className="flex items-center text-sm font-medium text-[var(--text-primary)] mb-2"
          >
            <Mail className="h-4 w-4 mr-2 text-[var(--primary-blue)]" /> Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={forgotForm.email}
            onChange={handleForgotChange}
            className="w-full bg-[var(--secondary-bg)] border border-[var(--border-color)] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[var(--primary-blue)] text-[var(--text-primary)] transition-all hover:border-[var(--primary-blue)]"
            placeholder="Nhập email của bạn"
            aria-describedby={errors.email ? "email-error" : undefined}
          />
          {errors.email && (
            <p id="email-error" className="text-red-500 text-xs mt-1">
              {errors.email}
            </p>
          )}
        </div>
        {errors.api && (
          <p className="text-red-500 text-sm mb-6 text-center">{errors.api}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-gradient-to-r from-[var(--primary-blue)] to-indigo-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md ${
            isLoading
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin h-5 w-5 mr-2 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Đang gửi...
            </span>
          ) : (
            "Gửi link đặt lại"
          )}
        </button>
        <div className="mt-6 text-center text-sm text-[var(--text-secondary)]">
          <p>
            Quay lại{" "}
            <button
              type="button"
              onClick={() => setModalType("login")}
              className="text-[var(--primary-blue)] hover:underline font-medium"
            >
              Đăng nhập
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;