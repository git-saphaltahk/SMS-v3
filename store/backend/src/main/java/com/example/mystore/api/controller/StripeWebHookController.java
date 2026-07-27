package com.example.mystore.api.controller;

import com.example.mystore.service.PaymentService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stripe/webhook")
@Slf4j
public class StripeWebHookController {
    private final PaymentService paymentService;
    private final String endpointSecret;

    public StripeWebHookController(PaymentService paymentService, @Value("${stripe.webhook.secret}") String endpointSecret) {
        this.paymentService = paymentService;
        this.endpointSecret = endpointSecret;
    }

    @PostMapping("/payment")
    public ResponseEntity<Void> handleStripeEvent(@RequestBody String payload, @RequestHeader("Stripe-Signature") String sigHeader) {
        try {
            Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
            log.info("Received Stripe event: {}", event.getType());

            if ("checkout.session.completed".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    paymentService.handleSessionCompleted(session.getId());
                }
            } else if ("checkout.session.expired".equals(event.getType())) {
                Session session = (Session) event.getDataObjectDeserializer().getObject().orElse(null);
                if (session != null) {
                    paymentService.handleSessionExpired(session.getId());
                }
            }

            return ResponseEntity.ok().build();
        } catch (SignatureVerificationException e) {
            log.error("Invalid Stripe signature", e);
            return ResponseEntity.status(401).build();
        } catch (Exception e) {
            log.error("Error processing Stripe webhook", e);
            return ResponseEntity.status(400).build();
        }
    }
}

