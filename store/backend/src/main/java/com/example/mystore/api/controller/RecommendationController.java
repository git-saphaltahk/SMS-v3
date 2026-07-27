package com.example.mystore.api.controller;

import org.springframework.web.bind.annotation.*;

import com.example.mystore.api.dto.RecommendationResponse;
import com.example.mystore.api.dto.ReviewResponse;
import com.example.mystore.entity.Product;
import com.example.mystore.helper.CurrentUser;
import com.example.mystore.repo.OrderRepository;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.ReviewRepository;
import com.example.mystore.service.PythonAiRecommendationService;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationController {

    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;
    private final OrderRepository orderRepository;
    private final CurrentUser currentUser;
    private final PythonAiRecommendationService pythonAiRecommendationService;

    public RecommendationController(ProductRepository productRepository,
                                     ReviewRepository reviewRepository,
                                     OrderRepository orderRepository,
                                     CurrentUser currentUser,
                                     PythonAiRecommendationService pythonAiRecommendationService) {
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
        this.orderRepository = orderRepository;
        this.currentUser = currentUser;
        this.pythonAiRecommendationService = pythonAiRecommendationService;
    }

    @GetMapping
    public RecommendationResponse getAll() {
        RecommendationResponse response = getAiRecommendations().orElseGet(() -> {
            RecommendationResponse fallback = new RecommendationResponse();
            fallback.trending = getTrendingProducts();
            fallback.topRated = getTopRatedProducts();
            fallback.forYou = getForYouProducts();
            return fallback;
        });
        response.latestReviews = reviewRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(ReviewResponse::from)
                .toList();
        return response;
    }

    @GetMapping("/trending")
    public List<RecommendationResponse.RecommendedProduct> getTrending() {
        return getAiRecommendations().map(r -> r.trending).orElseGet(this::getTrendingProducts);
    }

    @GetMapping("/top-rated")
    public List<RecommendationResponse.RecommendedProduct> getTopRated() {
        return getAiRecommendations().map(r -> r.topRated).orElseGet(this::getTopRatedProducts);
    }

    @GetMapping("/for-you")
    public List<RecommendationResponse.RecommendedProduct> getForYou() {
        return getAiRecommendations().map(r -> r.forYou).orElseGet(this::getForYouProducts);
    }

    private Optional<RecommendationResponse> getAiRecommendations() {
        Long userId = null;
        try {
            userId = currentUser.getCurrentUserId();
        } catch (Exception ignored) {
        }

        List<Product> allActiveProducts = productRepository.findAll().stream()
                .filter(Product::isActive)
                .collect(Collectors.toList());

        List<String> orderCategories = List.of();
        if (userId != null) {
            try {
                orderCategories = orderRepository.findDistinctCategoriesByUserId(userId);
            } catch (Exception ignored) {
            }
        }

        return pythonAiRecommendationService.fetchRecommendations(userId, allActiveProducts, orderCategories);
    }

    private List<RecommendationResponse.RecommendedProduct> getTrendingProducts() {
        // Trending = products with most reviews + active status, sorted by review count
        List<Object[]> mostReviewed = reviewRepository.findMostReviewedProducts();
        Set<Long> reviewedIds = mostReviewed.stream()
                .map(row -> (Long) row[0])
                .collect(Collectors.toSet());

        List<Product> allActive = productRepository.findAll().stream()
                .filter(Product::isActive)
                .collect(Collectors.toList());

        // Sort: reviewed products first (by review count), then unreviewed
        List<Product> sorted = new ArrayList<>();
        for (Object[] row : mostReviewed) {
            Long productId = (Long) row[0];
            productRepository.findById(productId).ifPresent(sorted::add);
        }
        for (Product p : allActive) {
            if (!reviewedIds.contains(p.getId())) {
                sorted.add(p);
            }
        }

        return sorted.stream()
                .limit(6)
                .map(p -> toRecommendedProduct(p, "🔥 Trending"))
                .collect(Collectors.toList());
    }

    private List<RecommendationResponse.RecommendedProduct> getTopRatedProducts() {
        List<Object[]> topRated = reviewRepository.findTopRatedProducts();

        List<RecommendationResponse.RecommendedProduct> result = new ArrayList<>();
        for (Object[] row : topRated) {
            Long productId = (Long) row[0];
            productRepository.findById(productId).ifPresent(product -> {
                if (product.isActive()) {
                    result.add(toRecommendedProduct(product, "⭐ Top Rated"));
                }
            });
        }
        return result.stream().limit(6).collect(Collectors.toList());
    }

    private List<RecommendationResponse.RecommendedProduct> getForYouProducts() {
        try {
            Long userId = currentUser.getCurrentUserId();

            // Find categories the user has ordered from
            List<String> userCategories = orderRepository.findDistinctCategoriesByUserId(userId);
            if (userCategories.isEmpty()) {
                // No order history — recommend trending products instead
                return getTrendingProducts().stream()
                        .peek(p -> p.recommendationTag = "💡 For You")
                        .collect(Collectors.toList());
            }

            // Recommend products from same categories, excluding what they've ordered
            List<Product> candidates = new ArrayList<>();
            for (String category : userCategories) {
                candidates.addAll(productRepository.findByCategory(category));
            }

            return candidates.stream()
                    .filter(Product::isActive)
                    .distinct()
                    .limit(6)
                    .map(p -> toRecommendedProduct(p, "💡 For You"))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            // If user is not authenticated, return trending as "for you"
            return getTrendingProducts().stream()
                    .peek(p -> p.recommendationTag = "💡 For You")
                    .collect(Collectors.toList());
        }
    }

    private RecommendationResponse.RecommendedProduct toRecommendedProduct(Product p, String tag) {
        RecommendationResponse.RecommendedProduct rp = new RecommendationResponse.RecommendedProduct();
        rp.id = p.getId();
        rp.name = p.getName();
        rp.price = p.getPrice();
        rp.category = p.getCategory();
        rp.stockQuantity = p.getStockQuantity();
        rp.imageName = p.getImageName();
        rp.recommendationTag = tag;

        Double avg = reviewRepository.getAverageRatingByProductId(p.getId());
        rp.averageRating = avg != null ? BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP).doubleValue() : 0.0;
        rp.reviewCount = reviewRepository.countByProductId(p.getId());

        return rp;
    }
}
