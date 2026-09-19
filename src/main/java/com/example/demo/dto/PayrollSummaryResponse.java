package com.example.demo.dto;

import java.math.BigDecimal;

public class PayrollSummaryResponse {

    private String payPeriod;
    private BigDecimal totalGrossSalary;
    private BigDecimal totalDeductions;
    private BigDecimal totalNetSalary;
    private long payrollCount;

    // No-argument constructor
    public PayrollSummaryResponse() {
    }


    // Parameterized constructor
    public PayrollSummaryResponse(
            String payPeriod,
            BigDecimal totalGrossSalary,
            BigDecimal totalDeductions,
            BigDecimal totalNetSalary,
            long payrollCount) {

        this.payPeriod = payPeriod;
        this.totalGrossSalary = totalGrossSalary;
        this.totalDeductions = totalDeductions;
        this.totalNetSalary = totalNetSalary;
        this.payrollCount = payrollCount;
    }


    // Getters and Setters

    public String getPayPeriod() {
        return payPeriod;
    }

    public void setPayPeriod(String payPeriod) {
        this.payPeriod = payPeriod;
    }


    public BigDecimal getTotalGrossSalary() {
        return totalGrossSalary;
    }

    public void setTotalGrossSalary(BigDecimal totalGrossSalary) {
        this.totalGrossSalary = totalGrossSalary;
    }


    public BigDecimal getTotalDeductions() {
        return totalDeductions;
    }

    public void setTotalDeductions(BigDecimal totalDeductions) {
        this.totalDeductions = totalDeductions;
    }


    public BigDecimal getTotalNetSalary() {
        return totalNetSalary;
    }

    public void setTotalNetSalary(BigDecimal totalNetSalary) {
        this.totalNetSalary = totalNetSalary;
    }
    public long getPayrollCount(){
      return payrollCount;
    }
    public void setPayrollCount(long payrollCount){
      this.payrollCount = payrollCount;
    }
}