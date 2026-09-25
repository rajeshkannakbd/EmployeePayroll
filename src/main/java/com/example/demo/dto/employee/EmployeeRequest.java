package com.example.demo.dto.employee;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeRequest {

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 2, max = 250, message = "Enter a valid name")
    @Pattern(
        regexp = "^[a-zA-Z]+$",
        message = "Only letters allowed"
    )
    private String firstName;

    @Size(min = 1, max = 20, message = "Enter a valid name")
    @Pattern(
        regexp = "^[a-zA-Z]+$",
        message = "Only letters allowed"
    )
    private String lastName;

    @Email
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone cannot be empty")
    @Pattern(
        regexp = "^[1-9][0-9]{9}$",
        message = "Phone must be 10 digits"
    )
    private String phone;

    @NotBlank(message = "Designation is required")
    @Size(min = 2, max = 100, message = "Enter a valid designation")
    @Pattern(
        regexp = "^[a-zA-Z][a-zA-Z .'-]*$",
        message = "Enter a valid designation"
    )
    private String designation;

    @PastOrPresent
    private LocalDate joiningDate;

    @NotBlank(message = "Status is required")
    private String status;

    @NotBlank(message = "PAN number is required")
    @Pattern(
        regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
        message = "Enter a valid PAN number"
    )
    private String panNumber;

    @Pattern(
        regexp = "^[1-9][0-9]{11}$",
        message = "Enter a valid UAN number"
    )
    private String uanNumber;

    private String bankAccountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(
        regexp = "^[A-Z]{4}0[A-Z0-9]{6}$",
        message = "Enter a valid IFSC code"
    )
    private String ifscCode;

    @NotBlank(message = "Employment type is required")
    private String employmentType;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 100, message = "Enter a valid location")
    @Pattern(
        regexp = "^[a-zA-Z][a-zA-Z .'-]*$",
        message = "Enter a valid location"
    )
    private String location;

    private Long departmentId;


  }