package com.example.thanhtrung.thuongmaidientu.service.impl;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.thanhtrung.thuongmaidientu.config.JwtProvider;
import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.modal.VerificationCode;
import com.example.thanhtrung.thuongmaidientu.repository.CartRepository;
import com.example.thanhtrung.thuongmaidientu.repository.SellerRepository;
import com.example.thanhtrung.thuongmaidientu.repository.UserRepository;
import com.example.thanhtrung.thuongmaidientu.repository.VerificationCodeRepository;
import com.example.thanhtrung.thuongmaidientu.request.LoginRequest;
import com.example.thanhtrung.thuongmaidientu.response.AuthResponse;
import com.example.thanhtrung.thuongmaidientu.response.SignupRequest;
import com.example.thanhtrung.thuongmaidientu.service.AuthService;
import com.example.thanhtrung.thuongmaidientu.service.EmailService;
import com.example.thanhtrung.thuongmaidientu.utils.OtpUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final CartRepository cartRepository;
    private final JwtProvider jwtProvider;
    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final CustomeUserServiceImpl customeUserService;
    private final SellerRepository sellerRepository;

    @Override
    public void sentLoginOtp(String email, USER_ROLE role) throws Exception {
        if (role.equals(USER_ROLE.ROLE_SELLER)) {
            Seller seller = sellerRepository.findByEmail(email);
            if (seller == null) {
                throw new Exception("Không tìm thấy người bán");
            }
        } else {
            User user = userRepository.findByEmail(email);
            if (user == null) {
                throw new Exception("Người dùng không tồn tại với email bạn cung cấp");
            }
        }

        VerificationCode isExist = verificationCodeRepository.findByEmail(email);
        if (isExist != null) {
            verificationCodeRepository.delete(isExist);
        }

        String otp = OtpUtil.generateOtp();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(email);
        verificationCodeRepository.save(verificationCode);

        String subject = "Đăng nhập qua OTP";
        String text = "Mã OTP để đăng nhập của bạn là: " + otp;
        emailService.sendVerificationOtpEmail(email, otp, subject, text);
    }

    @Override
    public void sentSignupOtp(String email, USER_ROLE role) throws Exception {
        if (role.equals(USER_ROLE.ROLE_SELLER)) {
            Seller seller = sellerRepository.findByEmail(email);
            if (seller != null) {
                throw new Exception("Email đã được sử dụng bởi một người bán khác");
            }
        } else {
            User user = userRepository.findByEmail(email);
            if (user != null) {
                throw new Exception("Email đã được sử dụng bởi một người dùng khác");
            }
        }

        VerificationCode isExist = verificationCodeRepository.findByEmail(email);
        if (isExist != null) {
            verificationCodeRepository.delete(isExist);
        }

        String otp = OtpUtil.generateOtp();
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setOtp(otp);
        verificationCode.setEmail(email);
        verificationCodeRepository.save(verificationCode);

        String subject = "Xác minh OTP để đăng ký";
        String text = "Mã OTP để đăng ký của bạn là: " + otp;
        emailService.sendVerificationOtpEmail(email, otp, subject, text);
    }

    @Override
    @Transactional
    public String createUser(SignupRequest req) throws Exception {
        VerificationCode verificationCode = verificationCodeRepository.findByEmail(req.getEmail());

        if (verificationCode == null || !verificationCode.getOtp().equals(req.getOtp())) {
            throw new Exception("Mã OTP sai hoặc đã hết hạn");
        }

        User user = userRepository.findByEmail(req.getEmail());
        if (user != null) {
            throw new Exception("Người dùng đã tồn tại với email: " + req.getEmail());
        }

        User createdUser = new User();
        createdUser.setEmail(req.getEmail());
        createdUser.setFullName(req.getFullname());
        createdUser.setRole(USER_ROLE.ROLE_CUSTOMER);
        createdUser.setMobile("0379263053"); // Consider making this configurable
        createdUser.setPassword(passwordEncoder.encode(req.getOtp()));
        user = userRepository.save(createdUser);

        // Kiểm tra và tạo Cart
        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setTotalItems(0);
            cart.setTotalSellingPrice(0);
            cart.setTotalMrPrice(0);
            cart.setDiscount(0);
            cartRepository.save(cart);
        }

        List<GrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority(USER_ROLE.ROLE_CUSTOMER.toString()));

        Authentication authentication = new UsernamePasswordAuthenticationToken(req.getEmail(), null, authorities);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtProvider.generateToken(authentication);
    }

    @Override
    public AuthResponse verifyLogin(LoginRequest req) throws Exception {
        if (req.getEmail() == null || req.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email không được để trống");
        }
        if (req.getOtp() == null || req.getOtp().trim().isEmpty()) {
            throw new IllegalArgumentException("OTP không được để trống");
        }

        String username = req.getEmail();
        String otp = req.getOtp();

        Authentication authentication = authenticate(username, otp);
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = jwtProvider.generateToken(authentication);

        User user = userRepository.findByEmail(username);
        Cart cart = cartRepository.findByUser(user);
        if (cart == null) {
            cart = new Cart();
            cart.setUser(user);
            cart.setTotalItems(0);
            cart.setTotalSellingPrice(0);
            cart.setTotalMrPrice(0);
            cart.setDiscount(0);
            cartRepository.save(cart);
        }

        AuthResponse authResponse = new AuthResponse();
        authResponse.setJwt(token);
        authResponse.setMessage("Đăng nhập thành công");

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        String roleName = authorities.isEmpty() ? null : authorities.iterator().next().getAuthority();
        authResponse.setRole(USER_ROLE.valueOf(roleName));
        return authResponse;
    }

    private Authentication authenticate(String username, String otp) throws Exception {
        UserDetails userDetails = customeUserService.loadUserByUsername(username);
        if (userDetails == null) {
            throw new BadCredentialsException("Tài khoản không tồn tại hoặc thông tin xác thực không hợp lệ");
        }

        VerificationCode verificationCode = verificationCodeRepository.findByEmail(username);
        if (verificationCode == null || !verificationCode.getOtp().equals(otp)) {
            throw new Exception("Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}