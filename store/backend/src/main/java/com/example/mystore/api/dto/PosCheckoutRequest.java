package com.example.mystore.api.dto;

import java.math.BigDecimal;
import java.util.List;

public class PosCheckoutRequest {
    public List<CartLineRequest> items;
    public BigDecimal discountPercent; // e.g. 10.00
    public String customerEmail; // optional, for POS sales with customer

    public static class CartLineRequest {
        public Long productId;
        public Integer quantity;
    }
}