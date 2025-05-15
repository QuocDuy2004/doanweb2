package com.example.thanhtrung.thuongmaidientu.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.thanhtrung.thuongmaidientu.response.ApiResponse;

@RestController
public class HomeController {

    @GetMapping
    public ApiResponse HomeControllerHandler() {
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setMessage("Hello World");
        return apiResponse;
    }
}
