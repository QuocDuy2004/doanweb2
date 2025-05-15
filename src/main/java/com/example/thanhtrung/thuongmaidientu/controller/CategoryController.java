package com.example.thanhtrung.thuongmaidientu.controller;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Category;
import com.example.thanhtrung.thuongmaidientu.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/categories")
public class CategoryController {

    private static final Logger logger = LoggerFactory.getLogger(CategoryController.class);
    private final CategoryService categoryService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable("id") Long categoryId) {
        try {
            logger.info("Fetching category with ID: {}", categoryId);
            Category category = categoryService.findCategoryById(categoryId);
            return ResponseEntity.ok(category);
        } catch (ProductException e) {
            logger.error("Error fetching category with ID: {}. Error: {}", categoryId, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/by-category-id/{categoryId}")
    public ResponseEntity<?> getCategoryByCategoryId(@PathVariable String categoryId) {
        try {
            logger.info("Fetching category with categoryId: {}", categoryId);
            Category category = categoryService.findCategoryByCategoryId(categoryId);
            return ResponseEntity.ok(category);
        } catch (ProductException e) {
            logger.error("Error fetching category with categoryId: {}. Error: {}", categoryId, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping
    public ResponseEntity<Page<Category>> getAllCategories(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer level,
            @RequestParam(required = false) String sort,
            @RequestParam(defaultValue = "0") Integer pageNumber) {
        logger.info("Fetching all categories with name: {}, level: {}, sort: {}, page: {}", name, level, sort, pageNumber);
        return ResponseEntity.ok(categoryService.getAllCategories(name, level, sort, pageNumber));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Category>> getAllCategoriesSimple() {
        logger.info("Fetching all categories (simple)");
        return ResponseEntity.ok(categoryService.findAllCategories());
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@Valid @RequestBody Category category) {
        try {
            logger.info("Creating new category with categoryId: {}", category.getCategoryId());
            Category createdCategory = categoryService.createCategory(category);
            return new ResponseEntity<>(createdCategory, HttpStatus.CREATED);
        } catch (ProductException e) {
            logger.error("Error creating category: {}", e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable("id") Long categoryId,
            @Valid @RequestBody Category category) {
        try {
            logger.info("Updating category with ID: {}", categoryId);
            Category updatedCategory = categoryService.updateCategory(categoryId, category);
            return ResponseEntity.ok(updatedCategory);
        } catch (ProductException e) {
            logger.error("Error updating category with ID: {}. Error: {}", categoryId, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable("id") Long categoryId) {
        try {
            logger.info("Deleting category with ID: {}", categoryId);
            categoryService.deleteCategory(categoryId);
            return ResponseEntity.noContent().build();
        } catch (ProductException e) {
            logger.error("Error deleting category with ID: {}. Error: {}", categoryId, e.getMessage());
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }
}