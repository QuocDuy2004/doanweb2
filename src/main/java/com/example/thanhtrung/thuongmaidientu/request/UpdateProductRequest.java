package com.example.thanhtrung.thuongmaidientu.request;

import lombok.Data;
import java.util.List;

@Data
public class UpdateProductRequest {
    private String title;
    private String description;
    private int mrpPrice;
    private int sellingPrice;
    private int discountPercent;
    private int quantity;
    private List<String> colors;
    private String category;
    private List<String> sizes;
    private List<String> images;
}