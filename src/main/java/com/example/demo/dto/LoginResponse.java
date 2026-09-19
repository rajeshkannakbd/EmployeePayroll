package com.example.demo.dto;

public class LoginResponse {

    private String token;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String role;

    public LoginResponse(
            String token,
            Long employeeId,
            String employeeCode,
            String employeeName,
            String role
    ) {
        this.token = token;
        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.employeeName = employeeName;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public String getRole() {
        return role;
    }
}