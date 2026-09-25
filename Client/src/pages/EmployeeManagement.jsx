import React, { useEffect, useMemo, useRef, useState } from "react";
import axiosInstance from "../services/axiosInstance";


const API_URL = "http://localhost:8080";


const getToday = () => {
  const date = new Date();

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
    2,
    "0"
  )}-${String(date.getDate()).padStart(2, "0")}`;
};

const today = getToday();

const EMPTY_FORM = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  designation: "",
  joiningDate: today,
  status: "ACTIVE",
  departmentId: "",
  panNumber: "",
  uanNumber: "",
  bankAccountNumber: "",
  ifscCode: "",
  employmentType: "",
  location: "",
};

const REQUIRED_FIELDS = [
  "firstName",
  "email",
  "phone",
  "designation",
  "joiningDate",
  "departmentId",
  "panNumber",
  "bankAccountNumber",
  "ifscCode",
  "employmentType",
  "location",
];

const FIELD_LABELS = {
  employeeCode: "Employee Code",
  firstName: "First Name",
  lastName: "Last Name",
  email: "Email",
  phone: "Phone",
  designation: "Designation",
  joiningDate: "Joining Date",
  status: "Status",
  departmentId: "Department",
  panNumber: "PAN Number",
  uanNumber: "UAN Number",
  bankAccountNumber: "Bank Account Number",
  ifscCode: "IFSC Code",
  employmentType: "Employment Type",
  location: "Location",
};

function FieldError({ name, errors }) {
  const messages = errors[name];

  if (!messages || messages.length === 0) {
    return null;
  }

  return (
    <p className="mt-1 text-xs font-medium text-red-600">
      {messages[0]}
    </p>
  );
}

function getInputClass(hasError) {
  return `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition ${
    hasError
      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
  }`;
}

function getSelectClass(hasError) {
  return `w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
    hasError
      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
  }`;
}

function addFieldError(result, field, message) {
  if (!field || !message) return;

  if (!result[field]) {
    result[field] = [];
  }

  if (!result[field].includes(message)) {
    result[field].push(message);
  }
}

function extractValidationErrors(error) {
  const data = error?.response?.data;
  const result = {};

  if (!data) {
    return result;
  }

  // Our GlobalExceptionHandler response:
  // { message: "Validation failed", errors: { firstName: ["..."] } }
  if (data.errors && typeof data.errors === "object") {
    if (Array.isArray(data.errors)) {
      data.errors.forEach((item) => {
        addFieldError(
          result,
          item.field || item.property || item.name,
          item.defaultMessage || item.message || item.reason
        );
      });
    } else {
      Object.entries(data.errors).forEach(([field, value]) => {
        const messages = Array.isArray(value) ? value : [value];

        messages.forEach((item) => {
          addFieldError(
            result,
            field,
            typeof item === "string"
              ? item
              : item?.defaultMessage || item?.message || item?.reason
          );
        });
      });
    }
  }

  ["fieldErrors", "validationErrors"].forEach((key) => {
    if (!data[key] || typeof data[key] !== "object") return;

    Object.entries(data[key]).forEach(([field, value]) => {
      const messages = Array.isArray(value) ? value : [value];

      messages.forEach((item) => {
        addFieldError(
          result,
          field,
          typeof item === "string"
            ? item
            : item?.defaultMessage || item?.message || item?.reason
        );
      });
    });
  });

  // Fallback for Spring's standard field error array.
  if (Array.isArray(data.errors)) {
    data.errors.forEach((item) => {
      addFieldError(
        result,
        item.field || item.property || item.name,
        item.defaultMessage || item.message || item.reason
      );
    });
  }

  // Fallback for the exact ConstraintViolationException text currently
  // returned by the user's backend.
  const rawText =
    typeof data === "string"
      ? data
      : typeof data.message === "string"
      ? data.message
      : "";

  if (rawText.includes("ConstraintViolationImpl")) {
    const regex =
      /interpolatedMessage='([^']*)'.*?propertyPath=([^,}]+)/g;

    let match;

    while ((match = regex.exec(rawText)) !== null) {
      addFieldError(result, match[2].trim(), match[1].trim());
    }
  }

  return result;
}

function getServerMessage(error) {
  const data = error?.response?.data;

  if (!data) {
    return "Failed to save employee.";
  }

  if (typeof data === "string") {
    if (data.includes("ConstraintViolationImpl")) {
      return "Please correct the highlighted fields.";
    }

    return data;
  }

  return (
    data.message ||
    data.detail ||
    data.error ||
    "Failed to save employee."
  );
}

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Filters / sorting / pagination
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("codeAsc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const formErrorRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------------------------
  // SCROLL TO FORM ERROR
  // --------------------------------------------------

  useEffect(() => {
    if (!showModal) {
      return;
    }

    const firstFieldWithError = REQUIRED_FIELDS.find(
      (field) => Array.isArray(fieldErrors[field]) && fieldErrors[field].length > 0
    );

    requestAnimationFrame(() => {
      if (firstFieldWithError) {
        const element = document.getElementById(firstFieldWithError);

        if (element) {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          if (typeof element.focus === "function") {
            element.focus({ preventScroll: true });
          }

          return;
        }
      }

      // For general/business errors with no specific field,
      // scroll to the error banner at the top of the form.
      if (formError && formErrorRef.current) {
        formErrorRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        formErrorRef.current.focus({ preventScroll: true });
      }
    });
  }, [fieldErrors, formError, showModal]);

  const loadData = async () => {
    try {
      setLoading(true);
      setPageError("");

      const [employeeResponse, departmentResponse] = await Promise.all([
        axiosInstance.get(`${API_URL}/employees`),
        axiosInstance.get(`${API_URL}/departments`),
      ]);

      setEmployees(employeeResponse.data || []);
      
      setDepartments(departmentResponse.data || []);
      
    } catch (error) {
      console.error("Error loading employee data:", error);
      setPageError(
        error?.response?.data?.message ||
          "Failed to load employees or departments."
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch = !term || [
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.designation,
        employee.location,
        employee.status,
        employee.employmentType,
        employee.department?.departmentName,
      ].some((value) =>
        String(value || "").toLowerCase().includes(term)
      );

      const matchesDepartment =
        !departmentFilter ||
        String(employee.department?.departmentId || "") ===
          String(departmentFilter);

      const matchesStatus =
        !statusFilter ||
        String(employee.status || "").toUpperCase() === statusFilter;

      const matchesEmploymentType =
        !employmentTypeFilter ||
        String(employee.employmentType || "") === employmentTypeFilter;

      const matchesLocation =
        !locationFilter ||
        String(employee.location || "") === locationFilter;

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesStatus &&
        matchesEmploymentType &&
        matchesLocation
      );
    });
  }, [
    employees,
    search,
    departmentFilter,
    statusFilter,
    employmentTypeFilter,
    locationFilter,
  ]);

  const sortedEmployees = useMemo(() => {
    const data = [...filteredEmployees];

    data.sort((a, b) => {
      const nameA = `${a.firstName || ""} ${a.lastName || ""}`
        .trim()
        .toLowerCase();
      const nameB = `${b.firstName || ""} ${b.lastName || ""}`
        .trim()
        .toLowerCase();

      const codeA = String(a.employeeCode || "").toLowerCase();
      const codeB = String(b.employeeCode || "").toLowerCase();

      const joiningA = a.joiningDate || "";
      const joiningB = b.joiningDate || "";

      switch (sortBy) {
        case "codeDesc":
          return codeB.localeCompare(codeA);

        case "nameAsc":
          return nameA.localeCompare(nameB);

        case "nameDesc":
          return nameB.localeCompare(nameA);

        case "joiningNewest":
          return joiningB.localeCompare(joiningA);

        case "joiningOldest":
          return joiningA.localeCompare(joiningB);

        case "status":
          return String(a.status || "").localeCompare(
            String(b.status || "")
          );

        case "codeAsc":
        default:
          return codeA.localeCompare(codeB);
      }
    });

    return data;
  }, [filteredEmployees, sortBy]);

  const totalPages = Math.max(
    1,
    Math.ceil(sortedEmployees.length / pageSize)
  );

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedEmployees.slice(startIndex, startIndex + pageSize);
  }, [sortedEmployees, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    departmentFilter,
    statusFilter,
    employmentTypeFilter,
    locationFilter,
    sortBy,
    pageSize,
  ]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Keep the employee list in view after changing page.
  useEffect(() => {
    if (!tableRef.current || currentPage === 1) {
      return;
    }

    requestAnimationFrame(() => {
      tableRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [currentPage]);

  const uniqueLocations = useMemo(() => {
    return [...new Set(
      employees
        .map((employee) => String(employee.location || "").trim())
        .filter(Boolean)
    )].sort((a, b) => a.localeCompare(b));
  }, [employees]);

  const activeCount = useMemo(() => {
    return employees.filter(
      (employee) =>
        String(employee.status || "").toUpperCase() === "ACTIVE"
    ).length;
  }, [employees]);

  const inactiveCount = useMemo(() => {
    return employees.filter(
      (employee) =>
        String(employee.status || "").toUpperCase() === "INACTIVE"
    ).length;
  }, [employees]);

  const clearFilters = () => {
    setSearch("");
    setDepartmentFilter("");
    setStatusFilter("");
    setEmploymentTypeFilter("");
    setLocationFilter("");
    setSortBy("codeAsc");
    setCurrentPage(1);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    // Last name should contain letters, spaces, apostrophes,
    // periods, or hyphens only. Remove numbers and other
    // invalid characters immediately on typing or paste.
    if (name === "joiningDate" && value > getToday()) {
      return;
    }

    const cleanedValue =
      name === "lastName"
        ? value.replace(/[^a-zA-Z .\'-]/g, "")
        : value;

    setFormData((previous) => ({
      ...previous,
      [name]: cleanedValue,
    }));

    setFormError("");

    setFieldErrors((previous) => {
      const next = { ...previous };
      delete next[name];
      return next;
    });
  };

  const openAddModal = () => {
    setIsEditing(false);
    setEditingEmployeeId(null);
    setFormData({
    ...EMPTY_FORM,
    joiningDate: getToday(),
  });
    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setIsEditing(true);
    setEditingEmployeeId(employee.employeeId);

    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      designation: employee.designation || "",
      joiningDate: employee.joiningDate || "",
      status: employee.status || "ACTIVE",
      departmentId: employee.department?.departmentId
        ? String(employee.department.departmentId)
        : "",
      panNumber: employee.panNumber || "",
      uanNumber: employee.uanNumber || "",
      bankAccountNumber: employee.bankAccountNumber || "",
      ifscCode: employee.ifscCode || "",
      employmentType: employee.employmentType || "",
      location: employee.location || "",
    });

    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setIsEditing(false);
    setEditingEmployeeId(null);
    setFormData({ ...EMPTY_FORM });
    setFormError("");
    setFieldErrors({});
  };

  const validateBasicForm = () => {
    const errors = {};

    const requiredFields = [
      {
        name: "firstName",
        value: formData.firstName,
        message: "First name is required.",
      },
      {
        name: "email",
        value: formData.email,
        message: "Email is required.",
      },
      {
        name: "phone",
        value: formData.phone,
        message: "Phone is required.",
      },
      {
        name: "designation",
        value: formData.designation,
        message: "Designation is required.",
      },
      {
        name: "joiningDate",
        value: formData.joiningDate,
        message: "Joining date is required.",
      },
      {
        name: "departmentId",
        value: formData.departmentId,
        message: "Please select a department.",
      },
      {
        name: "panNumber",
        value: formData.panNumber,
        message: "PAN number is required.",
      },
      {
        name: "bankAccountNumber",
        value: formData.bankAccountNumber,
        message: "Bank account number is required.",
      },
      {
        name: "ifscCode",
        value: formData.ifscCode,
        message: "IFSC code is required.",
      },
      {
        name: "employmentType",
        value: formData.employmentType,
        message: "Employment type is required.",
      },
      {
        name: "location",
        value: formData.location,
        message: "Location is required.",
      },
    ];

    requiredFields.forEach(({ name, value, message }) => {
      if (value === null || value === undefined || String(value).trim() === "") {
        errors[name] = [message];
      }
    });

    // Future joining dates are invalid.
    if (
      formData.joiningDate &&
      formData.joiningDate > getToday()
    ) {
      errors.joiningDate = ["Joining date cannot be a future date."];
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setFieldErrors({});

    // Validate every required field together so all errors are shown at once.
    const validationErrors = validateBasicForm();

    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setFormError("Please correct the highlighted fields.");
      return;
    }

    const employeeData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      designation: formData.designation.trim(),
      joiningDate: formData.joiningDate || null,
      status: formData.status,
      panNumber: formData.panNumber.trim(),
      uanNumber: formData.uanNumber.trim(),
      bankAccountNumber: formData.bankAccountNumber.trim(),
      ifscCode: formData.ifscCode.trim(),
      employmentType: formData.employmentType,
      location: formData.location.trim(),
      departmentId: formData.departmentId
      ? Number(formData.departmentId)
      : null,
    };
    try {
      setFormLoading(true);

      if (isEditing) {
        await axiosInstance.put(
          `${API_URL}/employees/${editingEmployeeId}`,
          employeeData
        );
      } else {
        await axiosInstance.post(`${API_URL}/employees`, employeeData);
      }

      await fetchEmployeesOnly();
      closeModal();
    } catch (error) {
      console.error("Save employee error:", error);

      const validationErrors = extractValidationErrors(error);

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        setFormError("Please correct the highlighted fields.");
      } else {
        setFormError(getServerMessage(error));
      }
    } finally {
      setFormLoading(false);
    }
  };

  const fetchEmployeesOnly = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/employees`);
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to refresh employees:", error);
      setPageError(
        error?.response?.data?.message ||
          "Failed to refresh employee records."
      );
    }
  };

  const handleDelete = async (employeeId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      setPageError("");
      await axiosInstance.delete(`${API_URL}/employees/${employeeId}`);
      await fetchEmployeesOnly();
    } catch (error) {
      console.error("Delete employee error:", error);
      setPageError(
        error?.response?.data?.message ||
          "Failed to delete employee."
      );
    }
  };

  const startRecord =
    sortedEmployees.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endRecord = Math.min(
    currentPage * pageSize,
    sortedEmployees.length
  );

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisible / 2)
    );

    let endPage = Math.min(
      totalPages,
      startPage + maxVisible - 1
    );

    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let page = startPage; page <= endPage; page++) {
      pages.push(page);
    }

    return pages;
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 pb-2">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
      {/* HEADER */}
      <div className="flex shrink-0 flex-col gap-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            Employee Management
          </h1>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          + Add Employee
        </button>
      </div>

      {/* PAGE ERROR */}
      {pageError && (
        <div
          role="alert"
          className="flex shrink-0 items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3"
        >
          <p className="text-sm font-medium text-red-600">
            {pageError}
          </p>
          <button
            type="button"
            onClick={loadData}
            className="shrink-0 text-sm font-medium text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      
      
    
      <div className="shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">

    {/* SEARCH */}
    <div className="sm:col-span-2 lg:col-span-2 xl:col-span-2">
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Search
      </label>

      <input
        type="text"
        placeholder="Search code, name, email, phone, designation..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      />
    </div>

    {/* DEPARTMENT */}
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Department
      </label>

      <select
        value={departmentFilter}
        onChange={(event) => setDepartmentFilter(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">All Departments</option>

        {departments.map((department) => (
          <option
            key={department.departmentId}
            value={department.departmentId}
          >
            {department.departmentName}
          </option>
        ))}
      </select>
    </div>

    {/* STATUS */}
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Status
      </label>

      <select
        value={statusFilter}
        onChange={(event) => setStatusFilter(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">All Status</option>
        <option value="ACTIVE">ACTIVE</option>
        <option value="INACTIVE">INACTIVE</option>
      </select>
    </div>

    {/* EMPLOYMENT TYPE */}
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Employment Type
      </label>

      <select
        value={employmentTypeFilter}
        onChange={(event) => setEmploymentTypeFilter(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="">All Employment Types</option>
        <option value="FULL_TIME">Full Time</option>
        <option value="PART_TIME">Part Time</option>
        <option value="CONTRACT">Contract</option>
        <option value="INTERN">Intern</option>
      </select>
    </div>

    {/* SORT */}
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Sort By
      </label>

      <select
        value={sortBy}
        onChange={(event) => setSortBy(event.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
      >
        <option value="codeAsc">Employee Code A-Z</option>
        <option value="codeDesc">Employee Code Z-A</option>
        <option value="nameAsc">Employee Name A-Z</option>
        <option value="nameDesc">Employee Name Z-A</option>
        <option value="joiningNewest">Newest Joining Date</option>
        <option value="joiningOldest">Oldest Joining Date</option>
        <option value="status">Status</option>
      </select>
    </div>

    {/* CLEAR FILTERS */}
    <div className="flex items-end">
      <button
        type="button"
        onClick={clearFilters}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
      >
        Clear Filters
      </button>
    </div>
  </div>
</div>

      {/* TABLE */}
      {loading ? (
        <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="text-xs text-slate-500">
            Loading employees...
          </p>
        </div>
      ) : (
        <div ref={tableRef} className="mt-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm scroll-mt-4">
          <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Employee List
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                {sortedEmployees.length} employee record(s)
              </p>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            <table className="w-full min-w-[980px]">
              <thead className="bg-slate-100">
                <tr>
                  {[
                    "S.No.",
                    "Employee Name",
                    "Department",
                    "Designation",
                    "Email",
                    "Location",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="sticky top-0 z-20 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500 shadow-[0_1px_0_rgba(226,232,240,0.9)]"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((employee, index) => (
                    <tr
                      key={employee.employeeId}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="w-14 whitespace-nowrap px-4 py-2.5 text-center text-xs font-semibold text-slate-400">
                        {(currentPage - 1) * pageSize + index + 1}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-slate-700">
                        <p className="font-medium text-slate-800">
                          {employee.firstName || ""}{" "}
                          {employee.lastName || ""}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-slate-600">
                        {employee.departmentName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-slate-600">
                        {employee.designation || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5 text-sm text-slate-600">
                        {employee.email || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                        {employee.location || "-"}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            String(employee.status || "").toUpperCase() === "ACTIVE"
                              ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {employee.status || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-4 py-2.5">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(employee)}
                            className="rounded-lg border border-indigo-100 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDelete(employee.employeeId)}
                            className="rounded-lg border border-red-100 px-2.5 py-1.5 text-[11px] font-semibold text-red-700 transition hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-10 text-center text-sm text-slate-500"
                    >
                      {search ||
                      departmentFilter ||
                      statusFilter ||
                      employmentTypeFilter ||
                      locationFilter
                        ? "No employees found with the selected filters."
                        : "No employees available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {sortedEmployees.length > 0 && (
            <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-4 py-2.5 lg:flex-row lg:items-center lg:justify-between">
              <div className="text-xs text-slate-500">
                Showing {" "}
                <span className="font-semibold text-slate-800">
                  {startRecord}-{endRecord}
                </span>{" "}
                of {" "}
                <span className="font-semibold text-slate-800">
                  {sortedEmployees.length}
                </span>
              </div>

              <div className="flex items-center justify-center gap-1">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                  aria-label="Previous page"
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span aria-hidden="true">‹</span>
                  <span className="hidden sm:inline">Previous</span>
                </button>

                {renderPageNumbers().map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    aria-current={currentPage === page ? "page" : undefined}
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
                  onClick={() => setCurrentPage((page) => page + 1)}
                  aria-label="Next page"
                  className="inline-flex h-8 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span aria-hidden="true">›</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 lg:justify-end">
                <label
                  htmlFor="employee-page-size"
                  className="text-xs font-medium text-slate-500"
                >
                  Rows
                </label>
                <select
                  id="employee-page-size"
                  value={pageSize}
                  onChange={(event) => setPageSize(Number(event.target.value))}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <span className="text-xs text-slate-400">per page</span>
              </div>
            </div>
          )}
        </div>
      )}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center scroll-smooth justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isEditing ? "Edit Employee" : "Add Employee"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  {isEditing
                    ? "Update employee information" 
                    : "Create a new employee record"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={formLoading}
                className="rounded-lg px-3 py-2 text-2xl text-slate-400 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ×
              </button>
            </div>

            <form
              noValidate
              onSubmit={handleSubmit}
              className="space-y-5 p-5"
            >
              {formError && (
                <div
                  ref={formErrorRef}
                  role="alert"
                  tabIndex={-1}
                  className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 outline-none"
                >
                  <p className="text-sm font-medium text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              <FormSection title="Basic Information">
             

                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Arun"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Kumar"
                  errors={fieldErrors}
                />

                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. arun.kumar@company.com"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="designation"
                  label="Designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="joiningDate"
                  label="Joining Date"
                  type="date"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  required
                  max={getToday()}
                  errors={fieldErrors}
                />
              </FormSection>

              <FormSection title="Employment Information">
                <SelectField
                  name="employmentType"
                  label="Employment Type"
                  value={formData.employmentType}
                  onChange={handleChange}
                  required
                  errors={fieldErrors}
                  options={[
                    { value: "", label: "Select employment type" },
                    { value: "FULL_TIME", label: "Full Time" },
                    { value: "PART_TIME", label: "Part Time" },
                    { value: "CONTRACT", label: "Contract" },
                    { value: "INTERN", label: "Intern" },
                  ]}
                />

                <TextField
                  name="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Trichy"
                  required
                  errors={fieldErrors}
                />

                <SelectField
                  name="departmentId"
                  label="Department"
                  value={formData.departmentId}
                  onChange={handleChange}
                  required
                  errors={fieldErrors}
                  className="md:col-span-2"
                  options={[
                    { value: "", label: "Select department" },
                    ...departments.map((department) => ({
                      value: department.departmentId,
                      label: department.departmentName,
                    })),
                  ]}
                />
              </FormSection>

              <FormSection title="Payment Information">
                <TextField
                  name="panNumber"
                  label="PAN Number"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="e.g. ABCDE1234F"
                  maxLength={10}
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="uanNumber"
                  label="UAN Number"
                  value={formData.uanNumber}
                  onChange={handleChange}
                  placeholder="e.g. 100012345678"
                  errors={fieldErrors}
                />

                <TextField
                  name="bankAccountNumber"
                  label="Bank Account Number"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="e.g. 501234567890"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="ifscCode"
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="e.g. HDFC0001234"
                  maxLength={11}
                  required
                  errors={fieldErrors}
                />
              </FormSection>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Employee"
                    : "Add Employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function FormSection({ title, children }) {
  return (
    <section>
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-600">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

function TextField({
  name,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  max,
  errors,
}) {
  const hasError = Boolean(errors[name]?.length);

  return (
    <div>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>

      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        max={max}
        className={getInputClass(hasError)}
      />

      <FieldError name={name} errors={errors} />
    </div>
  );
}

function SelectField({
  name,
  label,
  value,
  onChange,
  options,
  required = false,
  errors,
  className = "",
}) {
  const hasError = Boolean(errors[name]?.length);

  return (
    <div className={className}>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={getSelectClass(hasError)}
      >
        {options.map((option) => (
          <option key={`${name}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <FieldError name={name} errors={errors} />
    </div>
  );
}

export default EmployeeManagement;
