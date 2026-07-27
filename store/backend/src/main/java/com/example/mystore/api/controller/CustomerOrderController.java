package com.example.mystore.api.controller;

import org.springframework.web.bind.annotation.*;

import com.example.mystore.api.dto.PlaceCustomerOrderRequest;
import com.example.mystore.api.dto.PlaceCustomerOrderResponse;
import com.example.mystore.helper.CurrentUser;
import com.example.mystore.service.CustomerOrderService;

@RestController
@RequestMapping("/api/customer")
public class CustomerOrderController {

    private final CurrentUser currentUser;
    private final CustomerOrderService customerOrderService;

    public CustomerOrderController(CurrentUser currentUser,
                                   CustomerOrderService customerOrderService) {
        this.currentUser = currentUser;
        this.customerOrderService = customerOrderService;
    }

    @PostMapping("/orders")
    public PlaceCustomerOrderResponse placeOrder(
        @RequestBody PlaceCustomerOrderRequest req) {
        Long customerId = currentUser.getCurrentUserId();
        return customerOrderService.placeOrder(customerId, req);
    }
}
