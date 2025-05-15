package com.example.thanhtrung.thuongmaidientu.modal;

import java.util.HashSet;
import java.util.Set;

import com.example.thanhtrung.thuongmaidientu.domain.PaymentMethod;
import com.example.thanhtrung.thuongmaidientu.domain.PaymentOrderStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import lombok.*;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@EqualsAndHashCode
public class PaymentOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    
    private Long amount;
    private PaymentOrderStatus status=PaymentOrderStatus.PENDING;

    private PaymentMethod paymentMethod;

    private String paymentLinkId;

    @ManyToOne
    private User user;

    @OneToMany
    private Set<Order> orders=new HashSet<>();
}
