package com.example.mystore.api.dto.promotion;

import java.math.BigDecimal;

public class PromotionPreviewResponse {
    public String appliedCouponCode;
    public BigDecimal subtotal;
    public BigDecimal discountAmount;
    public BigDecimal discountPercent;
    public BigDecimal grandTotal;
    public Integer earnedPoints;
    public Integer redeemablePoints;
    public String loyaltyRuleName;
    public boolean couponApplied;
}
