package com.example.demo.service;

import com.example.demo.dto.department.DepartmentRequest;
import com.example.demo.dto.department.DepartmentResponse;
import com.example.demo.entity.Department;
import com.example.demo.mapper.DepartmentMapper;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EmployeeRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentMapper departmentMapper;


    public DepartmentService(
            DepartmentRepository departmentRepository,
            EmployeeRepository employeeRepository,
            DepartmentMapper departmentMapper
    ) {
        this.departmentRepository = departmentRepository;
        this.employeeRepository = employeeRepository;
        this.departmentMapper = departmentMapper;
    }


    // GET ALL
    @Cacheable("departments-all")
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getAllDepartments() {

        return departmentRepository.findAll()
                .stream()
                .map(departmentMapper::toResponse)
                .toList();
    }


    // CREATE
    @CacheEvict(
        cacheNames = "departments-all",
             allEntries = true
        )
    @Transactional
    public DepartmentResponse createDepartment(
            DepartmentRequest request
    ) {

        Department department =
                departmentMapper.toEntity(request);

        Department savedDepartment =
                departmentRepository.save(department);

        return departmentMapper.toResponse(savedDepartment);
    }


    // GET BY ID
    @Cacheable(
        cacheNames = "department-by-id",
        key = "#id"
        )
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartmentById(Long id) {

        Department department =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"
                                )
                        );

        return departmentMapper.toResponse(department);
    }


    // UPDATE
    @Caching(evict = {
        @CacheEvict(
                cacheNames = "departments-all",
                allEntries = true
        ),
        @CacheEvict(
                cacheNames = "department-by-id"
        )
        })
    @Transactional
    public DepartmentResponse updateDepartment(
            Long id,
            DepartmentRequest request
    ) {

        Department existingDepartment =
                departmentRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"
                                )
                        );

        departmentMapper.updateEntity(
                request,
                existingDepartment
        );

        Department updatedDepartment =
                departmentRepository.save(existingDepartment);

        return departmentMapper.toResponse(updatedDepartment);
    }


    // DELETE
    @Caching(evict = {
        @CacheEvict(
                cacheNames = "departments-all",
                allEntries = true
        ),
        @CacheEvict(
                cacheNames = "department-by-id",
                key = "#departmentId"
        )
        })
    @Transactional
    public void deleteDepartment(Long departmentId) {

        Department department =
                departmentRepository.findById(departmentId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Department not found"
                                )
                        );

        boolean assigned =
                employeeRepository
                        .existsByDepartment_DepartmentId(
                                departmentId
                        );

        if (assigned) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This department cannot be deleted because it is assigned to one or more employees. " +
                    "Reassign those employees to another department and try again."
            );
        }

        departmentRepository.delete(department);
    }
}