package com.example.demo.service;

import com.example.demo.entity.SalaryStructure;
import java.math.BigDecimal;

public class PayRollCalculationTest {
    
    private final SalaryStructure salaryStructure;

    public PayRollCalculationTest(SalaryStructure salaryStructure) {
        this.salaryStructure = salaryStructure;
    }

    public BigDecimal calculatedGrossSalary(SalaryStructure salary) {
        return salary.getBasicSalary()
                .add(salary.getHra())
                .add(salary.getConveyance())
                .add(salary.getSpecialAllowance())
                .add(salary.getOtherAllowance());
    }

    public BigDecimal calculateTotalDeductions(SalaryStructure salary) {
        return salary.getEpf()
                .add(salary.getProfessionalTax())
                .add(salary.getTds())
                .add(salary.getOtherDeductions());
    }

    public BigDecimal calculateNetSalary(SalaryStructure salary) {
        return calculatedGrossSalary(salary).subtract(calculateTotalDeductions(salary));
    }

    public BigDecimal displayReport() {
        return calculateNetSalary(this.salaryStructure); 
    }
}
