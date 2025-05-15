package com.example.thanhtrung.thuongmaidientu.service.impl;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Category;
import com.example.thanhtrung.thuongmaidientu.repository.CategoryRepository;
import com.example.thanhtrung.thuongmaidientu.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private static final Logger logger = LoggerFactory.getLogger(CategoryServiceImpl.class);
    private final CategoryRepository categoryRepository;

    @Override
    public Category createCategory(Category category) throws ProductException {
        logger.info("Attempting to create category with categoryId: {}", category.getCategoryId());

        if (category.getCategoryId() == null || category.getCategoryId().isBlank()) {
            throw new ProductException("Category ID must not be null or blank");
        }
        if (categoryRepository.existsByCategoryId(category.getCategoryId())) {
            throw new ProductException("Category ID already exists: " + category.getCategoryId());
        }

        if (category.getName() == null || category.getName().isBlank()) {
            throw new ProductException("Category name must not be blank");
        }

        if (category.getLevel() == null || category.getLevel() < 1 || category.getLevel() > 3) {
            throw new ProductException("Category level must be between 1 and 3");
        }

        Category savedCategory = categoryRepository.save(category);
        logger.info("Category created successfully with ID: {}", savedCategory.getId());
        return savedCategory;
    }

    @Override
    public Category updateCategory(Long categoryId, Category category) throws ProductException {
        logger.info("Attempting to update category with ID: {}", categoryId);

        Category existingCategory = findCategoryById(categoryId);

        if (category.getCategoryId() != null && !category.getCategoryId().isBlank()) {
            if (!category.getCategoryId().equals(existingCategory.getCategoryId()) &&
                categoryRepository.existsByCategoryId(category.getCategoryId())) {
                throw new ProductException("Category ID already exists: " + category.getCategoryId());
            }
            existingCategory.setCategoryId(category.getCategoryId());
        }

        if (category.getName() != null && !category.getName().isBlank()) {
            existingCategory.setName(category.getName());
        }

        if (category.getLevel() != null) {
            if (category.getLevel() < 1 || category.getLevel() > 3) {
                throw new ProductException("Category level must be between 1 and 3");
            }
            existingCategory.setLevel(category.getLevel());
        }

        Category updatedCategory = categoryRepository.save(existingCategory);
        logger.info("Category updated successfully with ID: {}", updatedCategory.getId());
        return updatedCategory;
    }

    @Override
    public void deleteCategory(Long categoryId) throws ProductException {
        logger.info("Attempting to delete category with ID: {}", categoryId);

        Category category = findCategoryById(categoryId);
        categoryRepository.delete(category);
        logger.info("Category deleted successfully with ID: {}", categoryId);
    }

    @Override
    public Category findCategoryById(Long categoryId) throws ProductException {
        return categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ProductException("Category not found with ID: " + categoryId));
    }

    @Override
    public Category findCategoryByCategoryId(String categoryId) throws ProductException {
        if (categoryId == null || categoryId.isBlank()) {
            throw new ProductException("Category ID must not be null or blank");
        }
        return categoryRepository.findByCategoryId(categoryId)
                .orElseThrow(() -> new ProductException("Category not found with category ID: " + categoryId));
    }

    @Override
    public List<Category> findAllCategories() {
        logger.info("Fetching all categories");
        return categoryRepository.findAll();
    }

    @Override
    public Page<Category> getAllCategories(String name, Integer level, String sort, Integer pageNumber) {
        logger.info("Fetching categories with name: {}, level: {}, sort: {}, page: {}", name, level, sort, pageNumber);

        Sort sortOption = Sort.unsorted();
        if (sort != null && !sort.isEmpty()) {
            switch (sort.toLowerCase()) {
                case "name_asc":
                    sortOption = Sort.by(Sort.Direction.ASC, "name");
                    break;
                case "name_desc":
                    sortOption = Sort.by(Sort.Direction.DESC, "name");
                    break;
                case "level_asc":
                    sortOption = Sort.by(Sort.Direction.ASC, "level");
                    break;
                case "level_desc":
                    sortOption = Sort.by(Sort.Direction.DESC, "level");
                    break;
                default:
                    logger.warn("Invalid sort option: {}", sort);
            }
        }

        Pageable pageable = PageRequest.of(pageNumber, 10, sortOption);

        Specification<Category> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (level != null) {
                predicates.add(cb.equal(root.get("level"), level));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return categoryRepository.findAll(spec, pageable);
    }
}