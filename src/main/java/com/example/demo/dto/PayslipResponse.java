package com.example.demo.dto;
import com.example.demo.dto.CompanyInfoResponse;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayslipResponse {

    private Long payrollId;
    private String payPeriod;
    private LocalDate payDate;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String departmentName;
    private String designation;
    private LocalDate joiningDate;
    private Integer workingDays;
    private Integer presentDays;
    private Integer leaveDays;
    private Integer unpaidLeaveDays;
    private BigDecimal overtimeHours;
    private BigDecimal basicSalary;
    private BigDecimal hra;
    private BigDecimal conveyance;
    private BigDecimal specialAllowance;
    private BigDecimal otherAllowance;
    private BigDecimal overtime;
    private BigDecimal bonus;
    private BigDecimal grossSalary;
    private BigDecimal epf;
    private BigDecimal professionalTax;
    private BigDecimal tds;
    private BigDecimal otherDeductions;
    private BigDecimal unpaidLeaveDeduction;
    private BigDecimal totalDeductions;
    private BigDecimal netSalary;
    private String status;
    private String panNumber;
    private String uanNumber;
    private String bankAccountNumber;
    private String ifscCode;
    private String netSalaryInWords;
    private CompanyInfoResponse company;
    private String employmentType;
    private String location;
    private String note;

}