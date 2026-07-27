package com.example.mystore.api.dto;

public class PasswordResetResponse {
    public String message;
    public boolean success;

    public PasswordResetResponse(String message, boolean success) {
        this.message = message;
        this.success = success;
    }
}
