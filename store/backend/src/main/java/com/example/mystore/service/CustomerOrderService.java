package com.example.mystore.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.mystore.api.dto.PlaceCustomerOrderRequest;
import com.example.mystore.api.dto.PlaceCustomerOrderResponse;
import com.example.mystore.api.dto.promotion.PromotionPreviewResponse;
import com.example.mystore.api.dto.promotion.PromotionRequest;
import com.example.mystore.api.mapper.OrderMapper;
import com.example.mystore.entity.Order;
import com.example.mystore.entity.OrderItem;
import com.example.mystore.entity.Product;
import com.example.mystore.entity.User;
import com.example.mystore.enums.role.OrderSource;
import com.example.mystore.enums.role.OrderStatus;
import com.example.mystore.enums.role.PaymentStatus;
import com.example.mystore.helper.SecurityUtil;
import com.example.mystore.repo.OrderItemRepository;
import com.example.mystore.repo.OrderRepository;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.UserRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class CustomerOrderService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final PromotionService promotionService;

    public CustomerOrderService(UserRepository userRepository,OrderRepository orderRepository,
                                 OrderItemRepository orderItemRepository,
                                 ProductRepository productRepository,
                                 PromotionService promotionService) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.promotionService = promotionService;
     }

    @Transactional
    public PlaceCustomerOrderResponse placeOrder(User currentCustomer,
        PlaceCustomerOrderRequest req, OrderMapper mapper) {
    
                      //"email"comes from JWT "                          
            String email=SecurityUtil.currentEmail();

            //"customer"comes from DB lookup by that email(customer_id=user.id)

            if(req.items==null || req.items.isEmpty()){
                throw new IllegalArgumentException("Cart items cannot be empty");

            }
       BigDecimal subtotal=BigDecimal.ZERO;

        PromotionRequest promotionRequest = new PromotionRequest();
        promotionRequest.items = new ArrayList<>();
        promotionRequest.couponCode = req.couponCode;
        promotionRequest.redeemPoints = req.redeemPoints;

        Order order = new Order();
        order.setCustomer(currentCustomer);
        order.setCashier(null);
        order.setOrderSource(OrderSource.CUSTOMER_PORTAL);
        order.setOrderStatus(OrderStatus.PLACED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setSubtotalTotal(BigDecimal.ZERO);
        order.setDiscountPercent(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setGrandTotal(BigDecimal.ZERO);

        // We'll compute totals after building items
        order = orderRepository.save(order);

        List<OrderItem> savedItems = new ArrayList<>();
        for (PlaceCustomerOrderRequest.CartLineRequest line : req.items) {
            if (line.quantity == null || line.quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be > 0");
            }
            Product p = productRepository.findById(line.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId));

            // Stock validation
            if (p.getStockQuantity() < line.quantity) {
                throw new IllegalStateException("INSUFFICIENT_STOCK for product: " + p.getName());
            }

            // Pricing snapshot
            BigDecimal unit = p.getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(line.quantity));

            subtotal = subtotal.add(lineTotal);

            // Decrement inventory
            p.setStockQuantity(p.getStockQuantity() - line.quantity);
            productRepository.save(p);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setUnitPriceAtTime(unit);
            oi.setQuantity(line.quantity);
            oi.setLineTotal(lineTotal);

            PromotionRequest.PromotionLineRequest promotionLine = new PromotionRequest.PromotionLineRequest();
            promotionLine.productId = line.productId;
            promotionLine.quantity = line.quantity;
            promotionRequest.items.add(promotionLine);

            savedItems.add(orderItemRepository.save(oi));
        }

        PromotionPreviewResponse preview = promotionService.preview(promotionRequest);
        Integer redeemedPoints = Math.max(0, req.redeemPoints != null ? req.redeemPoints : 0);
        int availablePoints = currentCustomer.getLoyaltyPointsBalance() == null ? 0 : currentCustomer.getLoyaltyPointsBalance();
        redeemedPoints = Math.min(redeemedPoints, availablePoints);

        order.setSubtotalTotal(subtotal);
        order.setDiscountPercent(preview.discountPercent);
        order.setDiscountAmount(preview.discountAmount);
        order.setGrandTotal(preview.grandTotal);
        order.setCouponCode(req.couponCode);
        order.setLoyaltyPointsUsed(redeemedPoints);
        order.setLoyaltyPointsEarned(preview.earnedPoints);
        order.setLoyaltyRuleName(preview.loyaltyRuleName);

        currentCustomer.setLoyaltyPointsBalance(Math.max(0, availablePoints - redeemedPoints + preview.earnedPoints));
        userRepository.save(currentCustomer);

        order = orderRepository.save(order);

        return mapper.toPlaceCustomerOrderResponse(order, savedItems);
    }

    @Transactional
    public PlaceCustomerOrderResponse placeOrder(Long customerId, PlaceCustomerOrderRequest req) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new IllegalArgumentException("Customer not found with id: " + customerId));

        if(req.items == null || req.items.isEmpty()){
            throw new IllegalArgumentException("Cart items cannot be empty");
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        PromotionRequest promotionRequest = new PromotionRequest();
        promotionRequest.items = new ArrayList<>();
        promotionRequest.couponCode = req.couponCode;
        promotionRequest.redeemPoints = req.redeemPoints;

        Order order = new Order();
        order.setCustomer(customer);
        order.setCashier(null);
        order.setOrderSource(OrderSource.CUSTOMER_PORTAL);
        order.setOrderStatus(OrderStatus.PLACED);
        order.setPaymentStatus(PaymentStatus.UNPAID);
        order.setSubtotalTotal(BigDecimal.ZERO);
        order.setDiscountPercent(BigDecimal.ZERO);
        order.setDiscountAmount(BigDecimal.ZERO);
        order.setGrandTotal(BigDecimal.ZERO);

        // Save order first
        order = orderRepository.save(order);

        List<OrderItem> savedItems = new ArrayList<>();
        for (PlaceCustomerOrderRequest.CartLineRequest line : req.items) {
            if (line.quantity == null || line.quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be > 0");
            }
            Product p = productRepository.findById(line.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId));

            // Stock validation
            if (p.getStockQuantity() < line.quantity) {
                throw new IllegalStateException("INSUFFICIENT_STOCK for product: " + p.getName());
            }

            // Pricing snapshot
            BigDecimal unit = p.getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(line.quantity));

            subtotal = subtotal.add(lineTotal);

            // Decrement inventory
            p.setStockQuantity(p.getStockQuantity() - line.quantity);
            productRepository.save(p);

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(p);
            oi.setUnitPriceAtTime(unit);
            oi.setQuantity(line.quantity);
            oi.setLineTotal(lineTotal);

            PromotionRequest.PromotionLineRequest promotionLine = new PromotionRequest.PromotionLineRequest();
            promotionLine.productId = line.productId;
            promotionLine.quantity = line.quantity;
            promotionRequest.items.add(promotionLine);

            savedItems.add(orderItemRepository.save(oi));
        }

        PromotionPreviewResponse preview = promotionService.preview(promotionRequest);
        Integer redeemedPoints = Math.max(0, req.redeemPoints != null ? req.redeemPoints : 0);
        int availablePoints = customer.getLoyaltyPointsBalance() == null ? 0 : customer.getLoyaltyPointsBalance();
        redeemedPoints = Math.min(redeemedPoints, availablePoints);

        order.setSubtotalTotal(subtotal);
        order.setDiscountPercent(preview.discountPercent);
        order.setDiscountAmount(preview.discountAmount);
        order.setGrandTotal(preview.grandTotal);
        order.setCouponCode(req.couponCode);
        order.setLoyaltyPointsUsed(redeemedPoints);
        order.setLoyaltyPointsEarned(preview.earnedPoints);
        order.setLoyaltyRuleName(preview.loyaltyRuleName);

        customer.setLoyaltyPointsBalance(Math.max(0, availablePoints - redeemedPoints + preview.earnedPoints));
        userRepository.save(customer);

        order = orderRepository.save(order);

        return toPlaceCustomerOrderResponse(order, savedItems);
    }

    private PlaceCustomerOrderResponse toPlaceCustomerOrderResponse(Order order, List<OrderItem> items) {
        PlaceCustomerOrderResponse res = new PlaceCustomerOrderResponse();
        res.orderId = order.getId();
        res.orderStatus = order.getOrderStatus().toString();
        res.subtotalTotal = order.getSubtotalTotal();
        res.discountPercent = order.getDiscountPercent();
        res.discountAmount = order.getDiscountAmount();
        res.grandTotal = order.getGrandTotal();

        res.items = new ArrayList<>();
        for (OrderItem oi : items) {
            PlaceCustomerOrderResponse.OrderItemLineResponse line = new PlaceCustomerOrderResponse.OrderItemLineResponse();
            line.productId = oi.getProduct().getId();
            line.productName = oi.getProduct().getName();
            line.quantity = oi.getQuantity();
            line.unitPriceAtTime = oi.getUnitPriceAtTime();
            line.lineTotal = oi.getLineTotal();
            res.items.add(line);
        }

        return res;
    }
}

  