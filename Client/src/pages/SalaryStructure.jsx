import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

const API_URL = "http://localhost:8080";

const initialForm = {
  employeeId: "",
  basicSalary: "",
  hra: "",
  conveyance: "",
  specialAllowance: "",
  otherAllowance: "",
  epf: "",
  professionalTax: "",
  tds: "",
  otherDeductions: "",
};


// ---------------------------------------------------------
// PRE-BUILT SALARY TEMPLATES
// ---------------------------------------------------------
// These values are example company values.
// Selecting a template only fills the form.
// HR can change any value before saving.
const SALARY_TEMPLATES = [
  {
    id: "trainee",
    name: "Trainee",
    basicSalary: 10000,
    hra: 1500,
    conveyance: 1000,
    specialAllowance: 500,
    otherAllowance: 0,
    epf: 1200,
    professionalTax: 200,
    tds: 0,
    otherDeductions: 0,
  },
  {
    id: "one-year",
    name: "1 Year Experience",
    basicSalary: 15000,
    hra: 2500,
    conveyance: 1500,
    specialAllowance: 1000,
    otherAllowance: 500,
    epf: 1500,
    professionalTax: 200,
    tds: 0,
    otherDeductions: 0,
  },
  {
    id: "two-years",
    name: "2 Years Experience",
    basicSalary: 20000,
    hra: 4000,
    conveyance: 2000,
    specialAllowance: 2000,
    otherAllowance: 1000,
    epf: 1800,
    professionalTax: 200,
    tds: 500,
    otherDeductions: 0,
  },
  {
    id: "three-plus-years",
    name: "3+ Years Experience",
    basicSalary: 30000,
    hra: 6000,
    conveyance: 2500,
    specialAllowance: 3000,
    otherAllowance: 1500,
    epf: 1800,
    professionalTax: 200,
    tds: 1000,
    otherDeductions: 0,
  },
];

const SalaryStructure = () => {
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [showModal, setShowModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState(null);

  const [form, setForm] = useState(initialForm);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // ---------------------------------------------
  // FETCH SALARY STRUCTURES
  // ---------------------------------------------

  const fetchSalaryStructures = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get(
        `${API_URL}/salary-structures`
      );

      setSalaryStructures(response.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch salary structures:",
        error
      );

      setError("Failed to load salary structures.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // FETCH EMPLOYEES
  // ---------------------------------------------

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(
        `${API_URL}/employees`
      );

      setEmployees(response.data || []);
    } catch (error) {
      console.error(
        "Failed to fetch employees:",
        error
      );

      setFormError("Failed to load employees.");
    }
  };

  // ---------------------------------------------
  // INITIAL LOAD
  // ---------------------------------------------

  useEffect(() => {
    fetchSalaryStructures();
    fetchEmployees();
  }, []);

  // ---------------------------------------------
  // INPUT CHANGE
  // ---------------------------------------------

const handleChange = (event) => {
  const { name, value } = event.target;

  setForm((previous) => ({
    ...previous,
    [name]: value,
  }));

  setFormError("");

  setFieldErrors((previous) => {
    const updatedErrors = {
      ...previous,
      [name]: "",
    };

    // Validate negative salary values immediately
    if (
      name !== "employeeId" &&
      value !== "" &&
      Number(value) < 0
    ) {
      updatedErrors[name] = `${formatLabel(name)} cannot be negative`;
    }

    return updatedErrors;
  });
};

  // ---------------------------------------------
  // APPLY SALARY TEMPLATE
  // ---------------------------------------------

  const applySalaryTemplate = (templateId) => {
    setSelectedTemplate(templateId);

    if (!templateId) {
      return;
    }

    const template = SALARY_TEMPLATES.find(
      (item) => item.id === templateId
    );

    if (!template) {
      return;
    }

    setForm((previous) => ({
      ...previous,
      basicSalary: template.basicSalary,
      hra: template.hra,
      conveyance: template.conveyance,
      specialAllowance: template.specialAllowance,
      otherAllowance: template.otherAllowance,
      epf: template.epf,
      professionalTax: template.professionalTax,
      tds: template.tds,
      otherDeductions: template.otherDeductions,
    }));

    setFormError("");
    setFieldErrors({});
  };

  // ---------------------------------------------
  // OPEN ADD
  // ---------------------------------------------

  const openAddModal = () => {
    setIsEditing(false);
    setEditingSalaryId(null);
    setSelectedTemplate("");
    setForm(initialForm);
    setFormError("");
    setFieldErrors({});
    setShowModal(true);
  };

  // ---------------------------------------------
  // OPEN EDIT
  // ---------------------------------------------

const openEditModal = (salary) => {
  setIsEditing(true);
  setEditingSalaryId(salary.salaryId);
  setSelectedTemplate("");

  setForm({
    employeeId: salary.employee?.employeeId
      ? String(salary.employee.employeeId)
      : "",

    basicSalary: salary.basicSalary ?? "",
    hra: salary.hra ?? "",
    conveyance: salary.conveyance ?? "",
    specialAllowance: salary.specialAllowance ?? "",
    otherAllowance: salary.otherAllowance ?? "",

    epf: salary.epf ?? "",
    professionalTax: salary.professionalTax ?? "",
    tds: salary.tds ?? "",
    otherDeductions: salary.otherDeductions ?? "",
  });

  setFormError("");
  setFieldErrors({});
  setShowModal(true);
};

  // ---------------------------------------------
  // CLOSE
  // ---------------------------------------------

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setIsEditing(false);
    setEditingSalaryId(null);
    setSelectedTemplate("");
    setForm(initialForm);
    setFormError("");
    setFieldErrors({});
  };

  // ---------------------------------------------
  // SUBMIT
  // ---------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setFormError("");

    const errors = {};

    if (!form.employeeId) {
      errors.employeeId = "Employee is required";
    }

    const requiredFields = [
      "basicSalary",
    ];

    requiredFields.forEach((field) => {
      if (form[field] === "") {
        errors[field] = `${formatLabel(field)} is required`;
      } else if (Number(form[field]) < 0) {
        errors[field] = `${formatLabel(field)} cannot be negative`;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

const payload = {
   employee: {
    employeeId: Number(form.employeeId),
  },
  basicSalary: Number(form.basicSalary),

  hra: form.hra === "" ? 0 : Number(form.hra),
  conveyance: form.conveyance === "" ? 0 : Number(form.conveyance),
  specialAllowance:
    form.specialAllowance === "" ? 0 : Number(form.specialAllowance),
  otherAllowance:
    form.otherAllowance === "" ? 0 : Number(form.otherAllowance),

  epf: form.epf === "" ? 0 : Number(form.epf),
  professionalTax:
    form.professionalTax === "" ? 0 : Number(form.professionalTax),
  tds: form.tds === "" ? 0 : Number(form.tds),
  otherDeductions:
    form.otherDeductions === "" ? 0 : Number(form.otherDeductions)
};

    try {
      setFormLoading(true);

      if (isEditing) {
        await axiosInstance.put(
          `${API_URL}/salary-structures/${editingSalaryId}`,
          payload
        );
      } else {
        await axiosInstance.post(
          `${API_URL}/salary-structures`,
          payload
        );
      }

      await fetchSalaryStructures();

      closeModal();
    } catch (error) {
      console.error(
        "Failed to save salary structure:",
        error
      );

      const responseData = error.response?.data;

      if (responseData?.errors) {
        const normalizedErrors = {};

        Object.entries(responseData.errors).forEach(
          ([field, messages]) => {
            normalizedErrors[field] = Array.isArray(messages)
              ? messages[0]
              : String(messages);
          }
        );

        setFieldErrors(normalizedErrors);
        setFormError("");
      } else if (responseData?.message) {
        setFormError(responseData.message);
      } else {
        setFormError("Failed to save salary structure.");
      }
    } finally {
      setFormLoading(false);
    }
  };

  // ---------------------------------------------
  // DELETE
  // ---------------------------------------------

  const handleDelete = async (salaryId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this salary structure?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await axiosInstance.delete(
        `${API_URL}/salary-structures/${salaryId}`
      );

      await fetchSalaryStructures();
    } catch (error) {
      console.error(
        "Failed to delete salary structure:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to delete salary structure."
      );
    }
  };

  // ---------------------------------------------
  // SEARCH
  // ---------------------------------------------

  const filteredStructures =
    salaryStructures.filter((salary) => {
      const searchText = search.toLowerCase();

      const employee = salary.employee;

      const employeeCode =
        employee?.employeeCode?.toLowerCase() || "";

      const employeeName =
        `${employee?.firstName || ""} ${
          employee?.lastName || ""
        }`.toLowerCase();

      const designation =
        employee?.designation?.toLowerCase() || "";

      return (
        employeeCode.includes(searchText) ||
        employeeName.includes(searchText) ||
        designation.includes(searchText)
      );
    });

  // ---------------------------------------------
  // TOTAL SALARY
  // ---------------------------------------------

  const getTotalSalary = (salary) => {
    return (
      Number(salary.basicSalary || 0) +
      Number(salary.hra || 0) +
      Number(salary.conveyance || 0) +
      Number(salary.specialAllowance || 0) +
      Number(salary.otherAllowance || 0)
    );
  };

  // ---------------------------------------------
  // CURRENCY
  // ---------------------------------------------

  const formatCurrency = (value) => {
    return Number(value || 0).toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );
  };

  const formatLabel = (field) => {
    const labels = {
      employeeId: "Employee",
      basicSalary: "Basic salary",
      hra: "HRA",
      conveyance: "Conveyance",
      specialAllowance: "Special allowance",
      otherAllowance: "Other allowance",
      epf: "EPF",
      professionalTax: "Professional tax",
      tds: "TDS",
      otherDeductions: "Other deductions",
    };

    return labels[field] || field;
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Salary Structure
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage employee monthly salary components
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-[#1BBD36] hover:bg-[#159A2C] px-5 py-2.5 text-sm font-medium text-white "
        >
          + Add Salary Structure
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
          <p className="text-sm font-medium text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* SEARCH */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <input
            type="text"
            placeholder="Search employee..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 sm:max-w-md"
          />

          <p className="text-sm text-slate-500">
            {filteredStructures.length} salary structure(s)
          </p>

        </div>

      </div>

      {/* TABLE */}
      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading salary structures...
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-slate-100">

                <tr>
                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Employee
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Basic
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    HRA
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Conveyance
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Special
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Other
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Total
                  </th>

                  <th className="px-5 py-4 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Actions
                  </th>
                </tr>

              </thead>

              <tbody className="divide-y divide-slate-200">

                {filteredStructures.length > 0 ? (
                  filteredStructures.map((salary) => (

                    <tr
                      key={salary.salaryId}
                      className="hover:bg-slate-50"
                    >

                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-slate-800">
                          {salary.employee?.firstName}{" "}
                          {salary.employee?.lastName}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {salary.employee?.employeeCode ||
                            "-"}
                        </p>

                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-700">
                        ₹{formatCurrency(salary.basicSalary)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        ₹{formatCurrency(salary.hra)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        ₹{formatCurrency(salary.conveyance)}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        ₹{formatCurrency(
                          salary.specialAllowance
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-sm text-slate-600">
                        ₹{formatCurrency(
                          salary.otherAllowance
                        )}
                      </td>

                      <td className="px-5 py-4 text-right text-sm font-bold text-slate-800">
                        ₹{formatCurrency(
                          getTotalSalary(salary)
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <div className="flex justify-center gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(salary)
                            }
                            className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-medium text-green-600 hover:bg-green-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                salary.salaryId
                              )
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
                      className="px-6 py-12 text-center text-sm text-slate-500"
                    >
                      No salary structures found.
                    </td>
                  </tr>
                )}

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* ==========================================
          ADD / EDIT MODAL
      ========================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {isEditing
                    ? "Edit Salary Structure"
                    : "Add Salary Structure"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Define the employee's monthly salary components
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg px-3 py-2 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-6 p-6"
            >

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                  <p className="text-sm font-medium text-red-600">
                    {formError}
                  </p>
                </div>
              )}

              {/* EMPLOYEE */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Employee
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <select
                  name="employeeId"
                  value={form.employeeId}
                  onChange={handleChange}
                  disabled={isEditing}
                  className={`w-full rounded-lg border ${
                    fieldErrors.employeeId
                      ? "border-red-500 bg-red-50"
                      : "border-slate-300"
                  } bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100`}
                >
                  <option value="">
                    Select Employee
                  </option>

                  {employees.map((employee) => (
                    <option
                      key={employee.employeeId}
                      value={employee.employeeId}
                    >
                      {employee.employeeCode} -{" "}
                      {employee.firstName}{" "}
                      {employee.lastName}
                    </option>
                  ))}
                </select>

                {fieldErrors.employeeId && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {fieldErrors.employeeId}
                  </p>
                )}

                {isEditing && (
                  <p className="mt-1 text-xs text-slate-400">
                    Employee cannot be changed while editing a salary structure.
                  </p>
                )}
              </div>

              {/* SALARY TEMPLATE */}

              {!isEditing && (
                <div className="rounded-xl border border-[#1BBD36]/20 bg-[#1BBD36]/5 p-5">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-slate-700">
                      Quick Salary Template
                    </label>

                    <p className="mt-1 text-xs text-slate-500">
                      Select a predefined salary structure to automatically
                      fill the salary fields. You can edit every value before saving.
                    </p>
                  </div>

                  <select
                    value={selectedTemplate}
                    onChange={(event) =>
                      applySalaryTemplate(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">Select salary template</option>

                    {SALARY_TEMPLATES.map((template) => (
                      <option
                        key={template.id}
                        value={template.id}
                      >
                        {template.name}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs text-slate-400">
                    Trainee is shown first. Template values are examples and
                    can be changed before saving.
                  </p>
                </div>
              )}

              {/* SALARY COMPONENTS */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                <SalaryInput
                  label="Basic Salary"
                  name="basicSalary"
                  value={form.basicSalary}
                  onChange={handleChange}
                  required
                  error={fieldErrors.basicSalary || ""}                />

                <SalaryInput
                  label="HRA"
                  name="hra"
                  value={form.hra}
                  onChange={handleChange}
                  error={fieldErrors.hra || ""}                />

                <SalaryInput
                  label="Conveyance"
                  name="conveyance"
                  value={form.conveyance}
                  onChange={handleChange}
                  error={fieldErrors.conveyance || ""}                />

                <SalaryInput
                  label="Special Allowance"
                  name="specialAllowance"
                  value={form.specialAllowance}
                  onChange={handleChange}
                  error={fieldErrors.specialAllowance || ""}                />

                <SalaryInput
                  label="Other Allowance"
                  name="otherAllowance"
                  value={form.otherAllowance}
                  onChange={handleChange}
                  error={fieldErrors.otherAllowance || ""}                />

                <SalaryInput
                  label="EPF"
                  name="epf"
                  value={form.epf}
                  onChange={handleChange}
                  error={fieldErrors.epf || ""}
                />

                <SalaryInput
                  label="Professional Tax"
                  name="professionalTax"
                  value={form.professionalTax}
                  onChange={handleChange}
                  error={fieldErrors.professionalTax || ""}
                />

                <SalaryInput
                  label="TDS"
                  name="tds"
                  value={form.tds}
                  onChange={handleChange}
                  error={fieldErrors.tds || ""}
                />

                <SalaryInput
                  label="Other Deductions"
                  name="otherDeductions"
                  value={form.otherDeductions}
                  onChange={handleChange}
                  error={fieldErrors.otherDeductions || ""}
                />


              </div>

              {/* PREVIEW */}

              <div className="rounded-xl bg-slate-50 p-5">

                <div className="flex items-center justify-between">

                  <span className="text-sm font-medium text-slate-600">
                    Monthly Salary Structure
                  </span>

                  <span className="text-xl font-bold text-green-700">
                    ₹
                    {formatCurrency(
                      Number(form.basicSalary || 0) +
                        Number(form.hra || 0) +
                        Number(form.conveyance || 0) +
                        Number(
                          form.specialAllowance || 0
                        ) +
                        Number(
                          form.otherAllowance || 0
                        )
                    )}
                  </span>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {formLoading
                    ? "Saving..."
                    : isEditing
                    ? "Update Salary"
                    : "Save Salary"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
};

// ---------------------------------------------
// REUSABLE INPUT
// ---------------------------------------------

const SalaryInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error = "",
}) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && (
          <span className="ml-1 text-red-500">*</span>
        )}
      </label>

      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
          ₹
        </span>

        <input
          type="number"
          name={name}
          value={value}
          onChange={onChange}
          min="0"
          step="0.01"
          placeholder="0.00"
          className={`w-full rounded-lg border ${
            error
              ? "border-red-500 bg-red-50"
              : "border-slate-300"
          } py-3 pl-9 pr-4 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100`}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};


export default SalaryStructure;