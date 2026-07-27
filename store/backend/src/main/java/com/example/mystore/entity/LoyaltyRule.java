package com.example.mystore.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "loyalty_rules")
public class LoyaltyRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 64)
    private String name;

    @Column(length = 255)
    private String description;

    @Column(name = "points_per_dollar", nullable = false)
    private Integer pointsPerDollar = 1;

    @Column(name = "currency_per_point", nullable = false, precision = 19, scale = 4)
    private BigDecimal currencyPerPoint = new BigDecimal("0.01");

    @Column(name = "max_points_per_order", nullable = false)
    private Integer maxPointsPerOrder = 1000;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
