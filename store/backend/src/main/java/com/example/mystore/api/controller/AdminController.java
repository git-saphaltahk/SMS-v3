package com.example.mystore.api.controller;

import org.springframework.web.bind.annotation.*;

import com.example.mystore.entity.Order;
import com.example.mystore.entity.User;
import com.example.mystore.repo.OrderRepository;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.UserRepository;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public AdminController(UserRepository userRepository,
                           OrderRepository orderRepository,
                           ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }

    @GetMapping("/ping")
    public String ping() { return "ok"; }

    @GetMapping("/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
    }

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        List<Order> orders = orderRepository.findAll();

        long totalOrders = orders.size();
        BigDecimal totalRevenue = orders.stream()
                .map(o -> o.getGrandTotal() != null ? o.getGrandTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long fulfilledOrders = orders.stream()
                .filter(o -> "FULFILLED".equals(o.getOrderStatus() != null ? o.getOrderStatus().name() : null))
                .count();
        long totalProducts = productRepository.count();
        long totalUsers = userRepository.count();

        stats.put("totalOrders", totalOrders);
        stats.put("totalRevenue", totalRevenue);
        stats.put("fulfilledOrders", fulfilledOrders);
        stats.put("totalProducts", totalProducts);
        stats.put("totalUsers", totalUsers);

        return stats;
    }
}