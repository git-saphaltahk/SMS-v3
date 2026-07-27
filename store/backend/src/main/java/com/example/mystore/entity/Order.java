package com.example.mystore.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.mystore.enums.role.OrderSource;
import com.example.mystore.enums.role.OrderStatus;
import com.example.mystore.enums.role.PaymentStatus;


@Data
@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cashier_id")
    private User cashier;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private OrderSource orderSource;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private OrderStatus orderStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable=false)
    private PaymentStatus paymentStatus;

    @Column(name="subtotal_total", nullable=false, precision=19, scale=2)
    private BigDecimal subtotalTotal;

    @Column(name="discount_percent", nullable=false, precision=10, scale=2)
    private BigDecimal discountPercent;

    @Column(name="discount_amount", nullable=false, precision=19, scale=2)
    private BigDecimal discountAmount;

    @Column(name="grand_total", nullable=false, precision=19, scale=2)
    private BigDecimal grandTotal;

    @Column(name = "coupon_code", length = 64)
    private String couponCode;

    @Column(name = "loyalty_points_used")
    private Integer loyaltyPointsUsed = 0;

    @Column(name = "loyalty_points_earned")
    private Integer loyaltyPointsEarned = 0;

    @Column(name = "loyalty_rule_name", length = 120)
    private String loyaltyRuleName;

    @Column(nullable=false)
    private Instant createdAt = Instant.now();

    // getters/setters
}
