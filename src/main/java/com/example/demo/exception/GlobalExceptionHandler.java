package com.example.demo.exception;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // =========================================================
    // @Valid @RequestBody validation errors
    // =========================================================

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex) {
        

        Map<String, List<String>> errors = new LinkedHashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(error ->
                        errors.computeIfAbsent(
                                error.getField(),
                                key -> new ArrayList<>()
                        ).add(error.getDefaultMessage())
                );

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("message", "Validation failed");
        response.put("errors", errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // Hibernate / JPA validation errors
    // =========================================================

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraintViolation(
            ConstraintViolationException ex) {

        Map<String, List<String>> errors = new LinkedHashMap<>();

        for (ConstraintViolation<?> violation
                : ex.getConstraintViolations()) {

            String field =
                    violation.getPropertyPath().toString();

            String message =
                    violation.getMessage();

            errors.computeIfAbsent(
                    field,
                    key -> new ArrayList<>()
            ).add(message);
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("message", "Validation failed");
        response.put("errors", errors);

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    // =========================================================
    // ResponseStatusException
    // =========================================================

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>>
    handleResponseStatusException(
            ResponseStatusException ex) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        String message = ex.getReason();

        response.put(
                "message",
                message != null && !message.isBlank()
                        ? message
                        : "Request could not be completed."
        );

        return ResponseEntity
                .status(ex.getStatusCode())
                .body(response);
    }

    // =========================================================
    // DATABASE / UNIQUE CONSTRAINT ERRORS
    // =========================================================

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, Object>>
    handleDataIntegrityViolation(
            DataIntegrityViolationException ex) {

        String databaseMessage = "";

        if (ex.getMostSpecificCause() != null
                && ex.getMostSpecificCause().getMessage() != null) {

            databaseMessage =
                    ex.getMostSpecificCause()
                            .getMessage()
                            .toLowerCase();
        }

        String message;

        // Department duplicate
        if (databaseMessage.contains("department_name")) {

            message =
                    "Department name already exists. Please enter a different department name.";

        // Employee code duplicate
        } else if (databaseMessage.contains("employee_code")) {

            message =
                    "Employee code already exists. Please enter a different employee code.";

        // Email duplicate
        } else if (databaseMessage.contains("email")) {

            message =
                    "Email address already exists. Please use a different email address.";

        // Phone duplicate
        } else if (databaseMessage.contains("phone")) {

            message =
                    "Phone number already exists. Please use a different phone number.";

        // PAN duplicate
        } else if (databaseMessage.contains("pan_number")) {

            message =
                    "PAN number already exists. Please verify the PAN number.";

        // UAN duplicate
        } else if (databaseMessage.contains("uan_number")) {

            message =
                    "UAN number already exists. Please verify the UAN number.";

        // Bank account duplicate
        } else if (databaseMessage.contains("bank_account_number")) {

            message =
                    "Bank account number already exists. Please verify the bank account details.";

        // Attendance duplicate
        } else if (databaseMessage.contains(
                "uk_attendance_employee_period")) {

            message =
                    "Attendance already exists for this employee and pay period. Please edit the existing attendance record.";

        // Generic database conflict
        } else {

            message =
                    "The request could not be completed because it conflicts with existing data.";
        }

        Map<String, Object> response =
                new LinkedHashMap<>();

        response.put("message", message);

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(response);
    }

    // =========================================================
    // RuntimeException
    // =========================================================

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>>
    handleRuntimeException(
            RuntimeException ex) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        String message = ex.getMessage();

        response.put(
                "message",
                message != null && !message.isBlank()
                        ? message
                        : "Something went wrong. Please try again."
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }
    @ExceptionHandler(HttpMessageNotReadableException.class)
public ResponseEntity<Map<String, Object>> handleHttpMessageNotReadable(
        HttpMessageNotReadableException ex) {

    System.out.println();
    System.out.println("==============================================");
    System.out.println("JSON DESERIALIZATION ERROR");
    System.out.println("==============================================");

    System.out.println("MESSAGE:");
    System.out.println(ex.getMessage());

    System.out.println();
    System.out.println("MOST SPECIFIC CAUSE:");

    Throwable cause = ex.getMostSpecificCause();

    if (cause != null) {
        System.out.println(cause.getClass().getName());
        System.out.println(cause.getMessage());

        System.out.println();
        System.out.println("STACK TRACE:");
        cause.printStackTrace();
    }

    System.out.println("==============================================");
    System.out.println();

    Map<String, Object> response = new LinkedHashMap<>();

    response.put(
            "message",
            "Invalid JSON request. Check backend console for details."
    );

    return ResponseEntity
            .status(HttpStatus.BAD_REQUEST)
            .body(response);
}
}