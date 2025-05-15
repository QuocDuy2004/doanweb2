package com.example.thanhtrung.thuongmaidientu.service.impl;

import com.example.thanhtrung.thuongmaidientu.modal.OrderItem;
import com.example.thanhtrung.thuongmaidientu.repository.OrderItemrepository;
import com.example.thanhtrung.thuongmaidientu.service.OrderItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
@Service
public class OrderItemServiceImpl implements OrderItemService {

    @Autowired
    private OrderItemrepository orderItemRepository;

    @Override
    public OrderItem createOrderItem(OrderItem orderItem) {
        return orderItemRepository.save(orderItem);
    }

    @Override
    public OrderItem getOrderItemById(Long id) {
        return orderItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("OrderItem not found with id: " + id));
    }

    @Override
    public List<OrderItem> getAllOrderItems() {
        return orderItemRepository.findAll();
    }

    @Override
    public OrderItem updateOrderItem(Long id, OrderItem orderItem) {
        OrderItem existingOrderItem = getOrderItemById(id);
        existingOrderItem.setOrder(orderItem.getOrder());
        existingOrderItem.setProduct(orderItem.getProduct());
        existingOrderItem.setSize(orderItem.getSize());
        existingOrderItem.setQuantity(orderItem.getQuantity());
        existingOrderItem.setMrpPrice(orderItem.getMrpPrice());
        existingOrderItem.setSellingPrice(orderItem.getSellingPrice());
        existingOrderItem.setUserId(orderItem.getUserId());
        return orderItemRepository.save(existingOrderItem);
    }

    @Override
    public void deleteOrderItem(Long id) {
        Optional<OrderItem> orderItemOptional = orderItemRepository.findById(id);
        if (orderItemOptional.isPresent()) {
            orderItemRepository.delete(orderItemOptional.get());
        } else {
            throw new RuntimeException("OrderItem không tồn tại");
        }
    }
}