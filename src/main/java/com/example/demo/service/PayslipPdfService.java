package com.example.demo.service;

import com.example.demo.dto.PayslipResponse;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;

@Service
public class PayslipPdfService {

    public byte[] generatePayslipPdf(PayslipResponse payslip) {

        try (ByteArrayOutputStream outputStream =
                     new ByteArrayOutputStream()) {

            Document document = new Document();

            PdfWriter.getInstance(document, outputStream);

            document.open();

            // =====================================================
            // FONTS
            // =====================================================

            Font companyFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    18
            );

            Font titleFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    16
            );

            Font headingFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    11
            );

            Font normalFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    9
            );

            Font netSalaryFont = FontFactory.getFont(
                    FontFactory.HELVETICA_BOLD,
                    14
            );

            Font smallFont = FontFactory.getFont(
                    FontFactory.HELVETICA,
                    8
            );

            // =====================================================
            // COMPANY HEADER
            // =====================================================

            Paragraph companyName = new Paragraph(
                    payslip.getCompany().getCompanyName(),
                    companyFont
            );

            companyName.setAlignment(Element.ALIGN_CENTER);

            document.add(companyName);

            Paragraph companyAddress = new Paragraph(
                    payslip.getCompany().getAddress()
                            + ", "
                            + payslip.getCompany().getCity()
                            + ", "
                            + payslip.getCompany().getState(),
                    normalFont
            );

            companyAddress.setAlignment(Element.ALIGN_CENTER);

            document.add(companyAddress);

            Paragraph companyContact = new Paragraph(
                    "Email: "
                            + payslip.getCompany().getEmail()
                            + "    Phone: "
                            + payslip.getCompany().getPhone(),
                    smallFont
            );

            companyContact.setAlignment(Element.ALIGN_CENTER);

            document.add(companyContact);

            document.add(new Paragraph(" "));

            // =====================================================
            // PAYSLIP TITLE
            // =====================================================

            Paragraph title = new Paragraph(
                    "SALARY SLIP",
                    titleFont
            );

            title.setAlignment(Element.ALIGN_CENTER);

            document.add(title);

            Paragraph period = new Paragraph(
                    "Pay Period: " + payslip.getPayPeriod(),
                    headingFont
            );

            period.setAlignment(Element.ALIGN_CENTER);

            document.add(period);

            document.add(new Paragraph(" "));

            // =====================================================
            // EMPLOYEE INFORMATION
            // =====================================================

            document.add(
                    new Paragraph(
                            "EMPLOYEE INFORMATION",
                            headingFont
                    )
            );

            PdfPTable employeeTable =
                    new PdfPTable(2);

            employeeTable.setWidthPercentage(100);

            employeeTable.setWidths(
                    new float[]{3, 5}
            );

            addRow(
                    employeeTable,
                    "Employee ID",
                    String.valueOf(payslip.getEmployeeId()),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Employee Code",
                    payslip.getEmployeeCode(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Employee Name",
                    payslip.getEmployeeName(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Department",
                    payslip.getDepartmentName(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Designation",
                    payslip.getDesignation(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Joining Date",
                    String.valueOf(payslip.getJoiningDate()),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Employment Type",
                    payslip.getEmploymentType(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "Location",
                    payslip.getLocation(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "PAN",
                    payslip.getPanNumber(),
                    normalFont
            );

            addRow(
                    employeeTable,
                    "UAN",
                    payslip.getUanNumber(),
                    normalFont
            );

            document.add(employeeTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // ATTENDANCE
            // =====================================================

            document.add(
                    new Paragraph(
                            "ATTENDANCE",
                            headingFont
                    )
            );

            PdfPTable attendanceTable =
                    new PdfPTable(5);

            attendanceTable.setWidthPercentage(100);

            addHeader(
                    attendanceTable,
                    "Working Days",
                    headingFont
            );

            addHeader(
                    attendanceTable,
                    "Present Days",
                    headingFont
            );

            addHeader(
                    attendanceTable,
                    "Leave Days",
                    headingFont
            );

            addHeader(
                    attendanceTable,
                    "Unpaid Leave",
                    headingFont
            );

            addHeader(
                    attendanceTable,
                    "OT Hours",
                    headingFont
            );

            attendanceTable.addCell(
                    safeValue(payslip.getWorkingDays())
            );

            attendanceTable.addCell(
                    safeValue(payslip.getPresentDays())
            );

            attendanceTable.addCell(
                    safeValue(payslip.getLeaveDays())
            );

            attendanceTable.addCell(
                    safeValue(payslip.getUnpaidLeaveDays())
            );

            attendanceTable.addCell(
                    safeValue(payslip.getOvertimeHours())
            );

            document.add(attendanceTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // EARNINGS AND DEDUCTIONS SIDE BY SIDE
            // =====================================================

            PdfPTable mainTable =
                    new PdfPTable(2);

            mainTable.setWidthPercentage(100);

            mainTable.setWidths(
                    new float[]{1, 1}
            );

            // -----------------------------------------------------
            // EARNINGS TABLE
            // -----------------------------------------------------

            PdfPTable earningsTable =
                    new PdfPTable(2);

            earningsTable.setWidthPercentage(100);

            addHeader(
                    earningsTable,
                    "EARNINGS",
                    headingFont
            );

            addHeader(
                    earningsTable,
                    "AMOUNT",
                    headingFont
            );

            addRow(
                    earningsTable,
                    "Basic Salary",
                    money(payslip.getBasicSalary()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "HRA",
                    money(payslip.getHra()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "Conveyance",
                    money(payslip.getConveyance()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "Special Allowance",
                    money(payslip.getSpecialAllowance()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "Other Allowance",
                    money(payslip.getOtherAllowance()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "Overtime",
                    money(payslip.getOvertime()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "Bonus",
                    money(payslip.getBonus()),
                    normalFont
            );

            addRow(
                    earningsTable,
                    "Gross Salary",
                    money(payslip.getGrossSalary()),
                    headingFont
            );

            mainTable.addCell(
                    createTableCell(
                            earningsTable
                    )
            );

            // -----------------------------------------------------
            // DEDUCTIONS TABLE
            // -----------------------------------------------------

            PdfPTable deductionsTable =
                    new PdfPTable(2);

            deductionsTable.setWidthPercentage(100);

            addHeader(
                    deductionsTable,
                    "DEDUCTIONS",
                    headingFont
            );

            addHeader(
                    deductionsTable,
                    "AMOUNT",
                    headingFont
            );

            addRow(
                    deductionsTable,
                    "EPF",
                    money(payslip.getEpf()),
                    normalFont
            );

            addRow(
                    deductionsTable,
                    "Professional Tax",
                    money(payslip.getProfessionalTax()),
                    normalFont
            );

            addRow(
                    deductionsTable,
                    "TDS",
                    money(payslip.getTds()),
                    normalFont
            );

            addRow(
                    deductionsTable,
                    "Other Deductions",
                    money(payslip.getOtherDeductions()),
                    normalFont
            );

            addRow(
                    deductionsTable,
                    "Unpaid Leave",
                    money(payslip.getUnpaidLeaveDeduction()),
                    normalFont
            );

            addRow(
                    deductionsTable,
                    "Total Deductions",
                    money(payslip.getTotalDeductions()),
                    headingFont
            );

            mainTable.addCell(
                    createTableCell(
                            deductionsTable
                    )
            );

            document.add(mainTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // NET SALARY
            // =====================================================

            Paragraph netSalary = new Paragraph(
                    "NET SALARY: ₹"
                            + money(payslip.getNetSalary()),
                    netSalaryFont
            );

            netSalary.setAlignment(Element.ALIGN_CENTER);

            document.add(netSalary);

            Paragraph amountWords = new Paragraph(
                    "Amount in Words: "
                            + payslip.getNetSalaryInWords(),
                    normalFont
            );

            amountWords.setAlignment(Element.ALIGN_CENTER);

            document.add(amountWords);

            document.add(new Paragraph(" "));

            // =====================================================
            // PAYMENT DETAILS
            // =====================================================

            document.add(
                    new Paragraph(
                            "PAYMENT DETAILS",
                            headingFont
                    )
            );

            PdfPTable paymentTable =
                    new PdfPTable(2);

            paymentTable.setWidthPercentage(100);

            paymentTable.setWidths(
                    new float[]{3, 5}
            );

            addRow(
                    paymentTable,
                    "Bank Account",
                    payslip.getBankAccountNumber(),
                    normalFont
            );

            addRow(
                    paymentTable,
                    "IFSC Code",
                    payslip.getIfscCode(),
                    normalFont
            );

            addRow(
                    paymentTable,
                    "Payment Date",
                    String.valueOf(payslip.getPayDate()),
                    normalFont
            );

            addRow(
                    paymentTable,
                    "Status",
                    payslip.getStatus(),
                    normalFont
            );

            document.add(paymentTable);

            document.add(new Paragraph(" "));

            // =====================================================
            // NOTE
            // =====================================================

            document.add(
                    new Paragraph(
                            "NOTE",
                            headingFont
                    )
            );

            document.add(
                    new Paragraph(
                            payslip.getNote(),
                            smallFont
                    )
            );

            document.add(new Paragraph(" "));

            Paragraph footer = new Paragraph(
                    "This is a system-generated payslip.",
                    smallFont
            );

            footer.setAlignment(Element.ALIGN_CENTER);

            document.add(footer);

            // =====================================================
            // CLOSE DOCUMENT
            // =====================================================

            document.close();

            return outputStream.toByteArray();

        } catch (Exception exception) {

            throw new RuntimeException(
                    "Failed to generate payslip PDF",
                    exception
            );
        }
    }

    // =============================================================
    // HELPER METHODS
    // =============================================================

    private void addRow(
            PdfPTable table,
            String label,
            String value,
            Font font) {

        PdfPCell labelCell =
                new PdfPCell(
                        new Paragraph(label, font)
                );

        PdfPCell valueCell =
                new PdfPCell(
                        new Paragraph(
                                value == null ? "" : value,
                                font
                        )
                );

        table.addCell(labelCell);
        table.addCell(valueCell);
    }

    private void addHeader(
            PdfPTable table,
            String text,
            Font font) {

        PdfPCell cell =
                new PdfPCell(
                        new Paragraph(text, font)
                );

        cell.setHorizontalAlignment(
                Element.ALIGN_CENTER
        );

        table.addCell(cell);
    }

    private PdfPCell createTableCell(
            PdfPTable table) {

        PdfPCell cell =
                new PdfPCell();

        cell.addElement(table);

        return cell;
    }

    private String money(
            java.math.BigDecimal value) {

        if (value == null) {
            return "0.00";
        }

        return value.setScale(
                2,
                java.math.RoundingMode.HALF_UP
        ).toPlainString();
    }

    private String safeValue(Object value) {

        return value == null
                ? "-"
                : String.valueOf(value);
    }
}