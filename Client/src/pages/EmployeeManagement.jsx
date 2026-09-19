import React, { useEffect, useMemo, useState } from "react";
import axiosInstance from "../services/axiosInstance";


const API_URL = "http://localhost:8080";

const EMPTY_FORM = {
  employeeCode: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  designation: "",
  joiningDate: "",
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
  "employeeCode",
  "firstName",
  "email",
  "phone",
  "designation",
  "joiningDate",
  "status",
  "departmentId",
  "panNumber",
  "uanNumber",
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
      : "border-slate-300 bg-white focus:border-green-600 focus:ring-2 focus:ring-green-100"
  }`;
}

function getSelectClass(hasError) {
  return `w-full rounded-lg border bg-white px-4 py-2.5 text-sm outline-none transition ${
    hasError
      ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-green-600 focus:ring-2 focus:ring-green-100"
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

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmployeeId, setEditingEmployeeId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);

  const [pageError, setPageError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

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
      setPageError("Failed to load employees or departments.");
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return employees;
    }

    return employees.filter((employee) => {
      const values = [
        employee.employeeCode,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.phone,
        employee.designation,
        employee.location,
        employee.status,
        employee.department?.departmentName,
      ];

      return values.some((value) =>
        String(value || "").toLowerCase().includes(term)
      );
    });
  }, [employees, search]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
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
    setFormData({ ...EMPTY_FORM });
    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  };

  const openEditModal = (employee) => {
    setIsEditing(true);
    setEditingEmployeeId(employee.employeeId);

    setFormData({
      employeeCode: employee.employeeCode || "",
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
    if (!formData.employeeCode.trim()) {
      return "Employee Code is required.";
    }

    if (!formData.departmentId) {
      return "Please select a department.";
    }

    if (!formData.employmentType) {
      return "Employment Type is required.";
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");
    setFieldErrors({});

    const basicError = validateBasicForm();

    if (basicError) {
      setFormError(basicError);
      return;
    }

    const employeeData = {
      employeeCode: formData.employeeCode.trim(),
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
      department: formData.departmentId
        ? {
            departmentId: Number(formData.departmentId),
          }
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
    const response = await axiosInstance.get(`${API_URL}/employees`);
    setEmployees(response.data || []);
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
        error?.response?.data?.message || "Failed to delete employee."
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Employee Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage employee information and records
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-[#1BBD36] hover:bg-[#159A2C] px-5 py-2.5 text-sm font-medium text-white "
        >
          + Add Employee
        </button>
      </div>
      {pageError && (
        <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{pageError}</p>
          <button
            type="button"
            onClick={loadData}
            className="text-sm font-medium text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <input
          type="text"
          placeholder="Search employee..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-md"
        />

        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredEmployees.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {employees.length}
          </span>{" "}
          employees
        </p>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">Loading employees...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-100">
                <tr>
                  {[
                    "Code",
                    "Name",
                    "Department",
                    "Designation",
                    "Email",
                    "Location",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {filteredEmployees.length > 0 ? (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.employeeId} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-slate-800">
                        {employee.employeeCode || "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-700">
                        {employee.firstName || ""} {employee.lastName || ""}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {employee.department?.departmentName || "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {employee.designation || "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {employee.email || "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {employee.location || "-"}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            employee.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {employee.status || "UNKNOWN"}
                        </span>
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(employee)}
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(employee.employeeId)
                            }
                            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
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
                      className="px-6 py-10 text-center text-sm text-slate-500"
                    >
                      {search
                        ? "No employees found matching your search."
                        : "No employees available."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isEditing ? "Edit Employee" : "Add Employee"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? "Update employee information"
                    : "Create a new employee record"}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-3 py-2 text-2xl text-slate-400 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form noValidate onSubmit={handleSubmit} className="space-y-7 p-6">
              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              <FormSection title="Basic Information">
                <TextField
                  name="employeeCode"
                  label="Employee Code"
                  value={formData.employeeCode}
                  onChange={handleChange}
                  placeholder="EMP-1001"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="firstName"
                  label="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Rajesh"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="lastName"
                  label="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Kumar"
                  errors={fieldErrors}
                />

                <TextField
                  name="email"
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="employee@example.com"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="phone"
                  label="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="designation"
                  label="Designation"
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="Software Developer"
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
                  errors={fieldErrors}
                />

                <SelectField
                  name="status"
                  label="Status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  errors={fieldErrors}
                  options={[
                    { value: "ACTIVE", label: "ACTIVE" },
                    { value: "INACTIVE", label: "INACTIVE" },
                  ]}
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
                    { value: "", label: "Select Department" },
                    ...departments.map((department) => ({
                      value: department.departmentId,
                      label: department.departmentName,
                    })),
                  ]}
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
                    { value: "", label: "Select Employment Type" },
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
                  placeholder="Trichy"
                  required
                  errors={fieldErrors}
                />
              </FormSection>

              <FormSection title="Statutory & Payment Information">
                <TextField
                  name="panNumber"
                  label="PAN Number"
                  value={formData.panNumber}
                  onChange={handleChange}
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="uanNumber"
                  label="UAN Number"
                  value={formData.uanNumber}
                  onChange={handleChange}
                  placeholder="100200300400"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="bankAccountNumber"
                  label="Bank Account Number"
                  value={formData.bankAccountNumber}
                  onChange={handleChange}
                  placeholder="123456789012"
                  required
                  errors={fieldErrors}
                />

                <TextField
                  name="ifscCode"
                  label="IFSC Code"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="HDFC0001234"
                  maxLength={11}
                  required
                  errors={fieldErrors}
                />
              </FormSection>

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
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
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-700">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
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
  errors,
}) {
  const hasError = Boolean(errors[name]?.length);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
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
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>

      <select
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
