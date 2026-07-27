package com.example.mystore.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.mystore.api.dto.PosCheckoutRequest;
import com.example.mystore.api.dto.ReceiptResponse;
import com.example.mystore.api.mapper.OrderMapper;
import com.example.mystore.entity.Order;
import com.example.mystore.entity.OrderItem;
import com.example.mystore.entity.Product;
import com.example.mystore.entity.User;
import com.example.mystore.enums.role.OrderSource;
import com.example.mystore.enums.role.OrderStatus;
import com.example.mystore.enums.role.PaymentStatus;
import com.example.mystore.repo.OrderItemRepository;
import com.example.mystore.repo.OrderRepository;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class PosCheckoutService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final OrderMapper orderMapper;

    public PosCheckoutService(ProductRepository productRepository,
                              OrderRepository orderRepository,
                              OrderItemRepository orderItemRepository,
                              UserRepository userRepository,
                              OrderMapper orderMapper) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.userRepository = userRepository;
        this.orderMapper = orderMapper;
    }

    @Transactional
    public ReceiptResponse checkout(User cashier,
                                     PosCheckoutRequest req,
                                     OrderMapper mapper) {

        if (req.items == null || req.items.isEmpty()) {
            throw new IllegalArgumentException("Cart items cannot be empty");
        }

        BigDecimal discountPercent = req.discountPercent == null ? BigDecimal.ZERO : req.discountPercent;
        if (discountPercent.compareTo(BigDecimal.ZERO) < 0 || discountPercent.compareTo(new BigDecimal("100")) > 0) {
            throw new IllegalArgumentException("discountPercent must be between 0 and 100");
        }

        // Create order first (still inside transaction)
        // Look up customer if email provided
        User customer = null;
        if (req.customerEmail != null && !req.customerEmail.isBlank()) {
            customer = userRepository.findByEmail(req.customerEmail).orElse(null);
        }

        Order order = new Order();
        order.setCashier(cashier);
        order.setCustomer(customer);
        order.setOrderSource(OrderSource.POS);
        order.setOrderStatus(OrderStatus.FULFILLED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setSubtotalTotal(BigDecimal.ZERO);
        order.setDiscountPercent(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setGrandTotal(BigDecimal.ZERO);
        order = orderRepository.save(order);

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> savedItems = new ArrayList<>();

        // 1) Lock & validate stock + compute line totals + build order items
        //    (Using pessimistic write lock to prevent oversell in MVP)
        for (PosCheckoutRequest.CartLineRequest line : req.items) {
            if (line.quantity == null || line.quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be > 0");
            }

            Product p = productRepository.findByIdForUpdate(line.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId));

            int stock = p.getStockQuantity();
            if (stock < line.quantity) {
                throw new IllegalStateException("INSUFFICIENT_STOCK for productId=" + line.productId);
            }

            BigDecimal unit = p.getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(line.quantity));
            subtotal = subtotal.add(lineTotal);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setUnitPriceAtTime(unit);
            oi.setQuantity(line.quantity);
            oi.setLineTotal(lineTotal);

            savedItems.add(orderItemRepository.save(oi));
        }

        // 2) Calculate discount and totals (receipt discount-wide)
        BigDecimal discountAmount = subtotal.multiply(discountPercent)
                .divide(new BigDecimal("100"));

        BigDecimal grandTotal = subtotal.subtract(discountAmount);

        // 3) Decrement inventory (still inside same transaction)
        //    We decrement based on the same request lines; products are still locked.
        for (PosCheckoutRequest.CartLineRequest line : req.items) {
            Product p = productRepository.findByIdForUpdate(line.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId));

            p.setStockQuantity(p.getStockQuantity() - line.quantity);
            productRepository.save(p);
        }

        order.setSubtotalTotal(subtotal);
        order.setDiscountPercent(discountPercent);
        order.setDiscountAmount(discountAmount);
        order.setGrandTotal(grandTotal);

        order = orderRepository.save(order);

        return mapper.toReceiptResponse(order, savedItems);
    }

    @Transactional
    public ReceiptResponse checkout(Long cashierId, PosCheckoutRequest req) {
        User cashier = userRepository.findById(cashierId)
                .orElseThrow(() -> new IllegalArgumentException("Cashier not found with id: " + cashierId));
        return checkout(cashier, req, orderMapper);
    }
}