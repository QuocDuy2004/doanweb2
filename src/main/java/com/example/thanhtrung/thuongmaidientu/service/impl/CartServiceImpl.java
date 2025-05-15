package com.example.thanhtrung.thuongmaidientu.service.impl;

import org.springframework.stereotype.Service;

import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.CartItem;
import com.example.thanhtrung.thuongmaidientu.modal.Product;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.repository.CartRepository;
import com.example.thanhtrung.thuongmaidientu.repository.CartitemRepository;
import com.example.thanhtrung.thuongmaidientu.service.CartService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {
    private final CartRepository cartRepository;
    private final CartitemRepository cartitemRepository;

    @Override
    public CartItem addCartItem(User user, Product product, String size, int quantity) {

        Cart cart = findUserCart(user);

        CartItem isPresent = cartitemRepository.findByCartAndProductAndSize(cart, product, size);
        if (isPresent == null) {
            CartItem cartItem = new CartItem();
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItem.setUserId(user.getId());
            cartItem.setSize(size);
            int totalPrice = quantity * product.getSellingPrice();
            cartItem.setSellingPrice(totalPrice);
            cartItem.setMrpPrice(quantity * product.getMrpPrice());
            cart.getCartItems().add(cartItem);
            cartItem.setCart(cart);
            return cartitemRepository.save(cartItem);
        }
        return isPresent;
    }

    @Override
    public Cart findUserCart(User user) {
        Cart cart = cartRepository.findByUserId(user.getId());
        if (cart == null) {
            throw new RuntimeException("Giỏ hàng chưa được tạo cho người dùng này.");
        }
        int totalPrice = 0;
        int totalDiscountedPrice = 0;
        int totalItem = 0;
        for (CartItem cartItem : cart.getCartItems()) {
            totalPrice += cartItem.getMrpPrice();
            totalDiscountedPrice += cartItem.getSellingPrice();
            totalItem += cartItem.getQuantity();
        }
        cart.setTotalMrPrice(totalPrice);
        cart.setTotalItems(totalItem);
        cart.setTotalSellingPrice(totalDiscountedPrice);
        cart.setDiscount(caculateDiscountPercentage(totalPrice, totalDiscountedPrice));
        cart.setTotalItems(totalItem);
        return cart;
    }

    private int caculateDiscountPercentage(int mrpPrice, int sellingPrice) {
        if (mrpPrice <= 0) {
            return 0;
        }
        double discount = mrpPrice - sellingPrice;
        double discountPercentage = (discount / mrpPrice) * 100;

        return (int) discountPercentage;
    }

}
