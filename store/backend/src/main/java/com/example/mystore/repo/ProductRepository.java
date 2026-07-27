package com.example.mystore.repo;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;

import com.example.mystore.entity.Product;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

    List<Product> findByCategory(String category);

    @Query("select distinct p.category from Product p where p.active = true")
    List<String> findDistinctCategories();
}