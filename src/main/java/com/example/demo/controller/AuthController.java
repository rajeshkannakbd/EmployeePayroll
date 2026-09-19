package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.LoginResponse;
import com.example.demo.entity.Employee;
import com.example.demo.service.AuthService;

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
                        employee.getRole().name()
                );

        return ResponseEntity.ok(response);
    }
}