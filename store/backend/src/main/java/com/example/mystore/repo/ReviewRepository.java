package com.example.mystore.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.mystore.entity.Review;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.product.id = :productId")
    Long countByProductId(@Param("productId") Long productId);

    List<Review> findTop10ByOrderByCreatedAtDesc();

    @Query("SELECT r.product.id, AVG(r.rating) as avgRating, COUNT(r) as cnt " +
           "FROM Review r GROUP BY r.product.id HAVING COUNT(r) >= 2 " +
           "ORDER BY avgRating DESC")
    List<Object[]> findTopRatedProducts();

    @Query("SELECT r.product.id, COUNT(r) as cnt FROM Review r " +
           "GROUP BY r.product.id ORDER BY cnt DESC")
    List<Object[]> findMostReviewedProducts();

    boolean existsByProductIdAndUserId(Long productId, Long userId);
}
