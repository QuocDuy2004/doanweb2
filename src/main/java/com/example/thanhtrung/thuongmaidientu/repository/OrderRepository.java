package com.example.thanhtrung.thuongmaidientu.repository;

import com.example.thanhtrung.thuongmaidientu.modal.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserId(Long userId);

    List<Order> findBySellerId(Long sellerId);
}