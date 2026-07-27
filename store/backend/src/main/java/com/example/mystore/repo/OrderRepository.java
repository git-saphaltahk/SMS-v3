package com.example.mystore.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.mystore.entity.Order;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT DISTINCT oi.product.category FROM OrderItem oi " +
           "WHERE oi.order.customer.id = :userId")
    List<String> findDistinctCategoriesByUserId(@Param("userId") Long userId);
}
