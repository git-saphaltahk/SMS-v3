package com.example.mystore.enums;

public class role {
    public enum Role {
    ADMIN, MANAGER,CASHIER, CUSTOMER
}

public enum OrderSource {
    CUSTOMER_PORTAL, POS
}

public enum OrderStatus {
    PLACED, FULFILLED
}

public enum PaymentStatus {
    UNPAID, PENDING, COMPLETED, FAILED, EXPIRED, CANCELLED
}
}
