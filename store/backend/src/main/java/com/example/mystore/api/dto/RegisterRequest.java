package com.example.mystore.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterRequest {
    @Email @NotBlank
    public String email;

    @NotBlank
    @Size(min = 6, max = 100)
    public String password;

    @NotBlank
    public String role; // e.g. "CUSTOMER" (you can restrict this if you want)

    // optional: for MVP you can omit fields and always create CUSTOMER
}