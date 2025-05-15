package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.domain.OrderStatus;
import com.example.thanhtrung.thuongmaidientu.modal.Address;
import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.Order;
import com.example.thanhtrung.thuongmaidientu.modal.User;

import java.util.List;
import java.util.Set;

public interface OrderService {
    Set<Order> createOrder(User user, Address shippingAddress, Cart cart);

    Order findOrderById(long id);

    List<Order> userOrderHistory(Long userId);

    List<Order> sellersOrder(Long sellerId);

    Order updateOrderStatus(Long orderId, OrderStatus orderStatus);

    Order cancelOrder(Long orderId, User user);
}