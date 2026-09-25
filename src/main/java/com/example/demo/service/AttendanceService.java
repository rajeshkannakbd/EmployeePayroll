package com.example.demo.service;

import com.example.demo.dto.attendance.AttendanceRequest;
import com.example.demo.entity.Attendance;
import com.example.demo.entity.Employee;
import com.example.demo.repository.AttendanceRepository;
import com.example.demo.repository.EmployeeRepository;
import com.example.demo.repository.SalaryStructureRepository;
import com.example.demo.util.WorkingDaysCalculator;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final EmployeeRepository employeeRepository;
    private final SalaryStructureRepository salaryStructureRepository;


    // GET ALL ATTENDANCE

    @Transactional(readOnly = true)
    public List<Attendance> getAllAttendance() {

        return attendanceRepository.findAll();
    }


    // GET ATTENDANCE BY ID

    @Transactional(readOnly = true)
    public Attendance getAttendanceById(Long id) {

        return attendanceRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Attendance not found")
                );
    }


    // CREATE ATTENDANCE

    @Transactional
    public Attendance createAttendance(
            AttendanceRequest request
    ) {

        // Validate pay period first
        validatePayPeriod(request.getPayPeriod());

        // Calculate working days automatically
        int workingDays =
                WorkingDaysCalculator.calculate(
                        request.getPayPeriod()
                );

        // Find employee
        Employee employee =
                employeeRepository.findById(
                        request.getEmployeeId()
                ).orElseThrow(() ->
                        new RuntimeException("Employee not found")
                );

        // Create attendance
        Attendance attendance = new Attendance();

        attendance.setEmployee(employee);
        attendance.setPayPeriod(request.getPayPeriod());
        attendance.setWorkingDays(workingDays);

        attendance.setPresentDays(
                request.getPresentDays()
        );

        attendance.setLeaveDays(
                request.getLeaveDays()
        );

        attendance.setUnpaidLeaveDays(
                request.getUnpaidLeaveDays()
        );

        attendance.setOvertimeHours(
                request.getOvertimeHours() == null
                        ? BigDecimal.ZERO
                        : request.getOvertimeHours()
        );


        // Validate attendance values

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


        // Present + Leave cannot exceed working days

        if (attendance.getPresentDays()
                + attendance.getLeaveDays()
                > attendance.getWorkingDays()) {

            throw new RuntimeException(
                    "Present days and leave days cannot exceed working days"
            );
        }


        return attendanceRepository.save(attendance);
    }


    // CALCULATE OVERTIME AMOUNT

    @Transactional(readOnly = true)
    public BigDecimal calculateOvertimeAmount(
            Long employeeId,
            String payPeriod
    ) {

        Attendance attendance =
                attendanceRepository
                        .findByEmployee_EmployeeIdAndPayPeriod(
                                employeeId,
                                payPeriod
                        )
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Attendance not found"
                                )
                        );

        BigDecimal basicSalary =
                salaryStructureRepository
                        .findByEmployee_EmployeeId(employeeId)
                        .orElseThrow(() ->
                                new RuntimeException(
                                        "Salary structure not found"
                                )
                        )
                        .getBasicSalary();


        BigDecimal overtimeHours =
                attendance.getOvertimeHours() == null
                        ? BigDecimal.ZERO
                        : attendance.getOvertimeHours();


        // Daily basic salary = Basic / 26
        BigDecimal dailyBasicRate =
                basicSalary.divide(
                        BigDecimal.valueOf(26),
                        2,
                        RoundingMode.HALF_UP
                );


        // Hourly basic salary = Daily / 8
        BigDecimal hourlyBasicRate =
                dailyBasicRate.divide(
                        BigDecimal.valueOf(8),
                        2,
                        RoundingMode.HALF_UP
                );


        // Overtime = 1.5 × hourly basic salary
        BigDecimal overtimeRate =
                hourlyBasicRate.multiply(
                        BigDecimal.valueOf(1.5)
                );


        return overtimeHours.multiply(overtimeRate);
    }


    // GET EMPLOYEE ATTENDANCE

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByEmployee(
            Long employeeId
    ) {

        return attendanceRepository
                .findByEmployee_EmployeeIdOrderByPayPeriodDesc(
                        employeeId
                );
    }


    // VALIDATE PAY PERIOD

    private void validatePayPeriod(String payPeriod) {

        if (payPeriod == null ||
                !payPeriod.matches("\\d{4}-(0[1-9]|1[0-2])")) {

            throw new RuntimeException(
                    "Attendance Month must be in YYYY-MM format"
            );
        }

        YearMonth attendanceMonth =
                YearMonth.parse(payPeriod);

        YearMonth currentMonth =
                YearMonth.now();

        if (attendanceMonth.isAfter(currentMonth)) {

            throw new RuntimeException(
                    "Attendance Month cannot be in the future"
            );
        }
    }
}