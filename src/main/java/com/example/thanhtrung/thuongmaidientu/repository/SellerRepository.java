package com.example.thanhtrung.thuongmaidientu.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import java.util.List;
import com.example.thanhtrung.thuongmaidientu.domain.AccountStatus;


public interface SellerRepository extends JpaRepository<Seller, Long> {

    Seller findByEmail(String email);
    List<Seller> findByAccountStatus(AccountStatus accountStatus);
}
