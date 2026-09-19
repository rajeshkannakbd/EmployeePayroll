import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const today = new Date();
const todayDate = today.toISOString().split("T")[0];
const currentMonth = today.toISOString().slice(0, 7);

const initialForm = {
    employeeId: "",
    payPeriod: "",
    payDate: "",
    bonus: "",
};

function FieldError({ name, fieldErrors }) {
    const message = fieldErrors[name];

    if (!message) {
        return null;
    }

    return (
        <p className="mt-1.5 text-xs font-medium text-red-600">
            {message}
        </p>
    );
}

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

    // =========================================================
    // FETCH EMPLOYEES
    // =========================================================

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setEmployeesLoading(true);
            setError("");

            const response = await axiosInstance.get("/employees");

            setEmployees(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
        } catch (err) {
            console.error("Failed to fetch employees:", err);

            if (err.response?.status === 401) {
                setError(
                    "Your session has expired. Please login again."
                );
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to load employees."
                );
            } else {
                setError("Failed to load employees.");
            }
        } finally {
            setEmployeesLoading(false);
        }
    };

    // =========================================================
    // SELECTED EMPLOYEE
    // =========================================================

    const selectedEmployee = useMemo(() => {
        return employees.find(
            (employee) =>
                employee.employeeId === Number(form.employeeId)
        );
    }, [employees, form.employeeId]);

    // =========================================================
    // HANDLE INPUT
    // =========================================================

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

    // =========================================================
    // FORM VALIDATION
    // =========================================================

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

    // =========================================================
    // GENERATE PAYROLL
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        setMessage("");
        setError("");
        setGeneratedPayrollId(null);

        const isValid = validateForm();

        if (!isValid) {
            return;
        }

        try {
            setLoading(true);

            /*
             * Only monthly variable information is sent here.
             *
             * Salary values and deductions are NOT entered here.
             * Backend gets them from:
             *
             * Salary Structure
             * Attendance
             *
             * and calculates the final payroll.
             */

            const requestBody = {
                employeeId: Number(form.employeeId),
                payPeriod: form.payPeriod,
                payDate: form.payDate,
                bonus:
                    form.bonus === ""
                        ? 0
                        : Number(form.bonus),
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
        } catch (err) {
            console.error(
                "Failed to generate payroll:",
                err
            );

            const responseData = err.response?.data;

            if (responseData?.errors) {
                const backendErrors = {};

                Object.entries(responseData.errors).forEach(
                    ([field, messages]) => {
                        if (
                            Array.isArray(messages) &&
                            messages.length > 0
                        ) {
                            backendErrors[field] = messages[0];
                        } else if (
                            typeof messages === "string"
                        ) {
                            backendErrors[field] = messages;
                        }
                    }
                );

                setFieldErrors(backendErrors);

                if (
                    Object.keys(backendErrors).length === 0
                ) {
                    setError(
                        responseData.message ||
                            "Validation failed."
                    );
                }
            } else if (responseData?.message) {
                setError(responseData.message);
            } else if (typeof responseData === "string") {
                setError(responseData);
            } else {
                setError("Failed to generate payroll.");
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // RESET
    // =========================================================

    const handleReset = () => {
        setForm(initialForm);
        setError("");
        setFieldErrors({});
        setMessage("");
        setGeneratedPayrollId(null);
    };

    // =========================================================
    // VIEW PAYSLIP
    // =========================================================

    const openPayslip = () => {
        if (!generatedPayrollId) {
            return;
        }

        navigate(`/payslip/${generatedPayrollId}`);
    };

    // =========================================================
    // FORMAT CURRENCY
    // =========================================================

    const formatCurrency = (value) => {
        const amount = Number(value || 0);

        return `₹${amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const bonusAmount = Number(form.bonus || 0);

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl">

                {/* =================================================
                    PAGE HEADER
                ================================================= */}

                <div className="mb-8">

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                        <div>

                            <div className="mb-2 inline-flex items-center rounded-full bg-[#1BBD36]/10 px-3 py-1 text-xs font-semibold text-[#1BBD36]">
                                Payroll Management
                            </div>

                            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                                Generate Payroll
                            </h1>

                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                                Generate a monthly payroll using the
                                employee's salary structure and attendance
                                information.
                            </p>

                        </div>

                        <div className="flex items-center gap-3">

                            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">

                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                    Current Month
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                    {currentMonth}
                                </p>

                            </div>

                        </div>

                    </div>

                </div>

                {/* =================================================
                    SUCCESS MESSAGE
                ================================================= */}

                {message && (
                    <div className="mb-6 overflow-hidden rounded-2xl border border-green-200 bg-green-50 shadow-sm">

                        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                            <div className="flex items-start gap-3">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700">
                                    ✓
                                </div>

                                <div>

                                    <p className="text-sm font-semibold text-green-800">
                                        Payroll generated successfully
                                    </p>

                                    <p className="mt-1 text-xs text-green-700">
                                        {message}
                                    </p>

                                </div>

                            </div>

                            {generatedPayrollId && (
                                <button
                                    type="button"
                                    onClick={openPayslip}
                                    className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700"
                                >
                                    View Payslip
                                </button>
                            )}

                        </div>

                    </div>
                )}

                {/* =================================================
                    ERROR MESSAGE
                ================================================= */}

                {error && (
                    <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm">

                        <div className="flex items-start gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-600">
                                !
                            </div>

                            <div>
                                <p className="text-sm font-semibold text-red-800">
                                    Unable to generate payroll
                                </p>

                                <p className="mt-1 text-sm text-red-700">
                                    {error}
                                </p>
                            </div>

                        </div>

                    </div>
                )}

                <form onSubmit={handleSubmit} noValidate>

                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

                        {/* =================================================
                            LEFT SIDE
                        ================================================= */}

                        <div className="space-y-6 xl:col-span-2">

                            {/* =================================================
                                PAYROLL DETAILS
                            ================================================= */}

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Payroll Details
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Select the employee and payroll period.
                                    </p>

                                </div>

                                <div className="p-6">

                                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                                        {/* EMPLOYEE */}

                                        <div className="md:col-span-2">

                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Employee{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <select
                                                name="employeeId"
                                                value={form.employeeId}
                                                onChange={handleChange}
                                                disabled={
                                                    employeesLoading ||
                                                    loading
                                                }
                                                className={`w-full rounded-xl border ${
                                                    fieldErrors.employeeId
                                                        ? "border-red-500 ring-2 ring-red-100"
                                                        : "border-slate-300"
                                                } bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:cursor-not-allowed disabled:bg-slate-100`}
                                            >

                                                <option value="">
                                                    {employeesLoading
                                                        ? "Loading employees..."
                                                        : "Select Employee"}
                                                </option>

                                                {employees.map(
                                                    (employee) => (
                                                        <option
                                                            key={
                                                                employee.employeeId
                                                            }
                                                            value={
                                                                employee.employeeId
                                                            }
                                                        >
                                                            {
                                                                employee.employeeCode
                                                            }{" "}
                                                            -{" "}
                                                            {
                                                                employee.firstName
                                                            }{" "}
                                                            {
                                                                employee.lastName
                                                            }
                                                        </option>
                                                    )
                                                )}

                                            </select>

                                            <FieldError
                                                name="employeeId"
                                                fieldErrors={fieldErrors}
                                            />

                                        </div>

                                        {/* PAY PERIOD */}

                                        <div>

                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Pay Period{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="month"
                                                name="payPeriod"
                                                value={form.payPeriod}
                                                onChange={handleChange}
                                                max={currentMonth}
                                                disabled={loading}
                                                className={`w-full rounded-xl border ${
                                                    fieldErrors.payPeriod
                                                        ? "border-red-500 ring-2 ring-red-100"
                                                        : "border-slate-300"
                                                } bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100`}
                                            />

                                            <FieldError
                                                name="payPeriod"
                                                fieldErrors={fieldErrors}
                                            />

                                            <p className="mt-2 text-xs text-slate-400">
                                                Select a current or previous
                                                month.
                                            </p>

                                        </div>

                                        {/* PAY DATE */}

                                        <div>

                                            <label className="mb-2 block text-sm font-semibold text-slate-700">
                                                Pay Date{" "}
                                                <span className="text-red-500">
                                                    *
                                                </span>
                                            </label>

                                            <input
                                                type="date"
                                                name="payDate"
                                                value={form.payDate}
                                                onChange={handleChange}
                                                max={todayDate}
                                                disabled={loading}
                                                className={`w-full rounded-xl border ${
                                                    fieldErrors.payDate
                                                        ? "border-red-500 ring-2 ring-red-100"
                                                        : "border-slate-300"
                                                } bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100`}
                                            />

                                            <FieldError
                                                name="payDate"
                                                fieldErrors={fieldErrors}
                                            />

                                            <p className="mt-2 text-xs text-slate-400">
                                                Date on which salary is paid.
                                            </p>

                                        </div>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                SELECTED EMPLOYEE
                            ================================================= */}

                            {selectedEmployee && (
                                <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-sm">

                                    <div className="border-b border-green-100 bg-green-50 px-6 py-4">

                                        <div className="flex items-center gap-2">

                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-200 text-sm font-bold text-green-700">
                                                i
                                            </div>

                                            <div>
                                                <h2 className="text-base font-semibold text-green-900">
                                                    Selected Employee
                                                </h2>

                                                <p className="text-xs text-green-600">
                                                    Employee information
                                                </p>
                                            </div>
                                        </div>

                                    </div>

                                    <div className="p-6">

                                        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">

                                            {/* Avatar */}

                                            <div className="flex items-center gap-4">

                                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-green-700 text-xl font-bold text-white shadow-sm">
                                                    {(
                                                        selectedEmployee
                                                            .firstName
                                                            ?.charAt(0) ||
                                                        "E"
                                                    ).toUpperCase()}
                                                </div>

                                                <div>

                                                    <h3 className="text-lg font-semibold text-slate-900">
                                                        {
                                                            selectedEmployee.firstName
                                                        }{" "}
                                                        {
                                                            selectedEmployee.lastName
                                                        }
                                                    </h3>

                                                    <p className="mt-1 text-sm text-slate-500">
                                                        {
                                                            selectedEmployee.employeeCode
                                                        }
                                                    </p>

                                                </div>

                                            </div>

                                            {/* Details */}

                                            <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2">

                                                <div className="rounded-xl bg-slate-50 p-4">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                        Department
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {selectedEmployee.department
                                                            ?.departmentName ||
                                                            "-"}
                                                    </p>

                                                </div>

                                                <div className="rounded-xl bg-slate-50 p-4">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                        Designation
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {selectedEmployee.designation ||
                                                            "-"}
                                                    </p>

                                                </div>

                                                <div className="rounded-xl bg-slate-50 p-4">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                        Employment Type
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {selectedEmployee.employmentType ||
                                                            "-"}
                                                    </p>

                                                </div>

                                                <div className="rounded-xl bg-slate-50 p-4">

                                                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                        Location
                                                    </p>

                                                    <p className="mt-1 text-sm font-semibold text-slate-800">
                                                        {selectedEmployee.location ||
                                                            "-"}
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    </div>

                                </div>
                            )}

                            {/* =================================================
                                BONUS
                            ================================================= */}

                            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                <div className="border-b border-slate-100 px-6 py-5">

                                    <h2 className="text-lg font-semibold text-slate-900">
                                        Additional Earnings
                                    </h2>

                                    <p className="mt-1 text-sm text-slate-500">
                                        Enter any additional amount applicable
                                        to this month's payroll.
                                    </p>

                                </div>

                                <div className="p-6">

                                    <div className="max-w-md">

                                        <label className="mb-2 block text-sm font-semibold text-slate-700">
                                            Bonus
                                        </label>

                                        <div className="relative">

                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                                ₹
                                            </span>

                                            <input
                                                type="number"
                                                name="bonus"
                                                value={form.bonus}
                                                onChange={handleChange}
                                                min="0"
                                                step="0.01"
                                                placeholder="0.00"
                                                disabled={loading}
                                                className={`w-full rounded-xl border ${
                                                    fieldErrors.bonus
                                                        ? "border-red-500 ring-2 ring-red-100"
                                                        : "border-slate-300"
                                                } bg-white py-3 pl-9 pr-4 text-sm text-slate-700 outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100`}
                                            />

                                        </div>

                                        <FieldError
                                            name="bonus"
                                            fieldErrors={fieldErrors}
                                        />

                                        <p className="mt-2 text-xs leading-5 text-slate-400">
                                            Leave empty or enter 0 when there
                                            is no bonus.
                                        </p>

                                    </div>

                                </div>

                            </div>

                            {/* =================================================
                                AUTOMATIC CALCULATIONS
                            ================================================= */}

                            <div className="rounded-2xl border border-green-100 bg-green-50 shadow-sm">

                                <div className="p-6">

                                    <div className="flex items-start gap-4">

                                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-600 text-lg text-white">
                                            ⚙
                                        </div>

                                        <div>

                                            <h2 className="text-lg font-semibold text-green-900">
                                                Automatic Payroll Calculation
                                            </h2>

                                            <p className="mt-1 text-sm leading-6 text-green-700">
                                                You do not need to enter salary
                                                or deduction values here.
                                                The backend uses the employee's
                                                salary structure and attendance
                                                records to calculate the final
                                                payroll.
                                            </p>

                                        </div>

                                    </div>

                                    <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        <div className="rounded-xl border border-green-100 bg-white p-4">

                                            <p className="text-sm font-semibold text-slate-800">
                                                Salary Structure
                                            </p>

                                            <div className="mt-3 space-y-2 text-sm text-slate-600">

                                                <p>
                                                    ✓ Basic Salary
                                                </p>

                                                <p>
                                                    ✓ HRA
                                                </p>

                                                <p>
                                                    ✓ Conveyance
                                                </p>

                                                <p>
                                                    ✓ Special Allowance
                                                </p>

                                                <p>
                                                    ✓ Other Allowance
                                                </p>

                                            </div>

                                        </div>

                                        <div className="rounded-xl border border-green-100 bg-white p-4">

                                            <p className="text-sm font-semibold text-slate-800">
                                                Automatic Deductions
                                            </p>

                                            <div className="mt-3 space-y-2 text-sm text-slate-600">

                                                <p>
                                                    ✓ EPF
                                                </p>

                                                <p>
                                                    ✓ Professional Tax
                                                </p>

                                                <p>
                                                    ✓ TDS
                                                </p>

                                                <p>
                                                    ✓ Other Deductions
                                                </p>

                                                <p>
                                                    ✓ Unpaid Leave Deduction
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                    <div className="mt-4 rounded-xl border border-green-100 bg-white px-4 py-3">

                                        <p className="text-xs font-medium uppercase tracking-wide text-green-600">
                                            Attendance-based calculation
                                        </p>

                                        <p className="mt-1 text-sm text-slate-600">
                                            Overtime is taken from attendance
                                            and unpaid leave is automatically
                                            considered during payroll
                                            calculation.
                                        </p>

                                    </div>

                                </div>

                            </div>

                        </div>

                        {/* =================================================
                            RIGHT SIDE SUMMARY
                        ================================================= */}

                        <div className="xl:col-span-1">

                            <div className="sticky top-6 space-y-6">

                                {/* PAYROLL PREVIEW */}

                                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

                                    <div className="border-b border-slate-100 px-6 py-5">

                                        <h2 className="text-lg font-semibold text-slate-900">
                                            Payroll Preview
                                        </h2>

                                        <p className="mt-1 text-sm text-slate-500">
                                            Values used during generation
                                        </p>

                                    </div>

                                    <div className="p-6">

                                        <div className="space-y-4">

                                            {/* Employee */}

                                            <div>

                                                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                                                    Employee
                                                </p>

                                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                                    {selectedEmployee
                                                        ? `${selectedEmployee.firstName} ${selectedEmployee.lastName}`
                                                        : "Not selected"}
                                                </p>

                                            </div>

                                            <div className="border-t border-slate-100" />

                                            {/* Period */}

                                            <div className="flex items-center justify-between gap-4">

                                                <span className="text-sm text-slate-500">
                                                    Pay Period
                                                </span>

                                                <span className="text-sm font-semibold text-slate-800">
                                                    {form.payPeriod || "-"}
                                                </span>

                                            </div>

                                            {/* Pay Date */}

                                            <div className="flex items-center justify-between gap-4">

                                                <span className="text-sm text-slate-500">
                                                    Pay Date
                                                </span>

                                                <span className="text-sm font-semibold text-slate-800">
                                                    {form.payDate || "-"}
                                                </span>

                                            </div>

                                            <div className="border-t border-slate-100" />

                                            {/* Bonus */}

                                            <div className="flex items-center justify-between gap-4">

                                                <span className="text-sm text-slate-500">
                                                    Bonus
                                                </span>

                                                <span className="text-sm font-semibold text-green-600">
                                                    +
                                                    {formatCurrency(
                                                        bonusAmount
                                                    )}
                                                </span>

                                            </div>

                                            {/* Salary Structure */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center justify-between">

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            Salary Structure
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Loaded by backend
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                        Automatic
                                                    </span>

                                                </div>

                                            </div>

                                            {/* Attendance */}

                                            <div className="rounded-xl bg-slate-50 p-4">

                                                <div className="flex items-center justify-between">

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            Attendance
                                                        </p>

                                                        <p className="mt-1 text-xs text-slate-400">
                                                            Overtime & unpaid leave
                                                        </p>
                                                    </div>

                                                    <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-700">
                                                        Automatic
                                                    </span>

                                                </div>

                                            </div>

                                            {/* Final message */}

                                            <div className="rounded-xl border border-green-100 bg-green-50 p-4">

                                                <p className="text-sm font-semibold text-green-900">
                                                    Final salary is calculated
                                                    by the backend
                                                </p>

                                                <p className="mt-1 text-xs leading-5 text-green-700">
                                                    The generated payroll will
                                                    contain gross salary,
                                                    deductions and net salary.
                                                </p>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                                {/* ACTIONS */}

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                    <button
                                        type="submit"
                                        disabled={
                                            loading ||
                                            employeesLoading
                                        }
                                        className="w-full rounded-xl bg-green-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {loading
                                            ? "Generating Payroll..."
                                            : "Generate Payroll"}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleReset}
                                        disabled={loading}
                                        className="mt-3 w-full rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        Reset Form
                                    </button>

                                </div>

                                {/* HELP CARD */}

                                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

                                    <h3 className="text-sm font-semibold text-slate-800">
                                        Before generating
                                    </h3>

                                    <div className="mt-4 space-y-3 text-sm text-slate-500">

                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5 text-green-600">
                                                ✓
                                            </span>

                                            <span>
                                                Employee should have a salary
                                                structure.
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5 text-green-600">
                                                ✓
                                            </span>

                                            <span>
                                                Attendance should exist for
                                                the selected pay period.
                                            </span>
                                        </div>

                                        <div className="flex items-start gap-2">
                                            <span className="mt-0.5 text-green-600">
                                                ✓
                                            </span>

                                            <span>
                                                Pay period should be current
                                                or historical.
                                            </span>
                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default GeneratePayroll;