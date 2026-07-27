package com.example.mystore.service;

import com.example.mystore.entity.Order;
import com.example.mystore.entity.Payment;
import com.example.mystore.entity.User;
import com.example.mystore.enums.role.PaymentStatus;
import com.example.mystore.exception.PaymentException;
import com.example.mystore.exception.ResourceNotFoundException;
import com.example.mystore.exception.UnauthorizedException;
import com.example.mystore.helper.SecurityUtil;
import com.example.mystore.repo.OrderRepository;
import com.example.mystore.repo.PaymentRepository;
import com.example.mystore.repo.UserRepository;
import com.stripe.exception.StripeException;
import com.stripe.model.Customer;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.param.CustomerCreateParams;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@Slf4j
public class PaymentService {
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Value("${stripe.api.key:}")
    private String stripeApiKey;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Payment createPayment(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        String email = SecurityUtil.currentEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!order.getCustomer().getId().equals(user.getId())) {
            throw new UnauthorizedException("User is not authorized to pay for this order");
        }

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setUser(user);
        payment.setAmount(order.getGrandTotal());
        payment.setPaymentStatus(PaymentStatus.PENDING);
        payment.setPaymentMethod("stripe");

        return paymentRepository.save(payment);
    }

    @Transactional
    public String initiatePayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        String email = SecurityUtil.currentEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("User is not authorized to access this payment");
        }

        if (payment.getPaymentStatus() == PaymentStatus.COMPLETED) {
            throw new PaymentException("Payment is already completed");
        }

        try {
            String sessionUrl = getCheckoutSession(payment, user);
            payment.setPaymentStatus(PaymentStatus.PENDING);
            paymentRepository.save(payment);
            return sessionUrl;
        } catch (StripeException e) {
            log.error("Failed to create Stripe session", e);
            throw new PaymentException("Failed to create payment session: " + e.getMessage(), e);
        }
    }

    private String getCheckoutSession(Payment payment, User user) throws StripeException {
        log.info("Creating Stripe checkout session for payment: {}", payment.getId());

        // Create or retrieve customer
        CustomerCreateParams customerParams = CustomerCreateParams.builder()
                .setEmail(user.getEmail())
                .setName(user.getEmail())
                .build();

        Customer customer = Customer.create(customerParams);

        // Create checkout session
        String successUrl = frontendUrl + "/payment/success?paymentId=" + payment.getId();
        String cancelUrl = frontendUrl + "/payment/failure?paymentId=" + payment.getId();

        SessionCreateParams sessionParams = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomer(customer.getId())
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(payment.getAmount().multiply(BigDecimal.valueOf(100)).longValue())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName("Order #" + payment.getOrder().getId())
                                                                .setDescription("Payment for order")
                                                                .build()
                                                )
                                                .build()
                                )
                                .build()
                )
                .build();

        Session session = Session.create(sessionParams);
        payment.setStripeSessionId(session.getId());
        payment.setStripeCustomerId(customer.getId());
        paymentRepository.save(payment);

        log.info("Successfully created Stripe session: {}", session.getId());
        return session.getUrl();
    }

    @Transactional
    public void handleSessionCompleted(String sessionId) {
        try {
            Session session = Session.retrieve(sessionId);
            Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session: " + sessionId));

            if ("paid".equals(session.getPaymentStatus())) {
                payment.setPaymentStatus(PaymentStatus.COMPLETED);
                payment.setCompletedAt(LocalDateTime.now());
                payment.setStripePaymentIntentId(session.getPaymentIntent());

                Order order = payment.getOrder();
                order.setPaymentStatus(PaymentStatus.COMPLETED);
                orderRepository.save(order);

                paymentRepository.save(payment);
                log.info("Successfully confirmed payment: {}", payment.getId());
            }
        } catch (StripeException e) {
            log.error("Error handling session completion", e);
            throw new PaymentException("Error processing payment: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleSessionExpired(String sessionId) {
        Payment payment = paymentRepository.findByStripeSessionId(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found for session: " + sessionId));

        payment.setPaymentStatus(PaymentStatus.EXPIRED);
        paymentRepository.save(payment);
        log.info("Payment session expired: {}", payment.getId());
    }

    public Payment getPaymentDetails(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with id: " + paymentId));

        String email = SecurityUtil.currentEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!payment.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedException("User is not authorized to view this payment");
        }

        return payment;
    }
}