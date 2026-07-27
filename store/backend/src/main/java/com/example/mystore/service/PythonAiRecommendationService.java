package com.example.mystore.service;

import com.example.mystore.api.dto.RecommendationResponse;
import com.example.mystore.entity.Product;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PythonAiRecommendationService {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String recommendationUrl;

    public PythonAiRecommendationService(@Value("${ai.recommendation.url:http://localhost:5000}") String recommendationUrl,
                                         @Value("${ai.recommendation.timeout-ms:3000}") int timeoutMs,
                                         ObjectMapper objectMapper) {
        this.recommendationUrl = recommendationUrl.endsWith("/") ? recommendationUrl.substring(0, recommendationUrl.length() - 1) : recommendationUrl;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofMillis(timeoutMs))
                .build();
    }

    public Optional<RecommendationResponse> fetchRecommendations(Long userId,
                                                                   List<Product> products,
                                                                   List<String> orderCategories) {
        try {
            String requestBody = objectMapper.writeValueAsString(buildPayload(userId, products, orderCategories));
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(recommendationUrl + "/recommendations"))
                    .timeout(Duration.ofSeconds(5))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return Optional.empty();
            }
            RecommendationResponse recommendationResponse = objectMapper.readValue(response.body(), new TypeReference<>() {});
            return Optional.of(recommendationResponse);
        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            return Optional.empty();
        } catch (Exception e) {
            return Optional.empty();
        }
    }

    private Map<String, Object> buildPayload(Long userId,
                                             List<Product> products,
                                             List<String> orderCategories) {
        List<Map<String, Object>> productPayload = products.stream().map(product -> {
            Map<String, Object> item = new HashMap<>();
            item.put("id", product.getId());
            item.put("name", product.getName());
            item.put("category", product.getCategory());
            item.put("price", product.getPrice() != null ? product.getPrice().doubleValue() : 0.0);
            item.put("stockQuantity", product.getStockQuantity());
            item.put("imageName", product.getImageName());
            item.put("averageRating", 0.0);
            item.put("reviewCount", 0);
            item.put("active", product.isActive());
            return item;
        }).collect(Collectors.toList());

        Map<String, Object> payload = new HashMap<>();
        payload.put("userId", userId);
        payload.put("products", productPayload);
        payload.put("orderCategories", orderCategories != null ? orderCategories : List.of());
        return payload;
    }
}
