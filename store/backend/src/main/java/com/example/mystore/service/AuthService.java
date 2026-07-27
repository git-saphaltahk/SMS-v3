package com.example.mystore.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.mystore.api.dto.AuthResponse;
import com.example.mystore.api.dto.ForgotPasswordRequest;
import com.example.mystore.api.dto.LoginRequest;
import com.example.mystore.api.dto.PasswordResetResponse;
import com.example.mystore.api.dto.RegisterRequest;
import com.example.mystore.api.dto.ResetPasswordRequest;
import com.example.mystore.entity.User;
import com.example.mystore.enums.role.Role;
import com.example.mystore.repo.UserRepository;
import com.example.mystore.utility.JwtService;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                        PasswordEncoder passwordEncoder,
                        JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.findByEmail(req.email).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        // Priority authentication first: email/password
        // If you want to force everyone to be CUSTOMER on register:
        Role role = Role.valueOf(req.role.toUpperCase());

        User u = new User();
        u.setEmail(req.email);
        u.setPasswordHash(passwordEncoder.encode(req.password));
        u.setRole(role);
        u.setActive(true);

        User saved = userRepository.save(u);

        return toAuthResponse(saved);
    }

    public AuthResponse login(LoginRequest req) {
        User u = userRepository.findByEmail(req.email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));

        if (!u.isActive()) {
            throw new IllegalArgumentException("User is disabled");
        }

        boolean ok = passwordEncoder.matches(req.password, u.getPasswordHash());
        if (!ok) {
            throw new IllegalArgumentException("Invalid credentials");
        }

        return toAuthResponse(u);
    }

    public PasswordResetResponse forgotPassword(ForgotPasswordRequest req) {
        User u = userRepository.findByEmail(req.email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Generate reset token
        String resetToken = generateResetToken();
        u.setResetToken(resetToken);
        u.setResetTokenExpiry(LocalDateTime.now().plusHours(1)); // Token valid for 1 hour
        userRepository.save(u);

        // In production, send email with reset link
        // For now, log the token (in real app, use email service)
        System.out.println("Password reset token for " + req.email + ": " + resetToken);

        return new PasswordResetResponse("Password reset email sent successfully", true);
    }

    public PasswordResetResponse resetPassword(ResetPasswordRequest req) {
        // Find user by reset token
        // Note: JPA doesn't support finding by reset token directly in standard methods
        // We need to search all users (in production, add a finder method to UserRepository)
        throw new IllegalArgumentException("Password reset token verification not yet implemented");
    }

    public PasswordResetResponse resetPasswordWithToken(String token, String newPassword) {
        // This is a helper method that will be called from controller
        // Find user by token (we'll need to add this to UserRepository)
        java.util.Optional<User> userOpt = userRepository.findByResetToken(token);
        
        User u = userOpt.orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        // Check if token is expired
        if (u.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(u.getResetTokenExpiry())) {
            throw new IllegalArgumentException("Reset token has expired");
        }

        // Update password and clear reset token
        u.setPasswordHash(passwordEncoder.encode(newPassword));
        u.setResetToken(null);
        u.setResetTokenExpiry(null);
        userRepository.save(u);

        return new PasswordResetResponse("Password reset successfully", true);
    }

    private String generateResetToken() {
        return UUID.randomUUID().toString();
    }

    private AuthResponse toAuthResponse(User u) {
        String token = jwtService.generateToken(u.getEmail(), u.getRole(), u.getId());

        AuthResponse res = new AuthResponse();
        res.accessToken = token;
        res.email = u.getEmail();
        res.role = u.getRole().name();
        res.userId = u.getId();
        return res;
    }
}