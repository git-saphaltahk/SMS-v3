package com.example.mystore.service;

import com.example.mystore.api.dto.promotion.*;
import com.example.mystore.entity.*;
import com.example.mystore.repo.*;
import com.example.mystore.helper.SecurityUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class PromotionService {

    private final PromotionCouponRepository promotionCouponRepository;
    private final LoyaltyRuleRepository loyaltyRuleRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public PromotionService(PromotionCouponRepository promotionCouponRepository,
                            LoyaltyRuleRepository loyaltyRuleRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository) {
        this.promotionCouponRepository = promotionCouponRepository;
        this.loyaltyRuleRepository = loyaltyRuleRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<PromotionCouponDto> listCoupons() {
        return promotionCouponRepository.findByActiveTrueOrderByCodeAsc().stream().map(this::toCouponDto).toList();
    }

    public List<LoyaltyRuleDto> listLoyaltyRules() {
        return loyaltyRuleRepository.findByActiveTrueOrderByIdAsc().stream().map(this::toLoyaltyDto).toList();
    }

    public PromotionPreviewResponse preview(PromotionRequest req) {
        if (req == null) {
            throw new IllegalArgumentException("Promotion request cannot be null");
        }

        PromotionPreviewResponse response = new PromotionPreviewResponse();
        response.redeemablePoints = getCustomerLoyaltyPoints();
        response.earnedPoints = 0;
        response.loyaltyRuleName = getConfiguredLoyaltyRuleName();
        response.couponApplied = false;
        response.subtotal = BigDecimal.ZERO;
        response.discountAmount = BigDecimal.ZERO;
        response.discountPercent = BigDecimal.ZERO;
        response.grandTotal = BigDecimal.ZERO;

        if (req.items == null || req.items.isEmpty()) {
            return response;
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (PromotionRequest.PromotionLineRequest line : req.items) {
            if (line.quantity == null || line.quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be > 0");
            }
            Product p = productRepository.findById(line.productId)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.productId));
            subtotal = subtotal.add(p.getPrice().multiply(BigDecimal.valueOf(line.quantity)));
        }

        response.subtotal = subtotal;
        response.discountAmount = BigDecimal.ZERO;
        response.discountPercent = BigDecimal.ZERO;
        response.grandTotal = subtotal;
        response.redeemablePoints = getCustomerLoyaltyPoints();
        response.earnedPoints = calculateEarnedPoints(subtotal);
        response.loyaltyRuleName = getConfiguredLoyaltyRuleName();

        if (req.couponCode != null && !req.couponCode.isBlank()) {
            Optional<PromotionCoupon> coupon = promotionCouponRepository.findByCodeIgnoreCase(req.couponCode.trim());
            if (coupon.isPresent() && coupon.get().isActive()) {
                response.appliedCouponCode = coupon.get().getCode();
                BigDecimal discount = applyCoupon(subtotal, coupon.get());
                response.discountAmount = discount;
                response.discountPercent = discount.divide(subtotal, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));
                response.grandTotal = subtotal.subtract(discount).max(BigDecimal.ZERO);
                response.couponApplied = true;
            }
        }

        if (req.redeemPoints != null && req.redeemPoints > 0) {
            int availablePoints = getCustomerLoyaltyPoints();
            int redeem = Math.min(req.redeemPoints, availablePoints);
            BigDecimal redeemValue = BigDecimal.valueOf(redeem).multiply(getCurrencyPerPoint());
            response.discountAmount = response.discountAmount.add(redeemValue);
            response.grandTotal = response.grandTotal.subtract(redeemValue).max(BigDecimal.ZERO);
            response.redeemablePoints = availablePoints - redeem;
        }

        return response;
    }

    @Transactional
    public PromotionPreviewResponse previewAndApply(PromotionRequest req) {
        PromotionPreviewResponse response = preview(req);
        if (response.couponApplied && response.appliedCouponCode != null) {
            return response;
        }
        return response;
    }

    private BigDecimal applyCoupon(BigDecimal subtotal, PromotionCoupon coupon) {
        if (subtotal.compareTo(coupon.getMinOrderSubtotal()) < 0) {
            return BigDecimal.ZERO;
        }

        BigDecimal discount;
        if (coupon.getDiscountType() == PromotionCoupon.DiscountType.PERCENT) {
            discount = subtotal.multiply(coupon.getDiscountValue()).divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        } else {
            discount = coupon.getDiscountValue();
        }

        if (coupon.getMaxDiscountAmount() != null && coupon.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) > 0) {
            discount = discount.min(coupon.getMaxDiscountAmount());
        }

        return discount;
    }

    private int getCustomerLoyaltyPoints() {
        String email = SecurityUtil.currentEmail();
        return userRepository.findByEmail(email)
                .map(user -> user.getLoyaltyPointsBalance() == null ? 0 : Math.max(0, user.getLoyaltyPointsBalance()))
                .orElse(0);
    }

    private int calculateEarnedPoints(BigDecimal subtotal) {
        LoyaltyRule rule = loyaltyRuleRepository.findTopByActiveTrueOrderByIdAsc().orElse(null);
        if (rule == null) {
            return 0;
        }
        int points = subtotal.intValue() * rule.getPointsPerDollar();
        return Math.min(points, rule.getMaxPointsPerOrder());
    }

    private BigDecimal getCurrencyPerPoint() {
        LoyaltyRule rule = loyaltyRuleRepository.findTopByActiveTrueOrderByIdAsc().orElse(null);
        if (rule == null) {
            return BigDecimal.ZERO;
        }
        return rule.getCurrencyPerPoint();
    }

    private String getConfiguredLoyaltyRuleName() {
        return loyaltyRuleRepository.findTopByActiveTrueOrderByIdAsc()
                .map(LoyaltyRule::getName)
                .orElse("Default");
    }

    private PromotionCouponDto toCouponDto(PromotionCoupon coupon) {
        PromotionCouponDto dto = new PromotionCouponDto();
        dto.id = coupon.getId();
        dto.code = coupon.getCode();
        dto.description = coupon.getDescription();
        dto.discountType = coupon.getDiscountType().name();
        dto.discountValue = coupon.getDiscountValue();
        dto.minOrderSubtotal = coupon.getMinOrderSubtotal();
        dto.maxDiscountAmount = coupon.getMaxDiscountAmount();
        dto.active = coupon.isActive();
        return dto;
    }

    private LoyaltyRuleDto toLoyaltyDto(LoyaltyRule rule) {
        LoyaltyRuleDto dto = new LoyaltyRuleDto();
        dto.id = rule.getId();
        dto.name = rule.getName();
        dto.description = rule.getDescription();
        dto.pointsPerDollar = rule.getPointsPerDollar();
        dto.currencyPerPoint = rule.getCurrencyPerPoint();
        dto.maxPointsPerOrder = rule.getMaxPointsPerOrder();
        dto.active = rule.isActive();
        return dto;
    }

    public void seedDefaults() {
        if (promotionCouponRepository.count() == 0) {
            PromotionCoupon save10 = new PromotionCoupon();
            save10.setCode("SAVE10");
            save10.setDescription("10% off any eligible order");
            save10.setDiscountType(PromotionCoupon.DiscountType.PERCENT);
            save10.setDiscountValue(new BigDecimal("10"));
            save10.setMinOrderSubtotal(new BigDecimal("20.00"));
            save10.setMaxDiscountAmount(new BigDecimal("25.00"));
            save10.setActive(true);
            promotionCouponRepository.save(save10);

            PromotionCoupon save15 = new PromotionCoupon();
            save15.setCode("SAVE15");
            save15.setDescription("15% off orders over $50");
            save15.setDiscountType(PromotionCoupon.DiscountType.PERCENT);
            save15.setDiscountValue(new BigDecimal("15"));
            save15.setMinOrderSubtotal(new BigDecimal("50.00"));
            save15.setMaxDiscountAmount(new BigDecimal("30.00"));
            save15.setActive(true);
            promotionCouponRepository.save(save15);
        }

        if (loyaltyRuleRepository.count() == 0) {
            LoyaltyRule rule = new LoyaltyRule();
            rule.setName("Family Rewards");
            rule.setDescription("Earn and redeem points on every order");
            rule.setPointsPerDollar(1);
            rule.setCurrencyPerPoint(new BigDecimal("0.01"));
            rule.setMaxPointsPerOrder(1000);
            rule.setActive(true);
            loyaltyRuleRepository.save(rule);
        }
    }
}
