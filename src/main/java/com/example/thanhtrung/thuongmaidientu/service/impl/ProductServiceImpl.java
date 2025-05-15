package com.example.thanhtrung.thuongmaidientu.service.impl;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Category;
import com.example.thanhtrung.thuongmaidientu.modal.Product;
import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import com.example.thanhtrung.thuongmaidientu.repository.CategoryRepository;
import com.example.thanhtrung.thuongmaidientu.repository.ProductRepository;
import com.example.thanhtrung.thuongmaidientu.request.CreateProductRequest;
import com.example.thanhtrung.thuongmaidientu.request.UpdateProductRequest;
import com.example.thanhtrung.thuongmaidientu.service.ProductService;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private static final Logger logger = LoggerFactory.getLogger(ProductServiceImpl.class);
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public Product createProduct(CreateProductRequest req, Seller seller) throws ProductException {
        validateCreateProductRequest(req);

        // Handle category
        Category category = getOrCreateCategory(req.getCategory(), 3); // Assuming level 3 for consistency

        // Create product
        Product product = new Product();
        product.setSeller(seller);
        product.setCategory(category);
        product.setDescription(req.getDescription());
        product.setCreatedAt(LocalDateTime.now());
        product.setTitle(req.getTitle());
        product.setColor(req.getColors());
        product.setSellingPrice(req.getSellingPrice());
        product.setImages(req.getImages() != null ? req.getImages() : new ArrayList<>());
        product.setMrpPrice(req.getMrpPrice());
        product.setSizes(req.getSizes());
        product.setDiscountPercent(calculateDiscountPercentage(req.getMrpPrice(), req.getSellingPrice()));
        product.setQuantity(req.getQuantity());

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public Product updateProduct(Long productId, UpdateProductRequest req) throws ProductException {
        validateUpdateProductRequest(req);

        Product product = findProductById(productId);

        // Handle category
        Category category = getOrCreateCategory(req.getCategory(), 3);

        // Update product fields
        product.setTitle(req.getTitle());
        product.setDescription(req.getDescription());
        product.setMrpPrice(req.getMrpPrice());
        product.setSellingPrice(req.getSellingPrice());
        product.setDiscountPercent(calculateDiscountPercentage(req.getMrpPrice(), req.getSellingPrice()));
        product.setQuantity(req.getQuantity());
        product.setColor(req.getColors());
        product.setCategory(category);
        product.setSizes(req.getSizes());
        product.setImages(req.getImages() != null ? req.getImages() : product.getImages());

        return productRepository.save(product);
    }

    @Override
    @Transactional
    public void deleteProduct(Long productId) throws ProductException {
        Product product = findProductById(productId);
        productRepository.delete(product);
        logger.info("Deleted product with ID: {}", productId);
    }

    @Override
    public Product findProductById(Long productId) throws ProductException {
        return productRepository.findById(productId)
                .orElseThrow(() -> new ProductException("Sản phẩm không tồn tại với ID: " + productId));
    }

    @Override
    public List<Product> searchProduct(String query) {
        return productRepository.searchProduct(query);
    }

    @Override
    public Page<Product> getAllProducts(String category, String brand, String colors, String sizes, Integer minPrice,
            Integer maxPrice, Integer minDiscount, String sort, String stock, Integer pageNumber) {
        Specification<Product> spec = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (category != null) {
                Join<Product, Category> categoryJoin = root.join("category");
                predicates.add(criteriaBuilder.equal(categoryJoin.get("categoryId"), category));
            }
            if (colors != null && !colors.isEmpty()) {
                predicates.add(root.get("color").in(colors.split(",")));
            }
            if (sizes != null && !sizes.isEmpty()) {
                predicates.add(root.get("sizes").in(sizes.split(",")));
            }
            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("sellingPrice"), minPrice));
            }
            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("sellingPrice"), maxPrice));
            }
            if (minDiscount != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("discountPercent"), minDiscount));
            }
            if (stock != null) {
                predicates.add(criteriaBuilder.equal(root.get("quantity"), stock));
            }
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

        Pageable pageable;
        if (sort != null && !sort.isEmpty()) {
            switch (sort) {
                case "price_low":
                    pageable = PageRequest.of(pageNumber != null ? pageNumber : 0, 10,
                            Sort.by("sellingPrice").ascending());
                    break;
                case "price_high":
                    pageable = PageRequest.of(pageNumber != null ? pageNumber : 0, 10,
                            Sort.by("sellingPrice").descending());
                    break;
                default:
                    pageable = PageRequest.of(pageNumber != null ? pageNumber : 0, 10, Sort.unsorted());
            }
        } else {
            pageable = PageRequest.of(pageNumber != null ? pageNumber : 0, 10, Sort.unsorted());
        }

        return productRepository.findAll(spec, pageable);
    }

    @Override
    public List<Product> getProductBySellerId(Long sellerId) {
        return productRepository.findBySellerId(sellerId);
    }

    private void validateCreateProductRequest(CreateProductRequest req) throws ProductException {
        if (req == null) {
            throw new ProductException("Yêu cầu tạo sản phẩm không được null");
        }
        if (isBlank(req.getCategory())) {
            logger.warn("Missing category field");
            throw new ProductException("Trường danh mục (category) không được để trống");
        }
        if (isBlank(req.getTitle())) {
            logger.warn("Missing title field");
            throw new ProductException("Tiêu đề sản phẩm không được để trống");
        }
        if (req.getMrpPrice() <= 0) {
            throw new ProductException("Giá gốc phải lớn hơn 0");
        }
        if (req.getSellingPrice() <= 0) {
            throw new ProductException("Giá bán phải lớn hơn 0");
        }
        if (req.getQuantity() < 0) {
            throw new ProductException("Số lượng không được nhỏ hơn 0");
        }
        if (req.getDiscountPercent() < 0) {
            throw new ProductException("Giảm giá không được nhỏ hơn 0");
        }
    }

    private void validateUpdateProductRequest(UpdateProductRequest req) throws ProductException {
        if (req == null) {
            throw new ProductException("Yêu cầu cập nhật sản phẩm không được null");
        }
        if (isBlank(req.getCategory())) {
            logger.warn("Missing category field");
            throw new ProductException("Trường danh mục (category) không được để trống");
        }
        if (isBlank(req.getTitle())) {
            logger.warn("Missing title field");
            throw new ProductException("Tiêu đề sản phẩm không được để trống");
        }
        if (req.getMrpPrice() <= 0) {
            throw new ProductException("Giá gốc phải lớn hơn 0");
        }
        if (req.getSellingPrice() <= 0) {
            throw new ProductException("Giá bán phải lớn hơn 0");
        }
        if (req.getQuantity() < 0) {
            throw new ProductException("Số lượng không được nhỏ hơn 0");
        }
        if (req.getDiscountPercent() < 0) {
            throw new ProductException("Giảm giá không được nhỏ hơn 0");
        }
    }

    private Category getOrCreateCategory(String categoryId, int level) throws ProductException {
        if (isBlank(categoryId)) {
            throw new ProductException("Category ID cannot be blank");
        }
        return categoryRepository.findByCategoryId(categoryId)
                .orElseGet(() -> {
                    Category category = new Category();
                    category.setCategoryId(categoryId);
                    category.setName(categoryId);
                    category.setLevel(level);
                    return categoryRepository.save(category);
                });
    }

    private int calculateDiscountPercentage(int mrpPrice, int sellingPrice) {
        if (mrpPrice <= 0) {
            throw new IllegalArgumentException("Giá gốc phải lớn hơn 0");
        }
        double discount = mrpPrice - sellingPrice;
        double discountPercentage = (discount / mrpPrice) * 100;
        return (int) discountPercentage;
    }

    private boolean isBlank(String str) {
        return str == null || str.trim().isEmpty();
    }
}