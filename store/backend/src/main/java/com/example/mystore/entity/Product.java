package com.example.mystore.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Data;

@Data
@Entity
@Table(name = "products")
public class Product {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String name;

    @Column(nullable=false, precision=19, scale=2)
    private BigDecimal price;

    @Column(nullable=false)
    private String category;

    @Column(name="stock_quantity", nullable=false)
    private Integer stockQuantity;

    @Column(name = "image_name")
    private String imageName;

    @Column(nullable=false)
    private boolean active = true;

    // getters/setters
}
