package com.example.demo.dto.login;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private String role;
    private boolean mustChangePassword;

}
