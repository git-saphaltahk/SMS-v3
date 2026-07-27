package com.example.mystore.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="order_id", nullable=false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable=false)
    private Product product;

    // snapshot unit price
    @Column(name="unit_price_at_time", nullable=false, precision=19, scale=2)
    private BigDecimal unitPriceAtTime;

    @Column(nullable=false)
    private Integer quantity;

    @Column(name="line_total", nullable=false, precision=19, scale=2)
    private BigDecimal lineTotal;

    // getters/setters
}