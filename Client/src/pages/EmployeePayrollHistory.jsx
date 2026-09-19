import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const EmployeePayrollHistory = () => {
    const navigate = useNavigate();

    const [payrolls, setPayrolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return (
            <div className="min-h-full bg-gray-50 flex items-center justify-center">
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
        <div className="min-h-full bg-gray-50 p-4 sm:p-6 lg:p-8">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

                <div>
                    <p className="text-sm font-medium text-green-600">
                        Employee Self Service
                    </p>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
                        Payslip History
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View your previous salary and payslip records.
                    </p>
                </div>

                <button
                    onClick={() => navigate("/")}
                    className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50"
                >
                    Back to Dashboard
                </button>

            </div>

            {/* Error */}
            {error && (
                <div className="bg-white border border-red-200 rounded-2xl p-6 mb-6">

                    <p className="text-red-600 font-medium">
                        {error}
                    </p>

                    <button
                        onClick={fetchPayrollHistory}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl"
                    >
                        Try Again
                    </button>

                </div>
            )}

            {/* Payroll Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-100">

                    <h2 className="text-lg font-semibold text-gray-900">
                        My Payroll History
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Only your payroll records are shown.
                    </p>

                </div>

                {payrolls.length === 0 ? (

                    <div className="p-10 text-center text-gray-500">
                        No payroll records available.
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
                                        Gross Salary
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
                                        Payslip
                                    </th>

                                </tr>

                            </thead>

                            <tbody className="divide-y divide-gray-100">

                                {payrolls.map((payroll) => {

                                    const status = String(
                                        payroll.status || ""
                                    ).toUpperCase();

                                    return (
                                        <tr
                                            key={payroll.payrollId}
                                            className="hover:bg-gray-50"
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
                                                    payroll.grossSalary || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-right text-gray-700">
                                                ₹
                                                {Number(
                                                    payroll.totalDeductions || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-right font-semibold text-green-600">
                                                ₹
                                                {Number(
                                                    payroll.netSalary || 0
                                                ).toLocaleString("en-IN")}
                                            </td>

                                            <td className="px-6 py-4 text-center">

                                                <span
                                                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
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

        </div>
    );
};
export default EmployeePayrollHistory;