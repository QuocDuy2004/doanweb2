package com.example.thanhtrung.thuongmaidientu.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.thanhtrung.thuongmaidientu.domain.AccountStatus;
import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.exceptions.SellerException;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.request.LoginOtpRequest;
import com.example.thanhtrung.thuongmaidientu.request.LoginRequest;
import com.example.thanhtrung.thuongmaidientu.response.ApiResponse;
import com.example.thanhtrung.thuongmaidientu.response.AuthResponse;
import com.example.thanhtrung.thuongmaidientu.response.SellerResponse;
import com.example.thanhtrung.thuongmaidientu.response.SignupRequest;
import com.example.thanhtrung.thuongmaidientu.service.AuthService;
import com.example.thanhtrung.thuongmaidientu.service.SellerService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/sellers")
@Validated
public class SellerController {
    private final SellerService sellerService;
    private final AuthService authService;

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> createSeller(@Valid @RequestBody SignupRequest req) throws Exception {
        String jwt = sellerService.createSeller(req);
        AuthResponse res = new AuthResponse();
        res.setJwt(jwt);
        res.setMessage("Tạo tài khoản người bán thành công!");
        res.setRole(USER_ROLE.ROLE_SELLER);
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sent/signup-otp")
    public ResponseEntity<ApiResponse> sendSignupOtp(@Valid @RequestBody LoginOtpRequest req) throws Exception {
        if (!USER_ROLE.ROLE_SELLER.equals(req.getRole())) {
            throw new IllegalArgumentException("Invalid role for seller signup");
        }
        authService.sentSignupOtp(req.getEmail(), USER_ROLE.ROLE_SELLER);
        ApiResponse res = new ApiResponse();
        res.setMessage("OTP đã được gửi đến email của bạn");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/sent/login-otp")
    public ResponseEntity<ApiResponse> sendLoginOtp(@Valid @RequestBody LoginOtpRequest req) throws Exception {
        if (!USER_ROLE.ROLE_SELLER.equals(req.getRole())) {
            throw new IllegalArgumentException("Invalid role for seller login");
        }
        authService.sentLoginOtp(req.getEmail(), USER_ROLE.ROLE_SELLER);
        ApiResponse res = new ApiResponse();
        res.setMessage("OTP đã được gửi đến email của bạn");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> loginSeller(@Valid @RequestBody LoginRequest req) throws Exception {
        // Validate seller role
        Seller seller = sellerService.getSellerByEmail(req.getEmail());
        if (!USER_ROLE.ROLE_SELLER.equals(seller.getRole())) {
            throw new SellerException("Invalid role for seller login");
        }
        
        AuthResponse authResponse = authService.verifyLogin(req);
        if (seller.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new SellerException("Seller account is not active");
        }
        
        authResponse.setRole(USER_ROLE.ROLE_SELLER);
        authResponse.setMessage("Đăng nhập người bán thành công");
        return ResponseEntity.ok(authResponse);
    }

    @PatchMapping("/verify/{otp}")
    public ResponseEntity<SellerResponse> verifySellerEmail(@PathVariable String otp, @Valid @RequestBody LoginRequest req) throws Exception {
        Seller seller = sellerService.verifyEmail(req.getEmail(), otp);
        SellerResponse response = new SellerResponse(seller, "Xác minh email thành công");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SellerResponse> getSellerById(@PathVariable Long id) throws SellerException {
        Seller seller = sellerService.getSellerById(id);
        SellerResponse response = new SellerResponse(seller, "Lấy thông tin người bán thành công");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping("/profile")
    public ResponseEntity<SellerResponse> getSellerByJwt(@RequestHeader("Authorization") String jwt) throws Exception {
        Seller seller = sellerService.getSellerProfile(jwt.replace("Bearer ", ""));
        SellerResponse response = new SellerResponse(seller, "Lấy hồ sơ người bán thành công");
        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<List<Seller>> getAllSellers(@RequestParam(required = false) AccountStatus status) {
        List<Seller> sellers = sellerService.getAllSellers(status);
        return ResponseEntity.ok(sellers);
    }

    @PatchMapping
    public ResponseEntity<SellerResponse> updateSeller(@RequestHeader("Authorization") String jwt, @Valid @RequestBody Seller seller) throws Exception {
        Seller profile = sellerService.getSellerProfile(jwt.replace("Bearer ", ""));
        Seller updatedSeller = sellerService.updateSeller(profile.getId(), seller);
        SellerResponse response = new SellerResponse(updatedSeller, "Cập nhật thông tin người bán thành công");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteSeller(@PathVariable Long id) throws Exception {
        sellerService.deleteSeller(id);
        ApiResponse response = new ApiResponse();
        response.setMessage("Xóa người bán thành công");
        return ResponseEntity.ok(response);
    }
}