package com.example.demo.dto;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PayrollGenerationRequest {

    private Long employeeId;
    private String payPeriod;
    private LocalDate payDate;
    private BigDecimal bonus;

}