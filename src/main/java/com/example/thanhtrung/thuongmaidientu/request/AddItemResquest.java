package com.example.thanhtrung.thuongmaidientu.request;

import lombok.Data;

@Data
public class AddItemResquest {
    private String size;
    private int quantity;
    private Long productId;
}
