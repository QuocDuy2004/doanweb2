package com.example.thanhtrung.thuongmaidientu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.thanhtrung.thuongmaidientu.modal.VerificationCode;

public interface VerificationCodeRepository extends JpaRepository<VerificationCode, Long> {

    VerificationCode findByEmail(String email);

    VerificationCode findByOtp(String otp);
}
