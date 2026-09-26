import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  UserRoundCheck,
  UserRoundX,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const API_BASE_URL = "http://localhost:8080";

const initialForm = {
  departmentName: "",
};

const PAGE_SIZES = [10, 25, 50];

function FieldError({ message }) {
  if (!message) return null;

  return (
    <p className="mt-1 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

const getInitials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "D";

function DepartmentManagement() {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const errorRef = useRef(null);
  const listRef = useRef(null);
  const formRef = useRef(null);

  // ---------------------------------------------------------
  // FETCH
  // ---------------------------------------------------------

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (!error || !errorRef.current) return;

    requestAnimationFrame(() => {
      errorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      errorRef.current.focus({ preventScroll: true });
    });
  }, [error]);

  const fetchDepartments = async () => {
    try {
      setFetching(true);
      setError("");

      const [departmentResponse, employeeResponse] = await Promise.all([
        axiosInstance.get(`${API_BASE_URL}/departments`),
        axiosInstance.get(`${API_BASE_URL}/employees`),
      ]);

      setDepartments(
        Array.isArray(departmentResponse.data)
          ? departmentResponse.data
          : []
      );

      setEmployees(
        Array.isArray(employeeResponse.data)
          ? employeeResponse.data
          : []
      );
    } catch (requestError) {
      console.error("Failed to fetch department data:", requestError);

      setError(
        requestError?.response?.data?.message ||
          "Failed to load departments."
      );

      // Still try to load departments if employee loading failed.
      try {
        const departmentResponse = await axiosInstance.get(
          `${API_BASE_URL}/departments`
        );

        setDepartments(
          Array.isArray(departmentResponse.data)
            ? departmentResponse.data
            : []
        );
      } catch (departmentError) {
        console.error(
          "Failed to load departments:",
          departmentError
        );
      }
    } finally {
      setFetching(false);
    }
  };

  // ---------------------------------------------------------
  // FORM
  // ---------------------------------------------------------

  const handleChange = (event) => {
    const { value } = event.target;

    setForm({
      departmentName: value,
    });

    setFieldError("");
    setError("");
    setMessage("");
  };

  const validateForm = () => {
    const name = form.departmentName.trim();

    if (!name) {
      setFieldError("Department name is required.");
      return false;
    }

    if (name.length < 2) {
      setFieldError(
        "Department name must be at least 2 characters."
      );
      return false;
    }

    if (name.length > 100) {
      setFieldError(
        "Department name cannot exceed 100 characters."
      );
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const payload = {
        departmentName: form.departmentName.trim(),
      };

      if (editingId) {
        await axiosInstance.put(
          `${API_BASE_URL}/departments/${editingId}`,
          payload
        );

        setMessage("Department updated successfully.");
      } else {
        await axiosInstance.post(
          `${API_BASE_URL}/departments`,
          payload
        );

        setMessage("Department created successfully.");
      }

      setForm(initialForm);
      setEditingId(null);
      setShowForm(false);

      await fetchDepartments();

      setCurrentPage(1);
    } catch (requestError) {
      console.error("Failed to save department:", requestError);

      const responseData = requestError.response?.data;

      if (responseData?.errors?.departmentName) {
        const departmentError =
          responseData.errors.departmentName;

        setFieldError(
          Array.isArray(departmentError)
            ? departmentError[0]
            : departmentError
        );
      } else if (responseData?.message) {
        setError(responseData.message);
      } else {
        setError("Failed to save department.");
      }
    } finally {
      setLoading(false);
    }
  };

  const openAddForm = () => {
    setEditingId(null);
    setForm(initialForm);
    setFieldError("");
    setError("");
    setMessage("");
    setShowForm(true);
  };

  const handleEdit = (department) => {
    setEditingId(department.departmentId);

    setForm({
      departmentName: department.departmentName || "",
    });

    setFieldError("");
    setError("");
    setMessage("");
    setShowForm(true);

    requestAnimationFrame(() => {
      const input = document.getElementById("departmentName");
      input?.focus();
    });
  };

  const handleCancel = () => {
    if (loading) return;

    setEditingId(null);
    setForm(initialForm);
    setFieldError("");
    setError("");
    setMessage("");
    setShowForm(false);
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this department?"
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      await axiosInstance.delete(
        `${API_BASE_URL}/departments/${id}`
      );

      setMessage("Department deleted successfully.");

      await fetchDepartments();
    } catch (requestError) {
      console.error(
        "Failed to delete department:",
        requestError
      );

      const responseData = requestError.response?.data;

      setError(
        responseData?.message ||
          (typeof responseData === "string"
            ? responseData
            : "Unable to delete this department. Please try again.")
      );
    }
  };

  // ---------------------------------------------------------
  // SEARCH / PAGINATION
  // ---------------------------------------------------------

  const filteredDepartments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return departments;
    }

    return departments.filter((department) =>
      String(department.departmentName || "")
        .toLowerCase()
        .includes(term)
    );
  }, [departments, search]);

  const sortedDepartments = useMemo(() => {
    return [...filteredDepartments].sort((a, b) =>
      String(a.departmentName || "").localeCompare(
        String(b.departmentName || "")
      )
    );
  }, [filteredDepartments]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedDepartments.length / pageSize)
  );

  const paginatedDepartments = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return sortedDepartments.slice(
      startIndex,
      startIndex + pageSize
    );
  }, [sortedDepartments, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const startRecord =
    sortedDepartments.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    currentPage * pageSize,
    sortedDepartments.length
  );

  const visiblePages = useMemo(() => {
    const maxVisible = 5;

    let start = Math.max(
      1,
      currentPage - Math.floor(maxVisible / 2)
    );

    let end = Math.min(
      totalPages,
      start + maxVisible - 1
    );

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    const pages = [];

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (page) => {
    setCurrentPage(page);

    requestAnimationFrame(() => {
      listRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  // ---------------------------------------------------------
  // SUMMARY / DETAILS
  // ---------------------------------------------------------

  const assignedEmployees = useMemo(
    () =>
      employees.filter(
        (employee) => employee.department?.departmentId != null
      ).length,
    [employees]
  );

  const unassignedEmployees = Math.max(
    employees.length - assignedEmployees,
    0
  );

  const getEmployeeCount = (departmentId) => {
  return employees.filter(
    (employee) =>
      Number(employee.departmentId) === Number(departmentId)
  ).length;
 };


  // ---------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
        {/* HEADER */}

      <div className="flex shrink-0 flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Department Management
          </h1>

          <p className="mt-0.5 text-xs text-slate-500">
            Manage departments and their employee allocation.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        >
          <Plus size={14} />
          Add Department
        </button>
      </div>

      {/* ALERTS */}

      {message && (
        <div
          role="status"
          className="flex shrink-0 items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700"
        >
          <CheckCircle2 size={16} />
          {message}
        </div>
      )}

      {error && (
        <div
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="flex shrink-0 items-start justify-between gap-3 rounded-lg border border-red-100 bg-red-50 px-4 py-3 outline-none"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle
              size={17}
              className="mt-0.5 shrink-0 text-red-600"
            />

            <div>
              <p className="text-sm font-semibold text-red-700">
                Unable to complete the request
              </p>
              <p className="mt-0.5 text-xs text-red-600">
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-md p-1 text-red-500 hover:bg-red-100"
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* SUMMARY CARDS 

      <div className="grid shrink-0 grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <Building2 size={16} className="shrink-0 text-indigo-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Departments
              </p>
              <p className="truncate text-[10px] text-slate-400">
                Available in the system
              </p>
            </div>
          </div>

          <p className="text-xl font-bold text-slate-900">
            {departments.length}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-2 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <UserRoundCheck size={16} className="shrink-0 text-indigo-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-indigo-700">
                Employees Assigned
              </p>
              <p className="truncate text-[10px] text-indigo-600">
                Across all departments
              </p>
            </div>
          </div>

          <p className="text-xl font-bold text-indigo-900">
            {assignedEmployees}
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 shadow-sm">
          <div className="flex min-w-0 items-center gap-2">
            <UserRoundX size={16} className="shrink-0 text-amber-500" />
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                Unassigned Employees
              </p>
              <p className="truncate text-[10px] text-amber-600">
                Need department assignment
              </p>
            </div>
          </div>

          <p className="text-xl font-bold text-amber-900">
            {unassignedEmployees}
          </p>
        </div>
      </div>

       ADD / EDIT FORM */}

      {/* SEARCH */}

      <section className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {startRecord}-{endRecord}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {sortedDepartments.length}
              </span>
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>

           <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <p className="text-[11px] text-slate-500">
              <span className="font-semibold text-slate-800">
                {sortedDepartments.length} department
                {sortedDepartments.length === 1 ? "" : "s"}
              </span>{" "}
              {search ? "matching your search" : "in total of "} {employees.length} total employee record
          {employees.length === 1 ? "" : "s"}
            </p>
          </div>
      </section>

      {/* DEPARTMENT LIST */}

      <section
        ref={listRef}
        className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2.5">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Department List
            </h2>
          </div>

          <span className="hidden rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:inline-flex">
            {sortedDepartments.length} Records
          </span>
        </div>

        {fetching ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
            <p className="mt-3 text-sm text-slate-500">
              Loading departments...
            </p>
          </div>
        ) : sortedDepartments.length === 0 ? (
          <div className="p-10 text-center">
            <Building2
              size={26}
              className="mx-auto text-slate-300"
            />

            <p className="mt-3 text-sm font-medium text-slate-600">
              {search
                ? "No departments found with this search."
                : "No departments found."}
            </p>

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="mt-2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full table-fixed">
              <colgroup>
                <col className="w-[7%]" />
                <col className="w-[46%]" />
                <col className="w-[27%]" />
                <col className="w-[20%]" />
              </colgroup>

              <thead className="sticky top-0 z-10 bg-slate-50 shadow-sm">
                <tr>
                  <th className="px-5 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    S.No.
                  </th>

                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Department
                  </th>

                  <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Employees
                  </th>

                  <th className="px-3 py-2 text-center text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {paginatedDepartments.map((department, index) => {
                  const employeeCount = getEmployeeCount(
                    department.departmentId
                  );

                  const serialNumber =
                    (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr
                      key={department.departmentId}
                      className="transition hover:bg-slate-50"
                    >
                      {/* S.NO */}
                      <td className="px-6 py-2 text-xs font-semibold text-slate-400">
                        {serialNumber}
                      </td>

                      {/* DEPARTMENT */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-[11px] font-bold text-indigo-600">
                            {getInitials(department.departmentName)}
                          </div>

                          <p className="truncate text-sm font-semibold text-slate-800">
                            {department.departmentName}
                          </p>
                        </div>
                      </td>

                      {/* EMPLOYEES */}
                      <td className="px-3 py-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                          <Users size={12} />
                          {employeeCount}{" "}
                          {employeeCount === 1
                            ? "employee"
                            : "employees"}
                        </span>
                      </td>

                      {/* ACTIONS */}
                      <td className="px-8 py-2">
                        <div className="flex items-center justify-start gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(department)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:border-indigo-200 hover:bg-indigo-50"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(department.departmentId)
                            }
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:border-red-200 hover:bg-red-50"
                          >
                            <Trash2 size={13} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            {/* PAGINATION */}

            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-4 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="mr-1 flex items-center gap-1.5">
                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    Rows per page
                  </span>

                  <select
                    value={pageSize}
                    onChange={(event) =>
                      setPageSize(
                        Number(event.target.value)
                      )
                    }
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  
              <p className="text-xs text-slate-500">
                Showing Page{" "}
                <span className="font-semibold text-slate-800">
                  {currentPage}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-800">
                  {totalPages}
                </span>
              </p>
                </div>

              <div className="flex flex-wrap items-center gap-1.5">
                

                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    goToPage(currentPage - 1)
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>

                {visiblePages.map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => goToPage(page)}
                    className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-semibold transition ${
                      currentPage === page
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "border border-slate-200 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    goToPage(currentPage + 1)
                  }
                  className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* SMALL SUMMARY FOOTER */}

      {/* <div className="flex shrink-0 flex-col gap-1 pt-1 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Average employees per department:{" "}
          <span className="font-semibold text-slate-600">
            averageEmployeesPerDepartment
          </span>
        </span>

        <span>
          {employees.length} total employee record
          {employees.length === 1 ? "" : "s"}
        </span>
      </div> */}
      </div>
      {/* ADD / EDIT MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="department-form-title"
        >
          <div
            ref={formRef}
            className="w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <h2
                  id="department-form-title"
                  className="text-sm font-semibold text-slate-800"
                >
                  {editingId ? "Edit Department" : "Add Department"}
                </h2>

                <p className="mt-0.5 text-[11px] text-slate-400">
                  {editingId
                    ? "Update the department name."
                    : "Create a department for employee organization."}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancel}
                disabled={loading}
                className="rounded-lg px-2 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-4 p-4"
            >
              {error && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5">
                  <p className="text-xs font-medium text-red-600">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="departmentName"
                  className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-500"
                >
                  Department Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  id="departmentName"
                  type="text"
                  name="departmentName"
                  value={form.departmentName}
                  onChange={handleChange}
                  placeholder="e.g. Human Resources"
                  disabled={loading}
                  autoFocus
                  className={`w-full rounded-lg border bg-white px-3 py-2.5 text-sm outline-none transition disabled:bg-slate-100 ${
                    fieldError
                      ? "border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                      : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  }`}
                />

                <FieldError message={fieldError} />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="rounded-lg border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    "Saving..."
                  ) : editingId ? (
                    <>
                      <Pencil size={13} />
                      Update
                    </>
                  ) : (
                    <>
                      <Plus size={13} />
                      Add
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default DepartmentManagement;
