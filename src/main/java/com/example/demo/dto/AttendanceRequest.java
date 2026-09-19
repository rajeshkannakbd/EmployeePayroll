package com.example.demo.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class AttendanceRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotNull(message = "Pay period is required")
    private String payPeriod;

    @NotNull(message = "Working days are required")
    @Min(value = 1, message = "Working days must be at least 1")
    private Integer workingDays;

    @NotNull(message = "Present days are required")
    @Min(value = 0, message = "Present days cannot be negative")
    private Integer presentDays;

    @NotNull(message = "Leave days are required")
    @Min(value = 0, message = "Leave days cannot be negative")
    private Integer leaveDays;

    @NotNull(message = "Unpaid leave days are required")
    @Min(value = 0, message = "Unpaid leave days cannot be negative")
    private Integer unpaidLeaveDays;

    @DecimalMin(value = "0.0", message = "Overtime hours cannot be negative")
    private BigDecimal overtimeHours;


    // No-argument constructor
    public AttendanceRequest() {
    }


    // Getters and Setters

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }


    public String getPayPeriod() {
        return payPeriod;
    }

    public void setPayPeriod(String payPeriod) {
        this.payPeriod = payPeriod;
    }


    public Integer getWorkingDays() {
        return workingDays;
    }

    public void setWorkingDays(Integer workingDays) {
        this.workingDays = workingDays;
    }


    public Integer getPresentDays() {
        return presentDays;
    }

    public void setPresentDays(Integer presentDays) {
        this.presentDays = presentDays;
    }


    public Integer getLeaveDays() {
        return leaveDays;
    }

    public void setLeaveDays(Integer leaveDays) {
        this.leaveDays = leaveDays;
    }


    public Integer getUnpaidLeaveDays() {
        return unpaidLeaveDays;
    }

    public void setUnpaidLeaveDays(Integer unpaidLeaveDays) {
        this.unpaidLeaveDays = unpaidLeaveDays;
    }


    public BigDecimal getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }
}