package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.request.LoginRequest;
import com.example.thanhtrung.thuongmaidientu.response.AuthResponse;
import com.example.thanhtrung.thuongmaidientu.response.SignupRequest;

public interface AuthService {

    void sentLoginOtp(String email, USER_ROLE role) throws Exception;

    void sentSignupOtp(String email, USER_ROLE role) throws Exception; // New method for signup OTP

    String createUser(SignupRequest req) throws Exception;

    AuthResponse verifyLogin(LoginRequest req) throws Exception;
}