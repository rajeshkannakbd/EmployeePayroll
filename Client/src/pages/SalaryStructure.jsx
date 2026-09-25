import React, { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import axiosInstance from "../services/axiosInstance";

const API_URL = "http://localhost:8080";

const initialSalaryForm = {
  employeeId: "",
  templateId: "",
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

const initialTemplateForm = {
  templateName: "",
  description: "",
  basicSalary: "",
  hra: "",
  conveyance: "",
  specialAllowance: "",
  otherAllowance: "",
  epf: "",
  professionalTax: "",
  tds: "",
  otherDeductions: "",
  active: true,
};

const PAGE_SIZE_OPTIONS = [10, 25, 50];

const MONEY_FIELDS = [
  "basicSalary",
  "hra",
  "conveyance",
  "specialAllowance",
  "otherAllowance",
  "epf",
  "professionalTax",
  "tds",
  "otherDeductions",
];

const TEMPLATE_LABELS = {
  templateName: "Template name",
  description: "Description",
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

const getEmployeeName = (employee) =>
  `${employee?.firstName || ""} ${employee?.lastName || ""}`.trim() ||
  "Unnamed employee";

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getGrossSalary = (salary) =>
  Number(salary?.basicSalary || 0) +
  Number(salary?.hra || 0) +
  Number(salary?.conveyance || 0) +
  Number(salary?.specialAllowance || 0) +
  Number(salary?.otherAllowance || 0);

const getTotalDeductions = (salary) =>
  Number(salary?.epf || 0) +
  Number(salary?.professionalTax || 0) +
  Number(salary?.tds || 0) +
  Number(salary?.otherDeductions || 0);

const getTemplatePayload = (form) => ({
  templateName: form.templateName.trim(),
  description: form.description.trim() || null,
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
    form.otherDeductions === "" ? 0 : Number(form.otherDeductions),
  active: Boolean(form.active),
});

const getSalaryPayload = (form) => ({
  employeeId: Number(form.employeeId),

  templateId: form.templateId
    ? Number(form.templateId)
    : null,

  basicSalary: Number(form.basicSalary),

  hra: form.hra === ""
    ? 0
    : Number(form.hra),

  conveyance: form.conveyance === ""
    ? 0
    : Number(form.conveyance),

  specialAllowance:
    form.specialAllowance === ""
      ? 0
      : Number(form.specialAllowance),

  otherAllowance:
    form.otherAllowance === ""
      ? 0
      : Number(form.otherAllowance),

  epf: form.epf === ""
    ? 0
    : Number(form.epf),

  professionalTax:
    form.professionalTax === ""
      ? 0
      : Number(form.professionalTax),

  tds: form.tds === ""
    ? 0
    : Number(form.tds),

  otherDeductions:
    form.otherDeductions === ""
      ? 0
      : Number(form.otherDeductions),
});

const normalizeApiError = (error, fallback) => {
  const data = error?.response?.data;

  if (data?.errors && typeof data.errors === "object") {
    const fieldErrors = {};
    Object.entries(data.errors).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages)
        ? String(messages[0] || "")
        : String(messages || "");
    });

    return {
      message: data.message || "",
      fieldErrors,
    };
  }

  if (typeof data === "string") {
    return { message: data, fieldErrors: {} };
  }

  return {
    message: data?.message || fallback,
    fieldErrors: {},
  };
};

const validateSalaryForm = (form) => {
  const errors = {};

  if (!form.employeeId) {
    errors.employeeId = "Employee is required";
  }

  if (
    form.basicSalary === "" ||
    Number.isNaN(Number(form.basicSalary))
  ) {
    errors.basicSalary = "Basic salary is required";
  } else if (Number(form.basicSalary) < 0) {
    errors.basicSalary = "Basic salary cannot be negative";
  }

  MONEY_FIELDS.filter((field) => field !== "basicSalary").forEach((field) => {
    if (form[field] !== "" && Number(form[field]) < 0) {
      errors[field] = `${field
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (letter) => letter.toUpperCase())} cannot be negative`;
    }
  });

  return errors;
};

const validateTemplateForm = (form) => {
  const errors = {};

  if (!form.templateName.trim()) {
    errors.templateName = "Template name is required";
  }

  if (
    form.basicSalary === "" ||
    Number.isNaN(Number(form.basicSalary))
  ) {
    errors.basicSalary = "Basic salary is required";
  } else if (Number(form.basicSalary) < 0) {
    errors.basicSalary = "Basic salary cannot be negative";
  }

  MONEY_FIELDS.filter((field) => field !== "basicSalary").forEach((field) => {
    if (form[field] !== "" && Number(form[field]) < 0) {
      errors[field] = `${TEMPLATE_LABELS[field]} cannot be negative`;
    }
  });

  return errors;
};

const SalaryInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  error = "",
  disabled = false,
}) => (
  <div>
    <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-600">
      {label}
      {required && <span className="ml-1 text-red-500">*</span>}
    </label>

    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
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
        disabled={disabled}
        className={`w-full rounded-lg border ${
          error
            ? "border-red-500 bg-red-50"
            : "border-slate-300 bg-white"
        } py-2 pl-7 pr-3 text-sm outline-none transition placeholder:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100`}
      />
    </div>

    {error && (
      <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>
    )}
  </div>
);

const TemplateMoneyGrid = ({ form, fieldErrors, onChange }) => (
  <>
    <div className="mb-3">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">
        Earnings
      </p>
    </div>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <SalaryInput
        label="Basic Salary"
        name="basicSalary"
        value={form.basicSalary}
        onChange={onChange}
        required
        error={fieldErrors.basicSalary || ""}
      />
      <SalaryInput
        label="HRA"
        name="hra"
        value={form.hra}
        onChange={onChange}
        error={fieldErrors.hra || ""}
      />
      <SalaryInput
        label="Conveyance"
        name="conveyance"
        value={form.conveyance}
        onChange={onChange}
        error={fieldErrors.conveyance || ""}
      />
      <SalaryInput
        label="Special Allowance"
        name="specialAllowance"
        value={form.specialAllowance}
        onChange={onChange}
        error={fieldErrors.specialAllowance || ""}
      />
      <SalaryInput
        label="Other Allowance"
        name="otherAllowance"
        value={form.otherAllowance}
        onChange={onChange}
        error={fieldErrors.otherAllowance || ""}
      />
    </div>

    <div className="my-4 border-t border-slate-100" />

    <p className="mb-3 text-[11px] font-bold uppercase tracking-wide text-slate-500">
      Deductions
    </p>

    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <SalaryInput
        label="EPF"
        name="epf"
        value={form.epf}
        onChange={onChange}
        error={fieldErrors.epf || ""}
      />
      <SalaryInput
        label="Professional Tax"
        name="professionalTax"
        value={form.professionalTax}
        onChange={onChange}
        error={fieldErrors.professionalTax || ""}
      />
      <SalaryInput
        label="TDS"
        name="tds"
        value={form.tds}
        onChange={onChange}
        error={fieldErrors.tds || ""}
      />
      <SalaryInput
        label="Other Deductions"
        name="otherDeductions"
        value={form.otherDeductions}
        onChange={onChange}
        error={fieldErrors.otherDeductions || ""}
      />
    </div>
  </>
);

const SalaryPreview = ({ form }) => {
  const gross =
    Number(form.basicSalary || 0) +
    Number(form.hra || 0) +
    Number(form.conveyance || 0) +
    Number(form.specialAllowance || 0) +
    Number(form.otherAllowance || 0);

  const deductions =
    Number(form.epf || 0) +
    Number(form.professionalTax || 0) +
    Number(form.tds || 0) +
    Number(form.otherDeductions || 0);

  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Gross
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">
          ₹{money(gross)}
        </p>
      </div>
      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Deductions
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">
          ₹{money(deductions)}
        </p>
      </div>
      <div className="rounded-lg bg-slate-50 px-3 py-2.5">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Net
        </p>
        <p className="mt-0.5 text-sm font-bold text-slate-800">
          ₹{money(gross - deductions)}
        </p>
      </div>
    </div>
  );
};

const SalaryStructure = () => {
  const [activeTab, setActiveTab] = useState("employees");

  // Employee salary data
  const [salaryStructures, setSalaryStructures] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [salarySearch, setSalarySearch] = useState("");
  const [salaryLoading, setSalaryLoading] = useState(true);
  const [salaryError, setSalaryError] = useState("");
  const [salaryFormError, setSalaryFormError] = useState("");
  const [salaryFieldErrors, setSalaryFieldErrors] = useState({});
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [showSalaryComponents, setShowSalaryComponents] = useState(false);
  const [isEditingSalary, setIsEditingSalary] = useState(false);
  const [editingSalaryId, setEditingSalaryId] = useState(null);
  const [salaryForm, setSalaryForm] = useState(initialSalaryForm);
  const [salaryFormLoading, setSalaryFormLoading] = useState(false);
  const [salaryPage, setSalaryPage] = useState(1);
  const [salaryPageSize, setSalaryPageSize] = useState(10);

  // Template data
  const [templates, setTemplates] = useState([]);
  const [templateSearch, setTemplateSearch] = useState("");
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState("");
  const [templateFormError, setTemplateFormError] = useState("");
  const [templateFieldErrors, setTemplateFieldErrors] = useState({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateForm, setTemplateForm] = useState(initialTemplateForm);
  const [templateFormLoading, setTemplateFormLoading] = useState(false);
  const [templatePage, setTemplatePage] = useState(1);
  const [templatePageSize, setTemplatePageSize] = useState(10);

  const fetchSalaryStructures = async () => {
    try {
      setSalaryLoading(true);
      setSalaryError("");

      const response = await axiosInstance.get(
        `${API_URL}/salary-structures`
      );

      setSalaryStructures(response.data || []);
    } catch (error) {
      console.error("Failed to fetch salary structures:", error);
      setSalaryError(
        error?.response?.data?.message ||
          "Failed to load salary structures."
      );
    } finally {
      setSalaryLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await axiosInstance.get(`${API_URL}/employees`);
      setEmployees(response.data || []);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setSalaryFormError("Failed to load employees.");
    }
  };

  const fetchTemplates = async () => {
    try {
      setTemplateLoading(true);
      setTemplateError("");

      const response = await axiosInstance.get(
        `${API_URL}/salary-templates`
      );

      setTemplates(response.data || []);
    } catch (error) {
      console.error("Failed to fetch salary templates:", error);
      setTemplateError(
        error?.response?.data?.message ||
          "Failed to load salary templates."
      );
    } finally {
      setTemplateLoading(false);
    }
  };

  useEffect(() => {
    fetchSalaryStructures();
    fetchEmployees();
    fetchTemplates();
  }, []);

  const usedEmployeeIds = useMemo(
    () =>
      new Set(
        salaryStructures
          .map((salary) => salary?.employee?.employeeId)
          .filter(Boolean)
      ),
    [salaryStructures]
  );

  const availableEmployees = useMemo(() => {
    if (isEditingSalary) {
      return employees;
    }

    return employees.filter(
      (employee) => !usedEmployeeIds.has(employee.employeeId)
    );
  }, [employees, usedEmployeeIds, isEditingSalary]);

  const filteredStructures = useMemo(() => {
    const text = salarySearch.trim().toLowerCase();

    if (!text) {
      return salaryStructures;
    }

    return salaryStructures.filter((salary) => {
      const employee = salary?.employee;
      const name = getEmployeeName(employee).toLowerCase();
      const code = String(employee?.employeeCode || "").toLowerCase();
      const designation = String(employee?.designation || "").toLowerCase();

      const department =
        typeof employee?.department === "string"
          ? employee.department.toLowerCase()
          : String(
              employee?.department?.departmentName ||
                employee?.departmentName ||
                ""
            ).toLowerCase();

      const templateName = String(
        salary?.template?.templateName || ""
      ).toLowerCase();

      return (
        name.includes(text) ||
        code.includes(text) ||
        designation.includes(text) ||
        department.includes(text) ||
        templateName.includes(text) ||
        String(salary?.basicSalary || "").includes(text)
      );
    });
  }, [salaryStructures, salarySearch]);

  const filteredTemplates = useMemo(() => {
    const text = templateSearch.trim().toLowerCase();

    if (!text) {
      return templates;
    }

    return templates.filter((template) => {
      return (
        String(template?.templateName || "")
          .toLowerCase()
          .includes(text) ||
        String(template?.description || "")
          .toLowerCase()
          .includes(text)
      );
    });
  }, [templates, templateSearch]);

  useEffect(() => {
    setSalaryPage(1);
  }, [salarySearch, salaryPageSize]);

  useEffect(() => {
    setTemplatePage(1);
  }, [templateSearch, templatePageSize]);

  const salaryTotalPages = Math.max(
    1,
    Math.ceil(filteredStructures.length / salaryPageSize)
  );

  const templateTotalPages = Math.max(
    1,
    Math.ceil(filteredTemplates.length / templatePageSize)
  );

  useEffect(() => {
    setSalaryPage((page) => Math.min(page, salaryTotalPages));
  }, [salaryTotalPages]);

  useEffect(() => {
    setTemplatePage((page) => Math.min(page, templateTotalPages));
  }, [templateTotalPages]);

  const paginatedStructures = useMemo(() => {
    const start = (salaryPage - 1) * salaryPageSize;
    return filteredStructures.slice(start, start + salaryPageSize);
  }, [filteredStructures, salaryPage, salaryPageSize]);

  const paginatedTemplates = useMemo(() => {
    const start = (templatePage - 1) * templatePageSize;
    return filteredTemplates.slice(start, start + templatePageSize);
  }, [filteredTemplates, templatePage, templatePageSize]);

  const salaryPageStart =
    filteredStructures.length === 0
      ? 0
      : (salaryPage - 1) * salaryPageSize + 1;

  const salaryPageEnd = Math.min(
    salaryPage * salaryPageSize,
    filteredStructures.length
  );

  const templatePageStart =
    filteredTemplates.length === 0
      ? 0
      : (templatePage - 1) * templatePageSize + 1;

  const templatePageEnd = Math.min(
    templatePage * templatePageSize,
    filteredTemplates.length
  );

  const salaryPages = Array.from(
    { length: salaryTotalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      page === 1 ||
      page === salaryTotalPages ||
      Math.abs(page - salaryPage) <= 1
  );

  const templatePages = Array.from(
    { length: templateTotalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      page === 1 ||
      page === templateTotalPages ||
      Math.abs(page - templatePage) <= 1
  );

  const selectedSalaryEmployee = useMemo(
    () =>
      employees.find(
        (employee) =>
          String(employee.employeeId) === String(salaryForm.employeeId)
      ),
    [employees, salaryForm.employeeId]
  );

  const selectedTemplate = useMemo(
    () =>
      templates.find(
        (template) =>
          String(template.templateId) === String(salaryForm.templateId)
      ),
    [templates, salaryForm.templateId]
  );

  const applyTemplateToSalaryForm = (templateId) => {
    setSalaryForm((previous) => {
      if (!templateId) {
        return {
          ...previous,
          templateId: "",
        };
      }

      const template = templates.find(
        (item) => String(item.templateId) === String(templateId)
      );

      if (!template) {
        return {
          ...previous,
          templateId,
        };
      }

      return {
        ...previous,
        templateId: String(template.templateId),
        basicSalary: template.basicSalary ?? "",
        hra: template.hra ?? "",
        conveyance: template.conveyance ?? "",
        specialAllowance: template.specialAllowance ?? "",
        otherAllowance: template.otherAllowance ?? "",
        epf: template.epf ?? "",
        professionalTax: template.professionalTax ?? "",
        tds: template.tds ?? "",
        otherDeductions: template.otherDeductions ?? "",
      };
    });

    setSalaryFieldErrors({});
    setSalaryFormError("");
  };

  const handleSalaryChange = (event) => {
    const { name, value } = event.target;

    setSalaryForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSalaryFormError("");

    setSalaryFieldErrors((previous) => {
      const updated = {
        ...previous,
        [name]: "",
      };

      if (
        MONEY_FIELDS.includes(name) &&
        value !== "" &&
        Number(value) < 0
      ) {
        updated[name] = `${TEMPLATE_LABELS[name]} cannot be negative`;
      }

      return updated;
    });
  };

  const handleEmployeeSelection = (event) => {
    const employeeId = event.target.value;

    setSalaryForm((previous) => ({
      ...previous,
      employeeId,
    }));

    setSalaryFormError("");
    setSalaryFieldErrors((previous) => ({
      ...previous,
      employeeId: "",
    }));
  };

  const openAddSalaryModal = () => {
    setIsEditingSalary(false);
    setShowSalaryComponents(false);
    setEditingSalaryId(null);
    setSalaryForm(initialSalaryForm);
    setSalaryFormError("");
    setSalaryFieldErrors({});
    setShowSalaryModal(true);
  };

  const openEditSalaryModal = (salary) => {
    setIsEditingSalary(true);
    setShowSalaryComponents(false);
    setEditingSalaryId(salary.salaryId);
    setSalaryForm({
      employeeId: salary?.employee?.employeeId
        ? String(salary.employee.employeeId)
        : "",
      templateId: salary?.template?.templateId
        ? String(salary.template.templateId)
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
    setSalaryFormError("");
    setSalaryFieldErrors({});
    setShowSalaryModal(true);
  };

  const closeSalaryModal = () => {
    if (salaryFormLoading) return;

    setShowSalaryModal(false);
    setShowSalaryComponents(false);
    setIsEditingSalary(false);
    setEditingSalaryId(null);
    setSalaryForm(initialSalaryForm);
    setSalaryFormError("");
    setSalaryFieldErrors({});
  };

  const handleSalarySubmit = async (event) => {
    event.preventDefault();

    const errors = validateSalaryForm(salaryForm);

    if (Object.keys(errors).length > 0) {
      setSalaryFieldErrors(errors);
      setSalaryFormError("Please correct the highlighted fields.");
      return;
    }

    try {
      setSalaryFormLoading(true);
      setSalaryFormError("");
      setSalaryFieldErrors({});

      const payload = getSalaryPayload(salaryForm);

      if (isEditingSalary) {
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
      closeSalaryModal();
    } catch (error) {
      console.error("Failed to save salary structure:", error);

      const normalized = normalizeApiError(
        error,
        "Failed to save salary structure."
      );

      if (Object.keys(normalized.fieldErrors).length > 0) {
        setSalaryFieldErrors(normalized.fieldErrors);
        setSalaryFormError(
          normalized.message || "Please correct the highlighted fields."
        );
      } else {
        setSalaryFormError(normalized.message);
      }
    } finally {
      setSalaryFormLoading(false);
    }
  };

  const handleDeleteSalary = async (salaryId) => {
    const salary = salaryStructures.find(
      (item) => item.salaryId === salaryId
    );

    const confirmed = window.confirm(
      `Delete the salary structure for ${
        getEmployeeName(salary?.employee) || "this employee"
      }?`
    );

    if (!confirmed) return;

    try {
      setSalaryError("");

      await axiosInstance.delete(
        `${API_URL}/salary-structures/${salaryId}`
      );

      await fetchSalaryStructures();
    } catch (error) {
      console.error("Failed to delete salary structure:", error);
      setSalaryError(
        error?.response?.data?.message ||
          "Failed to delete salary structure."
      );
    }
  };

  const handleTemplateChange = (event) => {
    const { name, value } = event.target;

    setTemplateForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setTemplateFormError("");

    setTemplateFieldErrors((previous) => {
      const updated = {
        ...previous,
        [name]: "",
      };

      if (
        MONEY_FIELDS.includes(name) &&
        value !== "" &&
        Number(value) < 0
      ) {
        updated[name] = `${TEMPLATE_LABELS[name]} cannot be negative`;
      }

      return updated;
    });
  };

  const openAddTemplateModal = () => {
    setIsEditingTemplate(false);
    setEditingTemplateId(null);
    setTemplateForm(initialTemplateForm);
    setTemplateFormError("");
    setTemplateFieldErrors({});
    setShowTemplateModal(true);
  };

  const openEditTemplateModal = (template) => {
    setIsEditingTemplate(true);
    setEditingTemplateId(template.templateId);
    setTemplateForm({
      templateName: template?.templateName ?? "",
      description: template?.description ?? "",
      basicSalary: template?.basicSalary ?? "",
      hra: template?.hra ?? "",
      conveyance: template?.conveyance ?? "",
      specialAllowance: template?.specialAllowance ?? "",
      otherAllowance: template?.otherAllowance ?? "",
      epf: template?.epf ?? "",
      professionalTax: template?.professionalTax ?? "",
      tds: template?.tds ?? "",
      otherDeductions: template?.otherDeductions ?? "",
      active: template?.active !== false,
    });
    setTemplateFormError("");
    setTemplateFieldErrors({});
    setShowTemplateModal(true);
  };

  const closeTemplateModal = () => {
    if (templateFormLoading) return;

    setShowTemplateModal(false);
    setIsEditingTemplate(false);
    setEditingTemplateId(null);
    setTemplateForm(initialTemplateForm);
    setTemplateFormError("");
    setTemplateFieldErrors({});
  };

  const handleTemplateSubmit = async (event) => {
    event.preventDefault();

    const errors = validateTemplateForm(templateForm);

    if (Object.keys(errors).length > 0) {
      setTemplateFieldErrors(errors);
      setTemplateFormError("Please correct the highlighted fields.");
      return;
    }

    try {
      setTemplateFormLoading(true);
      setTemplateFormError("");
      setTemplateFieldErrors({});

      const payload = getTemplatePayload(templateForm);

      if (isEditingTemplate) {
        await axiosInstance.put(
          `${API_URL}/salary-templates/${editingTemplateId}`,
          payload
        );
      } else {
        await axiosInstance.post(
          `${API_URL}/salary-templates`,
          payload
        );
      }

      await fetchTemplates();
      closeTemplateModal();
    } catch (error) {
      console.error("Failed to save salary template:", error);

      const normalized = normalizeApiError(
        error,
        "Failed to save salary template."
      );

      if (Object.keys(normalized.fieldErrors).length > 0) {
        setTemplateFieldErrors(normalized.fieldErrors);
        setTemplateFormError(
          normalized.message || "Please correct the highlighted fields."
        );
      } else {
        setTemplateFormError(normalized.message);
      }
    } finally {
      setTemplateFormLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    const template = templates.find(
      (item) => item.templateId === templateId
    );

    const confirmed = window.confirm(
      `Delete salary template "${template?.templateName || "this template"}"?`
    );

    if (!confirmed) return;

    try {
      setTemplateError("");

      await axiosInstance.delete(
        `${API_URL}/salary-templates/${templateId}`
      );

      await fetchTemplates();
      await fetchSalaryStructures();
    } catch (error) {
      console.error("Failed to delete salary template:", error);
      setTemplateError(
        error?.response?.data?.message ||
          "Failed to delete salary template."
      );
    }
  };

  const changeSalaryPage = (page) => {
    setSalaryPage(Math.min(Math.max(page, 1), salaryTotalPages));
  };

  const changeTemplatePage = (page) => {
    setTemplatePage(Math.min(Math.max(page, 1), templateTotalPages));
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden px-3 py-2 sm:px-4">
      <div className="mx-auto flex min-h-0 w-full max-w-[1600px] flex-1 flex-col">
      {/* HEADER */}
      <div className="flex shrink-0 flex-col gap- sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 sm:text-xl">
            Salary Structure
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Manage employee salaries and reusable salary templates.
          </p>
        </div>

        <button
          type="button"
          onClick={
            activeTab === "employees"
              ? openAddSalaryModal
              : openAddTemplateModal
          }
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <Plus size={16} />
          {activeTab === "employees"
            ? "Add Salary Structure"
            : "Add Salary Template"}
        </button>
      </div>

      {/* TABS */}
      <div className="mt-3 flex shrink-0 items-center gap-1 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab("employees")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "employees"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Employee Salaries
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("templates")}
          className={`border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "templates"
              ? "border-indigo-600 text-indigo-600"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          Salary Templates
        </button>
      </div>

      {/* EMPLOYEE SALARIES TAB */}
      {activeTab === "employees" ? (
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          {salaryError && (
            <div className="mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-xs font-medium text-red-700">
                {salaryError}
              </p>
            </div>
          )}

          <div className="mb-2 shrink-0 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={salarySearch}
                  onChange={(event) => setSalarySearch(event.target.value)}
                  placeholder="Search employee, code, designation..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                {salarySearch && (
                  <button
                    type="button"
                    onClick={() => setSalarySearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <span className="text-xs text-slate-500">
                {filteredStructures.length} record
                {filteredStructures.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {salaryLoading ? (
              <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-500">
                Loading salary structures...
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="min-w-[1060px] w-full">
                    <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm">
                      <tr>
                        <th className="w-14 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          S.No.
                        </th>
                        <th className="min-w-[220px] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Employee
                        </th>
                        <th className="min-w-[180px] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Template
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Basic
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Allowances
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Gross
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Deductions
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Net
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {paginatedStructures.length > 0 ? (
                        paginatedStructures.map((salary, index) => {
                          const allowances =
                            Number(salary?.hra || 0) +
                            Number(salary?.conveyance || 0) +
                            Number(salary?.specialAllowance || 0) +
                            Number(salary?.otherAllowance || 0);

                          const gross = getGrossSalary(salary);
                          const deductions = getTotalDeductions(salary);
                          const net = gross - deductions;

                          return (
                            <tr
                              key={salary.salaryId}
                              className="transition hover:bg-slate-50"
                            >
                              <td className="px-3 py-2.5 text-xs font-medium text-slate-500">
                                {(salaryPage - 1) * salaryPageSize +
                                  index +
                                  1}
                              </td>

                              <td className="px-3 py-2.5">
                                <p className="text-sm font-semibold text-slate-800">
                                  {getEmployeeName(salary.employee)}
                                </p>
                                <p className="mt-0.5 text-[11px] text-slate-500">
                                  {salary.employee?.employeeCode || "-"}
                                  {salary.employee?.designation
                                    ? ` • ${salary.employee.designation}`
                                    : ""}
                                </p>
                              </td>

                              <td className="px-3 py-2.5">
                                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                                  {salary?.template?.templateName ||
                                    "Custom Salary"}
                                </span>
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-slate-700">
                                ₹{money(salary.basicSalary)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-slate-600">
                                ₹{money(allowances)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-bold text-slate-800">
                                ₹{money(gross)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-slate-600">
                                ₹{money(deductions)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-bold text-emerald-700">
                                ₹{money(net)}
                              </td>

                              <td className="px-3 py-2.5">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditSalaryModal(salary)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                  >
                                    <Edit2 size={12} />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteSalary(salary.salaryId)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="9"
                            className="px-6 py-14 text-center text-sm text-slate-500"
                          >
                            {salarySearch
                              ? "No salary structures match your search."
                              : "No salary structures found."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={salaryPage}
                  totalPages={salaryTotalPages}
                  pageSize={salaryPageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  pageStart={salaryPageStart}
                  pageEnd={salaryPageEnd}
                  totalItems={filteredStructures.length}
                  onPageChange={changeSalaryPage}
                  onPageSizeChange={setSalaryPageSize}
                />
              </>
            )}
          </div>
        </div>
      ) : (
        /* SALARY TEMPLATES TAB */
        <div className="mt-3 flex min-h-0 flex-1 flex-col">
          {templateError && (
            <div className="mb-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <p className="text-xs font-medium text-red-700">
                {templateError}
              </p>
            </div>
          )}

          <div className="mb-3 shrink-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-md">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  value={templateSearch}
                  onChange={(event) => setTemplateSearch(event.target.value)}
                  placeholder="Search template name or description..."
                  className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-9 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />

                {templateSearch && (
                  <button
                    type="button"
                    onClick={() => setTemplateSearch("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <span className="text-xs text-slate-500">
                {filteredTemplates.length} template
                {filteredTemplates.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {templateLoading ? (
              <div className="flex flex-1 items-center justify-center p-10 text-sm text-slate-500">
                Loading salary templates...
              </div>
            ) : (
              <>
                <div className="min-h-0 flex-1 overflow-auto">
                  <table className="min-w-[1080px] w-full">
                    <thead className="sticky top-0 z-10 bg-slate-100 shadow-sm">
                      <tr>
                        <th className="w-14 px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          S.No.
                        </th>
                        <th className="min-w-[220px] px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Template
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Basic
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Allowances
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Gross
                        </th>
                        <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Deductions
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Status
                        </th>
                        <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-600">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                      {paginatedTemplates.length > 0 ? (
                        paginatedTemplates.map((template, index) => {
                          const gross = getGrossSalary(template);
                          const deductions = getTotalDeductions(template);
                          const allowances =
                            gross - Number(template.basicSalary || 0);

                          return (
                            <tr
                              key={template.templateId}
                              className="transition hover:bg-slate-50"
                            >
                              <td className="px-3 py-2.5 text-xs font-medium text-slate-500">
                                {(templatePage - 1) * templatePageSize +
                                  index +
                                  1}
                              </td>

                              <td className="px-3 py-2.5">
                                <p className="text-sm font-semibold text-slate-800">
                                  {template.templateName}
                                </p>
                                <p className="mt-0.5 max-w-sm truncate text-[11px] text-slate-500">
                                  {template.description || "No description"}
                                </p>
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-medium text-slate-700">
                                ₹{money(template.basicSalary)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-slate-600">
                                ₹{money(allowances)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs font-bold text-slate-800">
                                ₹{money(gross)}
                              </td>

                              <td className="whitespace-nowrap px-3 py-2.5 text-right text-xs text-slate-600">
                                ₹{money(deductions)}
                              </td>

                              <td className="px-3 py-2.5 text-center">
                                <span
                                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    template.active
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  {template.active ? "Active" : "Inactive"}
                                </span>
                              </td>

                              <td className="px-3 py-2.5">
                                <div className="flex justify-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      openEditTemplateModal(template)
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-50"
                                  >
                                    <Edit2 size={12} />
                                    Edit
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleDeleteTemplate(
                                        template.templateId
                                      )
                                    }
                                    className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-[11px] font-semibold text-red-600 transition hover:bg-red-50"
                                  >
                                    <Trash2 size={12} />
                                    Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="8"
                            className="px-6 py-14 text-center text-sm text-slate-500"
                          >
                            {templateSearch
                              ? "No salary templates match your search."
                              : "No salary templates found. Add your first fixed salary template."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  currentPage={templatePage}
                  totalPages={templateTotalPages}
                  pageSize={templatePageSize}
                  pageSizeOptions={PAGE_SIZE_OPTIONS}
                  pageStart={templatePageStart}
                  pageEnd={templatePageEnd}
                  totalItems={filteredTemplates.length}
                  onPageChange={changeTemplatePage}
                  onPageSizeChange={setTemplatePageSize}
                />
              </>
            )}
          </div>
        </div>
      )}

      </div>
      {/* EMPLOYEE SALARY MODAL */}
      {showSalaryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
          <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {isEditingSalary
                    ? "Edit Salary Structure"
                    : "Add Salary Structure"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Select an employee and salary template. Other components stay hidden until you edit them.
                </p>
              </div>

              <button
                type="button"
                onClick={closeSalaryModal}
                disabled={salaryFormLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSalarySubmit}
              noValidate
              className="min-h-0 overflow-y-auto p-5"
            >
              {salaryFormError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                  <p className="text-xs font-medium text-red-700">
                    {salaryFormError}
                  </p>
                </div>
              )}

              {/* COMPACT MAIN FIELDS */}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Employee <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="employeeId"
                    value={salaryForm.employeeId}
                    onChange={handleEmployeeSelection}
                    disabled={isEditingSalary}
                    className={`w-full rounded-lg border ${
                      salaryFieldErrors.employeeId
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300"
                    } bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100`}
                  >
                    <option value="">Select Employee</option>

                    {availableEmployees.map((employee) => (
                      <option
                        key={employee.employeeId}
                        value={employee.employeeId}
                      >
                        {employee.employeeCode || "EMP"} - {getEmployeeName(employee)}
                      </option>
                    ))}
                  </select>

                  {!isEditingSalary && availableEmployees.length === 0 && (
                    <p className="mt-1 text-[11px] text-amber-600">
                      All employees already have a salary structure.
                    </p>
                  )}

                  {salaryFieldErrors.employeeId && (
                    <p className="mt-1 text-[11px] font-medium text-red-600">
                      {salaryFieldErrors.employeeId}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Salary Template
                  </label>

                  <select
                    name="templateId"
                    value={salaryForm.templateId}
                    onChange={(event) =>
                      applyTemplateToSalaryForm(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  >
                    <option value="">Custom salary</option>

                    {templates
                      .filter((template) => template.active !== false)
                      .map((template) => (
                        <option
                          key={template.templateId}
                          value={template.templateId}
                        >
                          {template.templateName}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Basic Salary <span className="text-red-500">*</span>
                  </label>

                  <SalaryInput
                    label=""
                    name="basicSalary"
                    value={salaryForm.basicSalary}
                    onChange={handleSalaryChange}
                    required
                    error={salaryFieldErrors.basicSalary || ""}
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => setShowSalaryComponents((value) => !value)}
                    className="w-full rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
                  >
                    {showSalaryComponents
                      ? "Hide Salary Components"
                      : "Edit Salary Components"}
                  </button>
                </div>
              </div>

              {selectedSalaryEmployee && (
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">
                    {getEmployeeName(selectedSalaryEmployee)}
                  </span>

                  {selectedSalaryEmployee.employeeCode && (
                    <span>{selectedSalaryEmployee.employeeCode}</span>
                  )}

                  {selectedSalaryEmployee.designation && (
                    <span>{selectedSalaryEmployee.designation}</span>
                  )}

                  {selectedTemplate && (
                    <span className="font-medium text-indigo-600">
                      {selectedTemplate.templateName}
                    </span>
                  )}
                </div>
              )}

              {/* COMPACT PREVIEW ALWAYS VISIBLE */}
              <div className="mt-4">
                <SalaryPreview form={salaryForm} />
              </div>

              {/* FULL COMPONENT FORM ONLY AFTER EDIT */}
              {showSalaryComponents && (
                <div className="mt-4 rounded-xl border border-slate-200 p-4">
                  <div className="mb-3">
                    <p className="text-sm font-semibold text-slate-800">
                      Salary Components
                    </p>
                    <p className="mt-0.5 text-[11px] text-slate-500">
                      Edit allowances and deductions. The selected template is only used as the starting values.
                    </p>
                  </div>

                  <TemplateMoneyGrid
                    form={salaryForm}
                    fieldErrors={salaryFieldErrors}
                    onChange={handleSalaryChange}
                  />
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeSalaryModal}
                  disabled={salaryFormLoading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={salaryFormLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {salaryFormLoading
                    ? "Saving..."
                    : isEditingSalary
                    ? "Update Salary"
                    : "Save Salary"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SALARY TEMPLATE MODAL */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
          <div className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3.5">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {isEditingTemplate
                    ? "Edit Salary Template"
                    : "Add Salary Template"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Create reusable fixed salary structures for HR.
                </p>
              </div>

              <button
                type="button"
                onClick={closeTemplateModal}
                disabled={templateFormLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleTemplateSubmit}
              noValidate
              className="min-h-0 overflow-y-auto p-5"
            >
              {templateFormError && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5">
                  <p className="text-xs font-medium text-red-700">
                    {templateFormError}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Template Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    name="templateName"
                    value={templateForm.templateName}
                    onChange={handleTemplateChange}
                    placeholder="e.g. Junior Developer"
                    className={`w-full rounded-lg border ${
                      templateFieldErrors.templateName
                        ? "border-red-500 bg-red-50"
                        : "border-slate-300"
                    } px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100`}
                  />

                  {templateFieldErrors.templateName && (
                    <p className="mt-1 text-[11px] font-medium text-red-600">
                      {templateFieldErrors.templateName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                    Description
                  </label>

                  <input
                    type="text"
                    name="description"
                    value={templateForm.description}
                    onChange={handleTemplateChange}
                    placeholder="Optional description"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 p-4">
                <TemplateMoneyGrid
                  form={templateForm}
                  fieldErrors={templateFieldErrors}
                  onChange={handleTemplateChange}
                />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-3">
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Template status
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    Inactive templates are hidden from the employee assignment
                    dropdown.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setTemplateForm((previous) => ({
                      ...previous,
                      active: !previous.active,
                    }))
                  }
                  className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                    templateForm.active
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {templateForm.active ? "Active" : "Inactive"}
                </button>
              </div>

              <div className="mt-4">
                <SalaryPreview form={templateForm} />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  type="button"
                  onClick={closeTemplateModal}
                  disabled={templateFormLoading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={templateFormLoading}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {templateFormLoading
                    ? "Saving..."
                    : isEditingTemplate
                    ? "Update Template"
                    : "Save Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const Pagination = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions,
  pageStart,
  pageEnd,
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const pages = Array.from(
    { length: totalPages },
    (_, index) => index + 1
  ).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  return (
    <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>Rows per page</span>

        <select
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span className="ml-1">
          {pageStart}-{pageEnd} of {totalItems}
        </span>
      </div>

      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>

        {pages.map((page, index) => {
          const previousPage = pages[index - 1];
          const showEllipsis =
            index > 0 && page - previousPage > 1;

          return (
            <React.Fragment key={page}>
              {showEllipsis && (
                <span className="px-1 text-xs text-slate-400">…</span>
              )}

              <button
                type="button"
                onClick={() => onPageChange(page)}
                className={`min-w-8 rounded-lg px-2 py-1.5 text-xs font-semibold transition ${
                  currentPage === page
                    ? "bg-indigo-600 text-white"
                    : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                }`}
              >
                {page}
              </button>
            </React.Fragment>
          );
        })}

        <button
          type="button"
          disabled={currentPage === totalPages || totalItems === 0}
          onClick={() => onPageChange(currentPage + 1)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SalaryStructure;
