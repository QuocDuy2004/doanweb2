package com.example.thanhtrung.thuongmaidientu.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponse {
    private String message;
    private boolean success;

    public ApiResponse() {
        this.success = true;
    }

    public ApiResponse(String message) {
        this.message = message;
        this.success = true;
    }
}