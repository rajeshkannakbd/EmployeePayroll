package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class SalaryStructure {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long salaryId;

    @OneToOne
    @JoinColumn(
        name = "employee_id",
        nullable = false,
        unique = true
    )
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private SalaryTemplate template;
}