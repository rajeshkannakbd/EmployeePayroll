import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  WalletCards,
  Clock3,
  CalendarDays,
  ArrowUpRight,
  CircleCheck,
  CircleAlert,
  IndianRupee,
  ChevronRight,
  Building2,
} from "lucide-react";

import axiosInstance from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";

const getCurrentMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
};

const formatCurrency = (value) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const formatMonth = (value) => {
  if (!value) return "-";

  const [year, month] = String(value).split("-");
  if (!year || !month) return value;

  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString(
    "en-IN",
    {
      month: "short",
      year: "numeric",
    }
  );
};

const formatDate = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getEmployeeName = (employee) =>
  [employee?.firstName, employee?.lastName].filter(Boolean).join(" ") ||
  employee?.employeeCode ||
  "Employee";

const StatusBadge = ({ status }) => {
  const normalized = String(status || "UNKNOWN").toUpperCase();

  const styles =
    normalized === "PAID"
      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
      : normalized === "APPROVED"
      ? "bg-blue-50 text-blue-700 border-blue-100"
      : normalized === "GENERATED"
      ? "bg-amber-50 text-amber-700 border-amber-100"
      : "bg-slate-50 text-slate-600 border-slate-100";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${styles}`}
    >
      {normalized}
    </span>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const role = auth?.role;
  const currentMonth = getCurrentMonth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [employees, setEmployees] = useState([]);
  const [payrolls, setPayrolls] = useState([]);
  const [attendance, setAttendance] = useState([]);

  const [myProfile, setMyProfile] = useState(null);
  const [myAttendance, setMyAttendance] = useState([]);
  const [myPayrolls, setMyPayrolls] = useState([]);

  useEffect(() => {
    if (!auth?.token) return;

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.token, auth?.role]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      if (role === "EMPLOYEE") {
        const [profileResponse, attendanceResponse, payrollResponse] =
          await Promise.all([
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
          Array.isArray(payrollResponse.data) ? payrollResponse.data : []
        );

        return;
      }

      const [employeesResponse, payrollResponse, attendanceResponse] =
        await Promise.all([
          axiosInstance.get("/employees"),
          axiosInstance.get("/payrolls"),
          axiosInstance.get("/attendance"),
        ]);

      setEmployees(
        Array.isArray(employeesResponse.data) ? employeesResponse.data : []
      );

      setPayrolls(
        Array.isArray(payrollResponse.data) ? payrollResponse.data : []
      );

      setAttendance(
        Array.isArray(attendanceResponse.data) ? attendanceResponse.data : []
      );
    } catch (err) {
      console.error("Failed to load dashboard data:", err);

      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (err.response?.status === 403) {
        setError("You do not have permission to view this dashboard.");
      } else {
        setError("Unable to load dashboard data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ADMIN / HR CALCULATIONS
  // =========================================================

  const activeEmployees = useMemo(
    () =>
      employees.filter(
        (employee) =>
          String(employee.status || "").toUpperCase() === "ACTIVE"
      ).length,
    [employees]
  );

  const currentMonthPayrolls = useMemo(
    () =>
      payrolls.filter(
        (payroll) => String(payroll.payPeriod || "") === currentMonth
      ),
    [payrolls, currentMonth]
  );

  const totalGrossPayroll = useMemo(
    () =>
      currentMonthPayrolls.reduce(
        (total, payroll) => total + Number(payroll.grossSalary || 0),
        0
      ),
    [currentMonthPayrolls]
  );

  const totalNetPayroll = useMemo(
    () =>
      currentMonthPayrolls.reduce(
        (total, payroll) => total + Number(payroll.netSalary || 0),
        0
      ),
    [currentMonthPayrolls]
  );

  const pendingPayrolls = useMemo(
    () =>
      currentMonthPayrolls.filter(
        (payroll) =>
          String(payroll.status || "").toUpperCase() === "GENERATED"
      ).length,
    [currentMonthPayrolls]
  );

  const currentMonthAttendance = useMemo(
    () =>
      attendance.filter(
        (item) => String(item.payPeriod || "") === currentMonth
      ),
    [attendance, currentMonth]
  );

  const totalPresentDays = useMemo(
    () =>
      currentMonthAttendance.reduce(
        (total, item) => total + Number(item.presentDays || 0),
        0
      ),
    [currentMonthAttendance]
  );

  const recentPayrolls = useMemo(
    () =>
      [...payrolls]
        .sort((a, b) => {
          const aDate = a.payDate ? new Date(a.payDate).getTime() : 0;
          const bDate = b.payDate ? new Date(b.payDate).getTime() : 0;
          return bDate - aDate;
        })
        .slice(0, 6),
    [payrolls]
  );

  // =========================================================
  // EMPLOYEE CALCULATIONS
  // =========================================================

  const employeeFullName = [myProfile?.firstName, myProfile?.lastName]
    .filter(Boolean)
    .join(" ");

  const employeeDepartment =
    myProfile?.department?.departmentName || "Not assigned";

  const latestPayroll =
    myPayrolls.length > 0 ? myPayrolls[0] : null;

  const latestAttendance =
    myAttendance.length > 0 ? myAttendance[myAttendance.length - 1] : null;

  const employeePresentDays = myAttendance.reduce(
    (total, item) => total + Number(item.presentDays || 0),
    0
  );

  const employeeLeaveDays = myAttendance.reduce(
    (total, item) => total + Number(item.leaveDays || 0),
    0
  );

  const employeeOvertimeHours = myAttendance.reduce(
    (total, item) => total + Number(item.overtimeHours || 0),
    0
  );
const totalDepartments = useMemo(() => {
  const departmentKeys = new Set();

  employees.forEach((employee) => {
    const departmentId =
      employee.department?.departmentId ?? employee.departmentId;

    const departmentName =
      employee.department?.departmentName ?? employee.departmentName;

    if (departmentId != null) {
      departmentKeys.add(`id-${departmentId}`);
    } else if (departmentName) {
      departmentKeys.add(`name-${String(departmentName).trim().toLowerCase()}`);
    }
  });

  return departmentKeys.size;
}, [employees]);

console.log(myProfile);


  // =========================================================
  // STATES
  // =========================================================

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] scroll-smooth items-center justify-center bg-[#F7F8FA]">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          <p className="mt-3 text-sm text-slate-500">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] scroll-smooth items-center justify-center bg-[#F7F8FA] p-6">
        <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600">
            <CircleAlert size={20} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Unable to load dashboard
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="mt-4 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPLOYEE DASHBOARD
  // =========================================================

  if (role === "EMPLOYEE") {
    return (
      <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2 sm:px-4">
        <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
          {/* HEADER */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Employee Dashboard
              </p>
              <h1 className="mt-0.5 truncate text-xl font-bold tracking-tight text-slate-900">
                {employeeFullName || auth?.employeeName || "Employee"}
              </h1>
              <p className="mt-0.5 text-xs text-slate-500">
                {myProfile?.departmentName} {myProfile?.designation ? `• ${myProfile.designation}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate("/my-payroll")}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              My Payroll
              <ArrowUpRight size={14} />
            </button>
          </div>

          {/* ESS SUMMARY */}
          <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 lg:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Present Days
                </p>
                <UserCheck size={15} className="text-indigo-500" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-slate-900">
                {employeePresentDays}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Leave Days
                </p>
                <CalendarDays size={15} className="text-amber-500" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-slate-900">
                {employeeLeaveDays}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Overtime
                </p>
                <Clock3 size={15} className="text-indigo-500" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-slate-900">
                {employeeOvertimeHours} hrs
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Latest Net Pay
                </p>
                <IndianRupee size={15} className="text-emerald-600" />
              </div>
              <p className="mt-1.5 text-xl font-bold text-slate-900">
                {formatCurrency(latestPayroll?.netSalary)}
              </p>
              <p className="mt-0.5 text-[10px] text-slate-400">
                {latestPayroll?.payPeriod ? formatMonth(latestPayroll.payPeriod) : "No payroll"}
              </p>
            </div>
          </div>

          {/* MAIN ROW */}
          <div className="mt-3 grid shrink-0 grid-cols-1 gap-3 xl:grid-cols-3">
            {/* LATEST PAYROLL */}
            <section className="min-h-[250px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2.5">
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">Latest Payroll</h2>
                  <p className="mt-0.5 text-[11px] text-slate-400">Most recent salary record</p>
                </div>
                {latestPayroll && <StatusBadge status={latestPayroll.status} />}
              </div>

              {latestPayroll ? (
                <div className="p-4">
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pay Period</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatMonth(latestPayroll.payPeriod)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pay Date</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatDate(latestPayroll.payDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Gross Pay</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatCurrency(latestPayroll.grossSalary)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Deductions</p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {formatCurrency(latestPayroll.totalDeductions)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-indigo-50 px-4 py-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                        Net Salary
                      </p>
                      <p className="mt-0.5 text-2xl font-bold text-indigo-900">
                        {formatCurrency(latestPayroll.netSalary)}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate(`/payslip/${latestPayroll.payrollId}`)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                    >
                      View Payslip
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-sm text-slate-500">
                  No payroll record available.
                </div>
              )}
            </section>

            {/* EMPLOYMENT / ATTENDANCE */}
            <section className="min-h-[250px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-2.5">
                <h2 className="text-sm font-semibold text-slate-800">Employment Summary</h2>
              </div>

              <div className="space-y-3 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Employee Code</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {myProfile?.employeeCode || auth?.employeeCode || "-"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Department</span>
                  <span className="max-w-[58%] truncate text-right text-xs font-semibold text-slate-800">
                    {myProfile?.departmentName}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Joining Date</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {formatDate(myProfile?.joiningDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Status</span>
                  <span className="inline-flex rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                    {myProfile?.status || "ACTIVE"}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Latest Attendance</span>
                    <button
                      type="button"
                      onClick={() => navigate("/my-attendance")}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View
                    </button>
                  </div>

                  {latestAttendance ? (
                    <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Present</p>
                        <p className="mt-0.5 text-sm font-semibold text-emerald-700">
                          {latestAttendance.presentDays ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">Leave</p>
                        <p className="mt-0.5 text-sm font-semibold text-amber-700">
                          {latestAttendance.leaveDays ?? 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-slate-400">OT</p>
                        <p className="mt-0.5 text-sm font-semibold text-indigo-700">
                          {latestAttendance.overtimeHours ?? 0}h
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-2 text-xs text-slate-400">No attendance records available.</p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RECENT PAYROLL */}
          <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Recent Payslips</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">Latest payroll records</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/my-payroll")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View All
              </button>
            </div>

            {myPayrolls.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pay Period</th>
                      <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pay Date</th>
                      <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Gross</th>
                      <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Net</th>
                      <th className="px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</th>
                      <th className="px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPayrolls.slice(0, 4).map((payroll) => (
                      <tr key={payroll.payrollId} className="transition hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-xs font-medium text-slate-800">
                          {formatMonth(payroll.payPeriod)}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-slate-500">
                          {formatDate(payroll.payDate)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs text-slate-600">
                          {formatCurrency(payroll.grossSalary)}
                        </td>
                        <td className="px-4 py-2.5 text-right text-xs font-semibold text-slate-800">
                          {formatCurrency(payroll.netSalary)}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <StatusBadge status={payroll.status} />
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/payslip/${payroll.payrollId}`)}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                          >
                            Payslip
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-slate-500">No payslips available.</div>
            )}
          </section>
        </div>
      </div>
    );
  }


  // =========================================================
  // ADMIN / HR DASHBOARD
  // =========================================================

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2 sm:px-4">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 pb-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              {role} Dashboard
            </p>
            <h1 className="mt-0.5 text-xl font-bold tracking-tight text-slate-900">
              Payroll Overview
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              {formatMonth(currentMonth)}
            </p>
          </div>

          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => navigate("/employees")}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-200 hover:text-indigo-700"
            >
              <Users size={14} />
              Employees
            </button>

            <button
              type="button"
              onClick={() => navigate("/payroll/generate")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
            >
              Run Payroll
              <ArrowUpRight size={14} />
            </button>
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="mt-3 grid shrink-0 grid-cols-2 gap-2 xl:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Active Employees</p>
              <Users size={15} className="text-indigo-500" />
            </div>
            <p className="mt-1.5 text-xl font-bold text-slate-900">{activeEmployees}</p>
            <p className="text-[10px] text-slate-400">of {employees.length} total</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
  <div className="flex items-center justify-between">
    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
      Assigned Departments
    </p>
    <Building2 size={15} className="text-indigo-500" />
  </div>

  <p className="mt-1.5 text-xl font-bold text-slate-900">
     {totalDepartments}
  </p>

  <p className="text-[10px] text-slate-400">
     Departments with Active Employees
  </p>
</div>

          <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Gross Payroll</p>
              <IndianRupee size={15} className="text-slate-500" />
            </div>
            <p className="mt-1.5 text-xl font-bold text-slate-900">{formatCurrency(totalGrossPayroll)}</p>
            <p className="text-[10px] text-slate-400">Before deductions</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">Pending Approval</p>
              <Clock3 size={15} className="text-amber-600" />
            </div>
            <p className="mt-1.5 text-xl font-bold text-amber-900">{pendingPayrolls}</p>
            <p className="text-[10px] text-amber-700">Generated payroll records</p>
          </div>
        </div>

        {/* OPERATIONAL SUMMARY */}
        <div className="mt-3 grid shrink-0 grid-cols-1 gap-3 xl:grid-cols-3">
          <section className="min-h-[220px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm xl:col-span-2">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Payroll Status</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">Current month processing status</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/payroll/history")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View History
              </button>
            </div>

            <div className="p-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Records</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{currentMonthPayrolls.length}</p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Net Pay</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalNetPayroll)}</p>
                </div>

                <div className="rounded-lg bg-slate-50 px-3 py-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Gross Pay</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">{formatCurrency(totalGrossPayroll)}</p>
                </div>
              </div>

              <div className={`mt-3 flex items-center justify-between rounded-lg border px-3 py-2.5 ${
                pendingPayrolls > 0
                  ? "border-amber-100 bg-amber-50"
                  : "border-emerald-100 bg-emerald-50"
              }`}>
                <div className="flex min-w-0 items-center gap-2">
                  {pendingPayrolls > 0 ? (
                    <CircleAlert size={16} className="shrink-0 text-amber-600" />
                  ) : (
                    <CircleCheck size={16} className="shrink-0 text-emerald-600" />
                  )}

                  <p className="truncate text-xs font-semibold text-slate-800">
                    {pendingPayrolls > 0
                      ? `${pendingPayrolls} payroll record${pendingPayrolls === 1 ? "" : "s"} awaiting approval`
                      : "No payroll records awaiting approval"}
                  </p>
                </div>

                {pendingPayrolls > 0 && (
                  <button
                    type="button"
                    onClick={() => navigate("/payroll/history")}
                    className="shrink-0 text-xs font-semibold text-indigo-700 hover:text-indigo-900"
                  >
                    Review
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="min-h-[220px] overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Attendance</h2>
                <p className="mt-0.5 text-[11px] text-slate-400">Current month</p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/attendance")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                View
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Attendance records</span>
                <span className="text-sm font-semibold text-slate-800">{currentMonthAttendance.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Present days</span>
                <span className="text-sm font-semibold text-emerald-700">{totalPresentDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Active employees</span>
                <span className="text-sm font-semibold text-slate-800">{activeEmployees}</span>
              </div>
            </div>
          </section>
        </div>

        {/* RECENT PAYROLL */}
        <section className="mt-3 min-h-0 flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Recent Payroll</h2>
              <p className="mt-0.5 text-[11px] text-slate-400">Latest processed records</p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/payroll/history")}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
            >
              View All
            </button>
          </div>

          {recentPayrolls.length > 0 ? (
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Employee</th>
                    <th className="px-4 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">Period</th>
                    <th className="px-4 py-2 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Net Pay</th>
                    <th className="px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-400">Pay Date</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {recentPayrolls.map((payroll) => (
                    <tr key={payroll.payrollId} className="transition hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <p className="text-xs font-semibold text-slate-800">
                          {getEmployeeName(payroll.employee)}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {payroll.employee?.employeeCode || "-"}
                        </p>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-slate-600">
                        {formatMonth(payroll.payPeriod)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-slate-800">
                        {formatCurrency(payroll.netSalary)}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <StatusBadge status={payroll.status} />
                      </td>
                      <td className="px-4 py-2.5 text-center text-xs text-slate-500">
                        {formatDate(payroll.payDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-slate-500">No payroll records available.</div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
