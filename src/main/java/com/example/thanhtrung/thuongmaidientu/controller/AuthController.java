package com.example.thanhtrung.thuongmaidientu.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.request.LoginOtpRequest;
import com.example.thanhtrung.thuongmaidientu.request.LoginRequest;
import com.example.thanhtrung.thuongmaidientu.response.ApiResponse;
import com.example.thanhtrung.thuongmaidientu.response.AuthResponse;
import com.example.thanhtrung.thuongmaidientu.response.SignupRequest;
import com.example.thanhtrung.thuongmaidientu.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createUserHandler(@RequestBody SignupRequest req) throws Exception {
        String jwt = authService.createUser(req);
        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setMessage("Đăng ký thành công! Giỏ hàng đã được tạo.");
        res.setRole(USER_ROLE.ROLE_CUSTOMER);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sent/signup-otp")
    public ResponseEntity<ApiResponse> sentSignupOtpHandler(@RequestBody LoginOtpRequest req) throws Exception {
        authService.sentSignupOtp(req.getEmail(), req.getRole());
        ApiResponse res = new ApiResponse();
        res.setMessage("Gửi OTP đăng ký thành công");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sent/login-signup-otp")
    public ResponseEntity<ApiResponse> sentOtpHandler(
            @RequestBody LoginOtpRequest req,
            @RequestParam(value = "type", defaultValue = "login") String type) throws Exception {
        if ("signup".equalsIgnoreCase(type)) {
            authService.sentSignupOtp(req.getEmail(), req.getRole());
        } else {
            authService.sentLoginOtp(req.getEmail(), req.getRole());
        }
        ApiResponse res = new ApiResponse();
        res.setMessage("Gửi OTP thành công");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/signing")
    public ResponseEntity<ApiResponse> loginHandler(@RequestBody LoginOtpRequest req) throws Exception {
        authService.sentLoginOtp(req.getEmail(), req.getRole());
        ApiResponse res = new ApiResponse();
        res.setMessage("OTP đã được gửi đến email của bạn");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/verify-login")
    public ResponseEntity<AuthResponse> verifyLoginHandler(@RequestBody LoginRequest req) throws Exception {
        AuthResponse authResponse = authService.verifyLogin(req);
        return ResponseEntity.ok(authResponse);
    }
}