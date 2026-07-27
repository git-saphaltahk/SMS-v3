package com.example.mystore.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {
    @NotBlank
    public String token;

    @NotBlank
    @Size(min = 6, max = 100)
    public String newPassword;
}
