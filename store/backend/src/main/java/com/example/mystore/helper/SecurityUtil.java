package com.example.mystore.helper;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;


public class SecurityUtil {
    public static String currentEmail() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        return a.getName(); // username = email in our UserDetails
    }

}