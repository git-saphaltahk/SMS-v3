package com.example.mystore.api.controller;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import com.example.mystore.api.dto.ReviewRequest;
import com.example.mystore.api.dto.ReviewResponse;
import com.example.mystore.entity.Product;
import com.example.mystore.entity.Review;
import com.example.mystore.entity.User;
import com.example.mystore.helper.CurrentUser;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.ReviewRepository;
import com.example.mystore.repo.UserRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CurrentUser currentUser;

    public ReviewController(ReviewRepository reviewRepository,
                            ProductRepository productRepository,
                            UserRepository userRepository,
                            CurrentUser currentUser) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.currentUser = currentUser;
    }

    @GetMapping("/product/{productId}")
    public List<ReviewResponse> getByProduct(@PathVariable Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @GetMapping("/product/{productId}/stats")
    public Map<String, Object> getProductStats(@PathVariable Long productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        Long count = reviewRepository.countByProductId(productId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0);
        stats.put("reviewCount", count);
        return stats;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReviewResponse create(@RequestBody @Valid ReviewRequest req) {
        Long userId = currentUser.getCurrentUserId();

        // Check if user already reviewed this product
        if (reviewRepository.existsByProductIdAndUserId(req.productId, userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this product");
        }

        Product product = productRepository.findById(req.productId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        Review review = new Review();
        review.setProduct(product);
        review.setUser(user);
        review.setRating(req.rating);
        review.setComment(req.comment != null ? req.comment : "");

        Review saved = reviewRepository.save(review);
        return ReviewResponse.from(saved);
    }

    @GetMapping("/latest")
    public List<ReviewResponse> getLatest() {
        return reviewRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }

    @GetMapping("/my")
    public List<ReviewResponse> getMyReviews() {
        Long userId = currentUser.getCurrentUserId();
        return reviewRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(ReviewResponse::from)
                .toList();
    }
}
