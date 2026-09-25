package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.example.demo.dto.login.LoginRequest;
import com.example.demo.dto.login.LoginResponse;
import com.example.demo.dto.SignupRequest;
import com.example.demo.entity.Employee;
import com.example.demo.service.AuthService;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;

import com.example.demo.dto.ChangePasswordRequest;


@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {

        Employee employee =
                authService.authenticateEmployee(
                        request.getIdentifier(),
                        request.getPassword()
                );

        String token =
                authService.generateToken(employee);

        String employeeName =
                (
                    employee.getFirstName() +
                    " " +
                    employee.getLastName()
                ).trim();

        LoginResponse response =
                new LoginResponse(
                        token,
                        employee.getEmployeeId(),
                        employee.getEmployeeCode(),
                        employeeName,
                        employee.getRole().name(),
                        employee.isMustChangePassword()
                );

        return ResponseEntity.ok(response);
    }

@PostMapping("/signup")
public ResponseEntity<Map<String, String>> signup(
        @Valid @RequestBody SignupRequest request) {

    System.out.println("========== SIGNUP CONTROLLER REACHED ==========");

    authService.signupEmployeeAccount(
            request.getEmployeeCode(),
            request.getEmail(),
            request.getPassword(),
            request.getConfirmPassword()
    );

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(Map.of(
                    "message",
                    "Account created successfully. You can now login."
            ));
}
@PostMapping("/change-password")
public ResponseEntity<Map<String, String>> changePassword(
        @Valid @RequestBody ChangePasswordRequest request,
        Authentication authentication) {

    Jwt jwt = (Jwt) authentication.getPrincipal();

    Number employeeIdClaim =
            jwt.getClaim("employeeId");

    if (employeeIdClaim == null) {
        throw new RuntimeException(
                "Employee ID is missing from authentication token"
        );
    }

    Long employeeId =
            employeeIdClaim.longValue();

    authService.changePassword(
            employeeId,
            request
    );

    return ResponseEntity.ok(
            Map.of(
                    "message",
                    "Password changed successfully."
            )
    );
}
}