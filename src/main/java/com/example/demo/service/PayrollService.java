package com.example.demo.service;

import com.example.demo.dto.CompanyInfoResponse;
import com.example.demo.dto.PayslipResponse;
import com.example.demo.dto.PayrollGenerationRequest;
import com.example.demo.dto.PayrollSummaryResponse;
import com.example.demo.entity.Attendance;
import com.example.demo.entity.Employee;
import com.example.demo.entity.Payroll;
import com.example.demo.entity.SalaryStructure;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.PayrollRepository;
import com.example.demo.repository.SalaryStructureRepository;
import com.example.demo.util.NumberToWords;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PayrollService {


    private static final BigDecimal HOURS_PER_DAY =
            BigDecimal.valueOf(8);

    private static final BigDecimal OVERTIME_MULTIPLIER =
            BigDecimal.valueOf(1.5);

    private final PayrollRepository payrollRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;
    private final AttendanceRepository attendanceRepository;


    // =========================================================
    // GET ALL PAYROLLS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payroll> getAllPayrolls() {

        return payrollRepository.findAll();
    }


    // =========================================================
    // GET PAYROLL BY ID
    // =========================================================

    @Transactional(readOnly = true)
    public Payroll getPayrollById(Long id) {

        return payrollRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll record not found"
                        )
                );
    }


    // =========================================================
    // GENERATE PAYROLL
    // =========================================================
    @CacheEvict(
        cacheNames = "payroll-summary",
        key = "#request.payPeriod"
        )
    @Transactional
    public Payroll generatePayroll(
            PayrollGenerationRequest request) {

        // 1. Find employee
        Employee employee =
                employeeRepository.findById(
                        request.getEmployeeId()
                ).orElseThrow(() ->
                        new RuntimeException(
                                "Employee not found"
                        )
                );


        // 2. Find salary structure
        SalaryStructure salaryStructure =
                salaryStructureRepository
                        .findByEmployee_EmployeeId(
                                request.getEmployeeId()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found for employee"
                                )
                        );


        // 3. Find attendance
        Attendance attendance =
                attendanceRepository
                        .findByEmployee_EmployeeIdAndPayPeriod(
                                request.getEmployeeId(),
                                request.getPayPeriod()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Attendance not found for employee and pay period"
                                )
                        );
        int workingDays = attendance.getWorkingDays();

        // 4. Prevent duplicate payroll
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


        // =====================================================
        // CALCULATIONS
        // =====================================================

        BigDecimal basicSalary =
                zeroIfNull(
                        salaryStructure.getBasicSalary()
                );


        BigDecimal overtimeHours =
                zeroIfNull(
                        attendance.getOvertimeHours()
                );


        // Daily basic salary
        BigDecimal dailyBasicRate =
        basicSalary.divide(
                BigDecimal.valueOf(workingDays),
                2,
                RoundingMode.HALF_UP
        );


        // Hourly basic salary
        BigDecimal hourlyBasicRate =
                dailyBasicRate.divide(
                        HOURS_PER_DAY,
                        2,
                        RoundingMode.HALF_UP
                );


        // Overtime rate = 1.5 × hourly rate
        BigDecimal overtimeRate =
                hourlyBasicRate.multiply(
                        OVERTIME_MULTIPLIER
                );


        // Overtime amount
        BigDecimal overtime =
                overtimeHours
                        .multiply(overtimeRate)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        // Unpaid leave
        BigDecimal unpaidLeaveDays =
                BigDecimal.valueOf(
                        attendance.getUnpaidLeaveDays() == null
                                ? 0
                                : attendance.getUnpaidLeaveDays()
                );


        BigDecimal unpaidLeaveDeductions =
                dailyBasicRate
                        .multiply(unpaidLeaveDays)
                        .setScale(
                                2,
                                RoundingMode.HALF_UP
                        );


        // Bonus
        BigDecimal bonus =
                zeroIfNull(request.getBonus());


        // Deductions
        BigDecimal epf =
                zeroIfNull(
                        salaryStructure.getEpf()
                );

        BigDecimal professionalTax =
                zeroIfNull(
                        salaryStructure.getProfessionalTax()
                );

        BigDecimal tds =
                zeroIfNull(
                        salaryStructure.getTds()
                );

        BigDecimal otherDeductions =
                zeroIfNull(
                        salaryStructure.getOtherDeductions()
                );


        // =====================================================
        // GROSS SALARY
        // =====================================================

        BigDecimal grossSalary =
                zeroIfNull(
                        salaryStructure.getBasicSalary()
                )
                .add(
                        zeroIfNull(
                                salaryStructure.getHra()
                        )
                )
                .add(
                        zeroIfNull(
                                salaryStructure.getConveyance()
                        )
                )
                .add(
                        zeroIfNull(
                                salaryStructure.getSpecialAllowance()
                        )
                )
                .add(
                        zeroIfNull(
                                salaryStructure.getOtherAllowance()
                        )
                )
                .add(overtime)
                .add(bonus);


        // =====================================================
        // TOTAL DEDUCTIONS
        // =====================================================

        BigDecimal totalDeductions =
                epf
                        .add(professionalTax)
                        .add(tds)
                        .add(otherDeductions)
                        .add(unpaidLeaveDeductions);


        // =====================================================
        // NET SALARY
        // =====================================================

        BigDecimal netSalary =
                grossSalary.subtract(
                        totalDeductions
                );


        // =====================================================
        // CREATE PAYROLL
        // =====================================================

        Payroll payroll = new Payroll();

        payroll.setEmployee(employee);

        payroll.setPayPeriod(
                request.getPayPeriod()
        );

        payroll.setPayDate(
                request.getPayDate()
        );


        // Salary structure values

        payroll.setBasicSalary(
                zeroIfNull(
                        salaryStructure.getBasicSalary()
                )
        );

        payroll.setHra(
                zeroIfNull(
                        salaryStructure.getHra()
                )
        );

        payroll.setConveyance(
                zeroIfNull(
                        salaryStructure.getConveyance()
                )
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

        payroll.setProfessionalTax(
                professionalTax
        );

        payroll.setTds(tds);

        payroll.setOtherDeductions(
                otherDeductions
        );

        payroll.setUnpaidLeaveDeductions(
                unpaidLeaveDeductions
        );

        payroll.setTotalDeductions(
                totalDeductions
        );


        // Net salary

        payroll.setNetSalary(netSalary);


        // Initial status

        payroll.setStatus("GENERATED");


        return payrollRepository.save(payroll);
    }


    // =========================================================
    // DELETE PAYROLL
    // =========================================================
     @CacheEvict(
        cacheNames = "payroll-summary",
        key = "#request.payPeriod"
        )
    @Transactional
    public void deletePayroll(Long id) {

        if (!payrollRepository.existsById(id)) {

            throw new RuntimeException(
                    "Payroll record not found"
            );
        }

        payrollRepository.deleteById(id);
    }


    // =========================================================
    // GET PAYROLLS BY EMPLOYEE
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payroll> getPayrollsByEmployee(
            Long employeeId) {

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found"
            );
        }

        return payrollRepository
                .findByEmployee_EmployeeId(
                        employeeId,
                        Sort.by(
                                Sort.Direction.DESC,
                                "payPeriod"
                        )
                );
    }


    // =========================================================
    // GET PAYROLL BY EMPLOYEE + PERIOD
    // =========================================================

    @Transactional(readOnly = true)
    public Payroll getPayrollByEmployeeAndPeriod(
            Long employeeId,
            String payPeriod) {

        if (!employeeRepository.existsById(employeeId)) {

            throw new RuntimeException(
                    "Employee not found"
            );
        }

        return payrollRepository
                .findByEmployee_EmployeeIdAndPayPeriod(
                        employeeId,
                        payPeriod
                )
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payroll not found for employee and pay period"
                        )
                );
    }


    // =========================================================
    // APPROVE PAYROLL
    // =========================================================

    @Transactional
    public Payroll approvePayroll(Long id) {

        Payroll payroll =
                payrollRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll record not found"
                                )
                        );

        if (!"GENERATED".equals(
                payroll.getStatus()
        )) {

            throw new RuntimeException(
                    "Only GENERATED payroll can be approved"
            );
        }

        payroll.setStatus("APPROVED");

        return payrollRepository.save(payroll);
    }


    // =========================================================
    // MARK PAYROLL AS PAID
    // =========================================================

    @Transactional
    public Payroll markPayrollAsPaid(Long id) {

        Payroll payroll =
                payrollRepository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll record not found"
                                )
                        );

        if (!"APPROVED".equals(
                payroll.getStatus()
        )) {

            throw new RuntimeException(
                    "Only APPROVED payroll can be marked as PAID"
            );
        }

        payroll.setStatus("PAID");

        return payrollRepository.save(payroll);
    }


    // =========================================================
    // GET PAYROLLS BY PAY PERIOD
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payroll> getPayrollsByPayPeriod(
            String payPeriod) {

        return payrollRepository.findByPayPeriod(
                payPeriod
        );
    }


    // =========================================================
    // GET PAYROLLS BY STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payroll> getPayrollsByStatus(
            String status) {

        return payrollRepository.findByStatus(
                status
        );
    }


    // =========================================================
    // PAYROLL SUMMARY
    // =========================================================
    @Cacheable(
        cacheNames = "payroll-summary",
        key = "#payPeriod"
        )
    @Transactional(readOnly = true)
    public PayrollSummaryResponse getPayrollSummary(
            String payPeriod) {

        long payrollCount =
                payrollRepository.countPayrollsByPayPeriod(
                        payPeriod
                );

        BigDecimal totalGross =
                payrollRepository
                        .getTotalGrossSalaryByPayPeriod(
                                payPeriod
                        );

        BigDecimal totalDeductions =
                payrollRepository
                        .getTotalDeductionsByPayPeriod(
                                payPeriod
                        );

        BigDecimal totalNet =
                payrollRepository
                        .getTotalNetSalaryByPayPeriod(
                                payPeriod
                        );

        return new PayrollSummaryResponse(
                payPeriod,
                totalGross,
                totalDeductions,
                totalNet,
                payrollCount
        );
    }


    // =========================================================
    // PAYROLLS BY PERIOD + STATUS
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payroll> getPayrollsByPayPeriodAndStatus(
            String payPeriod,
            String status) {

        return payrollRepository
                .findByPayPeriodAndStatus(
                        payPeriod,
                        status
                );
    }


    // =========================================================
    // GET PAYSLIP
    // =========================================================

    @Transactional(readOnly = true)
    public PayslipResponse getPayslip(
            Long payrollId) {

        Payroll payroll =
                payrollRepository.findById(payrollId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll record not found"
                                )
                        );

        Employee employee =
                payroll.getEmployee();

        Attendance attendance =
                attendanceRepository
                        .findByEmployee_EmployeeIdAndPayPeriod(
                                employee.getEmployeeId(),
                                payroll.getPayPeriod()
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Attendance not found for payroll period"
                                )
                        );


        PayslipResponse payslip =
                new PayslipResponse();


        // =====================================================
        // COMPANY INFORMATION
        // =====================================================

        CompanyInfoResponse company =
                new CompanyInfoResponse(
                        "ABC PVT. LTD.",
                        "Tidal Park",
                        "Trichy",
                        "Tamil Nadu",
                        "abc@company.com",
                        "+91 12345 67890"
                );

        payslip.setCompany(company);


        // =====================================================
        // PAYROLL INFORMATION
        // =====================================================

        payslip.setPayrollId(
                payroll.getPayrollId()
        );

        payslip.setPayPeriod(
                payroll.getPayPeriod()
        );

        payslip.setPayDate(
                payroll.getPayDate()
        );

        payslip.setStatus(
                payroll.getStatus()
        );


        // =====================================================
        // EMPLOYEE INFORMATION
        // =====================================================

        payslip.setEmployeeId(
                employee.getEmployeeId()
        );

        payslip.setEmployeeCode(
                employee.getEmployeeCode()
        );

        payslip.setEmployeeName(
                employee.getFirstName()
                        + " "
                        + employee.getLastName()
        );

        payslip.setDesignation(
                employee.getDesignation()
        );

        payslip.setJoiningDate(
                employee.getJoiningDate()
        );

        payslip.setPanNumber(
                employee.getPanNumber()
        );

        payslip.setUanNumber(
                employee.getUanNumber()
        );

        payslip.setBankAccountNumber(
                maskBankAccount(
                        employee.getBankAccountNumber()
                )
        );

        payslip.setIfscCode(
                employee.getIfscCode()
        );


        if (employee.getDepartment() != null) {

            payslip.setDepartmentName(
                    employee.getDepartment()
                            .getDepartmentName()
            );
        }

        payslip.setEmploymentType(
                employee.getEmploymentType()
        );

        payslip.setLocation(
                employee.getLocation()
        );


        // =====================================================
        // ATTENDANCE INFORMATION
        // =====================================================

        payslip.setWorkingDays(
                attendance.getWorkingDays()
        );

        payslip.setPresentDays(
                attendance.getPresentDays()
        );

        payslip.setLeaveDays(
                attendance.getLeaveDays()
        );

        payslip.setUnpaidLeaveDays(
                attendance.getUnpaidLeaveDays()
        );

        payslip.setOvertimeHours(
                attendance.getOvertimeHours()
        );


        // =====================================================
        // EARNINGS
        // =====================================================

        payslip.setBasicSalary(
                payroll.getBasicSalary()
        );

        payslip.setHra(
                payroll.getHra()
        );

        payslip.setConveyance(
                payroll.getConveyance()
        );

        payslip.setSpecialAllowance(
                payroll.getSpecialAllowance()
        );

        payslip.setOtherAllowance(
                payroll.getOtherAllowance()
        );

        payslip.setOvertime(
                payroll.getOvertime()
        );

        payslip.setBonus(
                payroll.getBonus()
        );

        payslip.setGrossSalary(
                payroll.getGrossSalary()
        );


        // =====================================================
        // DEDUCTIONS
        // =====================================================

        payslip.setEpf(
                payroll.getEpf()
        );

        payslip.setProfessionalTax(
                payroll.getProfessionalTax()
        );

        payslip.setTds(
                payroll.getTds()
        );

        payslip.setOtherDeductions(
                payroll.getOtherDeductions()
        );

        payslip.setUnpaidLeaveDeduction(
                payroll.getUnpaidLeaveDeductions()
        );

        payslip.setTotalDeductions(
                payroll.getTotalDeductions()
        );

        payslip.setNetSalary(
                payroll.getNetSalary()
        );

        payslip.setNetSalaryInWords(
                NumberToWords.convert(
                        payroll.getNetSalary()
                )
        );

        payslip.setNote(
                "This payslip is generated electronically and does not require a signature."
        );

        return payslip;
    }


    // =========================================================
    // EMPLOYEE PAYROLL HISTORY
    // =========================================================

    @Transactional(readOnly = true)
    public List<Payroll> getMyPayrollHistory(
            Long employeeId) {

        return payrollRepository
                .findByEmployee_EmployeeId(
                        employeeId,
                        Sort.by(
                                Sort.Direction.DESC,
                                "payPeriod"
                        )
                );
    }


    // =========================================================
    // EMPLOYEE PAYSLIP
    // =========================================================

    @Transactional(readOnly = true)
    public PayslipResponse getEmployeePayslip(
            Long employeeId,
            Long payrollId) {

        Payroll payroll =
                payrollRepository.findById(payrollId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Payroll not found"
                                )
                        );

        if (!payroll.getEmployee()
                .getEmployeeId()
                .equals(employeeId)) {

            throw new RuntimeException(
                    "You are not allowed to view this payslip"
            );
        }

        return getPayslip(payrollId);
    }


    // =========================================================
    // NULL SAFE DECIMAL
    // =========================================================

    private BigDecimal zeroIfNull(
            BigDecimal value) {

        return value == null
                ? BigDecimal.ZERO
                : value;
    }


    // =========================================================
    // MASK BANK ACCOUNT
    // =========================================================

    private String maskBankAccount(
            String accountNumber) {

        if (accountNumber == null ||
                accountNumber.isBlank()) {

            return null;
        }

        if (accountNumber.length() <= 4) {
            return accountNumber;
        }

        return "X".repeat(
                accountNumber.length() - 4
        ) + accountNumber.substring(
                accountNumber.length() - 4
        );
    }
}