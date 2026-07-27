package com.example.mystore.api.dto.promotion;

import java.math.BigDecimal;

public class LoyaltyRuleDto {
    public Long id;
    public String name;
    public String description;
    public Integer pointsPerDollar;
    public BigDecimal currencyPerPoint;
    public Integer maxPointsPerOrder;
    public boolean active;
}
