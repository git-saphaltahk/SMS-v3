package com.example.mystore.utility;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;

import com.example.mystore.enums.role.Role;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;


@Service
public class JwtService {

    private final Key SecretKey;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms}") long expirationMs
    ) {
        this.SecretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, Role role, Long userId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claim("role", role.name())
                .claim("userId", userId)
                .issuedAt(now)
                .expiration(exp)
                .signWith(SecretKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Jws<Claims> parseAndValidate(String token) {
       SecretKey key= Keys.hmacShaKeyFor(SecretKey.getEncoded());
        try {
             return Jwts.parser()
                 .setSigningKey(key)   // ✅ SecretKey type
                  .build()
                   .parseClaimsJws(token); 
        } catch (JwtException e) {
            throw new RuntimeException("Invalid JWT token", e);
        }
       }
    }