package com.example.thanhtrung.thuongmaidientu.request;

import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;

import lombok.Data;

@Data
public class LoginOtpRequest {
    private String email;
    private String otp;
    private USER_ROLE role;
}
