package com.example.demo.controller;

import com.example.demo.entity.Department;
import com.example.demo.service.DepartmentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/departments")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(
            DepartmentService departmentService) {

        this.departmentService = departmentService;
    }

    // GET ALL DEPARTMENTS
    @GetMapping
    public List<Department> getAllDepartments() {

        return departmentService.getAllDepartments();
    }

    // GET DEPARTMENT BY ID
    @GetMapping("/{id}")
    public Department getDepartmentById(
            @PathVariable Long id) {

        return departmentService.getDepartmentById(id);
    }

    // CREATE DEPARTMENT
    @PostMapping
    public Department createDepartment(
            @Valid @RequestBody Department department) {

        return departmentService.createDepartment(department);
    }

    // UPDATE DEPARTMENT
    @PutMapping("/{id}")
    public Department updateDepartment(
            @PathVariable Long id,
            @Valid @RequestBody Department department) {

        return departmentService.updateDepartment(
                id,
                department
        );
    }

    // DELETE DEPARTMENT
    @DeleteMapping("/{id}")
    public void deleteDepartment(
            @PathVariable Long id) {

        departmentService.deleteDepartment(id);
    }
}