package com.example.mystore.api.dto;


public class AuthResponse {
    public String accessToken;
    public String tokenType = "Bearer";
    public String email;
    public String role;
    public Long userId;
}