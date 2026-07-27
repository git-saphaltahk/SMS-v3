package com.example.mystore.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusDto {
    private Long paymentId;
    private String status;
    private String message;
}
