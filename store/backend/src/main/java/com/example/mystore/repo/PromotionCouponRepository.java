package com.example.mystore.repo;

import com.example.mystore.entity.PromotionCoupon;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PromotionCouponRepository extends JpaRepository<PromotionCoupon, Long> {
    Optional<PromotionCoupon> findByCodeIgnoreCase(String code);
    List<PromotionCoupon> findByActiveTrueOrderByCodeAsc();
}
