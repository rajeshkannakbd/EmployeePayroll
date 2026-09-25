package com.example.demo.entity;
import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonSetter;
import com.fasterxml.jackson.annotation.Nulls;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @Column(nullable = false, unique = true)
    private String employeeCode;

    @NotBlank(message = "Name cannot be empty")
    @Size(min = 2, max = 250, message = "Enter a Valid name")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Only Letters allowed")
    @Column(nullable = false)
    private String firstName;

    @Size(min = 1, max = 20, message = "Enter a Valid name")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Only Letters allowed")
    private String lastName;

    @Email
    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone cannot be emplty")
    @Pattern(regexp = "^[1-9][0-9]{9}$",message = "Phone Must be should be 10 digits")
    @Column(nullable = false, unique = true)
    private String phone;

    @NotBlank(message = "Designation is required")
    @Size(min = 2, max = 100, message = "Enter a valid designation")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z .'-]*$",message = "Enter a valid designation")
    @Column(nullable = false)
    private String designation;

    @PastOrPresent
    @Column(nullable = false)
    private LocalDate joiningDate;

    @NotBlank(message = "Status is required")
    @Column(nullable = false)
    private String status;

    @Column(nullable = false, unique = true)
    @Pattern(regexp = "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",message = "Enter a Vaild PAN number")
    @NotBlank(message = "PAN number is required")
    private String panNumber;

    @Pattern(regexp = "^[1-9][0-9]{11}$",message = "Enter a Vaild UAN Number")
    private String uanNumber;

    @Column(nullable = false, unique = true)
    private String bankAccountNumber;

    @NotBlank(message = "IFSC code is required")
    @Pattern(regexp = "^[A-Z]{4}0[A-Z0-9]{6}$", message = "Enter a valid Code" )
    @Column(nullable = false)
    private String ifscCode;

    @NotBlank(message = "Employment type is required")
    @Column(nullable = false)
    private String employmentType;

    @NotBlank(message = "Location is required")
    @Size(min = 2, max = 100, message = "Enter a valid location")
    @Pattern(regexp = "^[a-zA-Z][a-zA-Z .'-]*$",message = "Enter a valid location")
    @Column(nullable = false)
    private String location;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column
    @JsonIgnore
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column
    private Role role;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    @JsonSetter(nulls = Nulls.SKIP)
    @Column(nullable = false)
    private boolean mustChangePassword = false;



    @JsonSetter(nulls = Nulls.SKIP)
    public void setMustChangePassword(boolean mustChangePassword) {
    this.mustChangePassword = mustChangePassword;
}
}
