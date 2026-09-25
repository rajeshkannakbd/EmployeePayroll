package com.example.demo.service;

import com.example.demo.dto.employee.EmployeeRequest;
import com.example.demo.dto.employee.EmployeeResponse;
import com.example.demo.entity.Department;
import com.example.demo.entity.Employee;
import com.example.demo.entity.EmployeeCodeSequence;
import com.example.demo.entity.Role;
import com.example.demo.mapper.EmployeeMapper;
import com.example.demo.repository.DepartmentRepository;
import com.example.demo.repository.EmployeeCodeSequenceRepository;
import com.example.demo.repository.EmployeeRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;

@Service
public class EmployeeService {

    private static final String DEFAULT_PASSWORD = "welcome@123";
    private static final int EMPLOYEE_CODE_OFFSET = 2026;

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final EmployeeCodeSequenceRepository employeeCodeSequenceRepository;
    private final EmployeeMapper employeeMapper;
    private final PasswordEncoder passwordEncoder;


    public EmployeeService(
            EmployeeRepository employeeRepository,
            DepartmentRepository departmentRepository,
            EmployeeCodeSequenceRepository employeeCodeSequenceRepository,
            EmployeeMapper employeeMapper,
            PasswordEncoder passwordEncoder
    ) {
        this.employeeRepository = employeeRepository;
        this.departmentRepository = departmentRepository;
        this.employeeCodeSequenceRepository = employeeCodeSequenceRepository;
        this.employeeMapper = employeeMapper;
        this.passwordEncoder = passwordEncoder;
    }


    // GET ALL EMPLOYEES
    @Cacheable("employees-all")
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(employeeMapper::toResponse)
                .toList();
    }


    // CREATE EMPLOYEE
    @CacheEvict(
        cacheNames = "employees-all",
        allEntries = true
        )
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {

        Employee employee = employeeMapper.toEntity(request);

        // Department
        employee.setDepartment(
                getDepartment(request.getDepartmentId())
        );

        // Auto-generated employee code
        EmployeeCodeSequence sequence =
                employeeCodeSequenceRepository.saveAndFlush(
                        new EmployeeCodeSequence()
                );

        String employeeCode = String.format(
                "EMP-%04d",
                sequence.getId() + EMPLOYEE_CODE_OFFSET
        );

        employee.setEmployeeCode(employeeCode);

        // Default login password
        employee.setPasswordHash(
                passwordEncoder.encode(DEFAULT_PASSWORD)
        );

        // Force password change at first login
        employee.setMustChangePassword(true);

        // Default role
        employee.setRole(Role.EMPLOYEE);

        Employee savedEmployee =
                employeeRepository.save(employee);

        return employeeMapper.toResponse(savedEmployee);
    }


    // GET EMPLOYEE BY ID
    @Cacheable(cacheNames = "employee-by-id",key = "#id")
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployeeById(Long id) {
        Employee employee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );

        return employeeMapper.toResponse(employee);
    }


    // UPDATE EMPLOYEE
    @Caching(evict = {
        @CacheEvict(
                cacheNames = "employees-all",
                allEntries = true
        ),
        @CacheEvict(
                cacheNames = "employee-by-id",
                key = "#id"
        )
        })
    @Transactional
    public EmployeeResponse updateEmployee(
            Long id,
            EmployeeRequest request
    ) {

        Employee existingEmployee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );

        employeeMapper.updateEntity(
                request,
                existingEmployee
        );

        existingEmployee.setDepartment(
                getDepartment(request.getDepartmentId())
        );

        Employee updatedEmployee =
                employeeRepository.save(existingEmployee);

        return employeeMapper.toResponse(updatedEmployee);
    }


    // DELETE EMPLOYEE
    @Caching(evict = {
        @CacheEvict(
                cacheNames = "employees-all",
                allEntries = true
        ),
        @CacheEvict(
                cacheNames = "employee-by-id",
                key = "#id"
        )
        })
    @Transactional
    public void deleteEmployee(Long id) {

        Employee employee =
                employeeRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Employee not found"
                                )
                        );

        employeeRepository.delete(employee);
    }


    // DEPARTMENT HELPER

    private Department getDepartment(Long departmentId) {

        if (departmentId == null) {
            return null;
        }

        return departmentRepository.findById(departmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Department not found"
                        )
                );
    }
}