package com.example.demo.repository;
import com.example.demo.entity.Attendance;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {

    Optional<Attendance> findByEmployee_EmployeeIdAndPayPeriod(
            Long employeeId,
            String payPeriod
        );

    List<Attendance> findByEmployee_EmployeeIdOrderByPayPeriodDesc(
            Long employeeId
        );
}