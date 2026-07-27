package com.example.mystore.api.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import com.example.mystore.entity.Order;
import com.example.mystore.entity.OrderItem;
import com.example.mystore.repo.OrderItemRepository;
import com.example.mystore.repo.OrderRepository;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrdersController {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public OrdersController(OrderRepository orderRepository,
                            OrderItemRepository orderItemRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    public static class OrderSummary {
        public Long id;
        public String customerEmail;
        public String status;
        public String createdAt;
        public String itemsJson;
        public String total;
        public String couponCode;
        public String discount;
        public String pointsUsed;
        public String pointsEarned;
    }

    @GetMapping
    @Transactional(readOnly = true)
    public List<OrderSummary> listAll() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream().map(this::toSummary).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public OrderSummary getById(@PathVariable Long id) {
        Order o = orderRepository.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        return toSummary(o);
    }

    private OrderSummary toSummary(Order o) {
        OrderSummary s = new OrderSummary();
        s.id = o.getId();
        s.customerEmail = o.getCustomer() != null ? o.getCustomer().getEmail() : null;
        s.status = o.getOrderStatus() != null ? o.getOrderStatus().name() : null;
        s.createdAt = o.getCreatedAt() != null ? o.getCreatedAt().toString() : null;
        s.total = o.getGrandTotal() != null ? o.getGrandTotal().toString() : null;
        s.couponCode = o.getCouponCode();
        s.discount = o.getDiscountAmount() != null ? o.getDiscountAmount().toString() : "0.00";
        s.pointsUsed = o.getLoyaltyPointsUsed() != null ? o.getLoyaltyPointsUsed().toString() : "0";
        s.pointsEarned = o.getLoyaltyPointsEarned() != null ? o.getLoyaltyPointsEarned().toString() : "0";

        // Fetch real order items
        List<OrderItem> items = orderItemRepository.findByOrderId(o.getId());
        s.itemsJson = items.stream()
                .map(item -> String.format(
                        "{\"productId\":%d,\"productName\":\"%s\",\"quantity\":%d,\"unitPrice\":%s,\"lineTotal\":%s}",
                        item.getProduct().getId(),
                        item.getProduct().getName().replace("\"", "\\\""),
                        item.getQuantity(),
                        item.getUnitPriceAtTime(),
                        item.getLineTotal()))
                .collect(Collectors.joining(",", "[", "]"));

        return s;
    }
}
