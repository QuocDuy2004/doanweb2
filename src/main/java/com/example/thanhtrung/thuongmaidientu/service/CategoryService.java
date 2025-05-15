package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.exceptions.ProductException;
import com.example.thanhtrung.thuongmaidientu.modal.Category;
import org.springframework.data.domain.Page;

import java.util.List;

public interface CategoryService {

    Category findCategoryById(Long categoryId) throws ProductException;

    Category findCategoryByCategoryId(String categoryId) throws ProductException;

    Page<Category> getAllCategories(String name, Integer level, String sort, Integer pageNumber);

    List<Category> findAllCategories();

    Category createCategory(Category category) throws ProductException;

    Category updateCategory(Long categoryId, Category category) throws ProductException;

    void deleteCategory(Long categoryId) throws ProductException;
}