package com.example.thanhtrung.thuongmaidientu.service;

import java.util.List;
import com.example.thanhtrung.thuongmaidientu.domain.AccountStatus;
import com.example.thanhtrung.thuongmaidientu.exceptions.SellerException;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.response.SignupRequest;

public interface SellerService {

    Seller getSellerProfile(String jwt) throws Exception;

    String createSeller(SignupRequest req) throws Exception; // Updated to use SignupRequest and return JWT

    Seller getSellerById(Long id) throws SellerException;

    Seller getSellerByEmail(String email) throws Exception;

    List<Seller> getAllSellers(AccountStatus status);

    Seller updateSeller(Long id, Seller seller) throws Exception;

    void deleteSeller(Long id) throws Exception;

    Seller verifyEmail(String email, String otp) throws Exception;

    Seller updateSellerAccountStatus(Long sellerId, AccountStatus status) throws Exception;
}