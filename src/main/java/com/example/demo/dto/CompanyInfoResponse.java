package com.example.demo.dto;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CompanyInfoResponse {

    private String companyName;
    private String address;
    private String city;
    private String state;
    private String email;
    private String phone;
}