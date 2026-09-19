package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.entity.Attendance;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployee_EmployeeIdAndPayPeriod(
            Long employeeId,
            String payPeriod
    );

    List<Attendance> findByEmployee_EmployeeIdOrderByPayPeriodDesc(
            Long employeeId
    );
}