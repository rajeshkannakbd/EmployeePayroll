package com.example.demo.service;

import com.example.demo.dto.salary.SalaryStructureRequest;
import com.example.demo.entity.Employee;
import com.example.demo.entity.SalaryStructure;
import com.example.demo.entity.SalaryTemplate;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.SalaryStructureRepository;
import com.example.demo.repository.SalaryTemplateRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalaryStructureService {

    private final SalaryStructureRepository salaryStructureRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryTemplateRepository salaryTemplateRepository;

    // ---------------------------------------------------
    // GET ALL
    // ---------------------------------------------------

    @Transactional(readOnly = true)
    public List<SalaryStructure> getAllSalaryStructures() {

        return salaryStructureRepository.findAll();
    }

    // ---------------------------------------------------
    // CREATE
    // ---------------------------------------------------

    @Transactional
    public SalaryStructure createSalaryStructure(
            SalaryStructureRequest request) {

        // ------------------------------------------------
        // EMPLOYEE
        // ------------------------------------------------

        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"
                        )
                );

        // ------------------------------------------------
        // ONE SALARY STRUCTURE PER EMPLOYEE
        // ------------------------------------------------

        if (salaryStructureRepository
                .findByEmployee_EmployeeId(
                        request.getEmployeeId()
                )
                .isPresent()) {

            throw new RuntimeException(
                    "Salary structure already exists for this employee"
            );
        }

        // ------------------------------------------------
        // CREATE ENTITY
        // ------------------------------------------------

        SalaryStructure salaryStructure =
                new SalaryStructure();

        salaryStructure.setEmployee(employee);

        // ------------------------------------------------
        // TEMPLATE
        // ------------------------------------------------

        if (request.getTemplateId() != null) {

            SalaryTemplate template =
                    salaryTemplateRepository
                            .findById(request.getTemplateId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Salary template not found"
                                    )
                            );

            salaryStructure.setTemplate(template);
        }

        // ------------------------------------------------
        // SALARY VALUES
        // ------------------------------------------------

        salaryStructure.setBasicSalary(
                request.getBasicSalary()
        );

        salaryStructure.setHra(
                zeroIfNull(request.getHra())
        );

        salaryStructure.setConveyance(
                zeroIfNull(request.getConveyance())
        );

        salaryStructure.setSpecialAllowance(
                zeroIfNull(request.getSpecialAllowance())
        );

        salaryStructure.setOtherAllowance(
                zeroIfNull(request.getOtherAllowance())
        );

        // ------------------------------------------------
        // DEDUCTIONS
        // ------------------------------------------------

        salaryStructure.setEpf(
                zeroIfNull(request.getEpf())
        );

        salaryStructure.setProfessionalTax(
                zeroIfNull(request.getProfessionalTax())
        );

        salaryStructure.setTds(
                zeroIfNull(request.getTds())
        );

        salaryStructure.setOtherDeductions(
                zeroIfNull(request.getOtherDeductions())
        );

        return salaryStructureRepository.save(
                salaryStructure
        );
    }

    // ---------------------------------------------------
    // GET BY ID
    // ---------------------------------------------------

    @Transactional(readOnly = true)
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

    @Transactional
    public SalaryStructure updateSalaryStructure(
            Long id,
            SalaryStructureRequest request) {

        SalaryStructure existingSalaryStructure =
                salaryStructureRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                )
                        );

        // ------------------------------------------------
        // EMPLOYEE IS NOT CHANGED DURING NORMAL EDIT
        // ------------------------------------------------

        // ------------------------------------------------
        // TEMPLATE
        // ------------------------------------------------

        if (request.getTemplateId() != null) {

            SalaryTemplate template =
                    salaryTemplateRepository
                            .findById(request.getTemplateId())
                            .orElseThrow(() ->
                                    new RuntimeException(
                                            "Salary template not found"
                                    )
                            );

            existingSalaryStructure.setTemplate(
                    template
            );

        } else {

            existingSalaryStructure.setTemplate(null);
        }

        // ------------------------------------------------
        // BASIC SALARY
        // ------------------------------------------------

        existingSalaryStructure.setBasicSalary(
                request.getBasicSalary()
        );

        // ------------------------------------------------
        // EARNINGS
        // ------------------------------------------------

        existingSalaryStructure.setHra(
                zeroIfNull(request.getHra())
        );

        existingSalaryStructure.setConveyance(
                zeroIfNull(request.getConveyance())
        );

        existingSalaryStructure.setSpecialAllowance(
                zeroIfNull(request.getSpecialAllowance())
        );

        existingSalaryStructure.setOtherAllowance(
                zeroIfNull(request.getOtherAllowance())
        );

        // ------------------------------------------------
        // DEDUCTIONS
        // ------------------------------------------------

        existingSalaryStructure.setEpf(
                zeroIfNull(request.getEpf())
        );

        existingSalaryStructure.setProfessionalTax(
                zeroIfNull(request.getProfessionalTax())
        );

        existingSalaryStructure.setTds(
                zeroIfNull(request.getTds())
        );

        existingSalaryStructure.setOtherDeductions(
                zeroIfNull(request.getOtherDeductions())
        );

        return salaryStructureRepository.save(
                existingSalaryStructure
        );
    }

    // ---------------------------------------------------
    // DELETE
    // ---------------------------------------------------

    @Transactional
    public void deleteSalaryStructure(Long id) {

        SalaryStructure existingSalaryStructure =
                salaryStructureRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                )
                        );

        salaryStructureRepository.delete(
                existingSalaryStructure
        );
    }

    // ---------------------------------------------------
    // CALCULATE GROSS SALARY
    // ---------------------------------------------------

    public BigDecimal calculatedGrossSalary(
            SalaryStructure salaryStructure) {

        return zeroIfNull(
                salaryStructure.getBasicSalary()
        )
        .add(
                zeroIfNull(
                        salaryStructure.getHra()
                )
        )
        .add(
                zeroIfNull(
                        salaryStructure.getConveyance()
                )
        )
        .add(
                zeroIfNull(
                        salaryStructure.getSpecialAllowance()
                )
        )
        .add(
                zeroIfNull(
                        salaryStructure.getOtherAllowance()
                )
        );
    }

    // ---------------------------------------------------
    // NULL SAFE DECIMAL
    // ---------------------------------------------------

    private BigDecimal zeroIfNull(
            BigDecimal value) {

        return value != null
                ? value
                : BigDecimal.ZERO;
    }
}