package com.example.mystore.api.dto;

import java.time.LocalDateTime;

public class ReviewResponse {
    public Long id;
    public Long productId;
    public String productName;
    public Long userId;
    public String userName;
    public Integer rating;
    public String comment;
    public LocalDateTime createdAt;

    public static ReviewResponse from(com.example.mystore.entity.Review review) {
        ReviewResponse r = new ReviewResponse();
        r.id = review.getId();
        r.productId = review.getProduct().getId();
        r.productName = review.getProduct().getName();
        r.userId = review.getUser().getId();
        r.userName = review.getUser().getEmail();
        r.rating = review.getRating();
        r.comment = review.getComment();
        r.createdAt = review.getCreatedAt();
        return r;
    }
}
