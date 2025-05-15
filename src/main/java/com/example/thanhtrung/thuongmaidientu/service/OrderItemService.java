package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.modal.OrderItem;

import java.util.List;

public interface OrderItemService {

    OrderItem createOrderItem(OrderItem orderItem);

    OrderItem getOrderItemById(Long id);

    List<OrderItem> getAllOrderItems();

    OrderItem updateOrderItem(Long id, OrderItem orderItem);

    void deleteOrderItem(Long id);
}