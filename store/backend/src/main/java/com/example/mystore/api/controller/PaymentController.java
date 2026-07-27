package com.example.mystore.api.controller;

import com.example.mystore.api.dto.CreatePaymentDto;
import com.example.mystore.api.dto.PaymentInitResponseDto;
import com.example.mystore.api.dto.PaymentStatusDto;
import com.example.mystore.entity.Payment;
import com.example.mystore.enums.role.PaymentStatus;
import com.example.mystore.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    public ResponseEntity<?> createPayment(@RequestBody Map<String, Object> request) {
        Long orderId = Long.valueOf(request.get("orderId").toString());
        Payment payment = paymentService.createPayment(orderId);

        // If "initiateCheckout" flag is set, also initiate Stripe checkout
        Object initiate = request.get("initiateCheckout");
        if (initiate != null && Boolean.TRUE.equals(
                initiate instanceof Boolean b ? b : Boolean.valueOf(initiate.toString()))) {
            String checkoutUrl = paymentService.initiatePayment(payment.getId());
            return ResponseEntity.ok(Map.of(
                "paymentId", payment.getId(),
                "checkoutUrl", checkoutUrl,
                "orderId", orderId,
                "status", "PENDING"
            ));
        }

        return ResponseEntity.ok(new PaymentStatusDto(
                payment.getId(),
                payment.getPaymentStatus().toString(),
                "Payment created successfully"
        ));
    }

    @PostMapping("/{paymentId}/initiate")
    public ResponseEntity<PaymentInitResponseDto> initiatePayment(@PathVariable Long paymentId) {
        String checkoutUrl = paymentService.initiatePayment(paymentId);
        Payment payment = paymentService.getPaymentDetails(paymentId);
        return ResponseEntity.ok(new PaymentInitResponseDto(
                checkoutUrl,
                paymentId,
                payment.getStripeSessionId()
        ));
    }

    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentStatusDto> getPaymentStatus(@PathVariable Long paymentId) {
        Payment payment = paymentService.getPaymentDetails(paymentId);
        return ResponseEntity.ok(new PaymentStatusDto(
                payment.getId(),
                payment.getPaymentStatus().toString(),
                "Payment status retrieved"
        ));
    }
}
