package com.example.mystore.api.mapper;

import org.springframework.stereotype.Component;

import com.example.mystore.api.dto.PlaceCustomerOrderResponse;
import com.example.mystore.api.dto.ReceiptResponse;
import com.example.mystore.entity.Order;
import com.example.mystore.entity.OrderItem;

import java.util.List;

@Component
public class OrderMapper {

    public PlaceCustomerOrderResponse toPlaceCustomerOrderResponse(
            Order order, List<OrderItem> items
    ) {
        PlaceCustomerOrderResponse res = new PlaceCustomerOrderResponse();
        res.orderId = order.getId();
        res.orderStatus = order.getOrderStatus().name();
        res.subtotalTotal = order.getSubtotalTotal();
        res.discountPercent = order.getDiscountPercent();
        res.discountAmount = order.getDiscountAmount();
        res.grandTotal = order.getGrandTotal();
        res.items = items.stream().map(this::toItemLine).toList();
        return res;
    }

    private PlaceCustomerOrderResponse.OrderItemLineResponse toItemLine(OrderItem oi) {
        PlaceCustomerOrderResponse.OrderItemLineResponse line = new PlaceCustomerOrderResponse.OrderItemLineResponse();
        line.productId = oi.getProduct().getId();
        line.productName = oi.getProduct().getName();
        line.quantity = oi.getQuantity();
        line.unitPriceAtTime = oi.getUnitPriceAtTime();
        line.lineTotal = oi.getLineTotal();
        return line;
    }

    public ReceiptResponse toReceiptResponse(Order order, List<OrderItem> items) {
        ReceiptResponse res = new ReceiptResponse();
        res.orderId = order.getId();
        res.createdAt = order.getCreatedAt();
        res.paymentStatus = order.getPaymentStatus().name();
        res.orderStatus = order.getOrderStatus().name();
        res.subtotalTotal = order.getSubtotalTotal();
        res.discountPercent = order.getDiscountPercent();
        res.discountAmount = order.getDiscountAmount();
        res.grandTotal = order.getGrandTotal();
        res.items = items.stream().map(this::toReceiptItem).toList();
        return res;
    }

    private ReceiptResponse.ReceiptItemResponse toReceiptItem(OrderItem oi) {
        ReceiptResponse.ReceiptItemResponse ri = new ReceiptResponse.ReceiptItemResponse();
        ri.productName = oi.getProduct().getName();
        ri.quantity = oi.getQuantity();
        ri.unitPriceAtTime = oi.getUnitPriceAtTime();
        ri.lineTotal = oi.getLineTotal();
        return ri;
    }
}