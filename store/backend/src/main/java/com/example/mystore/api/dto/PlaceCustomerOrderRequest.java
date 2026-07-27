package com.example.mystore.api.dto;

import java.util.List;
import lombok.Data;

@Data
public class PlaceCustomerOrderRequest {
    public List<CartLineRequest> items;
    public String couponCode;
    public Integer redeemPoints;

    public static class CartLineRequest {
        public Long productId;
        public Integer quantity;
    }
}