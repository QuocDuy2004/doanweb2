package com.example.thanhtrung.thuongmaidientu.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Cart;
import com.example.thanhtrung.thuongmaidientu.modal.CartItem;
import com.example.thanhtrung.thuongmaidientu.modal.Product;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.request.AddItemResquest;
import com.example.thanhtrung.thuongmaidientu.response.ApiResponse;
import com.example.thanhtrung.thuongmaidientu.service.CartItemService;
import com.example.thanhtrung.thuongmaidientu.service.CartService;
import com.example.thanhtrung.thuongmaidientu.service.ProductService;
import com.example.thanhtrung.thuongmaidientu.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/cart")
public class CartController {
    private final CartService cartService;
    private final CartItemService cartItemService;
    private final UserService userService;
    private final ProductService productService;

    @GetMapping
    public ResponseEntity<Cart> findUserCartHandler(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        Cart cart = cartService.findUserCart(user);

        return new ResponseEntity<Cart>(cart, HttpStatus.OK);
    }

    @PutMapping("/add")
    public ResponseEntity<CartItem> addItemToCart(@RequestBody AddItemResquest req,
            @RequestHeader("Authorization") String jwt) throws ProductException, Exception {
        User user = userService.findUserByJwtToken(jwt);
        Product product = productService.findProductById(req.getProductId());

        CartItem item = cartService.addCartItem(user, product, req.getSize(), req.getQuantity());
        ApiResponse res = new ApiResponse();
        res.setMessage("thêm thành công vào Cart");

        return new ResponseEntity<>(item, HttpStatus.ACCEPTED);
    }

    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<ApiResponse> deleteCartItemHandler(@PathVariable Long cartItemId,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        cartItemService.removeCartItem(user.getId(), cartItemId);
        ApiResponse res = new ApiResponse();
        res.setMessage("Đã xóa sản phẩm khỏi giỏ hàng");
        return new ResponseEntity<>(res, HttpStatus.ACCEPTED);
    }

    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<CartItem> updateCartItemHandler(@PathVariable Long cartItemId, @RequestBody CartItem cartItem,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        CartItem updatedCartItem = null;
        if (cartItem.getQuantity() > 0) {
            updatedCartItem = cartItemService.updateCartItem(user.getId(), cartItemId, cartItem);

        }
        return new ResponseEntity<>(updatedCartItem, HttpStatus.ACCEPTED);
    }

}
