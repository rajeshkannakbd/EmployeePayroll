import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const EmployeeAttendance = () => {
    const navigate = useNavigate();

    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    if (loading) {
        return (
            <div className="min-h-full bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-10 h-10 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
                    <p className="mt-4 text-gray-500">
                        Loading attendance...
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
                        My Attendance
                    </h1>

                    <p className="text-gray-500 mt-2">
                        View your attendance history.
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
                        onClick={fetchAttendance}
                        className="mt-4 px-4 py-2 bg-green-600 text-white rounded-xl"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-sm text-gray-500">
                        Present Days
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {totalPresent}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-sm text-gray-500">
                        Leave Days
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {totalLeave}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-sm text-gray-500">
                        Unpaid Leave
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {totalUnpaidLeave}
                    </p>
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <p className="text-sm text-gray-500">
                        Overtime Hours
                    </p>

                    <p className="text-3xl font-bold text-gray-900 mt-2">
                        {totalOvertime}
                    </p>
                </div>

            </div>

            {/* Attendance Table */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Attendance History
                    </h2>

                    <p className="text-sm text-gray-500 mt-1">
                        Your attendance records by pay period
                    </p>
                </div>

                {attendance.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No attendance records available.
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

                                {attendance.map((item) => (
                                    <tr
                                        key={item.attendanceId}
                                        className="hover:bg-gray-50"
                                    >

                                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                            {item.payPeriod || "-"}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-center text-gray-700">
                                            {item.workingDays ?? 0}
                                        </td>

                                        <td className="px-6 py-4 text-sm text-center text-green-600 font-medium">
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

        </div>
    );
};

export default EmployeeAttendance;