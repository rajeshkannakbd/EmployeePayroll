package com.example.demo.service;

import com.example.demo.entity.Attendance;
import com.example.demo.entity.Employee;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.SalaryStructureRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.dto.AttendanceRequest;
import org.springframework.stereotype.Service;
import java.time.YearMonth;
import java.math.BigDecimal;
import java.util.List;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;

    public AttendanceService(
            AttendanceRepository attendanceRepository,
            EmployeeRepository employeeRepository,
          SalaryStructureRepository salaryStructureRepository) {

        this.attendanceRepository = attendanceRepository;
        this.employeeRepository = employeeRepository;
        this.salaryStructureRepository = salaryStructureRepository;
    }

    public List<Attendance> getAllAttendance() {
        return attendanceRepository.findAll();
    }

    public Attendance getAttendanceById(Long id) {

        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Attendance not found"));
    }

public Attendance createAttendance(AttendanceRequest request) {

    // Find employee
    Employee employee = employeeRepository
            .findById(request.getEmployeeId())
            .orElseThrow(() ->
                    new RuntimeException("Employee not found"));

    // Create Attendance entity
    Attendance attendance = new Attendance();

    attendance.setEmployee(employee);
    attendance.setPayPeriod(request.getPayPeriod());
    attendance.setWorkingDays(request.getWorkingDays());
    attendance.setPresentDays(request.getPresentDays());
    attendance.setLeaveDays(request.getLeaveDays());
    attendance.setUnpaidLeaveDays(request.getUnpaidLeaveDays());

    // If overtime is not provided, store ZERO
    attendance.setOvertimeHours(
            request.getOvertimeHours() == null
                    ? BigDecimal.ZERO
                    : request.getOvertimeHours()
    );

    // Validate pay period
    validatePayPeriod(attendance.getPayPeriod());

    // Business validation
    if (attendance.getWorkingDays() == null ||
            attendance.getWorkingDays() <= 0) {

        throw new RuntimeException(
                "Working days must be greater than 0"
        );
    }

    if (attendance.getPresentDays() == null ||
            attendance.getPresentDays() < 0) {

        throw new RuntimeException(
                "Present days cannot be negative"
        );
    }

    if (attendance.getLeaveDays() == null ||
            attendance.getLeaveDays() < 0) {

        throw new RuntimeException(
                "Leave days cannot be negative"
        );
    }

    if (attendance.getUnpaidLeaveDays() == null ||
            attendance.getUnpaidLeaveDays() < 0) {

        throw new RuntimeException(
                "Unpaid leave days cannot be negative"
        );
    }

    if (attendance.getOvertimeHours()
            .compareTo(BigDecimal.ZERO) < 0) {

        throw new RuntimeException(
                "Overtime hours cannot be negative"
        );
    }

    if (attendance.getPresentDays()
            + attendance.getLeaveDays()
            > attendance.getWorkingDays()) {

        throw new RuntimeException(
                "Present days and leave days cannot exceed working days"
        );
    }

    return attendanceRepository.save(attendance);
}


    public BigDecimal calculateOvertimeAmount(Long employeeId, String payPeriod) {

    Employee employee = employeeRepository
            .findById(employeeId)
            .orElseThrow(() ->
                    new RuntimeException("Employee not found"));

    Attendance attendance = attendanceRepository
            .findByEmployee_EmployeeIdAndPayPeriod(
                    employeeId,
                    payPeriod
            )
            .orElseThrow(() ->
                    new RuntimeException("Attendance not found"));

    BigDecimal basicSalary = salaryStructureRepository
            .findByEmployee_EmployeeId(employeeId)
            .orElseThrow(() ->
                    new RuntimeException("Salary structure not found"))
            .getBasicSalary();

    BigDecimal overtimeHours =
            attendance.getOvertimeHours() == null
                    ? BigDecimal.ZERO
                    : attendance.getOvertimeHours();

    BigDecimal hourlyBasicRate =
            basicSalary
                    .divide(BigDecimal.valueOf(26), 2, java.math.RoundingMode.HALF_UP)
                    .divide(BigDecimal.valueOf(8), 2, java.math.RoundingMode.HALF_UP);

    BigDecimal overtimeRate =
            hourlyBasicRate.multiply(BigDecimal.valueOf(1.5));

    return overtimeHours.multiply(overtimeRate);
}
private void validatePayPeriod(String payPeriod) {

    if (payPeriod == null ||
            !payPeriod.matches("\\d{4}-(0[1-9]|1[0-2])")) {

        throw new RuntimeException(
                "Attendance Month must be in YYYY-MM format"
        );
    }

    YearMonth attendanceMonth = YearMonth.parse(payPeriod);
    YearMonth currentMonth = YearMonth.now();

    if (attendanceMonth.isAfter(currentMonth)) {
        throw new RuntimeException(
                "Attendance Month cannot be in the future"
        );
    }
}
public List<Attendance> getAttendanceByEmployee(Long employeeId) {

    return attendanceRepository
            .findByEmployee_EmployeeIdOrderByPayPeriodDesc(employeeId);
}
}