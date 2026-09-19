package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

@Entity
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long salaryId;

    @OneToOne
    @JoinColumn(name = "employee_id", unique = true)
    private Employee employee;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(value = "0.0", message = "Basic salary cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Basic salary can have up to 2 decimal places"
    )
    private BigDecimal basicSalary;

    @DecimalMin(value = "0.0", message = "HRA cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "HRA can have up to 2 decimal places"
    )
    private BigDecimal hra;

    @DecimalMin(value = "0.0", message = "Conveyance cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Conveyance can have up to 2 decimal places"
    )
    private BigDecimal conveyance;

    @DecimalMin(value = "0.0", message = "Special allowance cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Special allowance can have up to 2 decimal places"
    )
    private BigDecimal specialAllowance;

    @DecimalMin(value = "0.0", message = "Other allowance cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Other allowance can have up to 2 decimal places"
    )
    private BigDecimal otherAllowance;

    @DecimalMin(value = "0.0", message = "EPF cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "EPF can have up to 2 decimal places"
    )
    private BigDecimal epf;

    @DecimalMin(value = "0.0", message = "Professional tax cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Professional tax can have up to 2 decimal places"
    )
    private BigDecimal professionalTax;

    @DecimalMin(value = "0.0", message = "TDS cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "TDS can have up to 2 decimal places"
    )
    private BigDecimal tds;

    @DecimalMin(value = "0.0", message = "Other deductions cannot be negative")
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Other deductions can have up to 2 decimal places"
    )
    private BigDecimal otherDeductions;


    public SalaryStructure() {
    }


    public SalaryStructure(
            Long salaryId,
            Employee employee,
            BigDecimal basicSalary,
            BigDecimal hra,
            BigDecimal conveyance,
            BigDecimal specialAllowance,
            BigDecimal otherAllowance,
            BigDecimal epf,
            BigDecimal professionalTax,
            BigDecimal tds,
            BigDecimal otherDeductions) {

        this.salaryId = salaryId;
        this.employee = employee;
        this.basicSalary = basicSalary;
        this.hra = hra;
        this.conveyance = conveyance;
        this.specialAllowance = specialAllowance;
        this.otherAllowance = otherAllowance;
        this.epf = epf;
        this.professionalTax = professionalTax;
        this.tds = tds;
        this.otherDeductions = otherDeductions;
    }


    public Long getSalaryId() {
        return salaryId;
    }

    public void setSalaryId(Long salaryId) {
        this.salaryId = salaryId;
    }


    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }


    public BigDecimal getBasicSalary() {
        return basicSalary;
    }

    public void setBasicSalary(BigDecimal basicSalary) {
        this.basicSalary = basicSalary;
    }


    public BigDecimal getHra() {
        return hra;
    }

    public void setHra(BigDecimal hra) {
        this.hra = hra;
    }


    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(BigDecimal specialAllowance) {
        this.specialAllowance = specialAllowance;
    }


    public BigDecimal getConveyance() {
        return conveyance;
    }

    public void setConveyance(BigDecimal conveyance) {
        this.conveyance = conveyance;
    }


    public BigDecimal getOtherAllowance() {
        return otherAllowance;
    }

    public void setOtherAllowance(BigDecimal otherAllowance) {
        this.otherAllowance = otherAllowance;
    }


    public BigDecimal getEpf() {
        return epf != null ? epf : BigDecimal.ZERO;
    }

    public void setEpf(BigDecimal epf) {
        this.epf = epf;
    }


    public BigDecimal getProfessionalTax() {
        return professionalTax != null
                ? professionalTax
                : BigDecimal.ZERO;
    }

    public void setProfessionalTax(BigDecimal professionalTax) {
        this.professionalTax = professionalTax;
    }


    public BigDecimal getTds() {
        return tds != null ? tds : BigDecimal.ZERO;
    }

    public void setTds(BigDecimal tds) {
        this.tds = tds;
    }


    public BigDecimal getOtherDeductions() {
        return otherDeductions != null
                ? otherDeductions
                : BigDecimal.ZERO;
    }

    public void setOtherDeductions(BigDecimal otherDeductions) {
        this.otherDeductions = otherDeductions;
    }
}