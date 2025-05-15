package com.example.thanhtrung.thuongmaidientu.controller;

import com.example.thanhtrung.thuongmaidientu.domain.OrderStatus;
import com.example.thanhtrung.thuongmaidientu.modal.Address;
import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.Order;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<Set<Order>> createOrder(@RequestBody CreateOrderRequest request) {
        Set<Order> createdOrders = orderService.createOrder(
                request.getUser(),
                request.getShippingAddress(),
                request.getCart());
        return new ResponseEntity<>(createdOrders, HttpStatus.CREATED);
    }

    // Get Order by ID
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        Order order = orderService.findOrderById(id);
        return new ResponseEntity<>(order, HttpStatus.OK);
    }

    // Get User Order History
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getUserOrderHistory(@PathVariable Long userId) {
        List<Order> orders = orderService.userOrderHistory(userId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    // Get Seller Orders
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<Order>> getSellerOrders(@PathVariable Long sellerId) {
        List<Order> orders = orderService.sellersOrder(sellerId);
        return new ResponseEntity<>(orders, HttpStatus.OK);
    }

    // Update Order Status
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long id, @RequestBody OrderStatus orderStatus) {
        Order updatedOrder = orderService.updateOrderStatus(id, orderStatus);
        return new ResponseEntity<>(updatedOrder, HttpStatus.OK);
    }

    // Cancel Order
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id, @RequestBody User user) {
        Order cancelledOrder = orderService.cancelOrder(id, user);
        return new ResponseEntity<>(cancelledOrder, HttpStatus.OK);
    }
}

// Helper class for create order request
class CreateOrderRequest {
    private User user;
    private Address shippingAddress;
    private Cart cart;

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Address getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(Address shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }
}