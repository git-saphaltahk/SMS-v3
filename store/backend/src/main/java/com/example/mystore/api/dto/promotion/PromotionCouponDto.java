package com.example.mystore.api.dto.promotion;

import java.math.BigDecimal;

public class PromotionCouponDto {
    public Long id;
    public String code;
    public String description;
    public String discountType;
    public BigDecimal discountValue;
    public BigDecimal minOrderSubtotal;
    public BigDecimal maxDiscountAmount;
    public boolean active;
}
