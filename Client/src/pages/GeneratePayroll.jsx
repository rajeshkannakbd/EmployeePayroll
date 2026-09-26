import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calculator,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  FileText,
  IndianRupee,
  Play,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

const today = new Date();
const todayDate = today.toISOString().split("T")[0];
const currentMonth = today.toISOString().slice(0, 7);

const initialForm = {
  employeeId: "",
  payPeriod: currentMonth,
  payDate: todayDate,
  bonus: "",
};

function FieldError({ name, fieldErrors }) {
  const message = fieldErrors[name];

  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getEmployeeName = (employee) =>
  [employee?.firstName, employee?.lastName]
    .filter(Boolean)
    .join(" ") || "Employee";

const formatMonth = (value) => {
  if (!value) return "-";

  const [year, month] = String(value).split("-");

  if (!year || !month) {
    return value;
  }

  return new Date(
    Number(year),
    Number(month) - 1,
    1
  ).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
};

function GeneratePayroll() {
  const navigate = useNavigate();

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [employeesLoading, setEmployeesLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [generatedPayrollId, setGeneratedPayrollId] = useState(null);

  const topRef = useRef(null);

  // ---------------------------------------------------------
  // FETCH EMPLOYEES
  // ---------------------------------------------------------

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setEmployeesLoading(true);
      setError("");

      const response = await axiosInstance.get("/employees");

      setEmployees(
        Array.isArray(response.data) ? response.data : []
      );
    } catch (err) {
      console.error("Failed to fetch employees:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to load employees.");
      } else {
        setError("Failed to load employees.");
      }
    } finally {
      setEmployeesLoading(false);
    }
  };

  // ---------------------------------------------------------
  // SELECTED EMPLOYEE
  // ---------------------------------------------------------

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          employee.employeeId === Number(form.employeeId)
      ),
    [employees, form.employeeId]
  );
  

  // ---------------------------------------------------------
  // FORM
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setMessage("");
    setGeneratedPayrollId(null);

    setFieldErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!form.employeeId) {
      errors.employeeId = "Employee is required.";
    }

    if (!form.payPeriod) {
      errors.payPeriod = "Pay period is required.";
    } else if (form.payPeriod > currentMonth) {
      errors.payPeriod = "Pay period cannot be in the future.";
    }

    if (!form.payDate) {
      errors.payDate = "Pay date is required.";
    } else if (form.payDate > todayDate) {
      errors.payDate = "Pay date cannot be in the future.";
    }

    if (form.bonus !== "" && Number(form.bonus) < 0) {
      errors.bonus = "Bonus cannot be negative.";
    }

    setFieldErrors(errors);

    return Object.keys(errors).length === 0;
  };

  // ---------------------------------------------------------
  // GENERATE PAYROLL
  // ---------------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");
    setGeneratedPayrollId(null);

    if (!validateForm()) {
      requestAnimationFrame(() => {
        const firstError = Object.keys(fieldErrors)[0];
        if (firstError) {
          document.getElementById(firstError)?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
      return;
    }

    try {
      setLoading(true);

      const requestBody = {
        employeeId: Number(form.employeeId),
        payPeriod: form.payPeriod,
        payDate: form.payDate,
        bonus: form.bonus === "" ? 0 : Number(form.bonus),
      };

      const response = await axiosInstance.post(
        "/payrolls/generate",
        requestBody
      );

      const payrollId = response.data.payrollId;

      setGeneratedPayrollId(payrollId);
      setMessage(
        `Payroll generated successfully. Payroll ID: ${payrollId}`
      );

      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } catch (err) {
      console.error("Failed to generate payroll:", err);

      const responseData = err.response?.data;

      if (responseData?.errors) {
        const backendErrors = {};

        Object.entries(responseData.errors).forEach(
          ([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              backendErrors[field] = messages[0];
            } else if (typeof messages === "string") {
              backendErrors[field] = messages;
            }
          }
        );

        setFieldErrors(backendErrors);

        if (Object.keys(backendErrors).length === 0) {
          setError(
            responseData.message || "Validation failed."
          );
        }
      } else if (responseData?.message) {
        setError(responseData.message);
      } else if (typeof responseData === "string") {
        setError(responseData);
      } else {
        setError("Failed to generate payroll.");
      }

      requestAnimationFrame(() => {
        topRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // RESET
  // ---------------------------------------------------------

  const handleReset = () => {
    setForm(initialForm);
    setError("");
    setFieldErrors({});
    setMessage("");
    setGeneratedPayrollId(null);
  };

  const openPayslip = () => {
    if (!generatedPayrollId) {
      return;
    }

    navigate(`/payslip/${generatedPayrollId}`);
  };

  const bonusAmount = Number(form.bonus || 0);
  

  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div
      ref={topRef}
      className="min-h-full scroll-smooth p-4 w-full "
    >
      <div className="mx-auto">
        {/* HEADER */}

        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-indigo-600">
              Payroll
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
              Generate Payroll
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/payroll/history")}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
          >
            <FileText size={15} />
            Payroll History
          </button>
        </div>

        {/* SUCCESS */}

        {message && (
          <div className="mb-4 flex flex-col gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2
                size={18}
                className="shrink-0 text-emerald-600"
              />

              <div>
                <p className="text-sm font-semibold text-emerald-800">
                  Payroll generated successfully
                </p>
              </div>
            </div>

            {generatedPayrollId && (
              <button
                type="button"
                onClick={openPayslip}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
              >
                View Payslip
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
            <CircleAlert
              size={18}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to generate payroll
              </p>

              <p className="mt-0.5 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            {/* LEFT */}

            <div className="space-y-4 xl:col-span-2">
              {/* PAYROLL DETAILS */}

              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Payroll Details
                  </h2>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {/* EMPLOYEE */}

                    <div className="md:col-span-2">
                      <label
                        htmlFor="employeeId"
                        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Employee{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        id="employeeId"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={handleChange}
                        disabled={employeesLoading || loading}
                        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 ${
                          fieldErrors.employeeId
                            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                      >
                        <option value="">
                          {employeesLoading
                            ? "Loading employees..."
                            : "Select employee"}
                        </option>

                        {employees.map((employee) => (
                          <option
                            key={employee.employeeId}
                            value={employee.employeeId}
                          >
                            {employee.employeeCode} —{" "}
                            {getEmployeeName(employee)}
                          </option>
                        ))}
                      </select>

                      <FieldError
                        name="employeeId"
                        fieldErrors={fieldErrors}
                      />
                    </div>

                    {/* PAY PERIOD */}

                    <div>
                      <label
                        htmlFor="payPeriod"
                        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Pay Period{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="payPeriod"
                        type="month"
                        name="payPeriod"
                        value={form.payPeriod}
                        onChange={handleChange}
                        max={currentMonth}
                        disabled={loading}
                        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition disabled:bg-slate-100 ${
                          fieldErrors.payPeriod
                            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                      />

                      <FieldError
                        name="payPeriod"
                        fieldErrors={fieldErrors}
                      />
                    </div>

                    {/* PAY DATE */}

                    <div>
                      <label
                        htmlFor="payDate"
                        className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                      >
                        Pay Date{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        id="payDate"
                        type="date"
                        name="payDate"
                        value={form.payDate}
                        onChange={handleChange}
                        max={todayDate}
                        disabled={loading}
                        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition disabled:bg-slate-100 ${
                          fieldErrors.payDate
                            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                      />

                      <FieldError
                        name="payDate"
                        fieldErrors={fieldErrors}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* SELECTED EMPLOYEE 

              {selectedEmployee && (
                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <h2 className="text-sm font-semibold text-slate-800">
                      Selected Employee
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="flex items-center gap-2.5 sm:col-span-2 lg:col-span-1">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-sm font-bold text-indigo-600">
                        {(
                          selectedEmployee.firstName?.charAt(0) || "E"
                        ).toUpperCase()}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {getEmployeeName(selectedEmployee)}
                        </p>

                        <p className="text-[11px] text-slate-400">
                          {selectedEmployee.employeeCode || "-"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Department
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {selectedEmployee.department?.departmentName ||
                          "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Designation
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {selectedEmployee.designation || "-"}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                        Employment
                      </p>

                      <p className="mt-1 truncate text-sm font-medium text-slate-700">
                        {selectedEmployee.employmentType || "-"}
                      </p>
                    </div>
                  </div>
                </section>
              )}

               BONUS */}

              <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-semibold text-slate-800">
                    Additional Earnings
                  </h2>
                </div>

                <div className="p-4">
                  <div className="max-w-sm">
                    <label
                      htmlFor="bonus"
                      className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                    >
                      Bonus
                    </label>

                    <div className="relative">
                      <IndianRupee
                        size={14}
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                      />

                      <input
                        id="bonus"
                        type="number"
                        name="bonus"
                        value={form.bonus}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        disabled={loading}
                        className={`w-full rounded-lg border bg-white py-2.5 pl-8 pr-3 text-sm outline-none transition disabled:bg-slate-100 ${
                          fieldErrors.bonus
                            ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                            : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                        }`}
                      />
                    </div>

                    <FieldError
                      name="bonus"
                      fieldErrors={fieldErrors}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* RIGHT SUMMARY */}

            <div className="xl:col-span-1">
              <div className="sticky top-5 space-y-4">
                {/* PREVIEW */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Calculator
                        size={16}
                        className="text-indigo-500"
                      />

                      <h2 className="text-sm font-semibold text-slate-800">
                        Payroll Summary
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-3 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Employee
                      </span>

                      <span className="max-w-[58%] truncate text-right text-sm font-semibold text-slate-800">
                        {selectedEmployee
                          ? getEmployeeName(selectedEmployee)
                          : "Not selected"}
                      </span>
                    </div>
                     <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Department
                      </span>

                      <span className="max-w-[58%] truncate text-right text-sm font-semibold text-slate-800">
                        {selectedEmployee?.departmentName ||
                          "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Pay Period
                      </span>

                      <span className="text-sm font-semibold text-slate-800">
                        {formatMonth(form.payPeriod)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Pay Date
                      </span>

                      <span className="text-sm font-semibold text-slate-800">
                        {form.payDate || "-"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500">
                        Bonus
                      </span>

                      <span className="text-sm font-semibold text-indigo-600">
                        +{formatCurrency(bonusAmount)}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5">
                        <UserRound
                          size={15}
                          className="shrink-0 text-slate-400"
                        />

                        <p className="text-xs text-slate-500">
                          Salary and attendance values are taken from
                          the configured records during generation.
                        </p>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ACTIONS */}

                <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <button
                    type="submit"
                    disabled={loading || employeesLoading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Play size={15} />

                    {loading ? "Generating..." : "Generate Payroll"}
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={loading}
                    className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </button>

                  {generatedPayrollId && (
                    <button
                      type="button"
                      onClick={openPayslip}
                      className="mt-2.5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                    >
                      <FileText size={14} />
                      Open Payslip
                    </button>
                  )}
                </section>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GeneratePayroll;
