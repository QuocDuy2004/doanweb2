package com.example.thanhtrung.thuongmaidientu.controller;

import org.springframework.web.bind.annotation.RestController;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/users/profile")
    public ResponseEntity<User> getUserProfileHandler(
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByJwtToken(jwt);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<User> getUserByIdHandler(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsersHandler(
            @RequestHeader("Authorization") String jwt) throws Exception {
        List<User> users = userService.findAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/email/{email}")
    public ResponseEntity<User> getUserByEmailHandler(
            @PathVariable String email,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/users/profile")
    public ResponseEntity<User> updateUserProfileHandler(
            @RequestBody User updatedUser,
            @RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.updateUser(updatedUser, jwt);
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUserHandler(
            @PathVariable Long id,
            @RequestHeader("Authorization") String jwt) throws Exception {
        userService.deleteUser(id, jwt);
        return ResponseEntity.noContent().build();
    }
}