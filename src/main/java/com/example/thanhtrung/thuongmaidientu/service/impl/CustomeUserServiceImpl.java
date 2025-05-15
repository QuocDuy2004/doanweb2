package com.example.thanhtrung.thuongmaidientu.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.repository.SellerRepository;
import com.example.thanhtrung.thuongmaidientu.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Service
public class CustomeUserServiceImpl implements UserDetailsService {
    private final UserRepository userRepository;
    private final SellerRepository sellerRepository;
    private static final String SELLER_PREFIX = "seller_";

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username.startsWith(SELLER_PREFIX)) {
            String actualUsername = username.substring(SELLER_PREFIX.length());
            Seller seller = sellerRepository.findByEmail(actualUsername);

            if (seller != null) {
                return buildUserDetail(seller.getEmail(), seller.getPassword(), seller.getRole());
            }
        } else {
            User user = userRepository.findByEmail(username);
            if (user != null) {
                return buildUserDetail(user.getEmail(), user.getPassword(), user.getRole());
            }
        }
        throw new UsernameNotFoundException("không tìm thấy người dùng hoặc người bán có email:" + username);
    }

    private UserDetails buildUserDetail(String email, String password, USER_ROLE role) {
        if (role == null)
            role = USER_ROLE.ROLE_CUSTOMER;

        List<GrantedAuthority> authorityList = new ArrayList<>();
        // role.tostring() tránh bị cắt chuỗi
        authorityList.add(new SimpleGrantedAuthority(role.toString()));
        return new org.springframework.security.core.userdetails.User(email, password, authorityList);
    }

}
