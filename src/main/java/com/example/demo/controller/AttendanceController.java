package com.example.demo.controller;

import jakarta.validation.Valid;

import com.example.demo.entity.Attendance;
import com.example.demo.service.AttendanceService;
import com.example.demo.dto.attendance.AttendanceRequest;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(
            AttendanceService attendanceService) {

        this.attendanceService = attendanceService;
    }

    // GET ALL ATTENDANCE
    // Permission: ATTENDANCE_VIEW

    @GetMapping
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public List<Attendance> getAllAttendance() {

        return attendanceService.getAllAttendance();
    }


    // GET ATTENDANCE BY ID
    // Permission: ATTENDANCE_VIEW

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public Attendance getAttendanceById(
            @PathVariable Long id) {

        return attendanceService.getAttendanceById(id);
    }


    // CREATE / EDIT ATTENDANCE
    // Permission: ATTENDANCE_EDIT

    @PostMapping
    @PreAuthorize("hasAuthority('ATTENDANCE_EDIT')")
    public Attendance createAttendance(
            @Valid @RequestBody AttendanceRequest request) {

        return attendanceService.createAttendance(request);
    }


    // CALCULATE OVERTIME AMOUNT
    // Permission: ATTENDANCE_VIEW

    @GetMapping("/{employeeId}/{payPeriod}/overtime-amount")
    @PreAuthorize("hasAuthority('ATTENDANCE_VIEW')")
    public BigDecimal calculateOvertimeAmount(
            @PathVariable Long employeeId,
            @PathVariable String payPeriod) {

        return attendanceService.calculateOvertimeAmount(
                employeeId,
                payPeriod
        );
    }


    // EMPLOYEE SELF ATTENDANCE
    // Permission: MY_ATTENDANCE_VIEW

    @GetMapping("/me")
    @PreAuthorize("hasAuthority('MY_ATTENDANCE_VIEW')")
    public ResponseEntity<List<Attendance>> getMyAttendance(
            @AuthenticationPrincipal Jwt jwt) {

        Long employeeId =
                ((Number) jwt.getClaim("employeeId")).longValue();

        return ResponseEntity.ok(
                attendanceService.getAttendanceByEmployee(employeeId)
        );
    }
}