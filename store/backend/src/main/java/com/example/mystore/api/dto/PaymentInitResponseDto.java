package com.example.mystore.api.dto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentInitResponseDto {
    private String sessionUrl;
    private Long paymentId;
    private String sessionId;
}

