import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Filter,
  RefreshCcw,
  Search,
  WalletCards,
  X,
} from "lucide-react";

const API_URL = "http://localhost:8080";

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const PayrollHistory = () => {
  const navigate = useNavigate();

  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [employeeId, setEmployeeId] = useState("");
  const [payPeriod, setPayPeriod] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/employees`);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Employee loading error:", error);
    }
  };

  const fetchPayrolls = async (
    filters = {
      employeeId,
      payPeriod,
      status,
    }
  ) => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (filters.employeeId && filters.payPeriod) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/employee/${filters.employeeId}/${filters.payPeriod}`
        );

        setPayrolls(response.data ? [response.data] : []);
      } else if (filters.employeeId) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/employee/${filters.employeeId}`
        );

        setPayrolls(Array.isArray(response.data) ? response.data : []);
      } else if (filters.payPeriod && filters.status) {
        response = await axiosInstance.get(`${API_URL}/payrolls/filter`, {
          params: {
            payPeriod: filters.payPeriod,
            status: filters.status,
          },
        });

        setPayrolls(Array.isArray(response.data) ? response.data : []);
      } else if (filters.payPeriod) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/period/${filters.payPeriod}`
        );

        setPayrolls(Array.isArray(response.data) ? response.data : []);
      } else if (filters.status) {
        response = await axiosInstance.get(
          `${API_URL}/payrolls/status/${filters.status}`
        );

        setPayrolls(Array.isArray(response.data) ? response.data : []);
      } else {
        response = await axiosInstance.get(`${API_URL}/payrolls`);
        setPayrolls(Array.isArray(response.data) ? response.data : []);
      }

      setCurrentPage(1);
    } catch (error) {
      console.error("Payroll loading error:", error);
      setPayrolls([]);
      setError(
        error.response?.data?.message || "Failed to load payroll history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchPayrolls();
    // Intentionally load once on page mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchPayrolls({ employeeId, payPeriod, status });
  };

  const handleClear = () => {
    const emptyFilters = {
      employeeId: "",
      payPeriod: "",
      status: "",
    };

    setEmployeeId("");
    setPayPeriod("");
    setStatus("");
    setSearch("");
    setCurrentPage(1);

    fetchPayrolls(emptyFilters);
  };

  const requestApprove = (payroll) => {
    setConfirmAction({ type: "approve", payroll });
  };

  const requestMarkPaid = (payroll) => {
    setConfirmAction({ type: "paid", payroll });
  };

  const closeConfirmation = () => {
    if (actionLoading === null) {
      setConfirmAction(null);
    }
  };

  const approvePayroll = async (id) => {
    try {
      setActionLoading(`approve-${id}`);

      await axiosInstance.put(`${API_URL}/payrolls/${id}/approve`);
      await fetchPayrolls({ employeeId, payPeriod, status });
      setConfirmAction(null);
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to approve payroll."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const markPayrollAsPaid = async (id) => {
    try {
      setActionLoading(`paid-${id}`);

      await axiosInstance.put(`${API_URL}/payrolls/${id}/paid`);
      await fetchPayrolls({ employeeId, payPeriod, status });
      setConfirmAction(null);
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to mark payroll as paid."
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusClass = (statusValue) => {
    switch (statusValue) {
      case "PAID":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200";
      case "APPROVED":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200";
      case "GENERATED":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200";
      default:
        return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
    }
  };

  const getEmployeeName = (payroll) => {
    if (!payroll?.employee) {
      return "-";
    }

    return `${payroll.employee.firstName || ""} ${
      payroll.employee.lastName || ""
    }`.trim();
  };

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN")}`;

  const getSearchText = (payroll) => {
    const employee = payroll?.employee;

    return [
      payroll?.payrollId,
      payroll?.payPeriod,
      payroll?.payDate,
      payroll?.status,
      employee?.employeeCode,
      employee?.firstName,
      employee?.lastName,
      employee?.email,
      employee?.phone,
      getEmployeeName(payroll),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
  };

  const filteredPayrolls = useMemo(() => {
    const query = search.trim().toLowerCase();

    const result = payrolls.filter((payroll) => {
      if (!query) {
        return true;
      }

      return getSearchText(payroll).includes(query);
    });

    return [...result].sort((a, b) => {
      const periodA = a?.payPeriod || "";
      const periodB = b?.payPeriod || "";

      if (periodA !== periodB) {
        return periodB.localeCompare(periodA);
      }

      return Number(b?.payrollId || 0) - Number(a?.payrollId || 0);
    });
  }, [payrolls, search]);

  const totalRecords = filteredPayrolls.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const paginatedPayrolls = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredPayrolls.slice(startIndex, startIndex + pageSize);
  }, [filteredPayrolls, currentPage, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageStart = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalRecords);

  const visiblePages = useMemo(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + 4);

    if (end - start < 4) {
      start = end - 4;
    }

    return Array.from({ length: end - start + 1 }, (_, index) => start + index);
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    const safePage = Math.min(Math.max(page, 1), totalPages);

    if (safePage === currentPage) {
      return;
    }

    setCurrentPage(safePage);

    requestAnimationFrame(() => {
      document
        .getElementById("payroll-history-list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);

    requestAnimationFrame(() => {
      document
        .getElementById("payroll-history-list")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const hasActiveFilters = employeeId || payPeriod || status || search;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
        {/* HEADER */}
        <div className="mb-1 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800 sm:text-xl">
              Payroll History
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/payroll/generate")}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            <WalletCards size={16} />
            Generate Payroll
          </button>
        </div>

        {/* SEARCH + FILTERS */}
        <section className="shrink-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
  <div className="flex flex-col gap-2 xl:flex-row xl:items-end">
    {/* Search */}
    <div className="min-w-0 flex-1">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Search
      </label>

      <div className="relative">
        <Search
          size={14}
          className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Employee, code, period, status..."
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCurrentPage(1);
            }}
            className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center justify-center rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>

    </div>

    {/* Employee */}
    <div className="w-full xl:w-56">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Employee
      </label>

      <select
        value={employeeId}
        onChange={(e) => setEmployeeId(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      >
        <option value="">All Employees</option>

        {employees.map((employee) => (
          <option key={employee.employeeId} value={employee.employeeId}>
            {employee.employeeCode} - {employee.firstName} {employee.lastName}
          </option>
        ))}
      </select>
    </div>

    {/* Pay Period */}
    <div className="w-full xl:w-40">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Pay Period
      </label>

      <input
        type="month"
        value={payPeriod}
        onChange={(e) => setPayPeriod(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      />
    </div>

    {/* Status */}
    <div className="w-full xl:w-36">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Status
      </label>

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      >
        <option value="">All Status</option>
        <option value="GENERATED">Generated</option>
        <option value="APPROVED">Approved</option>
        <option value="PAID">Paid</option>
      </select>
    </div>

    {/* Actions */}
    <div className="flex shrink-0 items-center gap-1.5">
      <button
        type="button"
        onClick={handleClear}
        className="inline-flex h-[34px] items-center justify-center gap-1 rounded-md border border-slate-300 px-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
      >
        <RefreshCcw size={13} />
        Clear
      </button>

      <button
        type="button"
        onClick={handleSearch}
        className="inline-flex h-[34px] items-center justify-center gap-1 rounded-md bg-indigo-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700"
      >
        <Search size={13} />
        Apply
      </button>
    </div>
  </div>
          {/* COMPACT RESULT INFO */}
  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
    <p className="text-[11px] text-slate-500">
      <span className="font-semibold text-slate-800">
        {loading
                    ? "Loading..."
                    : totalRecords === 0
                    ? "No matching records"
                    : `Showing ${pageEnd}`}
      </span>{" "}
      matching record{totalRecords === 1 ? "" : "s"}
    </p>
  </div>
</section>

        {error && (
          <div className="mb-2 flex shrink-0 items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
            <span>{error}</span>
            <button
              type="button"
              onClick={() => setError("")}
              className="rounded p-1 text-red-500 transition hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* PAYROLL LIST */}
        <section
          id="payroll-history-list"
          className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="flex shrink-0 flex-col gap-2 border-b border-slate-200 px-2 py-2 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                <FileText size={16} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-800 sm:text-base">
                  Payroll List
                </h2>
              </div>
            </div>


          </div>

          {loading ? (
            <div className="flex flex-1 items-center justify-center px-6 py-10 text-sm text-slate-500">
              Loading payroll history...
            </div>
          ) : (
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="min-w-[1050px] w-full border-collapse">
                <thead className="sticky top-0 z-20 bg-white shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                  <tr className="border-b border-slate-200">
                    <th className="sticky top-0 z-20 w-16 bg-white px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      S.No.
                    </th>
                    <th className="sticky top-0 z-20 min-w-[220px] bg-white px-4 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Employee
                    </th>
                    <th className="sticky top-0 z-20 w-32 bg-white px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Period
                    </th>
                    <th className="sticky top-0 z-20 w-32 bg-white px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Pay Date
                    </th>
                    <th className="sticky top-0 z-20 w-32 bg-white px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Gross
                    </th>
                    <th className="sticky top-0 z-20 w-32 bg-white px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Deductions
                    </th>
                    <th className="sticky top-0 z-20 w-32 bg-white px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Net Salary
                    </th>
                    <th className="sticky top-0 z-20 w-28 bg-white px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="sticky top-0 z-20 w-60 bg-white px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {paginatedPayrolls.length > 0 ? (
                    paginatedPayrolls.map((payroll, index) => {
                      const serialNumber = (currentPage - 1) * pageSize + index + 1;
                      const employeeName = getEmployeeName(payroll);
                      const employeeCode = payroll.employee?.employeeCode || "-";
                      const approveLoading = actionLoading === `approve-${payroll.payrollId}`;
                      const paidLoading = actionLoading === `paid-${payroll.payrollId}`;

                      return (
                        <tr
                          key={payroll.payrollId}
                          className="transition-colors hover:bg-slate-50/80"
                        >
                          <td className="px-3 py-2.5 text-center text-xs font-medium text-slate-500">
                            {serialNumber}
                          </td>

                          <td className="px-4 py-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {employeeName || "-"}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {employeeCode}
                              </p>
                            </div>
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600">
                            {payroll.payPeriod || "-"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5 text-xs text-slate-600">
                            {payroll.payDate || "-"}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-slate-700">
                            {formatCurrency(payroll.grossSalary)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-rose-600">
                            {formatCurrency(payroll.totalDeductions)}
                          </td>

                          <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-bold text-emerald-700">
                            {formatCurrency(payroll.netSalary)}
                          </td>

                          <td className="px-3 py-3 text-center">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${getStatusClass(
                                payroll.status
                              )}`}
                            >
                              {payroll.status === "PAID" && <CheckCircle2 size={12} />}
                              {payroll.status || "-"}
                            </span>
                          </td>

                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => navigate(`/payslip/${payroll.payrollId}`)}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                              >
                                <FileText size={13} />
                                Payslip
                              </button>

                              {payroll.status === "GENERATED" && (
                                <button
                                  type="button"
                                  onClick={() => requestApprove(payroll)}
                                  disabled={actionLoading !== null}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <CheckCircle2 size={13} />
                                  {approveLoading ? "Approving..." : "Approve"}
                                </button>
                              )}

                              {payroll.status === "APPROVED" && (
                                <button
                                  type="button"
                                  onClick={() => requestMarkPaid(payroll)}
                                  disabled={actionLoading !== null}
                                  className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-emerald-200 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  <WalletCards size={13} />
                                  {paidLoading ? "Updating..." : "Mark Paid"}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan="9"
                        className="px-6 py-16 text-center text-sm text-slate-500"
                      >
                        <div className="mx-auto flex max-w-sm flex-col items-center">
                          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                            <Search size={18} />
                          </div>
                          <p className="font-medium text-slate-700">
                            No payroll records found
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            Try changing the search or filters.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION */}
          {!loading && totalRecords > 0 && (
            <div className="shrink-0 border-t border-slate-200 bg-white px-4 py-2.5 sm:px-5">
              <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{pageStart}</span> to{" "}
                    <span className="font-semibold text-slate-700">{pageEnd}</span> of{" "}
                    <span className="font-semibold text-slate-700">{totalRecords}</span>
                  </p>

                  <div className="h-4 w-px bg-slate-200" />

                  <label className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Rows per page</span>
                    <select
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                    >
                      {PAGE_SIZE_OPTIONS.map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="flex items-center justify-between gap-1.5 sm:justify-end">
                  <button
                    type="button"
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {visiblePages.map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => goToPage(page)}
                      className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-sm"
                          : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {confirmAction && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="payroll-confirmation-title"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) closeConfirmation();
            }}
          >
            <div className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4">
                <div
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    confirmAction.type === "approve"
                      ? "bg-blue-50 text-blue-600"
                      : "bg-emerald-50 text-emerald-600"
                  }`}
                >
                  {confirmAction.type === "approve" ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <WalletCards size={18} />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      id="payroll-confirmation-title"
                      className="text-base font-semibold text-slate-800"
                    >
                      {confirmAction.type === "approve"
                        ? "Approve payroll?"
                        : "Mark payroll as paid?"}
                    </h3>

                    <button
                      type="button"
                      onClick={closeConfirmation}
                      disabled={actionLoading !== null}
                      className="rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Close confirmation"
                    >
                      <X size={17} />
                    </button>
                  </div>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    {confirmAction.type === "approve"
                      ? "Confirm that this payroll has been reviewed and is ready for approval."
                      : "Confirm that this payroll has been paid to the employee."}
                  </p>
                </div>
              </div>

              <div className="space-y-3 px-5 py-4">
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Employee
                    </p>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-700">
                      {getEmployeeName(confirmAction.payroll) || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Pay Period
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {confirmAction.payroll?.payPeriod || "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Net Salary
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatCurrency(confirmAction.payroll?.netSalary)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                      Current Status
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {confirmAction.payroll?.status || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800">
                  <AlertTriangle size={15} className="mt-0.5 shrink-0" />
                  <span>Please review the payroll details before confirming.</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 px-5 py-3.5">
                <button
                  type="button"
                  onClick={closeConfirmation}
                  disabled={actionLoading !== null}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading !== null}
                  onClick={() =>
                    confirmAction.type === "approve"
                      ? approvePayroll(confirmAction.payroll.payrollId)
                      : markPayrollAsPaid(confirmAction.payroll.payrollId)
                  }
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    confirmAction.type === "approve"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-emerald-600 hover:bg-emerald-700"
                  }`}
                >
                  {confirmAction.type === "approve" ? (
                    <>
                      <CheckCircle2 size={15} />
                      Confirm Approve
                    </>
                  ) : (
                    <>
                      <WalletCards size={15} />
                      Confirm Paid
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
};

export default PayrollHistory;
