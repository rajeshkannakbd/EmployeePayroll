package com.example.demo.service;

import com.example.demo.entity.Department;
import com.example.demo.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    // GET ALL
    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    // CREATE
    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    // GET BY ID
    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Department not found"));
    }

    // UPDATE
    public Department updateDepartment(
            Long id,
            Department department) {

        Department existingDepartment =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"));

        existingDepartment.setDepartmentName(
                department.getDepartmentName()
        );

        return departmentRepository.save(existingDepartment);
    }

    // DELETE
    public void deleteDepartment(Long id) {

        departmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found"));

        departmentRepository.deleteById(id);
    }
}