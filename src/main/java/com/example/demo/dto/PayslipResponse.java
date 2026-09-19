package com.example.demo.dto;
import com.example.demo.dto.CompanyInfoResponse;
import java.math.BigDecimal;
import java.time.LocalDate;

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


    // No-argument constructor
    public PayslipResponse() {
    }


    // Getters and Setters

    public Long getPayrollId() {
        return payrollId;
    }

    public void setPayrollId(Long payrollId) {
        this.payrollId = payrollId;
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


    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }


    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }


    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }


    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }


    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }


    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
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


    public BigDecimal getUnpaidLeaveDeduction() {
        return unpaidLeaveDeduction;
    }

    public void setUnpaidLeaveDeduction(BigDecimal unpaidLeaveDeduction) {
        this.unpaidLeaveDeduction = unpaidLeaveDeduction;
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
      public String getPanNumber(){
      return panNumber;
    }
    public void setPanNumber(String panNumber){
        this.panNumber = panNumber;
    }
    public String getUanNumber(){
      return uanNumber;
    }
    public void setUanNumber(String uanNumber){
        this.uanNumber = uanNumber;
    }
    public String getBankAccountNumber(){
      return bankAccountNumber;
    }
    public void setBankAccountNumber(String bankAccountNumber){
        this.bankAccountNumber = bankAccountNumber;
    }
    public String getIfscCode(){
      return ifscCode;
    }
    public void setIfscCode(String ifscCode){
        this.ifscCode = ifscCode;
    }
    public String getNetSalaryInWords() {
    return netSalaryInWords;
}

public void setNetSalaryInWords(String netSalaryInWords) {
    this.netSalaryInWords = netSalaryInWords;
}
public CompanyInfoResponse getCompany() {
    return company;
}

public void setCompany(CompanyInfoResponse company) {
    this.company = company;
}
public String getEmploymentType() {
    return employmentType;
}

public void setEmploymentType(String employmentType) {
    this.employmentType = employmentType;
}

public String getLocation() {
    return location;
}

public void setLocation(String location) {
    this.location = location;
}
public String getNote() {
    return note;
}

public void setNote(String note) {
    this.note = note;
}
}
