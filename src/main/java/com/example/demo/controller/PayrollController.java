package com.example.demo.controller;

import com.example.demo.dto.PayrollGenerationRequest;
import com.example.demo.entity.Payroll;
import com.example.demo.service.PayrollService;
import org.springframework.web.bind.annotation.*;
import com.example.demo.dto.PayrollSummaryResponse;
import com.example.demo.dto.PayslipResponse;
import com.example.demo.dto.PayslipResponse;
import com.example.demo.service.PayslipPdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import java.util.List;

@RestController
@RequestMapping("/payrolls")
public class PayrollController {

    private final PayrollService payrollService;
    private final PayslipPdfService payslipPdfService;

    public PayrollController(
        PayrollService payrollService,
        PayslipPdfService payslipPdfService) {

    this.payrollService = payrollService;
    this.payslipPdfService = payslipPdfService;
}

    @GetMapping
    public List<Payroll> getAllPayrolls() {
        return payrollService.getAllPayrolls();
    }

    @GetMapping("/{id}")
    public Payroll getPayrollById(@PathVariable Long id) {
        return payrollService.getPayrollById(id);
    }

    @PostMapping("/generate")
    public Payroll generatePayroll(
            @RequestBody PayrollGenerationRequest request) {

        return payrollService.generatePayroll(request);
    }

    @DeleteMapping("/{id}")
    public String deletePayroll(@PathVariable Long id) {

        payrollService.deletePayroll(id);

        return "Payroll deleted successfully";
    }
    @GetMapping("/employee/{employeeId}")
        public List<Payroll> getPayrollsByEmployee(
        @PathVariable Long employeeId) {

    return payrollService.getPayrollsByEmployee(employeeId);
} 
@GetMapping("/employee/{employeeId}/{payPeriod}")
public Payroll getPayrollByEmployeeAndPeriod(
        @PathVariable Long employeeId,
        @PathVariable String payPeriod) {

    return payrollService.getPayrollByEmployeeAndPeriod(
            employeeId,
            payPeriod
    );
}
@PutMapping("/{id}/approve")
public Payroll approvePayroll(
        @PathVariable Long id) {

    return payrollService.approvePayroll(id);
};
@PutMapping("/{id}/paid")
public Payroll markPayrollAsPaid(
        @PathVariable Long id) {

    return payrollService.markPayrollAsPaid(id);
};
@GetMapping("/period/{payPeriod}")
public List<Payroll> getPayrollsByPayPeriod(
        @PathVariable String payPeriod) {

    return payrollService.getPayrollsByPayPeriod(payPeriod);
}
@GetMapping("/status    /{status}")
public List<Payroll> getPayrollsByStatus(
        @PathVariable String status) {

    return payrollService.getPayrollsByStatus(status);
}
@GetMapping("/summary/{payPeriod}")
public PayrollSummaryResponse getPayrollSummary(
        @PathVariable String payPeriod) {

    return payrollService.getPayrollSummary(payPeriod);
}
@GetMapping("/filter")
public List<Payroll> getPayrollsByPayPeriodAndStatus(
        @RequestParam String payPeriod,
        @RequestParam String status) {

    return payrollService.getPayrollsByPayPeriodAndStatus(
            payPeriod,
            status
    );
}
@GetMapping("/{id}/payslip")
public PayslipResponse getPayslip(
        @PathVariable Long id) {

    return payrollService.getPayslip(id);
}
@GetMapping("/{id}/payslip/pdf")
public ResponseEntity<byte[]> downloadPayslipPdf(
        @PathVariable Long id) {

    PayslipResponse payslip =
            payrollService.getPayslip(id);

    byte[] pdf =
            payslipPdfService.generatePayslipPdf(payslip);

    return ResponseEntity.ok()
            .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=payslip-" + id + ".pdf"
            )
            .contentType(MediaType.APPLICATION_PDF)
            .body(pdf);
}
@GetMapping("/me")
@PreAuthorize("hasRole('EMPLOYEE')")
public ResponseEntity<List<Payroll>> getMyPayrollHistory(
        @AuthenticationPrincipal Jwt jwt) {

    Long employeeId =
            ((Number) jwt.getClaim("employeeId")).longValue();

    return ResponseEntity.ok(
            payrollService.getMyPayrollHistory(employeeId)
    );
}
@GetMapping("/me/{payrollId}/payslip")
@PreAuthorize("hasRole('EMPLOYEE')")
public ResponseEntity<PayslipResponse> getMyPayslip(
        @PathVariable Long payrollId,
        @AuthenticationPrincipal Jwt jwt) {

    Long employeeId =
            ((Number) jwt.getClaim("employeeId")).longValue();

    PayslipResponse payslip =
            payrollService.getEmployeePayslip(
                    employeeId,
                    payrollId
            );  

    return ResponseEntity.ok(payslip);
}
}
