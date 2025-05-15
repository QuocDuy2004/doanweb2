package com.example.thanhtrung.thuongmaidientu.response;

import com.example.thanhtrung.thuongmaidientu.modal.Seller;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SellerResponse {
    private Seller seller;
    private String message;
    private boolean success;

    public SellerResponse() {
        this.success = true;
    }

    public SellerResponse(Seller seller, String message) {
        this.seller = seller;
        this.message = message;
        this.success = true;
    }
}