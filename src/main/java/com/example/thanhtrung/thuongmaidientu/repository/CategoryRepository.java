package com.example.thanhtrung.thuongmaidientu.repository;

import com.example.thanhtrung.thuongmaidientu.modal.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByCategoryId(String categoryId);
    Page<Category> findAll(Specification<Category> spec, Pageable pageable);
    boolean existsByCategoryId(String categoryId);
}