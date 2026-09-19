package com.example.demo.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.PastOrPresent;

@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long employeeId;

    @Column(nullable = false, unique = true)
    private String employeeCode;

    @NotBlank(message ="Name cannot be empty")
    @Size(min=2, max=300, message="Enter a Valid name")
    @Pattern(regexp = "^[a-zA-Z]+$", message="Only Letters allowed")
    @Column(nullable = false)
    private String firstName;

    private String lastName;
     
    
    @Email
    @Column(nullable = false, unique = true)
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message ="Phone cannot be emplty")
    @Pattern(regexp="^[1-9][0-9]{9}$", message="Phone Must be should be 10 digits")
    @Column(nullable=false,unique=true)
    private String phone;

    @NotBlank(message = "Designation is required")
@Size(min = 2, max = 100, message = "Enter a valid designation")
@Pattern(
    regexp = "^[a-zA-Z][a-zA-Z .'-]*$",
    message = "Enter a valid designation"
)
@Column(nullable = false)
private String designation;

    @PastOrPresent
    @Column(nullable=false)
    private LocalDate joiningDate;
    
  @NotBlank(message = "Status is required")
@Column(nullable = false)
private String status;

    @Column(nullable=false,unique=true)
    @Pattern(regexp="^[A-Z]{5}[0-9]{4}[A-Z]{1}$", message="Enter a Vaild PAN number")
    @NotBlank(message = "PAN number is required")
    private String panNumber;

    @NotBlank(message="UAN number is required")
    @Column(nullable=false,unique=true)
    @Pattern(regexp="^[1-9][0-9]{11}$", message = "Enter a Vaild UAN Number")
    private String uanNumber;

    @Column(nullable=false,unique=true)
    private String bankAccountNumber;

    @NotBlank(message="IFSC code is required")
    @Pattern(regexp="^[A-Z]{4}0[A-Z0-9]{6}$", message="Enter a valid Code")
    @Column(nullable=false)
    private String ifscCode;
    
    @NotBlank(message = "Employment type is required")
@Column(nullable = false)
private String employmentType;

    @NotBlank(message = "Location is required")
@Size(min = 2, max = 100, message = "Enter a valid location")
@Pattern(
    regexp = "^[a-zA-Z][a-zA-Z .'-]*$",
    message = "Enter a valid location"
)
@Column(nullable = false)
private String location;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @Column
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column
    private Role role;

    public Employee() {
    }

    public Employee(
            Long employeeId,
            String employeeCode,
            String firstName,
            String lastName,
            String email,
            String phone,
            String designation,
            LocalDate joiningDate,
            String status,
            Department department,
            String panNumber,
            String uanNumber,
            String bankAccountNumber,
            String ifscCode,
            String employmentType,
            String location,
            String passwordHash,
            Role role
        ) {

        this.employeeId = employeeId;
        this.employeeCode = employeeCode;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.designation = designation;
        this.joiningDate = joiningDate;
        this.status = status;
        this.department = department;
        this.panNumber = panNumber;
       this.uanNumber = uanNumber;
       this.bankAccountNumber = bankAccountNumber;
       this.ifscCode = ifscCode;
       this.employmentType = employmentType;
       this.location = location;
       this.passwordHash = passwordHash;
       this.role = role;
    }

    // --- ACTUAL GETTERS AND SETTERS (REQUIRED FOR JSON) ---

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeCode() {
        return employeeCode;
    }

    public void setEmployeeCode(String employeeCode) {
        this.employeeCode = employeeCode;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
    public Department getDepartment(){
      return department;
    }
    public void setDepartment(Department department){
        this.department = department;
    }
    public String getPanNumber(){
      return panNumber;
    }
    public void setPanNumber(String panNumber){
        this.panNumber = panNumber;
    }
    public String getUanNumber(){
      return uanNumber;
    }
    public void setUanNumber(String uanNumber){
        this.uanNumber = uanNumber;
    }
    public String getBankAccountNumber(){
      return bankAccountNumber;
    }
    public void setBankAccountNumber(String bankAccountNumbert){
        this.bankAccountNumber = bankAccountNumber;
    }
    public String getIfscCode(){
      return ifscCode;
    }
    public void setIfscCode(String ifscCode){
        this.ifscCode = ifscCode;
    }
    public String getEmploymentType(){
        return employmentType;
    }
    public void setEmploymentType(String employmentType){
        this.employmentType = employmentType;
    }
    public String getLocation(){
        return location;
    }
    public void setLocation(String location){
        this.location = location;
    }
    public String getPasswordHash(){
        return passwordHash;
    }
    public void setPasswordHash(String passwordHash){
        this.passwordHash = passwordHash;
    }
    public Role getRole(){
        return role;
    }
    public void setRole(Role role){
        this.role = role;
    }


}
