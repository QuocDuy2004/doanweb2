package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.CartItem;
import com.example.thanhtrung.thuongmaidientu.modal.Product;
import com.example.thanhtrung.thuongmaidientu.modal.User;

public interface CartService {
    public CartItem addCartItem(
            User user,
            Product product,
            String size,
            int quantity);

    public Cart findUserCart(User user);
}
