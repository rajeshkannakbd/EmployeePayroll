package com.example.demo.controller;

import com.example.demo.dto.employee.EmployeeRequest;
import com.example.demo.dto.employee.EmployeeResponse;
import com.example.demo.service.EmployeeService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.demo.dto.employee.AssignRoleRequest;
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
    // Permission: EMPLOYEE_VIEW
    // URL: GET /employees
    // =========================================================

    @PreAuthorize("hasAuthority('EMPLOYEE_VIEW')")
    @GetMapping
    public ResponseEntity<List<EmployeeResponse>> getAllEmployees() {

        List<EmployeeResponse> employees =
                employeeService.getAllEmployees();

        return ResponseEntity.ok(employees);
    }


    // =========================================================
    // GET EMPLOYEE BY ID
    // Permission: EMPLOYEE_VIEW
    // URL: GET /employees/{id}
    // =========================================================

    @PreAuthorize("hasAuthority('EMPLOYEE_VIEW')")
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
    // Permission: EMPLOYEE_CREATE
    // URL: POST /employees
    // =========================================================

    @PreAuthorize("hasAuthority('EMPLOYEE_CREATE')")
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
    // Permission: EMPLOYEE_EDIT
    // URL: PUT /employees/{id}
    // =========================================================

    @PreAuthorize("hasAuthority('EMPLOYEE_EDIT')")
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
    // Permission: EMPLOYEE_DELETE
    // URL: DELETE /employees/{id}
    // =========================================================

    @PreAuthorize("hasAuthority('EMPLOYEE_DELETE')")
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEmployee(
            @PathVariable Long id
    ) {

        employeeService.deleteEmployee(id);

        return ResponseEntity.ok(
                "Employee deleted successfully"
        );
    }


    // =========================================================
    // ASSIGN ROLE
    // ADMIN ONLY
    // URL: PATCH /employees/{id}/role
    // =========================================================

    @PatchMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EmployeeResponse> assignRole(
            @PathVariable Long id,
            @Valid @RequestBody AssignRoleRequest request
    ) {

        return ResponseEntity.ok(
                employeeService.assignRole(
                        id,
                        request.getRoleId()
                )
        );
    }
}