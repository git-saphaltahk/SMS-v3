package com.example.mystore.api.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public class ReceiptResponse {
    public Long orderId;
    public Instant createdAt;
    public String paymentStatus; // UNPAID
    public String orderStatus;   // FULFILLED

    public BigDecimal subtotalTotal;
    public BigDecimal discountPercent;
    public BigDecimal discountAmount;
    public BigDecimal grandTotal;

    public List<ReceiptItemResponse> items;

    public static class ReceiptItemResponse {
        public String productName;
        public Integer quantity;
        public BigDecimal unitPriceAtTime;
        public BigDecimal lineTotal;
    }
}