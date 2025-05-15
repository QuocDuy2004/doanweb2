package com.example.thanhtrung.thuongmaidientu.repository;

import com.example.thanhtrung.thuongmaidientu.modal.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
}