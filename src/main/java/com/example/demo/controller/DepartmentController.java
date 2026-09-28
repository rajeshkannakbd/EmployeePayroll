package com.example.demo.controller;

import com.example.demo.dto.department.DepartmentRequest;
import com.example.demo.dto.department.DepartmentResponse;
import com.example.demo.service.DepartmentService;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(
            DepartmentService departmentService
    ) {
        this.departmentService = departmentService;
    }


    // GET ALL DEPARTMENTS
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    @GetMapping
    public List<DepartmentResponse> getAllDepartments() {

        return departmentService.getAllDepartments();
    }


    // GET DEPARTMENT BY ID
    @PreAuthorize("hasAuthority('DEPARTMENT_VIEW')")
    @GetMapping("/{id}")
    public DepartmentResponse getDepartmentById(
            @PathVariable Long id
    ) {

        return departmentService.getDepartmentById(id);
    }


    // CREATE DEPARTMENT
    @PreAuthorize("hasAuthority('DEPARTMENT_CREATE')")
    @PostMapping
    public DepartmentResponse createDepartment(
            @Valid @RequestBody DepartmentRequest request
    ) {

        return departmentService.createDepartment(request);
    }


    // UPDATE DEPARTMENT
    @PreAuthorize("hasAuthority('DEPARTMENT_EDIT')")
    @PutMapping("/{id}")
    public DepartmentResponse updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody DepartmentRequest request
    ) {

        return departmentService.updateDepartment(
                id,
                request
        );
    }


    // DELETE DEPARTMENT
    @PreAuthorize("hasAuthority('DEPARTMENT_DELETE')")
    @DeleteMapping("/{id}")
    public void deleteDepartment(
            @PathVariable Long id
    ) {

        departmentService.deleteDepartment(id);
    }
}