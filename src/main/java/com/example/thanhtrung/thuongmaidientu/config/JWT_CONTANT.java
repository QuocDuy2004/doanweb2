package com.example.thanhtrung.thuongmaidientu.config;

public class JWT_CONTANT {
    public static final String SECRET_KEY = "mysupersecretKey1234567890123456";
    public static final String JWT_HEADER = "Authorization";
    public static final String SECKET_KEY = null;

    static {
        System.out.println("JWT_CONTANT initialized, SECRET_KEY: " + SECRET_KEY);
    }
}