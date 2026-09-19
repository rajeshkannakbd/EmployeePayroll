package com.example.demo.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Employee;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByEmailIgnoreCase(String email);

    Optional<Employee> findByPhone(String phone);

    Optional<Employee> findByEmployeeCodeIgnoreCase(String employeeCode);

    List<Employee> findByFirstNameIgnoreCaseAndLastNameIgnoreCase(
            String firstName,
            String lastName
    );
}