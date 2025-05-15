package com.example.thanhtrung.thuongmaidientu.response;

import com.example.thanhtrung.thuongmaidientu.modal.Seller;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellerAuthResponse {
    private String jwt;
    private Seller seller;
    private String message;
}