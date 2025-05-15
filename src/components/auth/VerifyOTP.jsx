import { useState } from "react";
import { X } from "lucide-react";
import toastService from "../../service/toastService";
import { authService } from "../../api";

const VerifyOTP = ({ setModalType, onClose, email, fullName, type }) => {
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: "Vui lòng nhập OTP" });
      return;
    }

    setIsLoading(true);
    try {
      if (type === "register") {
        const response = await authService.signupWithOtp({
          email,
          otp,
          fullName,
        });
        if (response.status === 200) {
          onClose(); // Close modal on success
          // Optionally redirect: window.location.href = "/dashboard";
        }
      } else if (type === "login") {
        const response = await authService.signinWithOtp({ email, otp });
        if (response.status === 200) {
          onClose();
        }
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.";
      setErrors({ api: errorMessage });
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    try {
      const response = await authService.sendLoginSignupOtp({
        email,
        role: "ROLE_CUSTOMER",
      });
      if (response.status === 200) {
        toastService.success("OTP đã được gửi lại!");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Không thể gửi lại OTP.";
      toastService.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={onClose}
        className="absolute top-0 right-0 text-gray-900 hover:text-indigo-600 transition-colors"
        aria-label="Đóng modal"
        disabled={isLoading}
      >
        <X className="h-6 w-6" />
      </button>
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Xác minh OTP
      </h2>
      <form onSubmit={handleOtpSubmit}>
        <div className="mb-4">
          <label
            htmlFor="otp"
            className="text-sm font-medium text-gray-700 mb-1 block"
          >
            Nhập OTP được gửi đến {email}
          </label>
          <input
            id="otp"
            type="text"
            value={otp}
            onChange={handleOtpChange}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập mã OTP"
            aria-describedby={errors.otp ? "otp-error" : undefined}
          />
          {errors.otp && (
            <p id="otp-error" className="text-red-500 text-xs mt-1">
              {errors.otp}
            </p>
          )}
        </div>
        {errors.api && (
          <p className="text-red-500 text-sm mb-4 text-center">{errors.api}</p>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-indigo-600 text-white font-medium py-2 rounded-lg transition-colors duration-300 ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
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
              Đang xác minh...
            </span>
          ) : (
            "Xác minh OTP"
          )}
        </button>
        <div className="mt-4 text-center text-sm">
          <p>
            Không nhận được OTP?{" "}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={isLoading}
              className="text-indigo-600 hover:underline"
            >
              Gửi lại OTP
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default VerifyOTP;