package com.example.thanhtrung.thuongmaidientu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.CartItem;
import com.example.thanhtrung.thuongmaidientu.modal.Product;

public interface CartitemRepository extends JpaRepository<CartItem, Long> {
    CartItem findByCartAndProductAndSize(Cart cart, Product product, String size);
}
