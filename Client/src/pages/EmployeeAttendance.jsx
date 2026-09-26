import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const EmployeeAttendance = () => {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Pagination
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchAttendance();
    }, []);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/attendance/me");

            setAttendance(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );

            setPage(1);
        } catch (err) {
            console.error("Failed to load attendance:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else if (err.response?.status === 403) {
                setError("You are not allowed to view this attendance.");
            } else {
                setError("Failed to load attendance.");
            }
        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // SUMMARY CALCULATIONS
    // =========================================================

    const totalPresent = attendance.reduce(
        (sum, item) => sum + Number(item.presentDays || 0),
        0
    );

    const totalLeave = attendance.reduce(
        (sum, item) => sum + Number(item.leaveDays || 0),
        0
    );

    const totalUnpaidLeave = attendance.reduce(
        (sum, item) => sum + Number(item.unpaidLeaveDays || 0),
        0
    );

    const totalOvertime = attendance.reduce(
        (sum, item) => sum + Number(item.overtimeHours || 0),
        0
    );

    // =========================================================
    // PAGINATION
    // =========================================================

    const totalRecords = attendance.length;

    const totalPages = Math.max(
        1,
        Math.ceil(totalRecords / pageSize)
    );

    const safePage = Math.min(page, totalPages);

    const paginatedAttendance = attendance.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    const pageStart =
        totalRecords === 0
            ? 0
            : (safePage - 1) * pageSize + 1;

    const pageEnd = Math.min(
        safePage * pageSize,
        totalRecords
    );

    const getPageNumbers = () => {
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            return Array.from(
                { length: totalPages },
                (_, index) => index + 1
            );
        }

        let start = Math.max(
            1,
            safePage - 2
        );

        let end = Math.min(
            totalPages,
            start + maxVisiblePages - 1
        );

        if (end - start < maxVisiblePages - 1) {
            start = Math.max(
                1,
                end - maxVisiblePages + 1
            );
        }

        return Array.from(
            { length: end - start + 1 },
            (_, index) => start + index
        );
    };

    const changePage = (nextPage) => {
        setPage(
            Math.min(
                Math.max(nextPage, 1),
                totalPages
            )
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="flex h-full min-h-0 items-center justify-center px-3 py-2">
                <div className="text-center">
                    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

                    <p className="mt-4 text-gray-500">
                        Loading attendance...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2">

            <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">

                {/* =====================================================
                    HEADER
                ====================================================== */}
                <div className="mb-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <p className="text-[11px] font-semibold text-indigo-600">
                            Employee Self Service
                        </p>

                        <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                            My Attendance
                        </h1>

                        <p className="mt-0.5 text-xs text-gray-500">
                            View your attendance history and monthly records.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate("/")}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                    >
                        Back to Dashboard
                    </button>

                </div>

                {/* =====================================================
                    ERROR
                ====================================================== */}
                {error && (
                    <div className="mb-2 shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2.5">

                        <p className="text-sm font-medium text-red-600">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={fetchAttendance}
                            className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-green-700"
                        >
                            Try Again
                        </button>

                    </div>
                )}

                {/* =====================================================
                    SUMMARY
                ====================================================== 
                <div className="grid shrink-0 grid-cols-2 gap-2 py-2 lg:grid-cols-4">

                    
                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-medium text-slate-500">
                            Present Days
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                            {totalPresent}
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-medium text-slate-500">
                            Leave Days
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                            {totalLeave}
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-medium text-slate-500">
                            Unpaid Leave
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                            {totalUnpaidLeave}
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <p className="text-[11px] font-medium text-slate-500">
                            Overtime Hours
                        </p>

                        <p className="mt-1 text-xl font-bold text-slate-800">
                            {totalOvertime}
                        </p>
                    </div>

                </div> 

                 =====================================================
                    ATTENDANCE TABLE
                ====================================================== */}
                <div className="mt-1 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    {/* Table Header */}
                    <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">

                        <div>
                            <h2 className="text-sm font-semibold text-gray-900">
                                Attendance History
                            </h2>
                        </div>

                        <span className="text-[11px] text-gray-500">
                            {totalRecords} record
                            {totalRecords === 1 ? "" : "s"}
                        </span>

                    </div>

                    {/* =================================================
                        EMPTY STATE
                    ================================================== */}
                    {attendance.length === 0 ? (

                        <div className="flex flex-1 items-center justify-center p-8 text-sm text-gray-500">
                            No attendance records available.
                        </div>

                    ) : (

                        <>
                            {/* =================================================
                                TABLE BODY
                            ================================================== */}
                            <div className="min-h-0 flex-1 overflow-auto scroll-smooth">

                                <table className="min-w-[900px] w-full">

                                    <thead className="sticky top-0 z-10 bg-gray-50">

                                        <tr>

                                            <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                Pay Period
                                            </th>

                                            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                Working Days
                                            </th>

                                            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                Present
                                            </th>

                                            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                Leave
                                            </th>

                                            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                Unpaid Leave
                                            </th>

                                            <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                                Overtime
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody className="divide-y divide-gray-100">

                                        {paginatedAttendance.map((item) => (

                                            <tr
                                                key={item.attendanceId}
                                                className="hover:bg-gray-50"
                                            >

                                                {/* Pay Period */}
                                                <td className="whitespace-nowrap px-4 py-2.5 text-xs font-medium text-gray-900">
                                                    {item.payPeriod || "-"}
                                                </td>

                                                {/* Working Days */}
                                                <td className="px-4 py-2.5 text-center text-xs text-gray-700">
                                                    {item.workingDays ?? 0}
                                                </td>

                                                {/* Present */}
                                                <td className="px-4 py-2.5 text-center text-xs font-semibold text-green-600">
                                                    {item.presentDays ?? 0}
                                                </td>

                                                {/* Leave */}
                                                <td className="px-4 py-2.5 text-center text-xs text-orange-600">
                                                    {item.leaveDays ?? 0}
                                                </td>

                                                {/* Unpaid Leave */}
                                                <td className="px-4 py-2.5 text-center text-xs text-red-600">
                                                    {item.unpaidLeaveDays ?? 0}
                                                </td>

                                                {/* Overtime */}
                                                <td className="px-4 py-2.5 text-center text-xs font-medium text-indigo-600">
                                                    {item.overtimeHours ?? 0}
                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                            {/* =================================================
                                PAGINATION
                            ================================================== */}
                            {totalRecords > 0 && (

                                <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">

                                    {/* LEFT */}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">

                                        <span>
                                            Rows per page
                                        </span>

                                        <select
                                            value={pageSize}
                                            onChange={(e) => {
                                                setPageSize(
                                                    Number(e.target.value)
                                                );
                                                setPage(1);
                                            }}
                                            className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-green-500"
                                        >
                                            <option value="10">
                                                10
                                            </option>

                                            <option value="25">
                                                25
                                            </option>

                                            <option value="50">
                                                50
                                            </option>
                                        </select>

                                        <span className="ml-1">
                                            {pageStart}-{pageEnd} of {totalRecords}
                                        </span>

                                    </div>

                                    {/* RIGHT */}
                                    <div className="flex items-center justify-end gap-1">

                                        {/* Previous */}
                                        <button
                                            type="button"
                                            disabled={safePage === 1}
                                            onClick={() =>
                                                changePage(
                                                    safePage - 1
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Previous
                                        </button>

                                        {/* Page Numbers */}
                                        {getPageNumbers().map(
                                            (pageNumber) => (
                                                <button
                                                    key={pageNumber}
                                                    type="button"
                                                    onClick={() =>
                                                        changePage(
                                                            pageNumber
                                                        )
                                                    }
                                                    className={`min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                                                        pageNumber ===
                                                        safePage
                                                            ? "bg-indigo-600 text-white"
                                                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                                    }`}
                                                >
                                                    {pageNumber}
                                                </button>
                                            )
                                        )}

                                        {/* Next */}
                                        <button
                                            type="button"
                                            disabled={
                                                safePage === totalPages
                                            }
                                            onClick={() =>
                                                changePage(
                                                    safePage + 1
                                                )
                                            }
                                            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            Next
                                        </button>

                                    </div>

                                </div>

                            )}

                        </>

                    )}

                </div>

            </div>

        </div>
    );
};

export default EmployeeAttendance;