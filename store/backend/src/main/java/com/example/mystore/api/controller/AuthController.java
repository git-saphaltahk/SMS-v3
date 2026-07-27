package com.example.mystore.api.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import com.example.mystore.api.dto.AuthResponse;
import com.example.mystore.api.dto.ForgotPasswordRequest;
import com.example.mystore.api.dto.LoginRequest;
import com.example.mystore.api.dto.PasswordResetResponse;
import com.example.mystore.api.dto.RegisterRequest;
import com.example.mystore.api.dto.ResetPasswordRequest;
import com.example.mystore.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody @Valid RegisterRequest req) {
        return authService.register(req);
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody @Valid LoginRequest req) {
        return authService.login(req);
    }

    @PostMapping("/forgot-password")
    public PasswordResetResponse forgotPassword(@RequestBody @Valid ForgotPasswordRequest req) {
        return authService.forgotPassword(req);
    }

    @PostMapping("/reset-password")
    public PasswordResetResponse resetPassword(@RequestBody @Valid ResetPasswordRequest req) {
        return authService.resetPasswordWithToken(req.token, req.newPassword);
    }
}