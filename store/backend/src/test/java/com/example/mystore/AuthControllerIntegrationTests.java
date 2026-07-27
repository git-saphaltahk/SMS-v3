package com.example.mystore;

import com.example.mystore.api.dto.AuthResponse;
import com.example.mystore.api.dto.LoginRequest;
import com.example.mystore.api.dto.RegisterRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AuthControllerIntegrationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void registerCustomer_shouldReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest();
        request.email = "newcustomer@example.com";
        request.password = "password123";
        request.role = "CUSTOMER";

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/register", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.accessToken).isNotBlank();
        assertThat(body.role).isEqualTo("CUSTOMER");
        assertThat(body.userId).isNotNull();
    }

    @Test
    void registerStaff_shouldReturnAuthResponse() {
        RegisterRequest request = new RegisterRequest();
        request.email = "newstaff@example.com";
        request.password = "password123";
        request.role = "CASHIER";

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/register", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.accessToken).isNotBlank();
        assertThat(body.role).isEqualTo("CASHIER");
        assertThat(body.userId).isNotNull();
    }

    @Test
    void loginSeededCustomer_shouldReturnCustomerRole() {
        LoginRequest request = new LoginRequest();
        request.email = "customer@example.com";
        request.password = "password123";

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.accessToken).isNotBlank();
        assertThat(body.role).isEqualTo("CUSTOMER");
        assertThat(body.userId).isNotNull();
    }

    @Test
    void loginSeededStaff_shouldReturnCashierRole() {
        LoginRequest request = new LoginRequest();
        request.email = "staff@store.com";
        request.password = "password123";

        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/auth/login", request, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.accessToken).isNotBlank();
        assertThat(body.role).isEqualTo("CASHIER");
        assertThat(body.userId).isNotNull();
    }
}
