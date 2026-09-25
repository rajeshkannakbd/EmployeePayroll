import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_BASE_URL = "http://localhost:8080";

const formatMoney = (amount) => {
  if (amount === null || amount === undefined) {
    return "₹0.00";
  }

  return `₹${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};
function Payslip() {
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { auth } = useAuth();

  // Later we can get this from React Router.
  const { payrollId } = useParams();

  useEffect(() => {
    fetchPayslip();
  }, [payrollId]);

  const fetchPayslip = async () => {
  try {
    setLoading(true);
    setError("");

    let endpoint;

    if (auth?.role === "EMPLOYEE") {
      endpoint =
        `${API_BASE_URL}/payrolls/me/${payrollId}/payslip`;
    } else if (
      auth?.role === "HR" ||
      auth?.role === "ADMIN"
    ) {
      endpoint =
        `${API_BASE_URL}/payrolls/${payrollId}/payslip`;
    } else {
      setError("Your account role could not be identified.");
      return;
    }

    console.log("Payslip endpoint:", endpoint);
    console.log("Logged-in role:", auth?.role);

    const response =
      await axiosInstance.get(endpoint);

    setPayslip(response.data);

  } catch (error) {

    console.error(
      "Failed to fetch payslip:",
      error
    );

    if (error.response?.status === 401) {

      setError(
        "Your session has expired. Please login again."
      );

    } else if (error.response?.status === 403) {

      setError(
        "You do not have permission to view this payslip."
      );

    } else if (error.response?.data?.message) {

      setError(
        error.response.data.message
      );

    } else {

      setError(
        "Failed to load payslip from server."
      );
    }

  } finally {
    setLoading(false);
  }
};

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-200">
        <div className="rounded-lg bg-white px-8 py-6 shadow">
          <p className="text-lg font-semibold text-slate-700">
            Loading payslip...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-200">
        <div className="max-w-md rounded-lg bg-white px-8 py-6 text-center shadow">
          <p className="text-lg font-semibold text-red-600">
            {error}
          </p>

          <button
            onClick={fetchPayslip}
            className="mt-4 rounded-lg bg-green-700 px-5 py-2 font-semibold text-white hover:bg-green-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!payslip) {
    return null;
  }

  // =========================
  // EARNINGS
  // =========================

  const earnings = [
    ["Basic Salary", payslip.basicSalary],
    ["House Rent Allowance (HRA)", payslip.hra],
    ["Conveyance Allowance", payslip.conveyance],
    ["Special Allowance", payslip.specialAllowance],
    ["Other Allowance", payslip.otherAllowance],
    ["Overtime", payslip.overtime],
    ["Performance Bonus", payslip.bonus],
  ];

  // =========================
  // DEDUCTIONS
  // =========================

  const deductions = [
    [
      "Employee Provident Fund (EPF)",
      payslip.epf,
    ],
    [
      "Professional Tax",
      payslip.professionalTax,
    ],
    [
      "TDS (Income Tax)",
      payslip.tds,
    ],
    [
      "Other Deductions",
      payslip.otherDeductions,
    ],
    [
      "Unpaid Leave Deduction",
      payslip.unpaidLeaveDeduction,
    ],
  ];

  return (
 <div className="min-h-screen print:break-inside-avoid bg-slate-200 px-4 py-6 print:bg-white print:px-0 print:py-0">
<div className="mx-auto w-full max-w-[1150px] overflow-hidden bg-white shadow-xl print:max-w-none print:border-0 print:shadow-none">      
    {/* =====================================================
            COMPANY HEADER
        ====================================================== */}

        <header className="border-b-2 print:break-inside-avoid border-slate-800">

  <div className="flex flex-col justify-between gap-5 px-8 py-6 md:flex-row md:items-center">

    {/* LEFT: LOGO + COMPANY */}
    <div className="flex items-center gap-4">

      <div className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-green-800 text-4xl font-extrabold text-green-800">
        ABC
      </div>

      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 md:text-3xl">
          {payslip.company?.companyName}
        </h1>

        <p className="mt-1 text-xs font-semibold tracking-[0.35em] text-slate-500">
          PEOPLE • INNOVATION • GROWTH
        </p>
      </div>

    </div>

    {/* RIGHT: COMPANY CONTACT */}
    <div className="text-left text-xs leading-5 text-slate-600 md:text-right">

      <p className="font-bold text-slate-900">
        {payslip.company?.address}
      </p>

      <p>
        {payslip.company?.city},{" "}
        {payslip.company?.state}
      </p>

      <p>
        {payslip.company?.email}
      </p>

      <p>
        {payslip.company?.phone}
      </p>

    </div>

  </div>

</header>

        {/* =====================================================
            TITLE
        ====================================================== */}

        <section className="border-b print:break-inside-avoid border-slate-300 px-8 py-5">

  <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

    <div>
      <h2 className="text-3xl font-black uppercase tracking-wide text-slate-900">
        Salary Slip
      </h2>

      <p className="mt-1 text-base font-medium text-slate-600">
        For the Month of{" "}
        <span className="font-bold text-slate-900">
          {payslip.payPeriod}
        </span>
      </p>
    </div>

    <div className="text-left text-sm md:text-right">

      <p>
        <span className="font-semibold text-slate-600">
          Payslip No:
        </span>{" "}
        <span className="font-bold text-slate-900">
          PS-{String(payslip.payrollId).padStart(4, "0")}
        </span>
      </p>

      <p className="mt-1">
        <span className="font-semibold text-slate-600">
          Pay Date:
        </span>{" "}
        <span className="font-bold text-slate-900">
          {payslip.payDate}
        </span>
      </p>

    </div>

  </div>

</section>

        {/* =====================================================
            EMPLOYEE + COMPANY DETAILS
        ====================================================== */}

       <section className="grid grid-cols-1 gap-0 px-6 pt-5 print:break-inside-avoid md:grid-cols-2">

  {/* EMPLOYEE DETAILS */}

  <div className="border border-slate-300">

    <div className="bg-green-800 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white">
      Employee Details
    </div>

    <div>

      {[
        ["Employee ID", payslip.employeeId],
        ["Employee Code", payslip.employeeCode],
        ["Employee Name", payslip.employeeName],
        ["Department", payslip.departmentName],
        ["Designation", payslip.designation],
        ["Date of Joining", payslip.joiningDate],
        ["Employment Type", payslip.employmentType],
      ].map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[42%_58%] border-b border-slate-200 text-sm last:border-b-0"
        >
          <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-600">
            {label}
          </div>

          <div className="px-3 py-2 font-medium text-slate-900">
            {value ?? "-"}
          </div>
        </div>
      ))}

    </div>

  </div>

  {/* PAYROLL DETAILS */}

  <div className="border border-slate-300 md:border-l-0">

    <div className="bg-green-800 px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-white">
      Payroll Details
    </div>

    <div>

      {[
        ["Pay Period", payslip.payPeriod],
        ["Working Days", payslip.workingDays],
        ["Present Days", payslip.presentDays],
        ["Leave Days", payslip.leaveDays],
        ["Unpaid Leave", payslip.unpaidLeaveDays],
        ["Overtime Hours", payslip.overtimeHours],
        ["Location", payslip.location],
      ].map(([label, value]) => (
        <div
          key={label}
          className="grid grid-cols-[42%_58%] border-b border-slate-200 text-sm last:border-b-0"
        >
          <div className="bg-slate-50 px-3 py-2 font-semibold text-slate-600">
            {label}
          </div>

          <div className="px-3 py-2 font-medium text-slate-900">
            {value ?? "-"}
          </div>
        </div>
      ))}

    </div>

  </div>

</section>
<section className="grid grid-cols-1 print:break-inside-avoid gap-0 px-6 pt-3 md:grid-cols-3">

  <div className="border border-slate-300 px-4 py-3">
    <p className="text-xs font-semibold uppercase text-slate-500">
      PAN
    </p>

    <p className="mt-1 text-sm font-bold text-slate-900">
      {payslip.panNumber ?? "-"}
    </p>
  </div>

  <div className="border border-l-0 border-slate-300 px-4 py-3">
    <p className="text-xs font-semibold uppercase text-slate-500">
      UAN
    </p>

    <p className="mt-1 text-sm font-bold text-slate-900">
      {payslip.uanNumber ?? "-"}
    </p>
  </div>

  <div className="border border-l-0 border-slate-300 px-4 py-3">
    <p className="text-xs font-semibold uppercase text-slate-500">
      Bank Account
    </p>

    <p className="mt-1 text-sm font-bold text-slate-900">
      {payslip.bankAccountNumber ?? "-"}
    </p>
  </div>

        </section>
{/* =====================================================
    EARNINGS + DEDUCTIONS
====================================================== */}

<section className="px-6 print:break-inside-avoid pt-6">

  <div className="grid grid-cols-1 overflow-hidden border border-slate-300 md:grid-cols-2">

    {/* ================= EARNINGS ================= */}

    <div className="border-b border-emerald-300 md:border-b-0 md:border-r">

      <div className="bg-emerald-300 px-5 py-3 text-center text-base font-bold uppercase tracking-wide text-white">
        Earnings
      </div>

      <div className="grid grid-cols-[1fr_150px] border-b border-emerald-300 bg-slate-100 text-sm font-bold">

        <div className="border-r border-emerald-300 px-4 py-2.5">
          Description
        </div>

        <div className="px-4 py-2.5 text-right">
          Amount (₹)
        </div>

      </div>

      {earnings.map(([label, amount]) => (
        <div
          key={label}
          className="grid grid-cols-[1fr_150px] border-b border-slate-200 text-sm"
        >

          <div className="border-r border-emerald-200 px-4 py-2.5 text-slate-700">
            {label}
          </div>

          <div className="px-4 py-2.5 text-right font-medium text-slate-900">
            {formatMoney(amount).replace("₹", "")}
          </div>

        </div>
      ))}

      <div className="grid grid-cols-[1fr_150px] bg-emerald-100 text-sm font-extrabold">

        <div className="border-r border-emerald-300 px-4 py-3">
          Total Earnings (A)
        </div>

        <div className="px-4 py-3 text-right">
          {formatMoney(payslip.grossSalary).replace("₹", "")}
        </div>

      </div>

    </div>

    {/* ================= DEDUCTIONS ================= */}

    <div>

      <div className="bg-red-300 px-5 py-3 text-center text-base font-bold uppercase tracking-wide text-white">
        Deductions
      </div>

      <div className="grid grid-cols-[1fr_150px] border-b border-red-300 bg-slate-100 text-sm font-bold">

        <div className="border-r border-red-300 px-4 py-2.5">
          Description
        </div>

        <div className="px-4 py-2.5 text-right">
          Amount (₹)
        </div>

      </div>

      {deductions.map(([label, amount]) => (
        <div
          key={label}
          className="grid grid-cols-[1fr_150px] border-b border-red-200 text-sm"
        >

          <div className="border-r border-red-200 px-4 py-2.5 text-slate-700">
            {label}
          </div>

          <div className="px-4 py-2.5 text-right font-medium text-slate-900">
            {formatMoney(amount).replace("₹", "")}
          </div>

        </div>
      ))}

      <div className="grid grid-cols-[1fr_150px] bg-red-100 text-sm font-extrabold">

        <div className="border-r border-slate-300 px-4 py-3">
          Total Deductions (B)
        </div>

        <div className="px-4 py-3 text-right">
          {formatMoney(payslip.totalDeductions).replace("₹", "")}
        </div>

      </div>

    </div>

  </div>

</section>
        

        {/* =====================================================
            NET SALARY
        ====================================================== */}

       <section className="px-6 pt-5 print:break-inside-avoid">

  <div className="overflow-hidden border-2 border-slate-800">

    <div className="grid grid-cols-1 md:grid-cols-[1fr_320px]">

      <div className="flex items-center bg-slate-100 px-6 py-4">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Net Salary
          </p>

          <p className="text-2xl font-black text-slate-900">
            Amount Payable (A - B)
          </p>

        </div>

      </div>

      <div className="flex items-center justify-center bg-green-800 px-6 py-4">

        <p className="text-3xl font-black text-white">
          {formatMoney(payslip.netSalary)}
        </p>

      </div>

    </div>

  </div>

  <div className="border-x border-b border-slate-300 px-5 py-3">

    <p className="text-sm text-slate-600">

      <span className="font-bold text-slate-800">
        Amount in Words:
      </span>{" "}

      {payslip.netSalaryInWords || "-"}

    </p>

  </div>

</section>

{/* =====================================================
    BOTTOM INFORMATION
====================================================== */}

<section className="grid grid-cols-1 print:break-inside-avoid gap-4 px-6 py-5 md:grid-cols-3">

  {/* Attendance Summary */}
  <div className="overflow-hidden border border-slate-300">

    <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
        Attendance Summary
      </h3>
    </div>

    <div className="grid grid-cols-2">

      <div className="border-b border-r border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500">
          Working Days
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          {payslip.workingDays ?? "-"}
        </p>
      </div>

      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500">
          Present Days
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          {payslip.presentDays ?? "-"}
        </p>
      </div>

      <div className="border-r border-slate-200 px-4 py-3">
        <p className="text-xs text-slate-500">
          Leave Days
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          {payslip.leaveDays ?? "-"}
        </p>
      </div>

      <div className="px-4 py-3">
        <p className="text-xs text-slate-500">
          Overtime Hours
        </p>

        <p className="mt-1 text-lg font-bold text-slate-900">
          {payslip.overtimeHours ?? "-"}
        </p>
      </div>

    </div>
  </div>


  {/* Payment Details */}
  <div className="overflow-hidden border border-slate-300">

    <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
        Payment Details
      </h3>
    </div>

    <div className="divide-y divide-slate-200 text-sm">

      <div className="grid grid-cols-[45%_55%] px-4 py-2.5">
        <span className="font-medium text-slate-500">
          Pay Date
        </span>

        <span className="font-semibold text-slate-900">
          {payslip.payDate ?? "-"}
        </span>
      </div>

      <div className="grid grid-cols-[45%_55%] px-4 py-2.5">
        <span className="font-medium text-slate-500">
          Payment Mode
        </span>

        <span className="font-semibold text-slate-900">
          Bank Transfer
        </span>
      </div>

      <div className="grid grid-cols-[45%_55%] px-4 py-2.5">
        <span className="font-medium text-slate-500">
          Bank Account
        </span>

        <span className="font-semibold text-slate-900">
          {payslip.bankAccountNumber ?? "-"}
        </span>
      </div>

      <div className="grid grid-cols-[45%_55%] px-4 py-2.5">
        <span className="font-medium text-slate-500">
          IFSC
        </span>

        <span className="font-semibold text-slate-900">
          {payslip.ifscCode ?? "-"}
        </span>
      </div>

      <div className="grid grid-cols-[45%_55%] px-4 py-2.5">
        <span className="font-medium text-slate-500">
          Status
        </span>

        <span className="font-semibold text-slate-900">
          {payslip.status ?? "-"}
        </span>
      </div>

    </div>
  </div>


  {/* HR Note */}
  <div className="overflow-hidden border border-slate-300">

    <div className="border-b border-slate-300 bg-slate-100 px-4 py-3">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
        A Note from HR
      </h3>
    </div>

    <div className="flex min-h-[180px] flex-col justify-between p-5">

      <p className="text-sm italic leading-6 text-slate-600">
        “{payslip.note ?? "-"}”
      </p>

      <div className="mt-6">
        <p className="text-sm font-semibold text-slate-800">
          HR Department
        </p>

        <p className="text-xs text-slate-500">
          {payslip.company?.companyName}
        </p>
      </div>

    </div>
  </div>

</section>

{/* =====================================================
    FOOTER
====================================================== */}

<footer className="border-t print:break-inside-avoid border-slate-300 px-6 py-4">

  <div className="flex flex-col justify-between gap-3 text-xs text-slate-500 md:flex-row">

    <div>

      <p>
        This is a computer-generated payslip and does not require a signature.
      </p>

      <p className="mt-1">
        For payroll queries, contact HR at{" "}
        <span className="font-medium text-slate-700">
          {payslip.company?.email}
        </span>
      </p>

    </div>

    <div className="text-left md:text-right">

      <p className="font-semibold text-slate-700">
        {payslip.company?.companyName}
      </p>

      <p>
        {payslip.company?.city},{" "}
        {payslip.company?.state}
      </p>

    </div>

  </div>

</footer>


    </div>
        <div className="mx-auto mb-4 mt-6 flex max-w-[1150px] justify-end print:hidden">

  <button
    type="button"
    onClick={() => window.print()}
    className="rounded-lg bg-green-800 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-900"
  >
    Print / Save as PDF
  </button>

</div>
</div>
  );
}

export default Payslip;