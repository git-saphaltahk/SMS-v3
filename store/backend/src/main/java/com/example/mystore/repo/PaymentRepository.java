package com.example.mystore.repo;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.mystore.entity.Payment;
import java.util.Optional;
import java.util.List;


public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByStripeSessionId(String stripeSessionId);
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);
    List<Payment> findByUserId(Long userId);
    List<Payment> findByOrderId(Long orderId);
}
