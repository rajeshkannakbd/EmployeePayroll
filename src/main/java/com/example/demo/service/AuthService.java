package com.example.demo.service;

import java.util.List;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.security.JwtService;

@Service
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            EmployeeRepository employeeRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public Employee authenticateEmployee(
            String identifier,
            String password
    ) {

        String value =
                identifier == null
                        ? ""
                        : identifier.trim();

        if (value.isEmpty()) {
            throw new RuntimeException(
                    "Login identifier is required"
            );
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException(
                    "Password is required"
            );
        }

        Employee employee = findEmployee(value);

        if (employee == null) {
            throw new RuntimeException(
                    "Invalid login credentials"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(
                employee.getStatus()
        )) {
            throw new RuntimeException(
                    "Employee account is inactive"
            );
        }

        if (employee.getPasswordHash() == null
                || employee.getPasswordHash().isBlank()) {

            throw new RuntimeException(
                    "Login account is not configured"
            );
        }

        if (employee.getRole() == null) {
            throw new RuntimeException(
                    "Role is not assigned"
            );
        }

        boolean passwordMatches =
                passwordEncoder.matches(
                        password,
                        employee.getPasswordHash()
                );

        if (!passwordMatches) {
            throw new RuntimeException(
                    "Invalid login credentials"
            );
        }

        return employee;
    }

    private Employee findEmployee(String identifier) {

        // 1. Employee Code
        var employeeByCode =
                employeeRepository
                        .findByEmployeeCodeIgnoreCase(
                                identifier
                        );

        if (employeeByCode.isPresent()) {
            return employeeByCode.get();
        }

        // 2. Email
        var employeeByEmail =
                employeeRepository
                        .findByEmailIgnoreCase(
                                identifier
                        );

        if (employeeByEmail.isPresent()) {
            return employeeByEmail.get();
        }

        // 3. Mobile
        var employeeByPhone =
                employeeRepository
                        .findByPhone(identifier);

        if (employeeByPhone.isPresent()) {
            return employeeByPhone.get();
        }


        return null;
    }

    public String generateToken(Employee employee) {
        return jwtService.generateToken(employee);
    }
}