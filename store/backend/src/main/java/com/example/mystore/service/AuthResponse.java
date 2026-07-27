package com.example.mystore.service;

import lombok.Data;

@Data
public class AuthResponse {
    public String token;
    public Long userId;
    public String role;

    public AuthResponse(String token, Long userId, String role) {
        this.token = token;
        this.userId = userId;
        this.role = role;
    }
}
