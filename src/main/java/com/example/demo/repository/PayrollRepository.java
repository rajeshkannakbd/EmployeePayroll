package com.example.demo.repository;

import com.example.demo.entity.Payroll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import org.springframework.data.domain.Sort;
import java.util.Optional;
import java.util.List;

public interface PayrollRepository extends JpaRepository<Payroll, Long> {

    Optional<Payroll> findByEmployee_EmployeeIdAndPayPeriod(
            Long employeeId,
            String payPeriod
    );
    List<Payroll> findByEmployee_EmployeeId(Long employeeId);
    List<Payroll> findByPayPeriod(String payPeriod);
    List<Payroll> findByStatus(String status);
    @Query("""
    SELECT COALESCE(SUM(p.grossSalary), 0)
    FROM Payroll p
    WHERE p.payPeriod = :payPeriod
""")
BigDecimal getTotalGrossSalaryByPayPeriod(
        @Param("payPeriod") String payPeriod
);
   @Query("""
    SELECT COALESCE(SUM(p.totalDeductions), 0)
    FROM Payroll p
    WHERE p.payPeriod = :payPeriod
""")
BigDecimal getTotalDeductionsByPayPeriod(
        @Param("payPeriod") String payPeriod
);
@Query("""
    SELECT COALESCE(SUM(p.netSalary), 0)
    FROM Payroll p
    WHERE p.payPeriod = :payPeriod
""")
BigDecimal getTotalNetSalaryByPayPeriod(
        @Param("payPeriod") String payPeriod
);
@Query("""
    SELECT COUNT(p)
    FROM Payroll p
    WHERE p.payPeriod = :payPeriod
""")
long countPayrollsByPayPeriod(
        @Param("payPeriod") String payPeriod
);
List<Payroll> findByPayPeriodAndStatus(
        String payPeriod,
        String status
);
List<Payroll> findByEmployee_EmployeeId(
        Long employeeId,
        Sort sort
);

}