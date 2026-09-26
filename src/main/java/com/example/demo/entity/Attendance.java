package com.example.demo.entity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.math.BigDecimal;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attendance",uniqueConstraints = {@UniqueConstraint(name = "uk_attendance_employee_period",columnNames = {"employee_id", "pay_period"})})

public class Attendance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long attendanceId;

    @ManyToOne
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @Column(name = "pay_period", nullable = false)
    @NotNull(message = "Attendance Month is required")
    @Pattern(regexp = "\\d{4}-(0[1-9]|1[0-2])",message = "Attendance Month must be in YYYY-MM format")
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
    @NotNull(message = "Overtime hours cannot be null")
    private BigDecimal overtimeHours;

    @PositiveOrZero(message = "Unpaid leave days must be greater than 0")
    @Max(value = 31, message = "Unpaid leave days cannot exceed 31 days")
    @NotNull(message = "Unpaid leave days cannot be null")
    private Integer unpaidLeaveDays;

    @Column(nullable = false)
    private boolean mustChangePassword = false;

}