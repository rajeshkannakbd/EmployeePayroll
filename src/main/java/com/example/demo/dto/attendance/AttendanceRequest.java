package com.example.demo.dto.attendance;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceRequest {

    @NotNull(message = "Employee ID is required")
    private Long employeeId;

    @NotBlank(message = "Pay period is required")
    private String payPeriod;

    @NotNull(message = "Present days are required")
    @Min(value = 0, message = "Present days cannot be negative")
    private Integer presentDays;

    @NotNull(message = "Leave days are required")
    @Min(value = 0, message = "Leave days cannot be negative")
    private Integer leaveDays;

    @NotNull(message = "Unpaid leave days are required")
    @Min(value = 0, message = "Unpaid leave days cannot be negative")
    private Integer unpaidLeaveDays;

    @DecimalMin(value = "0.0",message = "Overtime hours cannot be negative")
    private BigDecimal overtimeHours;

}