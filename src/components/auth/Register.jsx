import { useState, useEffect, useCallback } from "react";
import { Mail, X } from "lucide-react";
import toastService from "../../service/toastService";
import { authService } from "../../api";
import { debounce } from "lodash";

const Register = ({ setModalType }) => {
    const [registerForm, setRegisterForm] = useState({
        email: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleRegisterChange = (e) => {
        setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
    };

    const validateRegister = () => {
        const newErrors = {};
        if (!registerForm.email) newErrors.email = "Email là bắt buộc";
        else if (!emailRegex.test(registerForm.email)) newErrors.email = "Email không hợp lệ";
        return newErrors;
    };

    const sendOtpRequest = async (controller) => {
        if (!registerForm.email) {
            setErrors({ api: "Email không được để trống" });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.sendLoginSignupOtp(
                {
                    email: registerForm.email,
                    role: "ROLE_CUSTOMER",
                },
                controller.signal
            );
            if (response.status === 200) {
                toastService.success(
                    response.data?.message || "OTP đã được gửi đến email của bạn!"
                );
                setModalType("verify", {
                    email: registerForm.email,
                    type: "register",
                });
                setErrors({});
            } else {
                throw new Error(response.data?.message || "Không thể gửi OTP.");
            }
        } catch (error) {
            if (error.name === "AbortError") {
                console.log("Request aborted");
                return;
            }
            let errorMessage = "Không thể gửi OTP. Vui lòng thử lại.";
            if (error.response) {
                const status = error.response.status;
                if (status === 403) {
                    errorMessage = "Lỗi CORS hoặc quyền truy cập bị từ chối. Vui lòng kiểm tra cấu hình máy chủ.";
                } else if (status === 429) {
                    const retryAfter = error.response.headers["retry-after"];
                    errorMessage = retryAfter
                        ? `Quá nhiều yêu cầu. Vui lòng thử lại sau ${retryAfter} giây.`
                        : "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
                } else if (status === 400) {
                    errorMessage = error.response.data?.message || "Email không hợp lệ.";
                } else if (status === 404) {
                    errorMessage = "API không tồn tại. Vui lòng kiểm tra endpoint.";
                } else if (status >= 500) {
                    errorMessage = "Lỗi máy chủ. Vui lòng thử lại sau.";
                }
            } else if (error.code === "ECONNABORTED") {
                errorMessage = "Yêu cầu hết thời gian. Vui lòng kiểm tra kết nối.";
            } else if (error.code === "ERR_NETWORK" || error.message.includes("Network Error")) {
                errorMessage = "Lỗi CORS hoặc máy chủ không phản hồi. Vui lòng kiểm tra backend.";
            }
            console.error("API Error:", errorMessage, error.response?.data);
            setErrors({ api: errorMessage });
            toastService.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const debouncedSendOtp = useCallback(
        debounce((controller) => sendOtpRequest(controller), 1000, { leading: true, trailing: false }),
        [registerForm.email]
    );

    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return;
        const newErrors = validateRegister();
        if (Object.keys(newErrors).length === 0) {
            const controller = new AbortController();
            debouncedSendOtp(controller);
        } else {
            setErrors(newErrors);
        }
    };

    useEffect(() => {
        const controller = new AbortController();
        return () => {
            controller.abort();
            debouncedSendOtp.cancel();
        };
    }, [debouncedSendOtp]);

    return (
        <div className="animate-fade-in relative">
           
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Đăng ký</h2>
            <form onSubmit={handleRegisterSubmit}>
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="flex items-center text-sm font-normal text-gray-900 mb-1"
                    >
                        <Mail className="h-4 w-4 mr-2 text-gray-500" /> Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        name="email"
                        value={registerForm.email}
                        onChange={handleRegisterChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
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
                    <p className="text-red-500 text-sm mb-4 text-center">{errors.api}</p>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full bg-[#0056D2] text-white font-medium py-2 rounded-lg transition-colors duration-300 ${
                        isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#0045b5]"
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
                        "Gửi OTP"
                    )}
                </button>
                <div className="mt-4 text-center text-xs text-gray-700">
                    <p>
                        Đã có tài khoản?{" "}
                        <button
                            type="button"
                            onClick={() => setModalType("login")}
                            className="text-[#0056D2] hover:underline"
                        >
                            Đăng nhập
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Register;