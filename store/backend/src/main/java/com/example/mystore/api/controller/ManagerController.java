package com.example.mystore.api.controller;

import org.springframework.web.bind.annotation.*;

import com.example.mystore.entity.Order;
import com.example.mystore.entity.Product;
import com.example.mystore.entity.User;
import com.example.mystore.repo.OrderRepository;
import com.example.mystore.repo.ProductRepository;
import com.example.mystore.repo.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/manager")
public class ManagerController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    public ManagerController(ProductRepository productRepository,
                             OrderRepository orderRepository,
                             UserRepository userRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @GetMapping("/products")
    public List<Product> listProducts() {
        return productRepository.findAll();
    }

    @GetMapping("/orders")
    public List<Order> listOrders() {
        return orderRepository.findAll();
    }

    @GetMapping("/users")
    public List<User> listUsers() {
        return userRepository.findAll();
    }
}
