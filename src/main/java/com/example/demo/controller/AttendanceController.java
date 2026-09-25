package com.example.demo.controller;
import jakarta.validation.Valid;
import com.example.demo.entity.Attendance;
import com.example.demo.service.AttendanceService;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.attendance.AttendanceRequest;
import java.math.BigDecimal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import java.util.List;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    @GetMapping
    public List<Attendance> getAllAttendance() {
        return attendanceService.getAllAttendance();
    }

    @GetMapping("/{id}")
    public Attendance getAttendanceById(
            @PathVariable Long id) {

        return attendanceService.getAttendanceById(id);
    }

    @PostMapping
    public Attendance createAttendance(
           @Valid @RequestBody AttendanceRequest request) {

        return attendanceService.createAttendance(request);
    }
    @GetMapping("/{employeeId}/{payPeriod}/overtime-amount")
public BigDecimal calculateOvertimeAmount(
        @PathVariable Long employeeId,
        @PathVariable String payPeriod) {

    return attendanceService.calculateOvertimeAmount(
            employeeId,
            payPeriod
    );
}
@GetMapping("/me")
@PreAuthorize("hasRole('EMPLOYEE')")
public ResponseEntity<List<Attendance>> getMyAttendance(
        @AuthenticationPrincipal Jwt jwt) {

    Long employeeId =
            ((Number) jwt.getClaim("employeeId")).longValue();

    return ResponseEntity.ok(
            attendanceService.getAttendanceByEmployee(employeeId)
    );
}
}