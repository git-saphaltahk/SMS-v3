package com.example.mystore.repo;

import com.example.mystore.entity.LoyaltyRule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LoyaltyRuleRepository extends JpaRepository<LoyaltyRule, Long> {
    Optional<LoyaltyRule> findTopByActiveTrueOrderByIdAsc();
    List<LoyaltyRule> findByActiveTrueOrderByIdAsc();
}
