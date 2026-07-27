package com.example.mystore.api.dto;
import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

public class PlaceCustomerOrderResponse {
    public Long orderId;
    public String orderStatus; // "PLACED"
    public BigDecimal subtotalTotal;
    public BigDecimal discountPercent; // 0
    public BigDecimal discountAmount; // 0
    public BigDecimal grandTotal;
    public List<OrderItemLineResponse> items;


    @Data
    public static class OrderItemLineResponse {
        public Long productId;
        public String productName;
        public Integer quantity;
        public BigDecimal unitPriceAtTime;
        public BigDecimal lineTotal;
    }
}