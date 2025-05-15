package com.example.thanhtrung.thuongmaidientu.controller;

import com.example.thanhtrung.thuongmaidientu.modal.OrderItem;
import com.example.thanhtrung.thuongmaidientu.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
@RestController
@RequestMapping("/api/order-items")
public class OrderItemController {

    @Autowired
    private OrderItemService orderItemService;

    // Create OrderItem
    @PostMapping
    public ResponseEntity<OrderItem> createOrderItem(@RequestBody OrderItem orderItem) {
        OrderItem createdOrderItem = orderItemService.createOrderItem(orderItem);
        return new ResponseEntity<>(createdOrderItem, HttpStatus.CREATED);
    }

    // Get OrderItem by ID
    @GetMapping("/{id}")
    public ResponseEntity<OrderItem> getOrderItemById(@PathVariable Long id) {
        OrderItem orderItem = orderItemService.getOrderItemById(id);
        return new ResponseEntity<>(orderItem, HttpStatus.OK);
    }

    // Get all OrderItems
    @GetMapping
    public ResponseEntity<List<OrderItem>> getAllOrderItems() {
        List<OrderItem> orderItems = orderItemService.getAllOrderItems();
        return new ResponseEntity<>(orderItems, HttpStatus.OK);
    }

    // Update OrderItem
    @PutMapping("/{id}")
    public ResponseEntity<OrderItem> updateOrderItem(@PathVariable Long id, @RequestBody OrderItem orderItem) {
        OrderItem updatedOrderItem = orderItemService.updateOrderItem(id, orderItem);
        return new ResponseEntity<>(updatedOrderItem, HttpStatus.OK);
    }

    // Delete OrderItem
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteOrderItem(@PathVariable Long id) {
        try {
            orderItemService.deleteOrderItem(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Xóa thành công");
            return new ResponseEntity<>(response, HttpStatus.OK);
        } catch (RuntimeException e) {
            Map<String, String> response = new HashMap<>();
            response.put("message", e.getMessage());
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }
}