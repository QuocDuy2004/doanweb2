package com.example.thanhtrung.thuongmaidientu.service.impl;

import org.springframework.stereotype.Service;

import com.example.thanhtrung.thuongmaidientu.modal.CartItem;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.repository.CartitemRepository;
import com.example.thanhtrung.thuongmaidientu.service.CartItemService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CartItemServiceImpl implements CartItemService {
    private final CartitemRepository cartitemRepository;

    @Override
    public CartItem updateCartItem(Long userId, Long id, CartItem cartItem) throws Exception {
        CartItem item = findCartItemById(id);
        User cartItemUser = item.getCart().getUser();
        if (cartItemUser.getId().equals(userId)) {
            // dòng này cập nhật số lượng trước khi cập nhật
            item.setQuantity(cartItem.getQuantity());
            item.setMrpPrice(item.getQuantity() * item.getProduct().getMrpPrice());
            item.setSellingPrice(item.getQuantity() * item.getProduct().getSellingPrice());
            return cartitemRepository.save(item);
        }
        throw new Exception("Bạn Không thể cập nhật CartItem ");

    }

    @Override
    public void removeCartItem(Long userId, Long cartItemId) throws Exception {
        CartItem item = findCartItemById(cartItemId);
        User cartItemUser = item.getCart().getUser();
        if (cartItemUser.getId().equals(userId)) {
            cartitemRepository.delete(item);
        }

        else
            throw new Exception("bạn không có quyền xóa items này ");
    }

    @Override
    public CartItem findCartItemById(Long id) throws Exception {
        return cartitemRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy cart items với id" + id));
    }

}
