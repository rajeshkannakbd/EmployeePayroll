import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8080";

const PayrollHistory = () => {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [payPeriod, setPayPeriod] = useState("");
  const [status, setStatus] = useState("");
   
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/employees`);
      setEmployees(response.data);
    } catch (error) {
      console.error("Employee loading error:", error);
    }
  };

  const fetchPayrolls = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (employeeId && payPeriod) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/employee/${employeeId}/${payPeriod}`
        );

        setPayrolls(
          response.data ? [response.data] : []
        );
      } else if (employeeId) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/employee/${employeeId}`
        );

        setPayrolls(response.data || []);
      } else if (payPeriod && status) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/filter`,
          {
            params: {
              payPeriod,
              status,
            },
          }
        );

        setPayrolls(response.data || []);
      } else if (payPeriod) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/period/${payPeriod}`
        );

        setPayrolls(response.data || []);
      } else if (status) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/status/${status}`
        );

        setPayrolls(response.data || []);
      } else {
        // Default: fetch all payrolls
        response = await axiosInstance.get(
          `${API_URL}/payrolls`
        );

        setPayrolls(response.data || []);
      }
    } catch (error) {
      console.error("Payroll loading error:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load payroll history."
      );

      setPayrolls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
  }, []);

  const handleSearch = () => {
    fetchPayrolls();
  };

  const handleClear = () => {
    setEmployeeId("");
    setPayPeriod("");
    setStatus("");

    setTimeout(() => {
      fetchPayrolls();
    }, 0);
  };

  const approvePayroll = async (id) => {
    try {
      await axiosInstance.put(
        `${API_URL}/payrolls/${id}/approve`
      );

      await fetchPayrolls();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to approve payroll."
      );
    }
  };

  const markPayrollAsPaid = async (id) => {
    try {
      await axiosInstance.put(
        `${API_URL}/payrolls/${id}/paid`
      );

      await fetchPayrolls();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to mark payroll as paid."
      );
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-700";

      case "APPROVED":
        return "bg-green-100 text-green-700";

      case "GENERATED":
        return "bg-yellow-100 text-yellow-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getEmployeeName = (payroll) => {
    if (!payroll.employee) {
      return "-";
    }

    return `${payroll.employee.firstName || ""} ${
      payroll.employee.lastName || ""
    }`.trim();
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">
          Payroll History
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View, filter and manage generated payroll records
        </p>
      </div>

      {/* FILTERS */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">

          {/* EMPLOYEE */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Employee
            </label>

            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">All Employees</option>

              {employees.map((employee) => (
                <option
                  key={employee.employeeId}
                  value={employee.employeeId}
                >
                  {employee.employeeCode} -{" "}
                  {employee.firstName} {employee.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* PAY PERIOD */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Pay Period
            </label>

            <input
              type="month"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Status
            </label>

            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
            >
              <option value="">All Status</option>
              <option value="GENERATED">GENERATED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          {/* BUTTONS */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="flex-1 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-green-800"
            >
              Search
            </button>

            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

        </div>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">
            {error}
          </p>
        </div>
      )}

      {/* PAYROLL TABLE */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Payroll Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {payrolls.length} record(s) found
            </p>
          </div>

        </div>

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading payroll history...
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-slate-100">
                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    ID
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Employee
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Period
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Gross
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Deductions
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Net Salary
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Status
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">

                {payrolls.length > 0 ? (

                  payrolls.map((payroll) => (

                    <tr
                      key={payroll.payrollId}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4 text-sm font-medium text-slate-800">
                        #{payroll.payrollId}
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {getEmployeeName(payroll)}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {payroll.employee?.employeeCode || "-"}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {payroll.payPeriod}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-medium text-slate-700">
                        ₹{Number(payroll.grossSalary || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm text-red-600">
                        ₹{Number(payroll.totalDeductions || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-800">
                        ₹{Number(payroll.netSalary || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                            payroll.status
                          )}`}
                        >
                          {payroll.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex flex-wrap justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/payslip/${payroll.payrollId}`
                              )
                            }
                            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            Payslip
                          </button>

                          {payroll.status === "GENERATED" && (
                            <button
                              type="button"
                              onClick={() =>
                                approvePayroll(
                                  payroll.payrollId
                                )
                              }
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50"
                            >
                              Approve
                            </button>
                          )}

                          {payroll.status === "APPROVED" && (
                            <button
                              type="button"
                              onClick={() =>
                                markPayrollAsPaid(
                                  payroll.payrollId
                                )
                              }
                              className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50"
                            >
                              Mark Paid
                            </button>
                          )}

                        </div>

                      </td>

                    </tr>

                  ))

                ) : (

                  <tr>
                    <td
                      colSpan="8"
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No payroll records found.
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
};

export default PayrollHistory;