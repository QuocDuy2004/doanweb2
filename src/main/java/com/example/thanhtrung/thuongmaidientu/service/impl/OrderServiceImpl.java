package com.example.thanhtrung.thuongmaidientu.service.impl;

import com.example.thanhtrung.thuongmaidientu.domain.OrderStatus;
import com.example.thanhtrung.thuongmaidientu.domain.PaymentStatus;
import com.example.thanhtrung.thuongmaidientu.modal.Address;
import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.CartItem;
import com.example.thanhtrung.thuongmaidientu.modal.Order;
import com.example.thanhtrung.thuongmaidientu.modal.OrderItem;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.repository.AddressRepository;
import com.example.thanhtrung.thuongmaidientu.repository.OrderItemrepository;
import com.example.thanhtrung.thuongmaidientu.repository.OrderRepository;
import com.example.thanhtrung.thuongmaidientu.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final AddressRepository addressRepository;
    private final OrderItemrepository orderItemRepository;

    @Override
    public Set<Order> createOrder(User user, Address shippingAddress, Cart cart) {
        Address address = addressRepository.save(shippingAddress);
        Map<Long, List<CartItem>> itemsBySeller = cart.getCartItems().stream()
                .collect(Collectors.groupingBy(item -> item.getProduct().getSeller().getId()));

        Set<Order> orders = new HashSet<>();
        for (Map.Entry<Long, List<CartItem>> entry : itemsBySeller.entrySet()) {
            Long sellerId = entry.getKey();
            List<CartItem> items = entry.getValue();
            int totalOrderPrice = items.stream()
                    .mapToInt(cartItem -> cartItem.getSellingPrice() * cartItem.getQuantity()).sum();
            int totalItem = items.stream().mapToInt(CartItem::getQuantity).sum();
            Order createdOrder = new Order();
            createdOrder.setUser(user);
            createdOrder.setSellerId(sellerId);
            createdOrder.setTotalMrpPrice(totalOrderPrice);
            createdOrder.setTotalSellingPrice(totalOrderPrice);
            createdOrder.setTotalItem(totalItem);
            createdOrder.setShippingAddress(address);
            createdOrder.setOrderStatus(com.example.thanhtrung.thuongmaidientu.modal.OrderStatus.PENDING);
            createdOrder.getPaymentDetails().setStatus(PaymentStatus.PENDING);
            Order savedOrder = orderRepository.save(createdOrder);
            orders.add(savedOrder);

            List<OrderItem> orderItems = new ArrayList<>();
            for (CartItem item : items) {
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(savedOrder);
                orderItem.setMrpPrice(item.getMrpPrice());
                orderItem.setProduct(item.getProduct());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setSize(item.getSize());
                orderItem.setUserId(item.getUserId());
                orderItem.setSellingPrice(item.getSellingPrice());
                savedOrder.getOrderItems().add(orderItem);
                OrderItem savedOrderItem = orderItemRepository.save(orderItem);
                orderItems.add(savedOrderItem);
            }
        }

        return orders;
    }

    @Override
    public Order findOrderById(long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));
    }

    @Override
    public List<Order> userOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    public List<Order> sellersOrder(Long sellerId) {
        return orderRepository.findBySellerId(sellerId);
    }

    @Override
    public Order updateOrderStatus(Long orderId, OrderStatus orderStatus) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'updateOrderStatus'");
    }

    @Override
    public Order cancelOrder(Long orderId, User user) {
        // TODO Auto-generated method stub
        throw new UnsupportedOperationException("Unimplemented method 'cancelOrder'");
    }
}