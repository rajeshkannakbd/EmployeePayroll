package com.example.demo.repository;

import com.example.demo.entity.EmployeeCodeSequence;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeCodeSequenceRepository
        extends JpaRepository<EmployeeCodeSequence, Long> {
}