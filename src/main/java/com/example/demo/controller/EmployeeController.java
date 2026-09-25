package com.example.demo.controller;

import com.example.demo.dto.employee.EmployeeRequest;
import com.example.demo.dto.employee.EmployeeResponse;
import com.example.demo.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }


    // =========================================================
    // EMPLOYEE SELF PROFILE
    // EMPLOYEE can access only their own profile
    // URL: GET /employees/me
    // =========================================================

    @PreAuthorize("hasRole('EMPLOYEE')")
    @GetMapping("/me")
    public ResponseEntity<EmployeeResponse> getMyProfile(
            @AuthenticationPrincipal Jwt jwt
    ) {

        Long employeeId =
                ((Number) jwt.getClaim("employeeId"))
                        .longValue();

        EmployeeResponse employee =
                employeeService.getEmployeeById(employeeId);

        return ResponseEntity.ok(employee);
    }


    // =========================================================
    // GET ALL EMPLOYEES
    // ADMIN + HR
    // URL: GET /employees
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {

        List<EmployeeResponse> employees =
                employeeService.getAllEmployees();

        return ResponseEntity.ok(employees);
    }


    // =========================================================
    // GET EMPLOYEE BY ID
    // ADMIN + HR
    // URL: GET /employees/{id}
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeResponse> getEmployeeById(
            @PathVariable Long id
    ) {

        EmployeeResponse employee =
                employeeService.getEmployeeById(id);

        return ResponseEntity.ok(employee);
    }


    // =========================================================
    // CREATE EMPLOYEE
    // ADMIN + HR
    // URL: POST /employees
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PostMapping
    public ResponseEntity<EmployeeResponse> createEmployee(
            @Valid @RequestBody EmployeeRequest request
    ) {

        EmployeeResponse savedEmployee =
                employeeService.createEmployee(request);

        return ResponseEntity.ok(savedEmployee);
    }


    // =========================================================
    // UPDATE EMPLOYEE
    // ADMIN + HR
    // URL: PUT /employees/{id}
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeResponse> updateEmployee(
            @PathVariable Long id,
            @Valid @RequestBody EmployeeRequest request
    ) {

        EmployeeResponse updatedEmployee =
                employeeService.updateEmployee(
                        id,
                        request
                );

        return ResponseEntity.ok(updatedEmployee);
    }


    // =========================================================
    // DELETE EMPLOYEE
    // ADMIN + HR
    // URL: DELETE /employees/{id}
    // =========================================================

    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id
    ) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(
                "Employee deleted successfully"
        );
    }
}