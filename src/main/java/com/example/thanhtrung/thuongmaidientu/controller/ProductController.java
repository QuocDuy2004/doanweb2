package com.example.thanhtrung.thuongmaidientu.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Product;
import com.example.thanhtrung.thuongmaidientu.service.ProductService;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequiredArgsConstructor
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;

    @GetMapping("/{productId}")
    public ResponseEntity<Product> getProductById(@PathVariable Long productId) throws ProductException {
        Product product = productService.findProductById(productId);
        return new ResponseEntity<>(product, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Product>> searchProduct(@RequestParam(required = false) String query)
            throws ProductException {
        List<Product> products = productService.searchProduct(query);
        return new ResponseEntity<>(products, HttpStatus.OK);
    }

    @GetMapping
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) String colors,
            @RequestParam(required = false) String size,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) Integer minDiscount,
            @RequestParam(required = false) String soft,
            @RequestParam(required = false) String stock,
            @RequestParam(defaultValue = "0") Integer pageNumber) {
        System.out.println("color o------" + pageNumber);
        return new ResponseEntity<>(
                productService.getAllProducts(category, brand, colors, size, minPrice, maxPrice, minDiscount, soft,
                        stock,
                        pageNumber),
                HttpStatus.OK);

    }

}
