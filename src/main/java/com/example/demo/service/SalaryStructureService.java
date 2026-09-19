package com.example.demo.service;

import com.example.demo.entity.SalaryStructure;
import com.example.demo.repository.SalaryStructureRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class SalaryStructureService {

    private final SalaryStructureRepository salaryStructureRepository;

    public SalaryStructureService(
            SalaryStructureRepository salaryStructureRepository) {

        this.salaryStructureRepository = salaryStructureRepository;
    }

    // ---------------------------------------------------
    // GET ALL
    // ---------------------------------------------------

    public List<SalaryStructure> getAllSalaryStructures() {

        return salaryStructureRepository.findAll();
    }

    // ---------------------------------------------------
    // CREATE
    // ---------------------------------------------------

    public SalaryStructure createSalaryStructure(
            SalaryStructure salaryStructure) {

        if (salaryStructure.getEmployee() == null
                || salaryStructure.getEmployee().getEmployeeId() == null) {

            throw new RuntimeException("Employee is required");
        }

        Long employeeId =
                salaryStructure.getEmployee().getEmployeeId();

        // One salary structure per employee
        if (salaryStructureRepository
                .findByEmployee_EmployeeId(employeeId)
                .isPresent()) {

            throw new RuntimeException(
                    "Salary structure already exists for this employee"
            );
        }

        // Make optional fields safe
        salaryStructure.setHra(
                zeroIfNull(salaryStructure.getHra())
        );

        salaryStructure.setConveyance(
                zeroIfNull(salaryStructure.getConveyance())
        );

        salaryStructure.setSpecialAllowance(
                zeroIfNull(salaryStructure.getSpecialAllowance())
        );

        salaryStructure.setOtherAllowance(
                zeroIfNull(salaryStructure.getOtherAllowance())
        );

        salaryStructure.setEpf(
                zeroIfNull(salaryStructure.getEpf())
        );

        salaryStructure.setProfessionalTax(
                zeroIfNull(salaryStructure.getProfessionalTax())
        );

        salaryStructure.setTds(
                zeroIfNull(salaryStructure.getTds())
        );

        salaryStructure.setOtherDeductions(
                zeroIfNull(salaryStructure.getOtherDeductions())
        );

        return salaryStructureRepository.save(salaryStructure);
    }

    // ---------------------------------------------------
    // GET BY ID
    // ---------------------------------------------------

    public SalaryStructure getSalaryStructureById(Long id) {

        return salaryStructureRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Salary structure not found"
                        )
                );
    }

    // ---------------------------------------------------
    // UPDATE
    // ---------------------------------------------------

    public SalaryStructure updateSalaryStructure(
            Long id,
            SalaryStructure salaryStructure) {

        SalaryStructure existingSalaryStructure =
                salaryStructureRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                )
                        );

        // Do not change employee during normal edit
        // Employee is already associated with this salary structure.

        // Basic salary
        existingSalaryStructure.setBasicSalary(
                salaryStructure.getBasicSalary()
        );

        // Earnings
        existingSalaryStructure.setHra(
                zeroIfNull(salaryStructure.getHra())
        );

        existingSalaryStructure.setConveyance(
                zeroIfNull(salaryStructure.getConveyance())
        );

        existingSalaryStructure.setSpecialAllowance(
                zeroIfNull(salaryStructure.getSpecialAllowance())
        );

        existingSalaryStructure.setOtherAllowance(
                zeroIfNull(salaryStructure.getOtherAllowance())
        );

        // Deductions
        existingSalaryStructure.setEpf(
                zeroIfNull(salaryStructure.getEpf())
        );

        existingSalaryStructure.setProfessionalTax(
                zeroIfNull(salaryStructure.getProfessionalTax())
        );

        existingSalaryStructure.setTds(
                zeroIfNull(salaryStructure.getTds())
        );

        existingSalaryStructure.setOtherDeductions(
                zeroIfNull(salaryStructure.getOtherDeductions())
        );

        return salaryStructureRepository.save(
                existingSalaryStructure
        );
    }

    // ---------------------------------------------------
    // DELETE
    // ---------------------------------------------------

    public void deleteSalaryStructure(Long id) {

        SalaryStructure existingSalaryStructure =
                salaryStructureRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                )
                        );

        salaryStructureRepository.delete(existingSalaryStructure);
    }

    // ---------------------------------------------------
    // CALCULATE GROSS SALARY
    // ---------------------------------------------------

    public BigDecimal calculatedGrossSalary(
            SalaryStructure salaryStructure) {

        return zeroIfNull(salaryStructure.getBasicSalary())
                .add(zeroIfNull(salaryStructure.getHra()))
                .add(zeroIfNull(salaryStructure.getConveyance()))
                .add(zeroIfNull(
                        salaryStructure.getSpecialAllowance()
                ))
                .add(zeroIfNull(
                        salaryStructure.getOtherAllowance()
                ));
    }

    // ---------------------------------------------------
    // NULL SAFE DECIMAL
    // ---------------------------------------------------

    private BigDecimal zeroIfNull(BigDecimal value) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }
}