package com.example.demo.dto.salary;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
public class SalaryStructureRequest {

    @NotNull(message = "Employee is required")
    private Long employeeId;

    private Long templateId;

    @NotNull(message = "Basic salary is required")
    @DecimalMin(
            value = "0.0",
            message = "Basic salary cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Basic salary can have up to 2 decimal places"
    )
    private BigDecimal basicSalary;

    @DecimalMin(value = "0.0", message = "HRA cannot be negative")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal hra;

    @DecimalMin(value = "0.0", message = "Conveyance cannot be negative")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal conveyance;

    @DecimalMin(
            value = "0.0",
            message = "Special allowance cannot be negative"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal specialAllowance;

    @DecimalMin(
            value = "0.0",
            message = "Other allowance cannot be negative"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal otherAllowance;

    @DecimalMin(value = "0.0", message = "EPF cannot be negative")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal epf;

    @DecimalMin(
            value = "0.0",
            message = "Professional tax cannot be negative"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal professionalTax;

    @DecimalMin(value = "0.0", message = "TDS cannot be negative")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal tds;

    @DecimalMin(
            value = "0.0",
            message = "Other deductions cannot be negative"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal otherDeductions;
}