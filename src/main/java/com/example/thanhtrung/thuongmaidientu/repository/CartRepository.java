package com.example.thanhtrung.thuongmaidientu.repository;

import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.User;

import org.springframework.data.jpa.repository.JpaRepository;


public interface CartRepository extends JpaRepository<Cart, Long> {
    Cart findByUserId(Long id);

    Cart findByUser(User user);
}