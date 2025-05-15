package com.example.thanhtrung.thuongmaidientu.service;

import com.example.thanhtrung.thuongmaidientu.modal.User;

import java.util.List;

public interface UserService {
    User findUserByJwtToken(String jwt) throws Exception;
    User findUserByEmail(String email) throws Exception;
    User findUserById(Long id) throws Exception;
    List<User> findAllUsers() throws Exception;
    User updateUser(User user, String jwt) throws Exception;
    void deleteUser(Long id, String jwt) throws Exception;
}