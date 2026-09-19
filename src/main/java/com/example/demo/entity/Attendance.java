package com.example.demo.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;


import java.math.BigDecimal;

@Entity
@Table(
        name = "attendance",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_attendance_employee_period",
                        columnNames = {"employee_id", "pay_period"}
                )
        }
)
public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period", nullable = false)
@NotNull(message = "Attendance Month is required")
@Pattern(
        regexp = "\\d{4}-(0[1-9]|1[0-2])",
        message = "Attendance Month must be in YYYY-MM format"
)
private String payPeriod;

    @PositiveOrZero(message = "Working days must not be less than 0")
    @Max(value = 31, message = "Monthly attendance cannot exceed 31 days")
    @NotNull(message = "Attendance days cannot be null")
    private Integer workingDays;

    @PositiveOrZero(message = "Present days must not be less than 0")
    @Max(value = 31, message = "Present days cannot exceed 31 days")
    @NotNull(message = "Present days cannot be null")
    private Integer presentDays;

    @PositiveOrZero(message = "Leave days must not be less than 0")
    @NotNull(message = "Leave days cannot be null")
    private Integer leaveDays;

    @PositiveOrZero(message = "Overtime hours cannot be less than 0")
    @Max(value = 16, message = "Overtime cannot exceed 16 hours")
    @NotNull(message = "Overtime hours cannot be null")
    private BigDecimal overtimeHours;

    @Positive(message = "Unpaid leave days must be greater than 0")
    @Max(value = 31, message = "Unpaid leave days cannot exceed 31 days")
    @NotNull(message = "Unpaid leave days cannot be null")
    private Integer unpaidLeaveDays;

    public Attendance() {
    }

    public Long getAttendanceId() {
        return attendanceId;
    }

    public void setAttendanceId(Long attendanceId) {
        this.attendanceId = attendanceId;
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

    public BigDecimal getOvertimeHours() {
        return overtimeHours;
    }

    public void setOvertimeHours(BigDecimal overtimeHours) {
        this.overtimeHours = overtimeHours;
    }

    public Integer getUnpaidLeaveDays() {
        return unpaidLeaveDays;
    }

    public void setUnpaidLeaveDays(Integer unpaidLeaveDays) {
        this.unpaidLeaveDays = unpaidLeaveDays;
    }
}