package com.example.demo.dto;

public class CompanyInfoResponse {

    private String companyName;
    private String address;
    private String city;
    private String state;
    private String email;
    private String phone;


    public CompanyInfoResponse() {
    }


    public CompanyInfoResponse(
            String companyName,
            String address,
            String city,
            String state,
            String email,
            String phone) {

        this.companyName = companyName;
        this.address = address;
        this.city = city;
        this.state = state;
        this.email = email;
        this.phone = phone;
    }


    // Getters and Setters

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }


    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }


    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }


    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
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
}
