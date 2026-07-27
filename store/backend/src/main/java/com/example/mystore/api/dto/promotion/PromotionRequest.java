package com.example.mystore.api.dto.promotion;

import java.util.List;

public class PromotionRequest {
    public List<PromotionLineRequest> items;
    public String couponCode;
    public Integer redeemPoints;

    public static class PromotionLineRequest {
        public Long productId;
        public Integer quantity;
    }
}
