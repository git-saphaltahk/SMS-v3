package com.example.mystore.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Entity
@Table(name = "promotion_coupons", uniqueConstraints = {
        @UniqueConstraint(name = "uk_promotion_coupon_code", columnNames = "code")
})
public class PromotionCoupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 32)
    private String code;

    @Column(length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountType discountType;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal discountValue;

    @Column(name = "min_order_subtotal", nullable = false, precision = 19, scale = 2)
    private BigDecimal minOrderSubtotal = BigDecimal.ZERO;

    @Column(name = "max_discount_amount", precision = 19, scale = 2)
    private BigDecimal maxDiscountAmount = BigDecimal.ZERO;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public enum DiscountType {
        PERCENT,
        FIXED_AMOUNT
    }
}
