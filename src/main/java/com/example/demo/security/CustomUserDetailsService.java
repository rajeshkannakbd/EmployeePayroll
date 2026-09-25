package com.example.demo.security;

import java.util.List;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import com.example.demo.entity.Employee;
import com.example.demo.repository.EmployeeRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    public CustomUserDetailsService(EmployeeRepository employeeRepository) {
        this.employeeRepository = employeeRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String identifier)
            throws UsernameNotFoundException {

        String value = identifier == null
                ? ""
                : identifier.trim();

        if (value.isEmpty()) {
            throw new UsernameNotFoundException(
                    "Login identifier is required"
            );
        }

        Employee employee = findEmployee(value);

        if (employee == null) {
            throw new UsernameNotFoundException(
                    "Employee not found"
            );
        }

        if (employee.getPasswordHash() == null
                || employee.getPasswordHash().isBlank()) {

            throw new UsernameNotFoundException(
                    "Login account is not configured for this employee"
            );
        }

        if (employee.getRole() == null) {
            throw new UsernameNotFoundException(
                    "Role is not assigned to this employee"
            );
        }

        boolean enabled =
                "ACTIVE".equalsIgnoreCase(employee.getStatus());

        return User.builder()
                .username(employee.getEmployeeCode())
                .password(employee.getPasswordHash())
                .roles(employee.getRole().name())
                .disabled(!enabled)
                .build();
    }

    private Employee findEmployee(String identifier) {

        // 1. Employee Code
        var employeeByCode =
                employeeRepository
                        .findByEmployeeCodeIgnoreCase(identifier);

        if (employeeByCode.isPresent()) {
            return employeeByCode.get();
        }

        // 2. Email
        var employeeByEmail =
                employeeRepository
                        .findByEmailIgnoreCase(identifier);

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
}