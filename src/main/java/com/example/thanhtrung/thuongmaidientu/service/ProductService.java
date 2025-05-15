package com.example.thanhtrung.thuongmaidientu.service;

import java.util.List;

import org.springframework.data.domain.Page;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Product;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.request.CreateProductRequest;
import com.example.thanhtrung.thuongmaidientu.request.UpdateProductRequest;

public interface ProductService {
    public Product createProduct(CreateProductRequest req, Seller seller) throws ProductException;

    public void deleteProduct(Long productId) throws ProductException;

    public Product updateProduct(Long productId, UpdateProductRequest req) throws ProductException;

    Product findProductById(Long productId) throws ProductException;

    List<Product> searchProduct(String query);

    public Page<Product> getAllProducts(
            String category,
            String brand,
            String colors,
            String sizes,
            Integer minPrice,
            Integer maxPrice,
            Integer minDiscount,
            String soft,
            String stock,
            Integer pageNumber);

    List<Product> getProductBySellerId(Long SellerId);
}
