package com.example.thanhtrung.thuongmaidientu.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.thanhtrung.thuongmaidientu.config.JwtProvider;
import com.example.thanhtrung.thuongmaidientu.domain.AccountStatus;
import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.exceptions.SellerException;
import com.example.thanhtrung.thuongmaidientu.modal.Address;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.modal.VerificationCode;
import com.example.thanhtrung.thuongmaidientu.repository.AddressRepository;
import com.example.thanhtrung.thuongmaidientu.repository.SellerRepository;
import com.example.thanhtrung.thuongmaidientu.repository.VerificationCodeRepository;
import com.example.thanhtrung.thuongmaidientu.response.SignupRequest;
import com.example.thanhtrung.thuongmaidientu.service.SellerService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SellerServiceImpl implements SellerService {
    private final SellerRepository sellerRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final AddressRepository addressRepository;
    private final VerificationCodeRepository verificationCodeRepository;

    @Override
    public Seller getSellerProfile(String jwt) throws Exception {
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        return getSellerByEmail(email);
    }

    @Override
    public String createSeller(SignupRequest req) throws Exception {
        // Verify OTP
        VerificationCode verificationCode = verificationCodeRepository.findByEmail(req.getEmail());
        if (verificationCode == null || !verificationCode.getOtp().equals(req.getOtp())) {
            throw new Exception("Mã OTP sai hoặc đã hết hạn");
        }

        // Check if seller already exists
        Seller sellerExist = sellerRepository.findByEmail(req.getEmail());
        if (sellerExist != null) {
            throw new Exception("Người bán đã tồn tại, sử dụng email khác!");
        }

        // Create new seller
        Seller newSeller = new Seller();
        newSeller.setEmail(req.getEmail());
        newSeller.setSellerName(req.getFullname());
        newSeller.setPassword(passwordEncoder.encode(req.getOtp())); // Use OTP as temporary password
        newSeller.setRole(USER_ROLE.ROLE_SELLER);
        newSeller.setMobile("0379263053"); // Placeholder, update as needed
        Address address = new Address(); // Placeholder, update with actual address data
        address.setAddress("Default Address");
        address.setCity("Default City");
        address.setState("Default State");
        address.setPinCode("000000");
        address.setMobile("0379263053");
        Address savedAddress = addressRepository.save(address);
        newSeller.setPickupAddress(savedAddress);

        sellerRepository.save(newSeller);

        // Set authentication
        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(USER_ROLE.ROLE_SELLER.toString()));
        Authentication authentication = new UsernamePasswordAuthenticationToken(req.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate and return JWT
        return jwtProvider.generateToken(authentication);
    }

    @Override
    public Seller getSellerById(Long id) throws SellerException {
        return sellerRepository.findById(id)
                .orElseThrow(() -> new SellerException("Không tìm thấy người bán với id: " + id));
    }

    @Override
    public Seller getSellerByEmail(String email) throws Exception {
        Seller seller = sellerRepository.findByEmail(email);
        if (seller == null) {
            throw new Exception("Người bán không tồn tại");
        }
        return seller;
    }

    @Override
    public List<Seller> getAllSellers(AccountStatus status) {
        return sellerRepository.findByAccountStatus(status);
    }

    @Override
    public Seller updateSeller(Long id, Seller seller) throws Exception {
        Seller existingSeller = getSellerById(id);
        if (seller.getSellerName() != null) {
            existingSeller.setSellerName(seller.getSellerName());
        }
        if (seller.getMobile() != null) {
            existingSeller.setMobile(seller.getMobile());
        }
        if (seller.getEmail() != null) {
            existingSeller.setEmail(seller.getEmail());
        }
        if (seller.getBusinessDetails() != null && seller.getBusinessDetails().getBusinessName() != null) {
            existingSeller.getBusinessDetails().setBusinessName(seller.getBusinessDetails().getBusinessName());
        }
        if (seller.getBankDetails() != null && seller.getBankDetails().getAccountHolderName() != null
                && seller.getBankDetails().getIfscCode() != null
                && seller.getBankDetails().getAccountNumber() != null) {
            existingSeller.getBankDetails().setAccountHolderName(seller.getBankDetails().getAccountHolderName());
            existingSeller.getBankDetails().setAccountNumber(seller.getBankDetails().getAccountNumber());
            existingSeller.getBankDetails().setIfscCode(seller.getBankDetails().getIfscCode());
        }
        if (seller.getPickupAddress() != null && seller.getPickupAddress().getAddress() != null
                && seller.getPickupAddress().getMobile() != null && seller.getPickupAddress().getCity() != null
                && seller.getPickupAddress().getState() != null) {
            existingSeller.getPickupAddress().setAddress(seller.getPickupAddress().getAddress());
            existingSeller.getPickupAddress().setCity(seller.getPickupAddress().getCity());
            existingSeller.getPickupAddress().setState(seller.getPickupAddress().getState());
            existingSeller.getPickupAddress().setMobile(seller.getPickupAddress().getMobile());
            existingSeller.getPickupAddress().setPinCode(seller.getPickupAddress().getPinCode());
        }
        if (seller.getGstin() != null) {
            existingSeller.setGstin(seller.getGstin());
        }
        return sellerRepository.save(existingSeller);
    }

    @Override
    public void deleteSeller(Long id) throws Exception {
        Seller seller = getSellerById(id);
        sellerRepository.delete(seller);
    }

    @Override
    public Seller verifyEmail(String email, String otp) throws Exception {
        Seller seller = getSellerByEmail(email);
        VerificationCode verificationCode = verificationCodeRepository.findByEmail(email);
        if (verificationCode == null || !verificationCode.getOtp().equals(otp)) {
            throw new Exception("Mã OTP không hợp lệ");
        }
        seller.setEmailVerified(true);
        return sellerRepository.save(seller);
    }

    @Override
    public Seller updateSellerAccountStatus(Long sellerId, AccountStatus status) throws Exception {
        Seller seller = getSellerById(sellerId);
        seller.setAccountStatus(status);
        return sellerRepository.save(seller);
    }
}