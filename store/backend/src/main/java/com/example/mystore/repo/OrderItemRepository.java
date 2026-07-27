package com.example.mystore.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.mystore.entity.OrderItem;

import java.util.List;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);
}
