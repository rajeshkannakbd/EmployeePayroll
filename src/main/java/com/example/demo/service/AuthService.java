package com.example.demo.service;

import com.example.demo.dto.ChangePasswordRequest;
import com.example.demo.entity.Employee;
import com.example.demo.entity.Role;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.security.JwtService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;


    // =========================================================
    // AUTHENTICATE EMPLOYEE
    // =========================================================

    @Transactional(readOnly = true)
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
                    "Please create your account before logging in"
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


    // =========================================================
    // SIGNUP EMPLOYEE ACCOUNT
    // =========================================================

    @Transactional
    public void signupEmployeeAccount(
            String employeeCode,
            String email,
            String password,
            String confirmPassword
    ) {

        String code =
                employeeCode == null
                        ? ""
                        : employeeCode.trim();

        String emailValue =
                email == null
                        ? ""
                        : email.trim();

        if (code.isEmpty()) {
            throw new RuntimeException(
                    "Employee code is required"
            );
        }

        if (emailValue.isEmpty()) {
            throw new RuntimeException(
                    "Email is required"
            );
        }

        if (password == null || password.isBlank()) {
            throw new RuntimeException(
                    "Password is required"
            );
        }

        if (!password.equals(confirmPassword)) {
            throw new RuntimeException(
                    "Password and confirm password do not match"
            );
        }

        if (password.length() < 8) {
            throw new RuntimeException(
                    "Password must be at least 8 characters"
            );
        }


        Employee employee =
                employeeRepository
                        .findByEmployeeCodeIgnoreCase(code)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found. Please contact HR."
                                )
                        );


        if (!employee.getEmail()
                .equalsIgnoreCase(emailValue)) {

            throw new RuntimeException(
                    "Employee code and registered email do not match"
            );
        }


        // Assign default role if no role exists

        if (employee.getRole() == null) {
            employee.setRole(Role.EMPLOYEE);
        }


        // Prevent creating the account twice

        if (employee.getPasswordHash() != null
                && !employee.getPasswordHash().isBlank()) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "An account already exists for this employee"
            );
        }


        String passwordHash =
                passwordEncoder.encode(password);

        employee.setPasswordHash(passwordHash);

        employeeRepository.save(employee);
    }


    // =========================================================
    // FIND EMPLOYEE
    // =========================================================

    private Employee findEmployee(String identifier) {

        // 1. Employee code

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


    // =========================================================
    // GENERATE JWT TOKEN
    // =========================================================

    public String generateToken(Employee employee) {

        return jwtService.generateToken(employee);
    }


    // =========================================================
    // CHANGE PASSWORD
    // =========================================================

    @Transactional
    public void changePassword(
            Long employeeId,
            ChangePasswordRequest request
    ) {

        Employee employee =
                employeeRepository.findById(employeeId)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "Employee not found"
                                )
                        );


        // Verify current password

        if (!passwordEncoder.matches(
                request.getCurrentPassword(),
                employee.getPasswordHash()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Current password is incorrect"
            );
        }


        // Confirm new password

        if (!request.getNewPassword().equals(
                request.getConfirmPassword()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "New password and confirm password do not match"
            );
        }


        // Prevent reusing current password

        if (request.getCurrentPassword().equals(
                request.getNewPassword()
        )) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "New password must be different from current password"
            );
        }


        // Hash new password

        String encodedPassword =
                passwordEncoder.encode(
                        request.getNewPassword()
                );

        employee.setPasswordHash(encodedPassword);


        // First-login restriction completed

        employee.setMustChangePassword(false);

        employeeRepository.save(employee);
    }
}