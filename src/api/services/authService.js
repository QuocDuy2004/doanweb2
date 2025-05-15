import axiosNoAuthInstance from "../config/axiosNoAuthInstance";
import toastService from "../../service/toastService";

const authService = {
    sendLoginSignupOtp: async (data, signal) => {
        console.log("Sending OTP request:", JSON.stringify(data, null, 2));
        try {
            const response = await axiosNoAuthInstance.post(
                "/auth/sent/signup-otp",
                data,
                { signal, timeout: 10000 }
            );
            console.log("OTP response:", JSON.stringify(response.data, null, 2));
            return response;
        } catch (error) {
            console.error("OTP request failed:", error.message, error.response?.data);
            throw error;
        }
    },

    signupWithOtp: (data) =>
        axiosNoAuthInstance
            .post("/auth/signup", data)
            .then((response) => {
                if (response.data.jwt && response.status === 200) {
                    localStorage.setItem("authToken", response.data.jwt);
                    localStorage.setItem("email", data.email);
                    toastService.success(response.data.message || "Đăng ký thành công!");
                }
                return response;
            })
            .catch((error) => {
                const errorMessage =
                    error.response?.data?.message || "OTP không hợp lệ hoặc đã hết hạn.";
                toastService.error(errorMessage);
                throw error;
            }),

            signinWithOtp: async (data, signal) => {
                const response = await axiosNoAuthInstance.post(
                    "/auth/signing",
                    data,
                    { signal, timeout: 10000 }
                );
                return response; // Returns ApiResponse with message
            },
            
            sendLoginOtp: async (data, signal) => {
                console.log("Sending OTP request:", JSON.stringify(data, null, 2));
                try {
                    const response = await axiosNoAuthInstance.post(
                        "/auth/signing",
                        data,
                        { signal, timeout: 30000 }
                    );
                    console.log("OTP response:", JSON.stringify(response.data, null, 2));
                    return response;
                } catch (error) {
                    console.error("OTP request failed:", error.message, error.response?.data);
                    throw error;
                }
            },
        
            verifyLogin: async (data, signal) => {
                console.log("Verify login request:", JSON.stringify(data, null, 2));
                try {
                    const response = await axiosNoAuthInstance.post(
                        "/auth/verify-login",
                        data,
                        { signal, timeout: 30000 }
                    );
                    console.log("Verify response:", JSON.stringify(response.data, null, 2));
                    return response;
                } catch (error) {
                    console.error("Verify request failed:", error.message, error.response?.data);
                    throw error;
                }
            },
};

export default authService;