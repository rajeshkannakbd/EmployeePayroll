package com.example.demo.repository;
import com.example.demo.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface SalaryStructureRepository
        extends JpaRepository<SalaryStructure, Long> {

    Optional<SalaryStructure> findByEmployee_EmployeeId(
            Long employeeId
    );
}