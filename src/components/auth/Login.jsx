import { useState, useEffect, useCallback } from "react";
import { Mail } from "lucide-react";
import toastService from "../../service/toastService";
import { authService } from "../../api";
import { debounce } from "lodash";

const Login = ({ setModalType, onClose }) => {
    const [loginForm, setLoginForm] = useState({
        email: "",
        otp: "",
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isOtpSent, setIsOtpSent] = useState(false);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleLoginChange = (e) => {
        setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
    };

    const validateEmail = () => {
        const newErrors = {};
        if (!loginForm.email) newErrors.email = "Email là bắt buộc";
        else if (!emailRegex.test(loginForm.email)) newErrors.email = "Email không hợp lệ";
        return newErrors;
    };

    const validateOtp = () => {
        const newErrors = {};
        if (!loginForm.otp) newErrors.otp = "OTP là bắt buộc";
        else if (loginForm.otp.length !== 6) newErrors.otp = "OTP phải có 6 chữ số";
        return newErrors;
    };

    const sendOtpRequest = async (controller, retries = 2) => {
        if (!loginForm.email) {
            setErrors({ api: "Email không được để trống" });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let lastError = null;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await authService.sendLoginOtp(
                    {
                        email: loginForm.email,
                        role: "ROLE_CUSTOMER",
                    },
                    controller.signal
                );
                if (response.status === 200) {
                    toastService.success(response.data.message || "OTP đã được gửi đến email của bạn!");
                    setIsOtpSent(true);
                    setCountdown(60);
                    setCanResend(false);
                    setErrors({});
                    return;
                } else {
                    throw new Error(response.data?.message || "Không thể gửi OTP.");
                }
            } catch (error) {
                lastError = error;
                if (error.name === "AbortError") {
                    console.log("Request aborted");
                    return;
                }
                let errorMessage = "Không thể gửi OTP. Vui lòng thử lại.";
                if (error.response) {
                    const status = error.response.status;
                    if (status === 400) {
                        errorMessage = error.response.data?.message || "Email không hợp lệ.";
                    } else if (status === 404) {
                        errorMessage = error.response.data?.message || "Không tìm thấy người dùng.";
                    } else if (status === 403) {
                        errorMessage = "Quyền truy cập bị từ chối.";
                    } else if (status === 429) {
                        errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    } else if (status >= 500) {
                        errorMessage = error.response.data?.message || "Lỗi máy chủ. Vui lòng thử lại sau.";
                    }
                } else if (error.code === "ECONNABORTED") {
                    errorMessage = "Yêu cầu hết thời gian. Vui lòng kiểm tra kết nối.";
                } else if (error.code === "ERR_NETWORK") {
                    errorMessage = "Không thể kết nối đến máy chủ.";
                }
                console.error(`Send OTP failed (attempt ${attempt}):`, errorMessage, error.response?.data);
                if (attempt < retries && error.response?.status >= 500) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
                setErrors({ api: errorMessage });
                toastService.error(errorMessage);
                break;
            } finally {
                setIsLoading(false);
            }
        }
        if (lastError) throw lastError;
    };

    const verifyOtpRequest = async (controller, retries = 2) => {
        if (!loginForm.otp) {
            setErrors({ api: "OTP không được để trống" });
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        let lastError = null;
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = await authService.verifyLogin(
                    {
                        email: loginForm.email,
                        otp: loginForm.otp,
                    },
                    controller.signal
                );
                if (response.status === 200) {
                    toastService.success(response.data.message || "Đăng nhập thành công!");
                    localStorage.setItem("authToken", response.data.jwt);
                    localStorage.setItem("email", loginForm.email);
                    onClose(); // Close modal on success
                    setErrors({});
                    return;
                } else {
                    throw new Error(response.data?.message || "Không thể xác thực OTP.");
                }
            } catch (error) {
                lastError = error;
                if (error.name === "AbortError") {
                    console.log("Request aborted");
                    return;
                }
                let errorMessage = "Không thể xác thực OTP. Vui lòng thử lại.";
                if (error.response) {
                    const status = error.response.status;
                    if (status === 400) {
                        errorMessage = error.response.data?.message || "OTP không hợp lệ.";
                    } else if (status === 404) {
                        errorMessage = "API không tồn tại.";
                    } else if (status === 403) {
                        errorMessage = "Quyền truy cập bị từ chối.";
                    } else if (status === 429) {
                        errorMessage = "Quá nhiều yêu cầu. Vui lòng thử lại sau.";
                    } else if (status >= 500) {
                        errorMessage = error.response.data?.message || "Lỗi máy chủ. Vui lòng thử lại sau.";
                    }
                } else if (error.code === "ECONNABORTED") {
                    errorMessage = "Yêu cầu hết thời gian. Vui lòng kiểm tra kết nối.";
                } else if (error.code === "ERR_NETWORK") {
                    errorMessage = "Không thể kết nối đến máy chủ.";
                }
                console.error(`Verify OTP failed (attempt ${attempt}):`, errorMessage, error.response?.data);
                if (attempt < retries && error.response?.status >= 500) {
                    await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
                    continue;
                }
                setErrors({ api: errorMessage });
                toastService.error(errorMessage);
                break;
            } finally {
                setIsLoading(false);
            }
        }
        if (lastError) throw lastError;
    };

    const debouncedSendOtp = useCallback(
        debounce((controller) => sendOtpRequest(controller), 1000, { leading: true, trailing: false }),
        [loginForm.email]
    );

    const debouncedVerifyOtp = useCallback(
        debounce((controller) => verifyOtpRequest(controller), 1000, { leading: true, trailing: false }),
        [loginForm.email, loginForm.otp]
    );

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (!isOtpSent) {
            const emailErrors = validateEmail();
            if (Object.keys(emailErrors).length === 0) {
                const controller = new AbortController();
                debouncedSendOtp(controller);
            } else {
                setErrors(emailErrors);
            }
        } else {
            const otpErrors = validateOtp();
            if (Object.keys(otpErrors).length === 0) {
                const controller = new AbortController();
                debouncedVerifyOtp(controller);
            } else {
                setErrors(otpErrors);
            }
        }
    };

    const handleResendOtp = () => {
        if (!canResend || isLoading) return;
        const controller = new AbortController();
        debouncedSendOtp(controller);
    };

    useEffect(() => {
        let timer;
        if (isOtpSent && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isOtpSent, countdown]);

    useEffect(() => {
        const controller = new AbortController();
        return () => {
            controller.abort();
            debouncedSendOtp.cancel();
            debouncedVerifyOtp.cancel();
        };
    }, [debouncedSendOtp, debouncedVerifyOtp]);

    return (
        <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Đăng nhập</h2>
            <form onSubmit={handleLoginSubmit}>
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
                        value={loginForm.email}
                        onChange={handleLoginChange}
                        className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
                        placeholder="Nhập email của bạn"
                        disabled={isOtpSent}
                        aria-describedby={errors.email ? "email-error" : undefined}
                    />
                    {errors.email && (
                        <p id="email-error" className="text-red-500 text-xs mt-1">
                            {errors.email}
                        </p>
                    )}
                </div>
                {isOtpSent && (
                    <div className="mb-4">
                        <label
                            htmlFor="otp"
                            className="flex items-center text-sm font-normal text-gray-900 mb-1"
                        >
                            OTP
                        </label>
                        <input
                            id="otp"
                            type="text"
                            name="otp"
                            value={loginForm.otp}
                            onChange={handleLoginChange}
                            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]"
                            placeholder="Nhập mã OTP"
                            aria-describedby={errors.otp ? "otp-error" : undefined}
                        />
                        {errors.otp && (
                            <p id="otp-error" className="text-red-500 text-xs mt-1">
                                {errors.otp}
                            </p>
                        )}
                    </div>
                )}
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
                            Đang xử lý...
                        </span>
                    ) : isOtpSent ? (
                        "Xác thực OTP"
                    ) : (
                        "Gửi OTP"
                    )}
                </button>
                {isOtpSent && (
                    <div className="mt-4 text-center">
                        <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={!canResend || isLoading}
                            className={`text-[#0056D2] hover:underline text-sm ${
                                !canResend || isLoading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                        >
                            Gửi lại OTP {countdown > 0 && `(${countdown}s)`}
                        </button>
                    </div>
                )}
                <div className="mt-4 text-center text-xs text-gray-700">
                    <p>
                        Chưa có tài khoản?{" "}
                        <button
                            type="button"
                            onClick={() => setModalType("register")}
                            className="text-[#0056D2] hover:underline"
                        >
                            Đăng ký
                        </button>
                    </p>
                    <p>
                        <button
                            type="button"
                            onClick={() => setModalType("forgot")}
                            className="text-[#0056D2] hover:underline"
                        >
                            Quên mật khẩu?
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;