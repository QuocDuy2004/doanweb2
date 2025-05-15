package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.modal.CartItem;

public interface CartItemService {
    CartItem updateCartItem(Long userId, Long id, CartItem cart) throws Exception;

    void removeCartItem(Long userId, Long cartItemId) throws Exception;

    CartItem findCartItemById(Long id) throws Exception;

}
