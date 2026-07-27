package com.example.mystore.api.dto;

import java.math.BigDecimal;
import java.util.List;

public class RecommendationResponse {
    public List<RecommendedProduct> trending;
    public List<RecommendedProduct> topRated;
    public List<RecommendedProduct> forYou;
    public List<ReviewResponse> latestReviews;

    public static class RecommendedProduct {
        public Long id;
        public String name;
        public BigDecimal price;
        public String category;
        public Integer stockQuantity;
        public String imageName;
        public Double averageRating;
        public Long reviewCount;
        public String recommendationTag; // e.g. "畅销爆款🔥", "好评如潮⭐", "为你推荐💡"
    }
}
