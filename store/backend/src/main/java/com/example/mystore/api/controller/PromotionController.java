package com.example.mystore.api.controller;

import com.example.mystore.api.dto.promotion.*;
import com.example.mystore.entity.*;
import com.example.mystore.repo.*;
import com.example.mystore.service.PromotionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class PromotionController {

    private final PromotionService promotionService;
    private final PromotionCouponRepository promotionCouponRepository;
    private final LoyaltyRuleRepository loyaltyRuleRepository;

    public PromotionController(PromotionService promotionService,
                              PromotionCouponRepository promotionCouponRepository,
                              LoyaltyRuleRepository loyaltyRuleRepository) {
        this.promotionService = promotionService;
        this.promotionCouponRepository = promotionCouponRepository;
        this.loyaltyRuleRepository = loyaltyRuleRepository;
    }

    @GetMapping("/api/customer/promotions")
    public CustomerPromotionSummary customerSummary() {
        return new CustomerPromotionSummary(
                promotionService.listCoupons(),
                promotionService.listLoyaltyRules(),
                promotionService.preview(new PromotionRequest())
        );
    }

    @PostMapping("/api/customer/promotions/preview")
    public PromotionPreviewResponse preview(@RequestBody PromotionRequest request) {
        return promotionService.preview(request);
    }

    @GetMapping("/api/admin/promotions/coupons")
    public List<PromotionCouponDto> listCoupons() {
        return promotionService.listCoupons();
    }

    @GetMapping("/api/admin/promotions/loyalty-rules")
    public List<LoyaltyRuleDto> listLoyaltyRules() {
        return promotionService.listLoyaltyRules();
    }

    @PostMapping("/api/admin/promotions/coupons")
    public PromotionCouponDto createCoupon(@RequestBody PromotionCouponDto request) {
        PromotionCoupon coupon = new PromotionCoupon();
        coupon.setCode(request.code);
        coupon.setDescription(request.description);
        coupon.setDiscountType(PromotionCoupon.DiscountType.valueOf(request.discountType));
        coupon.setDiscountValue(request.discountValue);
        coupon.setMinOrderSubtotal(request.minOrderSubtotal);
        coupon.setMaxDiscountAmount(request.maxDiscountAmount);
        coupon.setActive(request.active);
        PromotionCoupon saved = promotionCouponRepository.save(coupon);
        return promotionService.listCoupons().stream()
                .filter(item -> item.id.equals(saved.getId()))
                .findFirst()
                .orElse(null);
    }

    @PutMapping("/api/admin/promotions/coupons/{id}")
    public PromotionCouponDto updateCoupon(@PathVariable Long id, @RequestBody PromotionCouponDto request) {
        PromotionCoupon coupon = promotionCouponRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Coupon not found: " + id));
        coupon.setCode(request.code);
        coupon.setDescription(request.description);
        coupon.setDiscountType(PromotionCoupon.DiscountType.valueOf(request.discountType));
        coupon.setDiscountValue(request.discountValue);
        coupon.setMinOrderSubtotal(request.minOrderSubtotal);
        coupon.setMaxDiscountAmount(request.maxDiscountAmount);
        coupon.setActive(request.active);
        promotionCouponRepository.save(coupon);
        return promotionService.listCoupons().stream()
                .filter(item -> item.id.equals(id))
                .findFirst()
                .orElse(null);
    }

    @DeleteMapping("/api/admin/promotions/coupons/{id}")
    public void deleteCoupon(@PathVariable Long id) {
        promotionCouponRepository.deleteById(id);
    }

    @PostMapping("/api/admin/promotions/loyalty-rules")
    public LoyaltyRuleDto createLoyaltyRule(@RequestBody LoyaltyRuleDto request) {
        LoyaltyRule loyaltyRule = new LoyaltyRule();
        loyaltyRule.setName(request.name);
        loyaltyRule.setDescription(request.description);
        loyaltyRule.setPointsPerDollar(request.pointsPerDollar);
        loyaltyRule.setCurrencyPerPoint(request.currencyPerPoint);
        loyaltyRule.setMaxPointsPerOrder(request.maxPointsPerOrder);
        loyaltyRule.setActive(request.active);
        loyaltyRuleRepository.save(loyaltyRule);
        return promotionService.listLoyaltyRules().stream()
                .filter(item -> item.name.equalsIgnoreCase(request.name))
                .findFirst()
                .orElse(null);
    }

    @PutMapping("/api/admin/promotions/loyalty-rules/{id}")
    public LoyaltyRuleDto updateLoyaltyRule(@PathVariable Long id, @RequestBody LoyaltyRuleDto request) {
        LoyaltyRule rule = loyaltyRuleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Loyalty rule not found: " + id));
        rule.setName(request.name);
        rule.setDescription(request.description);
        rule.setPointsPerDollar(request.pointsPerDollar);
        rule.setCurrencyPerPoint(request.currencyPerPoint);
        rule.setMaxPointsPerOrder(request.maxPointsPerOrder);
        rule.setActive(request.active);
        loyaltyRuleRepository.save(rule);
        return promotionService.listLoyaltyRules().stream().filter(item -> item.id.equals(id)).findFirst().orElse(null);
    }

    @DeleteMapping("/api/admin/promotions/loyalty-rules/{id}")
    public void deleteLoyaltyRule(@PathVariable Long id) {
        loyaltyRuleRepository.deleteById(id);
    }

    public record CustomerPromotionSummary(List<PromotionCouponDto> coupons,
                                            List<LoyaltyRuleDto> loyaltyRules,
                                            PromotionPreviewResponse preview) {
    }
}
