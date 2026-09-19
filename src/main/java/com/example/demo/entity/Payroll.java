package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.validation.constraints.PastOrPresent;
@Entity
@Table(
        name = "payroll",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_payroll_employee_period",
                        columnNames = {"employee_id", "pay_period"}
                )
        }
)
public class Payroll {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long payrollId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    @NotNull(message = "Employee is required")
    private Employee employee;

    @Column(name = "pay_period", nullable = false)
    @NotBlank(message = "Pay period is required")
    @Pattern(
            regexp = "\\d{4}-(0[1-9]|1[0-2])",
            message = "Pay period must be in YYYY-MM format"
    )
    private String payPeriod;

    @NotNull(message = "Pay date is required")
    @PastOrPresent(message = "Pay date cannot be in the future")
    private LocalDate payDate;


    // =========================
    // EARNINGS
    // =========================

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


    @NotNull(message = "HRA is required")
    @DecimalMin(
            value = "0.0",
            message = "HRA cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "HRA can have up to 2 decimal places"
    )
    private BigDecimal hra;


    @NotNull(message = "Conveyance is required")
    @DecimalMin(
            value = "0.0",
            message = "Conveyance cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Conveyance can have up to 2 decimal places"
    )
    private BigDecimal conveyance;


    @NotNull(message = "Special allowance is required")
    @DecimalMin(
            value = "0.0",
            message = "Special allowance cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Special allowance can have up to 2 decimal places"
    )
    private BigDecimal specialAllowance;


    @NotNull(message = "Other allowance is required")
    @DecimalMin(
            value = "0.0",
            message = "Other allowance cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Other allowance can have up to 2 decimal places"
    )
    private BigDecimal otherAllowance;


    // =========================
    // OVERTIME & BONUS
    // =========================

    @NotNull(message = "Overtime amount is required")
    @DecimalMin(
            value = "0.0",
            message = "Overtime cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Overtime can have up to 2 decimal places"
    )
    private BigDecimal overtime;


    @NotNull(message = "Bonus is required")
    @DecimalMin(
            value = "0.0",
            message = "Bonus cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Bonus can have up to 2 decimal places"
    )
    private BigDecimal bonus;


    // =========================
    // GROSS SALARY
    // =========================

    @NotNull(message = "Gross salary is required")
    @DecimalMin(
            value = "0.0",
            message = "Gross salary cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Gross salary can have up to 2 decimal places"
    )
    private BigDecimal grossSalary;


    // =========================
    // DEDUCTIONS
    // =========================

    @NotNull(message = "EPF is required")
    @DecimalMin(
            value = "0.0",
            message = "EPF cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "EPF can have up to 2 decimal places"
    )
    private BigDecimal epf;


    @NotNull(message = "Professional tax is required")
    @DecimalMin(
            value = "0.0",
            message = "Professional tax cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Professional tax can have up to 2 decimal places"
    )
    private BigDecimal professionalTax;


    @NotNull(message = "TDS is required")
    @DecimalMin(
            value = "0.0",
            message = "TDS cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "TDS can have up to 2 decimal places"
    )
    private BigDecimal tds;


    @NotNull(message = "Other deductions are required")
    @DecimalMin(
            value = "0.0",
            message = "Other deductions cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Other deductions can have up to 2 decimal places"
    )
    private BigDecimal otherDeductions;


    // =========================
    // TOTALS
    // =========================

    @NotNull(message = "Total deductions are required")
    @DecimalMin(
            value = "0.0",
            message = "Total deductions cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Total deductions can have up to 2 decimal places"
    )
    private BigDecimal totalDeductions;


    @NotNull(message = "Net salary is required")
    @DecimalMin(
            value = "0.0",
            message = "Net salary cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Net salary can have up to 2 decimal places"
    )
    private BigDecimal netSalary;


    // =========================
    // STATUS
    // =========================

    @NotBlank(message = "Status is required")
    private String status;


    // =========================
    // UNPAID LEAVE DEDUCTION
    // =========================

    @NotNull(message = "Unpaid leave deduction is required")
    @DecimalMin(
            value = "0.0",
            message = "Unpaid leave deduction cannot be negative"
    )
    @Digits(
            integer = 10,
            fraction = 2,
            message = "Unpaid leave deduction can have up to 2 decimal places"
    )
    private BigDecimal unpaidLeaveDeductions;


    // =========================
    // CONSTRUCTOR
    // =========================

    public Payroll() {
    }


    // =========================
    // GETTERS & SETTERS
    // =========================

    public Long getPayrollId() {
        return payrollId;
    }

    public void setPayrollId(Long payrollId) {
        this.payrollId = payrollId;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public String getPayPeriod() {
        return payPeriod;
    }

    public void setPayPeriod(String payPeriod) {
        this.payPeriod = payPeriod;
    }

    public LocalDate getPayDate() {
        return payDate;
    }

    public void setPayDate(LocalDate payDate) {
        this.payDate = payDate;
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

    public BigDecimal getConveyance() {
        return conveyance;
    }

    public void setConveyance(BigDecimal conveyance) {
        this.conveyance = conveyance;
    }

    public BigDecimal getSpecialAllowance() {
        return specialAllowance;
    }

    public void setSpecialAllowance(BigDecimal specialAllowance) {
        this.specialAllowance = specialAllowance;
    }

    public BigDecimal getOtherAllowance() {
        return otherAllowance;
    }

    public void setOtherAllowance(BigDecimal otherAllowance) {
        this.otherAllowance = otherAllowance;
    }

    public BigDecimal getOvertime() {
        return overtime;
    }

    public void setOvertime(BigDecimal overtime) {
        this.overtime = overtime;
    }

    public BigDecimal getBonus() {
        return bonus;
    }

    public void setBonus(BigDecimal bonus) {
        this.bonus = bonus;
    }

    public BigDecimal getGrossSalary() {
        return grossSalary;
    }

    public void setGrossSalary(BigDecimal grossSalary) {
        this.grossSalary = grossSalary;
    }

    public BigDecimal getEpf() {
        return epf;
    }

    public void setEpf(BigDecimal epf) {
        this.epf = epf;
    }

    public BigDecimal getProfessionalTax() {
        return professionalTax;
    }

    public void setProfessionalTax(BigDecimal professionalTax) {
        this.professionalTax = professionalTax;
    }

    public BigDecimal getTds() {
        return tds;
    }

    public void setTds(BigDecimal tds) {
        this.tds = tds;
    }

    public BigDecimal getOtherDeductions() {
        return otherDeductions;
    }

    public void setOtherDeductions(BigDecimal otherDeductions) {
        this.otherDeductions = otherDeductions;
    }

    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }

    public BigDecimal getNetSalary() {
        return netSalary;
    }

    public void setNetSalary(BigDecimal netSalary) {
        this.netSalary = netSalary;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getUnpaidLeaveDeductions() {
        return unpaidLeaveDeductions;
    }

    public void setUnpaidLeaveDeductions(BigDecimal unpaidLeaveDeductions) {
        this.unpaidLeaveDeductions = unpaidLeaveDeductions;
    }
}