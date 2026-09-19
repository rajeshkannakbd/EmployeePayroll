import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
    const navigate = useNavigate();
    const { auth } = useAuth();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ==========================================
    // ADMIN / HR DATA
    // ==========================================

    const [employees, setEmployees] = useState([]);
    const [payrolls, setPayrolls] = useState([]);
    const [attendance, setAttendance] = useState([]);

    // ==========================================
    // EMPLOYEE DATA
    // ==========================================

    const [myProfile, setMyProfile] = useState(null);
    const [myAttendance, setMyAttendance] = useState([]);
    const [myPayrolls, setMyPayrolls] = useState([]);

    const role = auth?.role;

    // ==========================================
    // FETCH DASHBOARD DATA
    // ==========================================

    useEffect(() => {
        if (!auth?.token) {
            return;
        }

        fetchDashboardData();
    }, [auth?.token, auth?.role]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError("");

            // ==========================================
            // EMPLOYEE DASHBOARD
            // ==========================================

            if (role === "EMPLOYEE") {
                const [
                    profileResponse,
                    attendanceResponse,
                    payrollResponse,
                ] = await Promise.all([
                    axiosInstance.get("/employees/me"),
                    axiosInstance.get("/attendance/me"),
                    axiosInstance.get("/payrolls/me"),
                ]);

                setMyProfile(profileResponse.data);

                setMyAttendance(
                    Array.isArray(attendanceResponse.data)
                        ? attendanceResponse.data
                        : []
                );

                setMyPayrolls(
                    Array.isArray(payrollResponse.data)
                        ? payrollResponse.data
                        : []
                );

                return;
            }

            // ==========================================
            // ADMIN / HR DASHBOARD
            // ==========================================

            const [
                employeesResponse,
                payrollResponse,
                attendanceResponse,
            ] = await Promise.all([
                axiosInstance.get("/employees"),
                axiosInstance.get("/payrolls"),
                axiosInstance.get("/attendance"),
            ]);

            setEmployees(
                Array.isArray(employeesResponse.data)
                    ? employeesResponse.data
                    : []
            );

            setPayrolls(
                Array.isArray(payrollResponse.data)
                    ? payrollResponse.data
                    : []
            );

            setAttendance(
                Array.isArray(attendanceResponse.data)
                    ? attendanceResponse.data
                    : []
            );
        } catch (err) {
            console.error("Failed to load dashboard data:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else if (err.response?.status === 403) {
                setError(
                    "You do not have permission to view this dashboard."
                );
            } else {
                setError("Failed to load dashboard");
            }
        } finally {
            setLoading(false);
        }
    };

    // ==========================================
    // CURRENT MONTH
    // ==========================================

    const currentMonth = new Date().toISOString().slice(0, 7);

    // ==========================================
    // ADMIN / HR CALCULATIONS
    // ==========================================

    const activeEmployees = useMemo(() => {
        return employees.filter(
            (employee) =>
                String(employee.status || "").toUpperCase() === "ACTIVE"
        ).length;
    }, [employees]);

    const currentMonthPayrolls = useMemo(() => {
        return payrolls.filter(
            (payroll) => payroll.payPeriod === currentMonth
        );
    }, [payrolls, currentMonth]);

    const totalGrossSalary = useMemo(() => {
        return currentMonthPayrolls.reduce(
            (total, payroll) =>
                total + Number(payroll.grossSalary || 0),
            0
        );
    }, [currentMonthPayrolls]);

    const totalNetSalary = useMemo(() => {
        return currentMonthPayrolls.reduce(
            (total, payroll) =>
                total + Number(payroll.netSalary || 0),
            0
        );
    }, [currentMonthPayrolls]);

    const pendingPayrolls = useMemo(() => {
        return currentMonthPayrolls.filter(
            (payroll) =>
                String(payroll.status || "").toUpperCase() === "GENERATED"
        ).length;
    }, [currentMonthPayrolls]);

    const currentMonthAttendance = useMemo(() => {
        return attendance.filter(
            (item) => item.payPeriod === currentMonth
        );
    }, [attendance, currentMonth]);

    const totalPresentDays = useMemo(() => {
        return currentMonthAttendance.reduce(
            (total, item) =>
                total + Number(item.presentDays || 0),
            0
        );
    }, [currentMonthAttendance]);

    const recentPayrolls = useMemo(() => {
        return [...payrolls]
            .sort((a, b) => {
                const aDate = a.payDate
                    ? new Date(a.payDate).getTime()
                    : 0;

                const bDate = b.payDate
                    ? new Date(b.payDate).getTime()
                    : 0;

                return bDate - aDate;
            })
            .slice(0, 5);
    }, [payrolls]);

    const departmentOverview = useMemo(() => {
        const departmentMap = {};

        employees.forEach((employee) => {
            const departmentName =
                employee.department?.departmentName ||
                "No Department";

            if (!departmentMap[departmentName]) {
                departmentMap[departmentName] = {
                    name: departmentName,
                    employeeCount: 0,
                    payrollAmount: 0,
                };
            }

            departmentMap[departmentName].employeeCount += 1;
        });

        currentMonthPayrolls.forEach((payroll) => {
            const departmentName =
                payroll.employee?.department?.departmentName ||
                "No Department";

            if (!departmentMap[departmentName]) {
                departmentMap[departmentName] = {
                    name: departmentName,
                    employeeCount: 0,
                    payrollAmount: 0,
                };
            }

            departmentMap[departmentName].payrollAmount += Number(
                payroll.grossSalary || 0
            );
        });

        return Object.values(departmentMap);
    }, [employees, currentMonthPayrolls]);

    // ==========================================
    // EMPLOYEE CALCULATIONS
    // ==========================================

    const employeeFullName = [
        myProfile?.firstName,
        myProfile?.lastName,
    ]
        .filter(Boolean)
        .join(" ");

    const employeeDepartment =
        myProfile?.department?.departmentName || "Not Assigned";

    const latestPayroll =
        myPayrolls.length > 0 ? myPayrolls[0] : null;

    const totalEmployeePresentDays = myAttendance.reduce(
        (total, item) =>
            total + Number(item.presentDays || 0),
        0
    );

    const totalEmployeeLeaveDays = myAttendance.reduce(
        (total, item) =>
            total + Number(item.leaveDays || 0),
        0
    );

    const totalEmployeeUnpaidLeaveDays = myAttendance.reduce(
        (total, item) =>
            total + Number(item.unpaidLeaveDays || 0),
        0
    );

    const totalEmployeeOvertimeHours = myAttendance.reduce(
        (total, item) =>
            total + Number(item.overtimeHours || 0),
        0
    );

    // ==========================================
    // LOADING SCREEN
    // ==========================================

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>

                    <p className="mt-4 text-gray-500">
                        Loading dashboard...
                    </p>
                </div>
            </div>
        );
    }

    // ==========================================
    // ERROR SCREEN
    // ==========================================

    if (error) {
        return (
            <div className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 bg-gray-50">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-100 p-8 text-center">

                    <div className="w-14 h-14 mx-auto rounded-full bg-red-50 flex items-center justify-center text-red-600 text-2xl font-bold">
                        !
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mt-5">
                        Unable to load dashboard
                    </h2>

                    <p className="text-gray-500 mt-2">
                        {error}
                    </p>

                    <button
                        onClick={fetchDashboardData}
                        className="mt-6 px-5 py-2.5 rounded-xl bg-green-600 text-white font-medium hover:bg-green-700 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ==========================================================
    // EMPLOYEE DASHBOARD
    // ==========================================================

    if (role === "EMPLOYEE") {
        return (
            <div className="min-h-full bg-[#F2F2F2] p-4 sm:p-6 lg:p-8">

                {/* ==========================================
                    HEADER
                ========================================== */}

                <div className="mb-8">
                    <p className="text-sm font-medium text-green-600">
                        Employee Dashboard
                    </p>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        Welcome, {employeeFullName || "Employee"}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View your profile, attendance and payroll information.
                    </p>
                </div>

                {/* ==========================================
                    PROFILE CARD
                ========================================== */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">

                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                        {/* Avatar */}

                        <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 text-xl font-bold">
                            {(
                                myProfile?.firstName?.charAt(0) || "E"
                            ).toUpperCase()}
                        </div>

                        {/* Employee Name */}

                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-gray-900">
                                {employeeFullName || "Employee"}
                            </h2>

                            <p className="text-gray-500 mt-1">
                                {myProfile?.designation || "Employee"}
                            </p>

                            <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-400">
                                <span>
                                    {myProfile?.employeeCode || "-"}
                                </span>

                                <span>•</span>

                                <span>
                                    {employeeDepartment}
                                </span>
                            </div>
                        </div>

                        {/* Status */}

                        <span className="inline-flex self-start sm:self-center px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                            {myProfile?.status || "ACTIVE"}
                        </span>

                    </div>

                </div>

                {/* ==========================================
                    EMPLOYEE SUMMARY CARDS
                ========================================== */}

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

                    {/* Present Days */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                        <p className="text-sm text-gray-500">
                            Present Days
                        </p>

                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {totalEmployeePresentDays}
                        </p>

                        <p className="text-sm text-green-600 mt-2">
                            Attendance history
                        </p>

                    </div>

                    {/* Leave Days */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                        <p className="text-sm text-gray-500">
                            Leave Days
                        </p>

                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {totalEmployeeLeaveDays}
                        </p>

                        <p className="text-sm text-orange-600 mt-2">
                            Total leave
                        </p>

                    </div>

                    {/* Unpaid Leave */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                        <p className="text-sm text-gray-500">
                            Unpaid Leave
                        </p>

                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {totalEmployeeUnpaidLeaveDays}
                        </p>

                        <p className="text-sm text-red-600 mt-2">
                            Unpaid days
                        </p>

                    </div>

                    {/* Overtime */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                        <p className="text-sm text-gray-500">
                            Overtime Hours
                        </p>

                        <p className="text-3xl font-bold text-gray-900 mt-2">
                            {totalEmployeeOvertimeHours}
                        </p>

                        <p className="text-sm text-green-600 mt-2">
                            Total overtime
                        </p>

                    </div>

                </div>

                {/* ==========================================
                    PROFILE + LATEST PAYROLL
                ========================================== */}

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">

                    {/* Personal Information */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <h2 className="text-lg font-semibold text-gray-900">
                            My Information
                        </h2>

                        <p className="text-sm text-gray-500 mt-1 mb-6">
                            Your employee details
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Full Name
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {employeeFullName || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Employee Code
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {myProfile?.employeeCode || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Email
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1 break-all">
                                    {myProfile?.email || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Phone
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {myProfile?.phone || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Department
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {employeeDepartment}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Designation
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {myProfile?.designation || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Joining Date
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {myProfile?.joiningDate || "-"}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-400 uppercase tracking-wide">
                                    Location
                                </p>

                                <p className="text-sm font-medium text-gray-800 mt-1">
                                    {myProfile?.location || "-"}
                                </p>
                            </div>

                        </div>

                    </div>

                    {/* Latest Payroll */}

                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                        <div className="flex items-center justify-between mb-6">

                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    Latest Payroll
                                </h2>

                                <p className="text-sm text-gray-500 mt-1">
                                    Your latest salary information
                                </p>
                            </div>

                            {latestPayroll && (
                                <span
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                                        String(
                                            latestPayroll.status || ""
                                        ).toUpperCase() === "PAID"
                                            ? "bg-green-100 text-green-700"
                                            : String(
                                                  latestPayroll.status || ""
                                              ).toUpperCase() === "APPROVED"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-orange-100 text-orange-700"
                                    }`}
                                >
                                    {latestPayroll.status || "GENERATED"}
                                </span>
                            )}

                        </div>

                        {latestPayroll ? (

                            <div>

                                <div className="grid grid-cols-2 gap-5">

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                            Pay Period
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {latestPayroll.payPeriod || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                            Pay Date
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            {latestPayroll.payDate || "-"}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                            Gross Salary
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            ₹
                                            {Number(
                                                latestPayroll.grossSalary || 0
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-xs text-gray-400 uppercase tracking-wide">
                                            Total Deductions
                                        </p>

                                        <p className="font-semibold text-gray-900 mt-1">
                                            ₹
                                            {Number(
                                                latestPayroll.totalDeductions || 0
                                            ).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                </div>

                                <div className="mt-6 p-5 bg-green-50 rounded-xl">

                                    <p className="text-sm text-green-700">
                                        Net Salary
                                    </p>

                                    <p className="text-3xl font-bold text-green-700 mt-1">
                                        ₹
                                        {Number(
                                            latestPayroll.netSalary || 0
                                        ).toLocaleString("en-IN")}
                                    </p>

                                </div>

                            </div>

                        ) : (

                            <div className="py-10 text-center">

                                <p className="text-gray-500">
                                    No payroll records available.
                                </p>

                            </div>

                        )}

                    </div>

                </div>

                {/* ==========================================
                    ATTENDANCE HISTORY
                ========================================== */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">

                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                My Attendance
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Your attendance history
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/my-attendance")}
                            className="text-sm font-medium bg-[#1BBD36]/20 rounded-lg p-2 hover:bg-[#159A2C]/90 hover:text-white transition"
                        >
                            View Attendance
                        </button>

                    </div>

                    {myAttendance.length === 0 ? (

                        <div className="p-10 text-center">

                            <p className="text-gray-500">
                                No attendance records available.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Pay Period
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Working Days
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Present
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Leave
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Unpaid Leave
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Overtime
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {myAttendance
                                        .slice(0, 8)
                                        .map((item) => (

                                            <tr
                                                key={
                                                    item.attendanceId
                                                }
                                                className="hover:bg-gray-50 transition"
                                            >

                                                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                    {item.payPeriod || "-"}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-center text-gray-700">
                                                    {item.workingDays ?? "-"}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-center font-medium text-green-600">
                                                    {item.presentDays ?? 0}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-center text-orange-600">
                                                    {item.leaveDays ?? 0}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-center text-red-600">
                                                    {item.unpaidLeaveDays ?? 0}
                                                </td>

                                                <td className="px-6 py-4 text-sm text-center text-green-600">
                                                    {item.overtimeHours ?? 0}
                                                </td>

                                            </tr>

                                        ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* ==========================================
                    PAYSLIP / PAYROLL HISTORY
                ========================================== */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-6">

                    <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Payslip History
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Your previous payroll records
                            </p>
                        </div>

                        <button
                            onClick={() => navigate("/my-payroll")}
                            className="text-sm font-medium bg-[#1BBD36]/20 rounded-lg p-2 hover:bg-[#159A2C]/90 hover:text-white transition"
                        >
                            View Payroll History
                        </button>

                    </div>

                    {myPayrolls.length === 0 ? (

                        <div className="p-10 text-center">

                            <p className="text-gray-500">
                                No payslip history available.
                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full">

                                <thead className="bg-gray-50">

                                    <tr>

                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Pay Period
                                        </th>

                                        <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Pay Date
                                        </th>

                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Gross
                                        </th>

                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Deductions
                                        </th>

                                        <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Net Salary
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Status
                                        </th>

                                        <th className="text-center px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {myPayrolls
                                        .slice(0, 8)
                                        .map((payroll) => {

                                            const status =
                                                String(
                                                    payroll.status || ""
                                                ).toUpperCase();

                                            return (
                                                <tr
                                                    key={
                                                        payroll.payrollId
                                                    }
                                                    className="hover:bg-gray-50 transition"
                                                >

                                                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                        {payroll.payPeriod || "-"}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-gray-600">
                                                        {payroll.payDate || "-"}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                                                        ₹
                                                        {Number(
                                                            payroll.grossSalary ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-right text-gray-700">
                                                        ₹
                                                        {Number(
                                                            payroll.totalDeductions ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                                                        ₹
                                                        {Number(
                                                            payroll.netSalary ||
                                                                0
                                                        ).toLocaleString(
                                                            "en-IN"
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-center">

                                                        <span
                                                            className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                status ===
                                                                "PAID"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : status ===
                                                                      "APPROVED"
                                                                    ? "bg-green-100 text-green-700"
                                                                    : "bg-orange-100 text-orange-700"
                                                            }`}
                                                        >
                                                            {payroll.status ||
                                                                "GENERATED"}
                                                        </span>

                                                    </td>

                                                    <td className="px-6 py-4 text-center">

                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/payslip/${payroll.payrollId}`
                                                                )
                                                            }
                                                            className="text-sm font-medium text-green-600 hover:text-green-700"
                                                        >
                                                            View Payslip
                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        })}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

                {/* ==========================================
                    QUICK ACTIONS
                ========================================== */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

                    <h2 className="text-lg font-semibold text-gray-900 mb-5">
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                        <button
                            onClick={() => navigate("/")}
                            className="p-4 text-left rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition"
                        >
                            <p className="font-semibold text-gray-900">
                                My Profile
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                View your employee information
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/attendance")}
                            className="p-4 text-left rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition"
                        >
                            <p className="font-semibold text-gray-900">
                                My Attendance
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                View your attendance records
                            </p>
                        </button>

                        <button
                            onClick={() => navigate("/payroll/history")}
                            className="p-4 text-left rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition"
                        >
                            <p className="font-semibold text-gray-900">
                                Payslip History
                            </p>

                            <p className="text-sm text-gray-500 mt-1">
                                View your previous salary records
                            </p>
                        </button>

                    </div>

                </div>

            </div>
        );
    }

    // ==========================================================
    // ADMIN / HR DASHBOARD
    // ==========================================================

    return (
        <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">

            {/* ==========================================
                DASHBOARD HEADER
            ========================================== */}

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
               
                <div>

                    <p className="text-sm font-medium text-[#1BBD36]">
                        {role} Dashboard
                    </p>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        Dashboard
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Overview of your employee payroll system.
                    </p>

                </div>

                <div className="flex flex-wrap gap-3">

                    <button
                        onClick={() => navigate("/employees")}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition"
                    >
                        Employees
                    </button>

                    <button
                        onClick={() => navigate("/payroll/generate")}
                        className="px-4 py-2.5 bg-[#1BBD36] text-white rounded-xl font-medium hover:bg-[#159A2C] transition"
                    >
                        Generate Payroll
                    </button>

                </div>

            </div>

            {/* ==========================================
                MAIN STATS
            ========================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

                {/* Total Employees */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Total Employees
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {employees.length}
                    </p>

                    <p className="text-sm text-green-600 mt-2">
                        {activeEmployees} active
                    </p>

                </div>

                {/* Gross Payroll */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Current Month Gross Payroll
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₹{totalGrossSalary.toLocaleString("en-IN")}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                        {currentMonth}
                    </p>

                </div>

                {/* Net Payroll */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Current Month Net Payroll
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        ₹{totalNetSalary.toLocaleString("en-IN")}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                        After deductions
                    </p>

                </div>

                {/* Pending Payroll */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Pending Payroll
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {pendingPayrolls}
                    </p>

                    <p className="text-sm text-orange-600 mt-2">
                        Awaiting approval
                    </p>

                </div>

            </div>

            {/* ==========================================
                ATTENDANCE SUMMARY
            ========================================== */}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Attendance Records
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {currentMonthAttendance.length}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                        Current month
                    </p>

                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Present Days
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {totalPresentDays}
                    </p>

                    <p className="text-sm text-green-600 mt-2">
                        Current month
                    </p>

                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">

                    <p className="text-sm text-gray-500">
                        Payroll Records
                    </p>

                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {currentMonthPayrolls.length}
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                        Current month
                    </p>

                </div>

            </div>

            {/* ==========================================
                DEPARTMENTS + RECENT PAYROLL
            ========================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Department Overview */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-semibold text-gray-900">
                                Department Overview
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Employee distribution
                            </p>

                        </div>

                        <button
                            onClick={() => navigate("/departments")}
                            className="text-sm font-medium text-[#1BBD36] hover:text-[#159A2C]"
                        >
                            View All
                        </button>

                    </div>

                    {departmentOverview.length === 0 ? (

                        <div className="p-8 text-center text-gray-500">
                            No department data available.
                        </div>

                    ) : (

                        <div className="divide-y divide-gray-100">

                            {departmentOverview.map((department) => (

                                <div
                                    key={department.name}
                                    className="p-5 flex items-center justify-between"
                                >

                                    <div>

                                        <p className="font-medium text-gray-900">
                                            {department.name}
                                        </p>

                                        <p className="text-sm text-gray-500 mt-1">
                                            {department.employeeCount} employees
                                        </p>

                                    </div>

                                    <div className="text-right">

                                        <p className="font-semibold text-gray-900">
                                            ₹
                                            {department.payrollAmount.toLocaleString(
                                                "en-IN"
                                            )}
                                        </p>

                                        <p className="text-xs text-gray-400 mt-1">
                                            Gross payroll
                                        </p>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* Recent Payroll */}

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">

                        <div>

                            <h2 className="text-lg font-semibold text-gray-900">
                                Recent Payroll
                            </h2>

                            <p className="text-sm text-gray-500 mt-1">
                                Latest payroll records
                            </p>

                        </div>

                        <button
                            onClick={() => navigate("/payroll/history")}
                            className="text-sm font-medium text-[#1BBD36] hover:text-[#159A2C]"
                        >
                            View All
                        </button>

                    </div>

                    {recentPayrolls.length === 0 ? (

                        <div className="p-8 text-center text-gray-500">
                            No payroll records available.
                        </div>

                    ) : (

                        <div className="divide-y divide-gray-100">

                            {recentPayrolls.map((payroll) => {

                                const employeeName = [
                                    payroll.employee?.firstName,
                                    payroll.employee?.lastName,
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                const status = String(
                                    payroll.status || ""
                                ).toUpperCase();

                                return (
                                    <div
                                        key={payroll.payrollId}
                                        className="p-5 flex items-center justify-between gap-4"
                                    >

                                        <div className="min-w-0">

                                            <p className="font-medium text-gray-900 truncate">
                                                {employeeName ||
                                                    payroll.employee
                                                        ?.employeeCode ||
                                                    "Employee"}
                                            </p>

                                            <p className="text-sm text-gray-500 mt-1">
                                                {payroll.payPeriod || "-"}
                                            </p>

                                        </div>

                                        <div className="text-right shrink-0">

                                            <p className="font-semibold text-gray-900">
                                                ₹
                                                {Number(
                                                    payroll.netSalary || 0
                                                ).toLocaleString("en-IN")}
                                            </p>

                                            <span
                                                className={`inline-flex mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                                    status === "PAID"
                                                        ? "bg-green-100 text-green-700"
                                                        : status === "APPROVED"
                                                        ? "bg-green-100 text-green-700"
                                                        : "bg-orange-100 text-orange-700"
                                                }`}
                                            >
                                                {payroll.status || "UNKNOWN"}
                                            </span>

                                        </div>

                                    </div>
                                );
                            })}

                        </div>

                    )}

                </div>

            </div>

            {/* ==========================================
                QUICK ACTIONS
            ========================================== */}

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mt-6">

                <h2 className="text-lg font-semibold text-gray-900 mb-5">
                    Quick Actions
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                    <button
                        onClick={() => navigate("/employees")}
                        className="p-4 text-left rounded-xl border border-gray-200 hover:border-[#1BBD36]/30 hover:bg-[#1BBD36]/10 transition"
                    >
                        <p className="font-semibold text-gray-900">
                            Employee Management
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Add and manage employees
                        </p>
                    </button>

                    <button
                        onClick={() => navigate("/salary-structure")}
                        className="p-4 text-left rounded-xl border border-gray-200 hover:border-[#1BBD36]/30 hover:bg-[#1BBD36]/10 transition"
                    >
                        <p className="font-semibold text-gray-900">
                            Salary Structure
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage employee salaries
                        </p>
                    </button>

                    <button
                        onClick={() => navigate("/attendance")}
                        className="p-4 text-left rounded-xl border border-gray-200 hover:border-[#1BBD36]/30 hover:bg-[#1BBD36]/10 transition"
                    >
                        <p className="font-semibold text-gray-900">
                            Attendance
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            Manage employee attendance
                        </p>
                    </button>

                    <button
                        onClick={() => navigate("/payroll/history")}
                        className="p-4 text-left rounded-xl border border-gray-200 hover:border-[#1BBD36]/30 hover:bg-[#1BBD36]/10 transition"
                    >
                        <p className="font-semibold text-gray-900">
                            Payroll History
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                            View payroll records
                        </p>
                    </button>

                </div>

            </div>

        </div>
    );
};

export default Dashboard;