import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const EmployeePayrollHistory = () => {
    const navigate = useNavigate();

    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        fetchPayrollHistory();
    }, []);

    const fetchPayrollHistory = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await axiosInstance.get("/payrolls/me");

            setPayrolls(
                Array.isArray(response.data)
                    ? response.data
                    : []
            );
            setPage(1);
        } catch (err) {
            console.error("Failed to load payroll history:", err);

            if (err.response?.status === 401) {
                setError("Your session has expired. Please login again.");
            } else if (err.response?.status === 403) {
                setError("You are not allowed to view this payroll history.");
            } else {
                setError("Failed to load payroll history.");
            }
        } finally {
            setLoading(false);
        }
    };

    const totalRecords = payrolls.length;
    const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
    const safePage = Math.min(page, totalPages);

    const paginatedPayrolls = payrolls.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
    );

    const pageStart =
        totalRecords === 0 ? 0 : (safePage - 1) * pageSize + 1;
    const pageEnd = Math.min(safePage * pageSize, totalRecords);

    const getPageNumbers = () => {
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages) {
            return Array.from({ length: totalPages }, (_, index) => index + 1);
        }

        let start = Math.max(1, safePage - 2);
        let end = Math.min(totalPages, start + maxVisiblePages - 1);

        if (end - start < maxVisiblePages - 1) {
            start = Math.max(1, end - maxVisiblePages + 1);
        }

        return Array.from(
            { length: end - start + 1 },
            (_, index) => start + index
        );
    };

    const changePage = (nextPage) => {
        setPage(Math.min(Math.max(nextPage, 1), totalPages));
    };

    if (loading) {
        return (
            <div className="flex h-full min-h-0 items-center justify-center px-3 py-2">
                <div className="text-center">

                    <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>

                    <p className="mt-4 text-gray-500">
                        Loading payroll history...
                    </p>

                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2">

            {/* Header */}
            <div className="mb-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                <div>
                    <p className="text-[11px] font-semibold text-indigo-600">
                        Employee Self Service
                    </p>

                    <h1 className="mt-0.5 text-xl font-bold text-gray-900 sm:text-2xl">
                        My Payslips
                    </h1>

                    <p className="mt-0.5 text-xs text-gray-500">
                        View your previous salary and payslip records.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50"
                >
                    Back to Dashboard
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="mb-2 shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2.5">

                    <p className="text-sm font-medium text-red-600">
                        {error}
                    </p>

                    <button
                        onClick={fetchPayrollHistory}
                        className="mt-3 rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white"
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* Payroll Table */}
            <div className="mt-1 flex min-h-0 flex-1 flex-col overflow-auto rounded-xl border border-gray-200 bg-white shadow-sm">

                <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-2.5">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">
                            Payroll History
                        </h2>
                    </div>

                    <span className="text-[11px] text-gray-500">
                        {totalRecords} record{totalRecords === 1 ? "" : "s"}
                    </span>
                </div>

                {payrolls.length === 0 ? (

                    <div className="flex flex-1 items-center justify-center p-8 text-sm text-gray-500">
                        No payroll records available.
                    </div>

                ) : (
                    <>
                    <div className="min-h-0 flex-1 overflow-auto scroll-smooth">

                        <table className="min-w-[820px] w-full">

                            <thead className="sticky top-0 z-10 bg-gray-50">

                                <tr>

                                    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Pay Period
                                    </th>

                                    <th className="px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Pay Date
                                    </th>

                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Gross Salary
                                    </th>

                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Deductions
                                    </th>

                                    <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Net Salary
                                    </th>

                                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Status
                                    </th>

                                    <th className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-gray-500">
                                        Payslip
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {paginatedPayrolls.map((payroll) => {

                                    const status = String(
                                        payroll.status || ""
                                    ).toUpperCase();

                                    return (
                                        <tr
                                            key={payroll.payrollId}
                                            className="hover:bg-gray-50"
                                        >

                                            <td className="px-4 py-2.5 text-xs font-medium text-gray-900">
                                                {payroll.payPeriod || "-"}
                                            </td>

                                            <td className="px-4 py-2.5 text-xs text-gray-600">
                                                {payroll.payDate || "-"}
                                            </td>

                                            <td className="px-4 py-2.5 text-right text-xs text-gray-700">
                                                ₹
                                                {Number(
                                                    payroll.grossSalary || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-2.5 text-right text-xs text-gray-700">
                                                ₹
                                                {Number(
                                                    payroll.totalDeductions || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-2.5 text-right text-xs font-semibold text-green-600">
                                                ₹
                                                {Number(
                                                    payroll.netSalary || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-4 py-2.5 text-center">

                                                <span
                                                    className={`inline-flex px-2 py-1 rounded-full text-[10px] font-semibold ${
                                                        status === "PAID"
                                                            ? "bg-green-100 text-green-700"
                                                            : status === "APPROVED"
                                                            ? "bg-green-100 text-green-700"
                                                            : "bg-orange-100 text-orange-700"
                                                    }`}
                                                >
                                                    {payroll.status || "GENERATED"}
                                                </span>

                                            </td>

                                            <td className="px-4 py-2.5 text-center">

                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/payslip/${payroll.payrollId}`
                                                        )
                                                    }
                                                    className="text-xs font-semibold text-green-600 hover:text-green-700"
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

                    {totalRecords > 0 && (
                        <div className="flex shrink-0 flex-col gap-2 border-t border-gray-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>Rows per page</span>

                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setPage(1);
                                    }}
                                    className="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs font-medium text-gray-700 outline-none focus:border-green-500"
                                >
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>

                                <span className="ml-1">
                                    {pageStart}-{pageEnd} of {totalRecords}
                                </span>
                            </div>

                            <div className="flex items-center justify-end gap-1">
                                <button
                                    type="button"
                                    disabled={safePage === 1}
                                    onClick={() => changePage(safePage - 1)}
                                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    Previous
                                </button>

                                {getPageNumbers().map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        type="button"
                                        onClick={() => changePage(pageNumber)}
                                        className={`min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                                            pageNumber === safePage
                                                ? "bg-indigo-600 text-white"
                                                : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    type="button"
                                    disabled={safePage === totalPages}
                                    onClick={() => changePage(safePage + 1)}
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
    );
};
export default EmployeePayrollHistory;