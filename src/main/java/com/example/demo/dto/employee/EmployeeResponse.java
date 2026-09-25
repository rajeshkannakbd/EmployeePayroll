package com.example.demo.dto.employee;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponse {

    private Long employeeId;
    private String employeeCode;

    private String firstName;
    private String lastName;

    private String email;
    private String phone;
    private String designation;

    private LocalDate joiningDate;

    private String status;

    private String panNumber;
    private String uanNumber;

    private String bankAccountNumber;
    private String ifscCode;

    private String employmentType;
    private String location;

    private Long departmentId;
    private String departmentName;

    private String role;
    private boolean mustChangePassword;
}