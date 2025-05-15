package com.example.thanhtrung.thuongmaidientu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.thanhtrung.thuongmaidientu.modal.OrderItem;

public interface OrderItemrepository extends JpaRepository<OrderItem, Long> {

}
