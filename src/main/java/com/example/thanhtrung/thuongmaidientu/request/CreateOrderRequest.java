package com.example.thanhtrung.thuongmaidientu.request;

import com.example.thanhtrung.thuongmaidientu.modal.Address;
import com.example.thanhtrung.thuongmaidientu.modal.Cart;

import lombok.Data;

@Data
public class CreateOrderRequest {
    private Long userId;
    private Address shippingAddress;
    private Cart cart;
}
