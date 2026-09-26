import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosInstance";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Plus,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Users,
  X,
} from "lucide-react";

const API_URL = "http://localhost:8080";

const today = new Date();

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

const currentMonth = getCurrentMonth();

const getSaturdays = (payPeriod) => {
  if (!payPeriod) return [];

  const parts = payPeriod.split("-");
  if (parts.length !== 2) return [];

  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!year || !month || month < 1 || month > 12) return [];

  const totalDays = new Date(year, month, 0).getDate();
  const saturdays = [];

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);

    if (date.getDay() === 6) {
      const value = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      saturdays.push(value);
    }
  }

  return saturdays;
};

const calculateWorkingDays = (payPeriod, holidayDates = []) => {
  if (!payPeriod) return "";

  const parts = payPeriod.split("-");
  if (parts.length !== 2) return "";

  const year = Number(parts[0]);
  const month = Number(parts[1]);

  if (!year || !month || month < 1 || month > 12) return "";

  const holidays = new Set(holidayDates);
  const totalDays = new Date(year, month, 0).getDate();
  let nonWorkingDays = 0;

  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month - 1, day);
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    if (date.getDay() === 0 || holidays.has(dateString)) {
      nonWorkingDays++;
    }
  }

  return totalDays - nonWorkingDays;
};

const emptyForm = {
  employeeId: "",
  payPeriod: currentMonth,
  holidayDates: [],
  workingDays: calculateWorkingDays(currentMonth),
  presentDays: "",
  leaveDays: "0",
  unpaidLeaveDays: "0",
  overtimeHours: "0",
};

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");
  const [monthFilter, setMonthFilter] = useState("all");
  const [employeeFilter, setEmployeeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  // --------------------------------------------------
  // FETCH ATTENDANCE
  // --------------------------------------------------

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(`${API_URL}/attendance`);
      setAttendance(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      setError("Failed to load attendance records.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FETCH EMPLOYEES
  // --------------------------------------------------

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/employees`);
      setEmployees(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setFormError("Failed to load employees.");
    }
  };

  // --------------------------------------------------
  // PAGE LOAD
  // --------------------------------------------------

  useEffect(() => {
    fetchAttendance();
    fetchEmployees();
  }, []);

  // --------------------------------------------------
  // RESET PAGINATION WHEN FILTERS CHANGE
  // --------------------------------------------------

  useEffect(() => {
    setPage(1);
  }, [search, monthFilter, employeeFilter, sortBy, pageSize]);

  // --------------------------------------------------
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => {
      const updatedForm = {
        ...previous,
        [name]: value,
      };

      if (name === "payPeriod") {
        updatedForm.holidayDates = [];
        updatedForm.workingDays = calculateWorkingDays(value, []);
      }

      return updatedForm;
    });

    setFormError("");
    setSuccessMessage("");

    setFieldErrors((previous) => {
      const updated = { ...previous };
      delete updated[name];
      return updated;
    });
  };

  const toggleSaturdayHoliday = (dateString) => {
    setFormData((previous) => {
      const exists = previous.holidayDates.includes(dateString);
      const holidayDates = exists
        ? previous.holidayDates.filter((date) => date !== dateString)
        : [...previous.holidayDates, dateString].sort();

      return {
        ...previous,
        holidayDates,
        workingDays: calculateWorkingDays(
          previous.payPeriod,
          holidayDates
        ),
      };
    });

    setFormError("");
    setSuccessMessage("");
    setFieldErrors((previous) => {
      const updated = { ...previous };
      delete updated.workingDays;
      delete updated.holidayDates;
      return updated;
    });
  };

  const saturdayOptions = useMemo(
    () => getSaturdays(formData.payPeriod),
    [formData.payPeriod]
  );

  // --------------------------------------------------
  // OPEN ADD MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setFormData({
      ...emptyForm,
      payPeriod: currentMonth,
      holidayDates: [],
      workingDays: calculateWorkingDays(currentMonth, []),
    });
    setFormError("");
    setFieldErrors({});
    setSuccessMessage("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE ADD MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setFormData({
      ...emptyForm,
      payPeriod: currentMonth,
      holidayDates: [],
      workingDays: calculateWorkingDays(currentMonth, []),
    });
    setFormError("");
    setFieldErrors({});
    setSuccessMessage("");
  };

  // --------------------------------------------------
  // FIELD VALIDATION ERROR HELPERS
  // --------------------------------------------------

  const getFirstErrorMessage = (name) => {
    const messages = fieldErrors[name];

    if (!messages || messages.length === 0) {
      return "";
    }

    return messages[0];
  };

  const getInputClassName = (name) => {
    const hasError = Boolean(getFirstErrorMessage(name));

    return `w-full rounded-lg border ${
      hasError ? "border-red-500 bg-red-50" : "border-slate-300"
    } px-3.5 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`;
  };

  const FieldError = ({ name }) => {
    const message = getFirstErrorMessage(name);

    if (!message) {
      return null;
    }

    return (
      <p className="mt-1 text-xs font-medium text-red-600">
        {message}
      </p>
    );
  };

  // --------------------------------------------------
  // CREATE ATTENDANCE
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");
    setFieldErrors({});

    const errors = {};

    if (!formData.employeeId) {
      errors.employeeId = ["Employee is required"];
    }

    if (!formData.payPeriod) {
      errors.payPeriod = ["Pay period is required"];
    }

    if (formData.presentDays === "") {
      errors.presentDays = ["Present days are required"];
    }

    if (formData.leaveDays === "") {
      errors.leaveDays = ["Leave days are required"];
    }

    if (formData.unpaidLeaveDays === "") {
      errors.unpaidLeaveDays = ["Unpaid leave days are required"];
    }

    if (formData.overtimeHours === "") {
      errors.overtimeHours = ["Overtime hours are required"];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const workingDays = Number(formData.workingDays);
    const presentDays = Number(formData.presentDays);
    const leaveDays = Number(formData.leaveDays);
    const unpaidLeaveDays = Number(formData.unpaidLeaveDays);
    const overtimeHours = Number(formData.overtimeHours);

    if (!Number.isInteger(presentDays) || presentDays < 0) {
      errors.presentDays = ["Present days cannot be negative"];
    } else if (presentDays > workingDays) {
      errors.presentDays = [
        `Present days cannot exceed ${workingDays} working days`,
      ];
    }

    if (!Number.isInteger(leaveDays) || leaveDays < 0) {
      errors.leaveDays = ["Leave days cannot be negative"];
    } else if (leaveDays > workingDays) {
      errors.leaveDays = [
        `Leave days cannot exceed ${workingDays} working days`,
      ];
    }

    if (!Number.isInteger(unpaidLeaveDays) || unpaidLeaveDays < 0) {
      errors.unpaidLeaveDays = [
        "Unpaid leave days cannot be negative",
      ];
    } else if (unpaidLeaveDays > leaveDays) {
      errors.unpaidLeaveDays = [
        "Unpaid leave cannot be greater than total leave days",
      ];
    }

    if (!Number.isFinite(overtimeHours) || overtimeHours < 0) {
      errors.overtimeHours = ["Overtime hours cannot be negative"];
    } 

    if (workingDays === "" || Number(workingDays) <= 0) {
      setFormError("Unable to calculate working days for the selected month.");
      return;
    }

    if (presentDays + leaveDays !== workingDays) {
      setFormError(
        `Present days + leave days must equal ${workingDays} working days.`
      );
      return;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const attendanceData = {
      employeeId: Number(formData.employeeId),
      payPeriod: formData.payPeriod,
      holidayDates: [...formData.holidayDates].sort(),
      presentDays,
      leaveDays,
      unpaidLeaveDays,
      overtimeHours,
    };

    try {
      setFormLoading(true);

      await axiosInstance.post(`${API_URL}/attendance`, attendanceData);

      await fetchAttendance();

      setSuccessMessage("Attendance record created successfully.");
      setFieldErrors({});

      setFormData({
        ...emptyForm,
        payPeriod: currentMonth,
        holidayDates: [],
        workingDays: calculateWorkingDays(currentMonth, []),
      });
    } catch (error) {
      console.error("Error creating attendance:", error);

      const responseData = error.response?.data;
      const status = error.response?.status;

      if (responseData?.errors) {
        const normalizedErrors = {};

        Object.entries(responseData.errors).forEach(([field, messages]) => {
          normalizedErrors[field] = Array.isArray(messages)
            ? messages
            : [String(messages)];
        });

        setFieldErrors(normalizedErrors);
        setFormError("");
      } else if (status === 409) {
        setFormError(
          "Attendance for this employee and month already exists. Please choose another month or edit the existing record."
        );
      } else if (responseData?.message) {
        setFormError(responseData.message);
      } else if (typeof responseData === "string") {
        const parsedErrors = {};
        const pattern =
          /interpolatedMessage='([^']*)'.*?propertyPath=([a-zA-Z0-9_]+)/g;

        let match;

        while ((match = pattern.exec(responseData)) !== null) {
          const message = match[1];
          const field = match[2];

          if (!parsedErrors[field]) {
            parsedErrors[field] = [message];
          }
        }

        if (Object.keys(parsedErrors).length > 0) {
          setFieldErrors(parsedErrors);
          setFormError("");
        } else {
          setFormError(responseData);
        }
      } else {
        setFormError("Failed to create attendance record.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // --------------------------------------------------
  // FORMATTERS
  // --------------------------------------------------

  const formatPayPeriod = (payPeriod) => {
    if (!payPeriod) return "-";

    const parts = payPeriod.split("-");

    if (parts.length !== 2) {
      return payPeriod;
    }

    const year = Number(parts[0]);
    const month = Number(parts[1]);

    if (!year || !month) {
      return payPeriod;
    }

    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatDateLabel = (payPeriod) => {
    if (!payPeriod) return "-";

    const parts = payPeriod.split("-");

    if (parts.length !== 2) return payPeriod;

    const year = Number(parts[0]);
    const month = Number(parts[1]);

    if (!year || !month) return payPeriod;

    return new Date(year, month - 1).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (item) => item.employeeId === Number(employeeId)
    );

    if (!employee) {
      return "";
    }

    return `${employee.firstName || ""} ${employee.lastName || ""}`.trim();
  };

  const getRecordEmployeeName = (record) => {
    return (
      `${record?.employee?.firstName || ""} ${
        record?.employee?.lastName || ""
      }`.trim() || getEmployeeName(record?.employee?.employeeId)
    );
  };

  const getAttendancePercentage = (presentDays, workingDays) => {
    const present = Number(presentDays || 0);
    const working = Number(workingDays || 0);

    if (!working || working <= 0) {
      return 0;
    }

    return Math.round((present / working) * 100);
  };

  const getAttendancePercentageDecimal = (presentDays, workingDays) => {
    const present = Number(presentDays || 0);
    const working = Number(workingDays || 0);

    if (!working || working <= 0) {
      return 0;
    }

    return ((present / working) * 100).toFixed(1);
  };

  // --------------------------------------------------
  // FILTER + SEARCH + SORT
  // --------------------------------------------------

  const filteredAndSortedAttendance = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    const filtered = attendance.filter((record) => {
      const employee = record.employee;
      const employeeCode =
        employee?.employeeCode?.toLowerCase() || "";
      const employeeName = getRecordEmployeeName(record).toLowerCase();
      const payPeriod = record.payPeriod?.toLowerCase() || "";
      const designation = employee?.designation?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        employeeCode.includes(searchText) ||
        employeeName.includes(searchText) ||
        payPeriod.includes(searchText) ||
        designation.includes(searchText);

      const matchesMonth =
        monthFilter === "all" || record.payPeriod === monthFilter;

      const recordEmployeeId = record.employee?.employeeId;
      const matchesEmployee =
        employeeFilter === "all" ||
        Number(recordEmployeeId) === Number(employeeFilter);

      return matchesSearch && matchesMonth && matchesEmployee;
    });

    const sorted = [...filtered].sort((a, b) => {
      const employeeCodeA =
        a.employee?.employeeCode?.toLowerCase() || "";
      const employeeCodeB =
        b.employee?.employeeCode?.toLowerCase() || "";
      const employeeNameA = getRecordEmployeeName(a).toLowerCase();
      const employeeNameB = getRecordEmployeeName(b).toLowerCase();

      const percentageA = getAttendancePercentageDecimal(
        a.presentDays,
        a.workingDays
      );
      const percentageB = getAttendancePercentageDecimal(
        b.presentDays,
        b.workingDays
      );

      switch (sortBy) {
        case "oldest":
          return (a.payPeriod || "").localeCompare(b.payPeriod || "");

        case "employeeAsc":
          return (
            employeeCodeA.localeCompare(employeeCodeB) ||
            employeeNameA.localeCompare(employeeNameB)
          );

        case "employeeDesc":
          return (
            employeeCodeB.localeCompare(employeeCodeA) ||
            employeeNameB.localeCompare(employeeNameA)
          );

        case "attendanceHigh":
          return (
            Number(percentageB) - Number(percentageA) ||
            (b.payPeriod || "").localeCompare(a.payPeriod || "")
          );

        case "attendanceLow":
          return (
            Number(percentageA) - Number(percentageB) ||
            (b.payPeriod || "").localeCompare(a.payPeriod || "")
          );

        case "overtimeHigh":
          return (
            Number(b.overtimeHours || 0) - Number(a.overtimeHours || 0) ||
            (b.payPeriod || "").localeCompare(a.payPeriod || "")
          );

        case "unpaidLeaveHigh":
          return (
            Number(b.unpaidLeaveDays || 0) -
              Number(a.unpaidLeaveDays || 0) ||
            (b.payPeriod || "").localeCompare(a.payPeriod || "")
          );

        default:
          return (
            (b.payPeriod || "").localeCompare(a.payPeriod || "") ||
            employeeCodeA.localeCompare(employeeCodeB) ||
            employeeNameA.localeCompare(employeeNameB)
          );
      }
    });

    return sorted;
  }, [attendance, search, monthFilter, employeeFilter, sortBy, employees]);

  // --------------------------------------------------
  // MONTH OPTIONS
  // --------------------------------------------------

  const monthOptions = useMemo(() => {
    const uniqueMonths = [
      ...new Set(
        attendance
          .map((record) => record.payPeriod)
          .filter(Boolean)
      ),
    ];

    return uniqueMonths.sort((a, b) => b.localeCompare(a));
  }, [attendance]);

  // --------------------------------------------------
  // PAGE CALCULATION
  // --------------------------------------------------

  const totalRecords = filteredAndSortedAttendance.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));

  const safePage = Math.min(page, totalPages);

  const paginatedAttendance = useMemo(() => {
    const startIndex = (safePage - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    return filteredAndSortedAttendance.slice(startIndex, endIndex);
  }, [filteredAndSortedAttendance, safePage, pageSize]);

  // --------------------------------------------------
  // SUMMARY
  // --------------------------------------------------

  const summary = useMemo(() => {
    if (filteredAndSortedAttendance.length === 0) {
      return {
        employees: 0,
        avgAttendance: 0,
        unpaidLeave: 0,
        overtime: 0,
      };
    }

    const totalAttendancePercentage =
      filteredAndSortedAttendance.reduce((sum, record) => {
        return (
          sum +
          Number(
            getAttendancePercentageDecimal(
              record.presentDays,
              record.workingDays
            )
          )
        );
      }, 0);

    const totalUnpaidLeave = filteredAndSortedAttendance.reduce(
      (sum, record) => sum + Number(record.unpaidLeaveDays || 0),
      0
    );

    const totalOvertime = filteredAndSortedAttendance.reduce(
      (sum, record) => sum + Number(record.overtimeHours || 0),
      0
    );

    const uniqueEmployeeIds = new Set(
      filteredAndSortedAttendance
        .map((record) => record.employee?.employeeId)
        .filter(Boolean)
    );

    return {
      employees: uniqueEmployeeIds.size,
      avgAttendance: Number(
        (
          totalAttendancePercentage /
          filteredAndSortedAttendance.length
        ).toFixed(1)
      ),
      unpaidLeave: totalUnpaidLeave,
      overtime: totalOvertime,
    };
  }, [filteredAndSortedAttendance]);

  // --------------------------------------------------
  // PAGE NUMBERS
  // --------------------------------------------------

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    let start = Math.max(1, safePage - 2);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);

    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  const changePage = (nextPage) => {
    const targetPage = Math.min(Math.max(nextPage, 1), totalPages);
    setPage(targetPage);

    requestAnimationFrame(() => {
      document
        .getElementById("attendance-list")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    });
  };

  // --------------------------------------------------
  // SELECTED MONTH LABEL
  // --------------------------------------------------

  const selectedMonthLabel =
    monthFilter === "all" ? "All Months" : formatPayPeriod(monthFilter);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 ">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-2 lg:flex-row mb-3 lg:items-center lg:justify-between">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-slate-800">
            Attendance Management
          </h1>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <Plus size={16} />
          Add Attendance
        </button>
      </div>

      {/* TOP ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-red-600">{error}</p>

            <button
              type="button"
              onClick={fetchAttendance}
              className="text-sm font-semibold text-red-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* FILTERS */}
      <section className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
  <div className="flex flex-col gap-2 xl:flex-row xl:items-end">

    {/* SEARCH */}
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
          placeholder="Employee, code or month..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X size={13} />
          </button>
        )}
      </div>
    </div>

    {/* MONTH */}
    <div className="w-full xl:w-40">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Month
      </label>

      <select
        value={monthFilter}
        onChange={(e) => setMonthFilter(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      >
        <option value="all">All Months</option>

        {monthOptions.map((month) => (
          <option key={month} value={month}>
            {formatPayPeriod(month)}
          </option>
        ))}
      </select>
    </div>

    {/* EMPLOYEE */}
    <div className="w-full xl:w-56">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Employee
      </label>

      <select
        value={employeeFilter}
        onChange={(e) => setEmployeeFilter(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      >
        <option value="all">All Employees</option>

        {[...employees]
          .sort((a, b) =>
            `${a.employeeCode || ""}`.localeCompare(
              `${b.employeeCode || ""}`
            )
          )
          .map((employee) => (
            <option
              key={employee.employeeId}
              value={employee.employeeId}
            >
              {employee.employeeCode} - {employee.firstName} {employee.lastName}
            </option>
          ))}
      </select>
    </div>

    {/* SORT */}
    <div className="w-full xl:w-44">
      <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500">
        Sort By
      </label>

      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100"
      >
        <option value="newest">Newest Month</option>
        <option value="oldest">Oldest Month</option>
        <option value="attendanceHigh">Highest Attendance</option>
        <option value="attendanceLow">Lowest Attendance</option>
        <option value="overtimeHigh">Highest Overtime</option>
        <option value="unpaidLeaveHigh">Most Unpaid Leave</option>
      </select>
    </div>

    {/* RESET */}
    <button
      type="button"
      onClick={() => {
        setSearch("");
        setMonthFilter("all");
        setEmployeeFilter("all");
        setSortBy("newest");
        setPage(1);
      }}
      className="inline-flex h-[34px] shrink-0 items-center justify-center gap-1 rounded-md border border-slate-300 px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-50"
    >
      <RotateCcw size={13} />
      Reset
    </button>
  </div>

  {/* COMPACT RESULT INFO */}
  <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
    <p className="text-[11px] text-slate-500">
      <span className="font-semibold text-slate-800">
        {totalRecords}
      </span>{" "}
      matching record{totalRecords === 1 ? "" : "s"}
      <span className="mx-1.5 text-slate-300">•</span>
      {selectedMonthLabel}
    </p>
  </div>
</section>
      {/* SUMMARY CARDS 
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Employees</p>
            <Users size={16} className="text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {summary.employees}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Avg Attendance</p>
            <CalendarDays size={16} className="text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-indigo-700">
            {summary.avgAttendance}%
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Unpaid Leave</p>
            <CalendarDays size={16} className="text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">
            {summary.unpaidLeave}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Overtime</p>
            <Clock3 size={16} className="text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {summary.overtime}
          </p>
        </div>
      </div>

       LOADING */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">Loading attendance...</p>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div
          id="attendance-list"
          className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="min-w-[980px] w-full">
              <thead className="sticky top-0 z-20 bg-slate-50 shadow-[0_1px_0_0_rgba(226,232,240,1)]">
                <tr>
                  <th className="w-14 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    S.No.
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Employee
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Attendance Month
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Working
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Present
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Leave
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Unpaid Leave
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Overtime
                  </th>
                  <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    Attendance
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {paginatedAttendance.length > 0 ? (
                  paginatedAttendance.map((record, index) => {
                    const percentage = getAttendancePercentage(
                      record.presentDays,
                      record.workingDays
                    );

                    const percentageDecimal = getAttendancePercentageDecimal(
                      record.presentDays,
                      record.workingDays
                    );

                    return (
                      <tr
                        key={record.attendanceId}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-5 py-2 text-xs font-medium text-slate-500">
                          {(safePage - 1) * pageSize + index + 1}
                        </td>

                        {/* EMPLOYEE */}
                        <td className="px-3 py-2.5 ">
                          <p className="text-sm font-semibold text-slate-800">
                            {getRecordEmployeeName(record) || "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {record.employee?.designation
                              ? ` • ${record.employee.designation}`
                              : ""}
                          </p>
                        </td>

                        {/* PERIOD */}
                        <td className="whitespace-nowrap px-4 py-3.5">
                          <p className="text-sm font-semibold text-slate-700">
                            {formatPayPeriod(record.payPeriod)}
                          </p>
                        </td>

                        {/* WORKING DAYS */}
                        <td className="px-4 py-3.5 text-center text-sm font-semibold text-slate-700">
                          {record.workingDays ?? 0}
                        </td>

                        {/* PRESENT DAYS */}
                        <td className="px-4 py-3.5 text-center text-sm font-semibold text-indigo-700">
                          {record.presentDays ?? 0}
                        </td>

                        {/* LEAVE DAYS */}
                        <td className="px-4 py-3.5 text-center text-sm text-slate-600">
                          {record.leaveDays ?? 0}
                        </td>

                        {/* UNPAID LEAVE */}
                        <td className="px-4 py-3.5 text-center text-sm font-semibold text-red-600">
                          {record.unpaidLeaveDays ?? 0}
                        </td>

                        {/* OVERTIME */}
                        <td className="px-4 py-3.5 text-center text-sm font-semibold text-slate-700">
                          {record.overtimeHours ?? 0} hrs
                        </td>

                        {/* ATTENDANCE */}
                        <td className="px-3 py-2.5">
                          <div className="min-w-[150px]">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-semibold text-slate-700">
                                {percentageDecimal}%
                              </span>
                              <span className="text-xs text-slate-400">
                                {record.presentDays ?? 0}/{record.workingDays ?? 0}
                              </span>
                            </div>

                            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200">
                              <div
                                className="h-full rounded-full bg-indigo-600 transition-all"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                          </div>
                        </td>

                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      {search || monthFilter !== "all" || employeeFilter !== "all"
                        ? "No attendance records match the selected filters."
                        : "No attendance records available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalRecords > 0 && (
            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-3 py-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Rows per page</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-indigo-500"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>

                <span className="ml-2">
                  {Math.min((safePage - 1) * pageSize + 1, totalRecords)}-
                  {Math.min(safePage * pageSize, totalRecords)} of {totalRecords}
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={safePage === 1}
                  onClick={() => changePage(safePage - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                {getPageNumbers().map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => changePage(pageNumber)}
                    className={`min-w-9 rounded-lg px-3 py-2 text-sm font-medium transition ${
                      pageNumber === safePage
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={safePage === totalPages}
                  onClick={() => changePage(safePage + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          ADD ATTENDANCE MODAL
      ================================================== */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-800">
                  Add Attendance
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={formLoading}
                className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
              >
                ×
              </button>
            </div>

            {/* FORM */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="max-h-[78vh] space-y-4 overflow-y-auto p-5 scroll-smooth"
            >
              {/* FORM ERROR */}
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              {/* SUCCESS */}
              {successMessage && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-medium text-emerald-700">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* EMPLOYEE & PERIOD */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {/* EMPLOYEE */}
                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Employee <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`${getInputClassName("employeeId")} bg-white`}
                  >
                    <option value="">Select Employee</option>

                    {employees.map((employee) => (
                      <option
                        key={employee.employeeId}
                        value={employee.employeeId}
                      >
                        {employee.employeeCode} - {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                  </select>

                  <FieldError name="employeeId" />
                </div>

                {/* PAY PERIOD */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Attendance Month <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="month"
                    name="payPeriod"
                    value={formData.payPeriod}
                    onChange={handleChange}
                    max={currentMonth}
                    className={getInputClassName("payPeriod")}
                  />

                  <FieldError name="payPeriod" />

                </div>

                {/* WORKING DAYS */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Working Days
                  </label>

                  <input
                    type="number"
                    name="workingDays"
                    value={formData.workingDays}
                    readOnly
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-semibold text-slate-700 outline-none"
                  />

                </div>

                {/* SATURDAY HOLIDAYS */}
                <div className="md:col-span-2 rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700">
                        Saturday Holidays
                      </label>
                    </div>

                    <span className="rounded-full border border-indigo-100 bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                      {formData.holidayDates.length} selected
                    </span>
                  </div>

                  {saturdayOptions.length > 0 ? (
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-5">
                      {saturdayOptions.map((dateString) => {
                        const selected = formData.holidayDates.includes(dateString);
                        const date = new Date(`${dateString}T00:00:00`);

                        return (
                          <label
                            key={dateString}
                            className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                              selected
                                ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={selected}
                              onChange={() => toggleSaturdayHoliday(dateString)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            {date.toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                            })}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-slate-500">
                      No Saturdays in the selected month.
                    </p>
                  )}
                </div>

                {/* PRESENT DAYS */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Present Days <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="presentDays"
                    value={formData.presentDays}
                    onChange={handleChange}
                    placeholder="24"
                    className={getInputClassName("presentDays")}
                  />

                  <FieldError name="presentDays" />
                </div>

                {/* LEAVE DAYS */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Leave Days <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="leaveDays"
                    value={formData.leaveDays}
                    onChange={handleChange}
                    placeholder="2"
                    className={getInputClassName("leaveDays")}
                  />

                  <FieldError name="leaveDays" />
                </div>

                {/* UNPAID LEAVE */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Unpaid Leave Days <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="unpaidLeaveDays"
                    value={formData.unpaidLeaveDays}
                    onChange={handleChange}
                    placeholder="0"
                    className={getInputClassName("unpaidLeaveDays")}
                  />

                  <FieldError name="unpaidLeaveDays" />

                </div>

                {/* OVERTIME */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                    Overtime Hours
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="overtimeHours"
                    value={formData.overtimeHours}
                    onChange={handleChange}
                    placeholder="10"
                    className={getInputClassName("overtimeHours")}
                  />

                  <FieldError name="overtimeHours" />

                </div>
              </div>

              {/* PREVIEW */}
              {formData.workingDays && formData.presentDays !== "" && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3.5">
                  <h3 className="text-sm font-semibold text-slate-700">
                    Attendance Summary
                  </h3>

                  <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                    <div>
                      <p className="text-xs text-slate-500">Working Days</p>
                      <p className="mt-1 text-lg font-bold text-slate-800">
                        {formData.workingDays}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Present</p>
                      <p className="mt-1 text-lg font-bold text-indigo-700">
                        {formData.presentDays}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Leave</p>
                      <p className="mt-1 text-lg font-bold text-slate-700">
                        {formData.leaveDays || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">Unpaid</p>
                      <p className="mt-1 text-lg font-bold text-red-600">
                        {formData.unpaidLeaveDays || 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">OT Hours</p>
                      <p className="mt-1 text-lg font-bold text-slate-700">
                        {formData.overtimeHours || 0}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading ? "Saving..." : "Save Attendance"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AttendanceManagement;
