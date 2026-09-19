package com.example.demo.service;

import com.example.demo.dto.PayrollGenerationRequest;
import com.example.demo.entity.Employee;
import com.example.demo.entity.Payroll;
import com.example.demo.entity.SalaryStructure;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.PayrollRepository;
import com.example.demo.repository.SalaryStructureRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.entity.Attendance;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import org.springframework.data.domain.Sort;
import com.example.demo.dto.PayrollSummaryResponse;
import org.springframework.data.domain.Sort;
import com.example.demo.dto.PayslipResponse;
import com.example.demo.util.NumberToWords;
import com.example.demo.dto.CompanyInfoResponse;

@Service
public class PayrollService {

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final AttendanceRepository attendanceRepository;

    public PayrollService(
            PayrollRepository payrollRepository,
            EmployeeRepository employeeRepository,
            SalaryStructureRepository salaryStructureRepository,
            AttendanceRepository attendanceRepository) {

        this.payrollRepository = payrollRepository;
        this.employeeRepository = employeeRepository;
        this.salaryStructureRepository = salaryStructureRepository;
        this.attendanceRepository = attendanceRepository;
    }

    public List<Payroll> getAllPayrolls() {
        return payrollRepository.findAll();
    }

    public Payroll getPayrollById(Long id) {

        return payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Payroll record not found"));
    }

    @Transactional
    public Payroll generatePayroll(PayrollGenerationRequest request) {

        // 1. Find Employee
        Employee employee = employeeRepository
                .findById(request.getEmployeeId())
                .orElseThrow(() ->
                        new RuntimeException("Employee not found"));

        // 2. Find Salary Structure
        SalaryStructure salaryStructure =
                salaryStructureRepository
                        .findByEmployee_EmployeeId(
                                request.getEmployeeId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found for employee"
                                ));

        Attendance attendance = attendanceRepository
        .findByEmployee_EmployeeIdAndPayPeriod(
                request.getEmployeeId(),
                request.getPayPeriod()
        )
        .orElseThrow(() ->
                new RuntimeException(
                        "Attendance not found for employee and pay period"
                ));

        // 3. Prevent duplicate payroll
        payrollRepository
                .findByEmployee_EmployeeIdAndPayPeriod(
                        request.getEmployeeId(),
                        request.getPayPeriod()
                )
                .ifPresent(existingPayroll -> {
                    throw new RuntimeException(
                            "Payroll already exists for this employee and pay period"
                    );
                });

        // 4. Convert null values to ZERO
        BigDecimal basicSalary =
        zeroIfNull(salaryStructure.getBasicSalary());
        BigDecimal overtimeHours =
        attendance.getOvertimeHours() == null
                ? BigDecimal.ZERO
                : attendance.getOvertimeHours();
        BigDecimal hourlyBasicRate =
        basicSalary
                .divide(
                        BigDecimal.valueOf(26),
                        2,
                        RoundingMode.HALF_UP
                )
                .divide(
                        BigDecimal.valueOf(8),
                        2,
                        RoundingMode.HALF_UP
                );
        BigDecimal dailyBasicRate =
        basicSalary
                .divide(
                        BigDecimal.valueOf(26),
                        2,
                        RoundingMode.HALF_UP
                );
        BigDecimal unpaidLeaveDays =
        BigDecimal.valueOf(
                attendance.getUnpaidLeaveDays() == null
                        ? 0
                        : attendance.getUnpaidLeaveDays()
        );

        BigDecimal unpaidLeaveDeductions =
        dailyBasicRate
                .multiply(unpaidLeaveDays)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal overtimeRate =
        hourlyBasicRate
                .multiply(BigDecimal.valueOf(1.5));
        BigDecimal overtime =
        overtimeHours
                .multiply(overtimeRate)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal bonus = zeroIfNull(request.getBonus());
        BigDecimal epf = zeroIfNull(salaryStructure.getEpf());
        BigDecimal professionalTax =
                zeroIfNull(salaryStructure.getProfessionalTax());
        BigDecimal tds = zeroIfNull(salaryStructure.getTds());
        BigDecimal otherDeductions =
                zeroIfNull(salaryStructure.getOtherDeductions());

        // 5. Calculate gross salary
        BigDecimal grossSalary =
                zeroIfNull(salaryStructure.getBasicSalary())
                        .add(zeroIfNull(salaryStructure.getHra()))
                        .add(zeroIfNull(salaryStructure.getConveyance()))
                        .add(zeroIfNull(
                                salaryStructure.getSpecialAllowance()))
                        .add(zeroIfNull(
                                salaryStructure.getOtherAllowance()))
                        .add(overtime)
                        .add(bonus);

        // 6. Calculate total deductions
        BigDecimal totalDeductions =
                epf
                        .add(professionalTax)
                        .add(tds)
                        .add(otherDeductions)
                        .add(unpaidLeaveDeductions);

        // 7. Calculate net salary
        BigDecimal netSalary =
                grossSalary.subtract(totalDeductions);

        // 8. Create Payroll object
        Payroll payroll = new Payroll();
        payroll.setOvertime(overtime);
        payroll.setEmployee(employee);
        payroll.setPayPeriod(request.getPayPeriod());
        payroll.setPayDate(request.getPayDate());
        
        // Salary structure values
        payroll.setBasicSalary(
                zeroIfNull(salaryStructure.getBasicSalary())
        );

        payroll.setHra(
                zeroIfNull(salaryStructure.getHra())
        );

        payroll.setConveyance(
                zeroIfNull(salaryStructure.getConveyance())
        );

        payroll.setSpecialAllowance(
                zeroIfNull(
                        salaryStructure.getSpecialAllowance()
                )
        );

        payroll.setOtherAllowance(
                zeroIfNull(
                        salaryStructure.getOtherAllowance()
                )
        );

        // Monthly additions
        payroll.setOvertime(overtime);
        payroll.setBonus(bonus);

        // Calculated values
        payroll.setGrossSalary(grossSalary);

        // Deductions
        payroll.setEpf(epf);
        payroll.setProfessionalTax(professionalTax);
        payroll.setTds(tds);
        payroll.setOtherDeductions(otherDeductions);
        payroll.setUnpaidLeaveDeductions(unpaidLeaveDeductions);
        payroll.setTotalDeductions(totalDeductions);
        payroll.setNetSalary(netSalary);
        payroll.setStatus("GENERATED");

        // 9. Save payroll
        return payrollRepository.save(payroll);
    }

    public void deletePayroll(Long id) {

        if (!payrollRepository.existsById(id)) {
            throw new RuntimeException("Payroll record not found");
        }

        payrollRepository.deleteById(id);
    }
public List<Payroll> getPayrollsByEmployee(Long employeeId) {

    if (!employeeRepository.existsById(employeeId)) {
        throw new RuntimeException("Employee not found");
    }

    return payrollRepository.findByEmployee_EmployeeId(
            employeeId,
            Sort.by(Sort.Direction.DESC, "payPeriod")
    );
}
public Payroll getPayrollByEmployeeAndPeriod(
        Long employeeId,
        String payPeriod) {

    if (!employeeRepository.existsById(employeeId)) {
        throw new RuntimeException("Employee not found");
    }

    return payrollRepository
            .findByEmployee_EmployeeIdAndPayPeriod(
                    employeeId,
                    payPeriod
            )
            .orElseThrow(() ->
                    new RuntimeException(
                            "Payroll not found for employee and pay period"
                    ));
}
public Payroll approvePayroll(Long id) {

    Payroll payroll = payrollRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Payroll record not found"));

    if (!"GENERATED".equals(payroll.getStatus())) {
        throw new RuntimeException(
                "Only GENERATED payroll can be approved"
        );
    }

    payroll.setStatus("APPROVED");

    return payrollRepository.save(payroll);
}

public Payroll markPayrollAsPaid(Long id) {

    Payroll payroll = payrollRepository
            .findById(id)
            .orElseThrow(() ->
                    new RuntimeException("Payroll record not found"));

    if (!"APPROVED".equals(payroll.getStatus())) {
        throw new RuntimeException(
                "Only APPROVED payroll can be marked as PAID"
        );
    }

    payroll.setStatus("PAID");

    return payrollRepository.save(payroll);
}

public List<Payroll> getPayrollsByPayPeriod(String payPeriod) {

    return payrollRepository.findByPayPeriod(payPeriod);
}

public List<Payroll> getPayrollsByStatus(String status) {

    return payrollRepository.findByStatus(status);
}

public PayrollSummaryResponse getPayrollSummary(String payPeriod) {

    long payrollCount =
            payrollRepository.countPayrollsByPayPeriod(payPeriod);    

    BigDecimal totalGross =
            payrollRepository.getTotalGrossSalaryByPayPeriod(payPeriod);

    BigDecimal totalDeductions =
            payrollRepository.getTotalDeductionsByPayPeriod(payPeriod);

    BigDecimal totalNet =
            payrollRepository.getTotalNetSalaryByPayPeriod(payPeriod);

    return new PayrollSummaryResponse(
            payPeriod,
            totalGross,
            totalDeductions,
            totalNet,
            payrollCount
    );
}

public List<Payroll> getPayrollsByPayPeriodAndStatus(
        String payPeriod,
        String status) {

    return payrollRepository.findByPayPeriodAndStatus(
            payPeriod,
            status
    );
}

public PayslipResponse getPayslip(Long payrollId) {

    Payroll payroll = payrollRepository
            .findById(payrollId)
            .orElseThrow(() ->
                    new RuntimeException("Payroll record not found"));

    Employee employee = payroll.getEmployee();

    Attendance attendance = attendanceRepository
            .findByEmployee_EmployeeIdAndPayPeriod(
                    employee.getEmployeeId(),
                    payroll.getPayPeriod()
            )
            .orElseThrow(() ->
                    new RuntimeException(
                            "Attendance not found for payroll period"
                    ));

    PayslipResponse payslip = new PayslipResponse();
    
    CompanyInfoResponse company = new CompanyInfoResponse(
        "ABC TECHNOLOGIES PVT. LTD.",
        "Technology Park",
        "Trichy",
        "Tamil Nadu",
        "hr@company.com",
        "+91 XXXXX XXXXX"
);

payslip.setCompany(company);

    // Payroll information
    payslip.setPayrollId(payroll.getPayrollId());
    payslip.setPayPeriod(payroll.getPayPeriod());
    payslip.setPayDate(payroll.getPayDate());
    payslip.setStatus(payroll.getStatus());


    // Employee information
    payslip.setEmployeeId(employee.getEmployeeId());
    payslip.setEmployeeCode(employee.getEmployeeCode());

    payslip.setEmployeeName(
            employee.getFirstName() + " " + employee.getLastName()
    );

    payslip.setDesignation(employee.getDesignation());
    payslip.setJoiningDate(employee.getJoiningDate());
    payslip.setPanNumber(employee.getPanNumber());
    payslip.setUanNumber(employee.getUanNumber());
    payslip.setBankAccountNumber(
        maskBankAccount(employee.getBankAccountNumber())
);
payslip.setIfscCode(employee.getIfscCode());
    if (employee.getDepartment() != null) {
        payslip.setDepartmentName(
                employee.getDepartment().getDepartmentName()
        );
    }
    payslip.setEmploymentType(employee.getEmploymentType());
    payslip.setLocation(employee.getLocation());

    // Attendance information
    payslip.setWorkingDays(attendance.getWorkingDays());
    payslip.setPresentDays(attendance.getPresentDays());
    payslip.setLeaveDays(attendance.getLeaveDays());
    payslip.setUnpaidLeaveDays(attendance.getUnpaidLeaveDays());
    payslip.setOvertimeHours(attendance.getOvertimeHours());

    // Earnings
    payslip.setBasicSalary(payroll.getBasicSalary());
    payslip.setHra(payroll.getHra());
    payslip.setConveyance(payroll.getConveyance());
    payslip.setSpecialAllowance(payroll.getSpecialAllowance());
    payslip.setOtherAllowance(payroll.getOtherAllowance());
    payslip.setOvertime(payroll.getOvertime());
    payslip.setBonus(payroll.getBonus());
    payslip.setGrossSalary(payroll.getGrossSalary());

    // Deductions
    payslip.setEpf(payroll.getEpf());
    payslip.setProfessionalTax(payroll.getProfessionalTax());
    payslip.setTds(payroll.getTds());
    payslip.setOtherDeductions(payroll.getOtherDeductions());
    payslip.setUnpaidLeaveDeduction(
            payroll.getUnpaidLeaveDeductions()
    );
    payslip.setTotalDeductions(payroll.getTotalDeductions());
    payslip.setNetSalary(payroll.getNetSalary());
    payslip.setNetSalaryInWords(
        NumberToWords.convert(payroll.getNetSalary())
         );
         payslip.setNote(
        "This payslip is generated electronically and does not require a signature."
);
    return payslip;
}
    private BigDecimal zeroIfNull(BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }
    private String maskBankAccount(String accountNumber) {

    if (accountNumber == null || accountNumber.isBlank()) {
        return null;
    }

    if (accountNumber.length() <= 4) {
        return accountNumber;
    }

    return "X".repeat(accountNumber.length() - 4)
            + accountNumber.substring(accountNumber.length() - 4);
}
public List<Payroll> getMyPayrollHistory(Long employeeId) {

    return payrollRepository.findByEmployee_EmployeeId(
            employeeId,
            Sort.by(
                    Sort.Direction.DESC,
                    "payPeriod"
            )
    );
}
public PayslipResponse getEmployeePayslip(
        Long employeeId,
        Long payrollId) {

    Payroll payroll = payrollRepository.findById(payrollId)
            .orElseThrow(() ->
                    new RuntimeException("Payroll not found"));

    if (!payroll.getEmployee().getEmployeeId().equals(employeeId)) {
        throw new RuntimeException(
                "You are not allowed to view this payslip"
        );
    }

    return getPayslip(payrollId);
}
}