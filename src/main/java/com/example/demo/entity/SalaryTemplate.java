package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "salary_templates")
@Getter
@Setter
@NoArgsConstructor
public class SalaryTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long templateId;

    @Column(nullable = false, unique = true)
    private String templateName;

    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal basicSalary;

    private BigDecimal hra;
    private BigDecimal conveyance;
    private BigDecimal specialAllowance;
    private BigDecimal otherAllowance;

    private BigDecimal epf;
    private BigDecimal professionalTax;
    private BigDecimal tds;
    private BigDecimal otherDeductions;

    @Column(nullable = false)
    private Boolean active = true;
}