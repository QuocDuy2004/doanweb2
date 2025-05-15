package com.example.thanhtrung.thuongmaidientu.service.impl;

import org.springframework.stereotype.Service;

import com.example.thanhtrung.thuongmaidientu.config.JwtProvider;
import com.example.thanhtrung.thuongmaidientu.domain.USER_ROLE;
import com.example.thanhtrung.thuongmaidientu.modal.User;
import com.example.thanhtrung.thuongmaidientu.modal.Address;
import com.example.thanhtrung.thuongmaidientu.repository.UserRepository;
import com.example.thanhtrung.thuongmaidientu.repository.AddressRepository;
import com.example.thanhtrung.thuongmaidientu.service.UserService;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final AddressRepository addressRepository;
    private final JwtProvider jwtProvider;

    @Override
    public User findUserByJwtToken(String jwt) throws Exception {
        String email = jwtProvider.getEmailFromJwtToken(jwt);
        User user = this.findUserByEmail(email);

        if (user == null) {
            throw new Exception("Không tìm thấy người dùng với email bạn cung cấp: " + email);
        }
        return user;
    }

    @Override
    public User findUserByEmail(String email) throws Exception {
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new Exception("Không tìm thấy người dùng qua email: " + email);
        }
        return user;
    }

    @Override
    public User findUserById(Long id) throws Exception {
        return userRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy người dùng với ID: " + id));
    }

    @Override
    public List<User> findAllUsers() throws Exception {
        List<User> users = userRepository.findAll();
        if (users.isEmpty()) {
            throw new Exception("Không tìm thấy người dùng nào trong hệ thống.");
        }
        return users;
    }

    @Override
    public User updateUser(User updatedUser, String jwt) throws Exception {
        // Xác thực người dùng từ JWT
        User currentUser = findUserByJwtToken(jwt);

        // Kiểm tra dữ liệu đầu vào
        if (updatedUser.getFullName() == null || updatedUser.getFullName().isBlank()) {
            throw new Exception("Họ tên không được để trống");
        }
        if (updatedUser.getEmail() == null || updatedUser.getEmail().isBlank()) {
            throw new Exception("Email không được để trống");
        }
        if (updatedUser.getMobile() == null || updatedUser.getMobile().isBlank()) {
            throw new Exception("Số điện thoại không được để trống");
        }
        if (!updatedUser.getMobile().matches("^\\d{10}$")) {
            throw new Exception("Số điện thoại phải có 10 chữ số");
        }

        // Kiểm tra email duy nhất
        if (!updatedUser.getEmail().equals(currentUser.getEmail())) {
            User existingUser = userRepository.findByEmail(updatedUser.getEmail());
            if (existingUser != null) {
                throw new Exception("Email đã được sử dụng bởi người dùng khác");
            }
        }

        // Cập nhật thông tin cơ bản
        currentUser.setFullName(updatedUser.getFullName());
        currentUser.setEmail(updatedUser.getEmail());
        currentUser.setMobile(updatedUser.getMobile());

        // Xử lý địa chỉ
        Set<Address> newAddresses = new HashSet<>();
        for (Address updatedAddress : updatedUser.getAddresses()) {
            // Kiểm tra dữ liệu địa chỉ
            if (updatedAddress.getName() == null || updatedAddress.getName().isBlank()) {
                throw new Exception("Tên địa chỉ không được để trống");
            }
            if (updatedAddress.getAddress() == null || updatedAddress.getAddress().isBlank()) {
                throw new Exception("Địa chỉ không được để trống");
            }
            if (updatedAddress.getCity() == null || updatedAddress.getCity().isBlank()) {
                throw new Exception("Thành phố không được để trống");
            }
            if (updatedAddress.getState() == null || updatedAddress.getState().isBlank()) {
                throw new Exception("Tỉnh/thành không được để trống");
            }
            if (updatedAddress.getPinCode() == null || updatedAddress.getPinCode().isBlank()) {
                throw new Exception("Mã bưu điện không được để trống");
            }
            if (updatedAddress.getMobile() == null || updatedAddress.getMobile().isBlank()) {
                throw new Exception("Số điện thoại không được để trống");
            }
            if (!updatedAddress.getMobile().matches("^\\d{10}$")) {
                throw new Exception("Số điện thoại địa chỉ phải có 10 chữ số");
            }

            if (updatedAddress.getId() != null) {
                // Cập nhật địa chỉ hiện có
                Address existingAddress = addressRepository.findById(updatedAddress.getId())
                        .orElseThrow(() -> new Exception("Không tìm thấy địa chỉ với ID: " + updatedAddress.getId()));
                existingAddress.setName(updatedAddress.getName());
                existingAddress.setLocality(updatedAddress.getLocality());
                existingAddress.setAddress(updatedAddress.getAddress());
                existingAddress.setCity(updatedAddress.getCity());
                existingAddress.setState(updatedAddress.getState());
                existingAddress.setPinCode(updatedAddress.getPinCode());
                existingAddress.setMobile(updatedAddress.getMobile());
                newAddresses.add(existingAddress);
            } else {
                // Tạo địa chỉ mới
                newAddresses.add(updatedAddress);
            }
        }

        // Cập nhật danh sách địa chỉ (các địa chỉ không có trong payload sẽ bị xóa do orphanRemoval)
        currentUser.setAddresses(newAddresses);

        // Lưu người dùng
        return userRepository.save(currentUser);
    }

    @Override
    public void deleteUser(Long id, String jwt) throws Exception {
        // Xác thực người dùng từ JWT
        User currentUser = findUserByJwtToken(jwt);

        // Kiểm tra quyền
        boolean isAdmin = currentUser.getRole() == USER_ROLE.ROLE_ADMIN;
        boolean isSelf = currentUser.getId().equals(id);
        if (!isAdmin && !isSelf) {
            throw new Exception("Bạn không có quyền xóa người dùng này");
        }

        // Kiểm tra người dùng tồn tại
        User userToDelete = userRepository.findById(id)
                .orElseThrow(() -> new Exception("Không tìm thấy người dùng với ID: " + id));

        // Xóa người dùng
        userRepository.delete(userToDelete);
    }
}