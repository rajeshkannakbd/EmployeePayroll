import React, { useEffect, useState } from "react";
import axiosInstance from "../services/axiosInstance";

const API_URL = "http://localhost:8080";

const emptyForm = {
  employeeId: "",
  payPeriod: "",
  workingDays: "",
  presentDays: "",
  leaveDays: "",
  unpaidLeaveDays: "",
  overtimeHours: "0",
};

const AttendanceManagement = () => {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

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

      setAttendance(response.data);
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

      setEmployees(response.data);
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
  // FORM CHANGE
  // --------------------------------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setFormError("");
    setFieldErrors((previous) => ({
      ...previous,
      [name]: [],
    }));
    setSuccessMessage("");
  };

  // --------------------------------------------------
  // OPEN MODAL
  // --------------------------------------------------

  const openAddModal = () => {
    setFormData(emptyForm);
    setFormError("");
    setFieldErrors({});
    setSuccessMessage("");
    setShowModal(true);
  };

  // --------------------------------------------------
  // CLOSE MODAL
  // --------------------------------------------------

  const closeModal = () => {
    if (formLoading) return;

    setShowModal(false);
    setFormData(emptyForm);
    setFormError("");
    setFieldErrors({});
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
    } px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100`;
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

    const errors = {};

    if (!formData.employeeId) {
      errors.employeeId = ["Employee is required"];
    }

    if (!formData.payPeriod) {
      errors.payPeriod = ["Pay period is required"];
    }

    const workingDays = Number(formData.workingDays);
    const presentDays = Number(formData.presentDays);
    const leaveDays = Number(formData.leaveDays);
    const unpaidLeaveDays = Number(formData.unpaidLeaveDays);
    const overtimeHours = Number(formData.overtimeHours);

    if (formData.workingDays === "") {
      errors.workingDays = ["Attendance days cannot be null"];
    } else if (workingDays <= 0) {
      errors.workingDays = ["Working days must be greater than 0"];
    } else if (workingDays > 31) {
      errors.workingDays = ["Monthly attendance cannot exceed 31 days"];
    }

    if (formData.presentDays === "") {
      errors.presentDays = ["Present days cannot be null"];
    } else if (presentDays <= 0) {
      errors.presentDays = ["Present days must be greater than 0"];
    } else if (presentDays > 31) {
      errors.presentDays = ["Present days cannot exceed 31 days"];
    }

    if (formData.leaveDays === "") {
      errors.leaveDays = ["Leave days cannot be null"];
    } else if (leaveDays <= 0) {
      errors.leaveDays = ["Leave days must be greater than 0"];
    } else if (leaveDays > 31) {
      errors.leaveDays = ["Leave days cannot exceed 31 days"];
    }

    if (formData.unpaidLeaveDays === "") {
      errors.unpaidLeaveDays = ["Unpaid leave days cannot be null"];
    } else if (unpaidLeaveDays <= 0) {
      errors.unpaidLeaveDays = ["Unpaid leave days must be greater than 0"];
    } else if (unpaidLeaveDays > 31) {
      errors.unpaidLeaveDays = ["Unpaid leave days cannot exceed 31 days"];
    }

    if (formData.overtimeHours === "") {
      errors.overtimeHours = ["Overtime hours cannot be null"];
    } else if (overtimeHours <= 0) {
      errors.overtimeHours = ["Overtime hours must be greater than 0"];
    } else if (overtimeHours > 16) {
      errors.overtimeHours = ["Overtime cannot exceed 16 hours"];
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const attendanceData = {
      employeeId: Number(formData.employeeId),
      payPeriod: formData.payPeriod,
      workingDays: Number(formData.workingDays),
      presentDays: Number(formData.presentDays),
      leaveDays: Number(formData.leaveDays),
      unpaidLeaveDays: Number(formData.unpaidLeaveDays),
      overtimeHours:
        formData.overtimeHours === ""
          ? 0
          : Number(formData.overtimeHours),
    };

    try {
      setFormLoading(true);

      await axiosInstance.post(
        `${API_URL}/attendance`,
        attendanceData
      );

      await fetchAttendance();

      setSuccessMessage(
        "Attendance record created successfully."
      );

      setFieldErrors({});
      setFormData(emptyForm);
    } catch (error) {
      console.error("Error creating attendance:", error);

      const responseData = error.response?.data;

      if (responseData?.errors) {
        const normalizedErrors = {};

        Object.entries(responseData.errors).forEach(([field, messages]) => {
          normalizedErrors[field] = Array.isArray(messages)
            ? messages
            : [String(messages)];
        });

        setFieldErrors(normalizedErrors);
        setFormError("");
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
        setFormError(
          "Failed to create attendance record."
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  // --------------------------------------------------
  // SEARCH
  // --------------------------------------------------

  const filteredAttendance = attendance.filter((record) => {
    const searchText = search.toLowerCase();

    const employee = record.employee;

    const employeeCode =
      employee?.employeeCode?.toLowerCase() || "";

    const employeeName =
      `${employee?.firstName || ""} ${
        employee?.lastName || ""
      }`.toLowerCase();

    const payPeriod =
      record.payPeriod?.toLowerCase() || "";

    return (
      employeeCode.includes(searchText) ||
      employeeName.includes(searchText) ||
      payPeriod.includes(searchText)
    );
  });

  // --------------------------------------------------
  // FIND EMPLOYEE
  // --------------------------------------------------

  const getEmployeeName = (employeeId) => {
    const employee = employees.find(
      (item) => item.employeeId === Number(employeeId)
    );

    if (!employee) {
      return "";
    }

    return `${employee.firstName || ""} ${
      employee.lastName || ""
    }`.trim();
  };

  // --------------------------------------------------
  // CALCULATE PRESENT PERCENTAGE
  // --------------------------------------------------

  const getAttendancePercentage = (
    presentDays,
    workingDays
  ) => {
    if (!workingDays || workingDays <= 0) {
      return 0;
    }

    return Math.round(
      (presentDays / workingDays) * 100
    );
  };

  const getCurrentMonth = () => {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
};

const currentMonth = getCurrentMonth();

  return (
    <div className="space-y-6">

      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Attendance Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage employee attendance, leave and overtime
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="rounded-lg bg-[#1BBD36] hover:bg-[#159A2C] px-5 py-2.5 text-sm font-medium text-white transition"
        >
          + Add Attendance
        </button>
      </div>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm font-medium text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={fetchAttendance}
              className="text-sm font-medium text-red-700 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* SEARCH */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search employee or pay period..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <p className="text-sm text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-800">
            {filteredAttendance.length}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-800">
            {attendance.length}
          </span>{" "}
          records
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm text-slate-500">
            Loading attendance...
          </p>
        </div>
      )}

      {/* TABLE */}
      {!loading && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="bg-slate-100">
                <tr>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Employee <span className="text-red-500">*</span>
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Attendance Month
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Working
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Present
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Leave
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Unpaid Leave
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Overtime
                  </th>

                  <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Attendance %
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">

                {filteredAttendance.length > 0 ? (

                  filteredAttendance.map((record) => (

                    <tr
                      key={record.attendanceId}
                      className="transition hover:bg-slate-50"
                    >

                      {/* EMPLOYEE */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-slate-800">
                          {record.employee?.firstName || ""}{" "}
                          {record.employee?.lastName || ""}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {record.employee?.employeeCode || "-"}
                        </p>
                      </td>

                      {/* PERIOD */}
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-medium text-slate-700">
                        {record.payPeriod || "-"}
                      </td>

                      {/* WORKING DAYS */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {record.workingDays ?? 0}
                      </td>

                      {/* PRESENT DAYS */}
                      <td className="px-5 py-4 text-sm font-medium text-green-700">
                        {record.presentDays ?? 0}
                      </td>

                      {/* LEAVE DAYS */}
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {record.leaveDays ?? 0}
                      </td>

                      {/* UNPAID LEAVE */}
                      <td className="px-5 py-4 text-sm font-medium text-red-600">
                        {record.unpaidLeaveDays ?? 0}
                      </td>
        
                      {/* OVERTIME */}
                      <td className="px-5 py-4 text-sm font-medium text-green-400">
                        {record.overtimeHours ?? 0} hrs
                      </td>

                      {/* PERCENTAGE */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-[#1BBD36] "
                              style={{
                                width: `${getAttendancePercentage(
                                  record.presentDays,
                                  record.workingDays
                                )}%`,
                              }}
                            />
                          </div>

                          <span className="text-xs font-medium text-slate-600">
                            {getAttendancePercentage(
                              record.presentDays,
                              record.workingDays
                            )}
                            %
                          </span>

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
                        ? "No attendance records found."
                        : "No attendance records available."}
                    </td>
                  </tr>

                )}

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* ==================================================
          ADD ATTENDANCE MODAL
      ================================================== */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

            {/* HEADER */}

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  Add Attendance
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Record monthly attendance for an employee
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
                <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3">
                  <p className="text-sm font-medium text-green-600">
                    {successMessage}
                  </p>
                </div>
              )}

              {/* EMPLOYEE & PERIOD */}

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                {/* EMPLOYEE */}

                <div className="md:col-span-2">

                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Employee
                  </label>

                  <select
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    className={`w-full rounded-lg border ${getFirstErrorMessage("employeeId") ? "border-red-500 bg-red-50" : "border-slate-300"} bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100`}
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

                   <FieldError name="employeeId" />

                </div>

                {/* PAY PERIOD */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
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

                  <p className="mt-1 text-xs text-slate-400">
                    Format: YYYY-MM
                  </p>
                </div>

                {/* WORKING DAYS */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Working Days <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="1"
                    name="workingDays"
                    value={formData.workingDays}
                    onChange={handleChange}
                    placeholder="26"
                    className={getInputClassName("workingDays")}
                  />

                  <FieldError name="workingDays" />
                </div>

                {/* PRESENT DAYS */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
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
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Unpaid Leave Days <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    name="unpaidLeaveDays"
                    value={formData.unpaidLeaveDays}
                    onChange={handleChange}
                    placeholder="1"
                    className={getInputClassName("unpaidLeaveDays")}
                  />

                  <FieldError name="unpaidLeaveDays" />

                  <p className="mt-1 text-xs text-slate-400">
                    Used for payroll deduction
                  </p>
                </div>

                {/* OVERTIME */}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Overtime Hours <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    name="overtimeHours"
                    value={formData.overtimeHours}
                    onChange={handleChange}
                    placeholder="10"
                    className={getInputClassName("overtimeHours")}
                  />

                  <FieldError name="overtimeHours" />

                  <p className="mt-1 text-xs text-slate-400">
                    Payroll calculates overtime amount
                  </p>
                </div>

              </div>

              {/* PREVIEW */}

              {formData.workingDays &&
                formData.presentDays !== "" && (
                  <div className="rounded-xl bg-slate-50 p-4">

                    <h3 className="text-sm font-semibold text-slate-700">
                      Attendance Summary
                    </h3>

                    <div className="mt-3 grid grid-cols-2 gap-4 sm:grid-cols-4">

                      <div>
                        <p className="text-xs text-slate-500">
                          Working Days
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-800">
                          {formData.workingDays}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Present
                        </p>

                        <p className="mt-1 text-lg font-bold text-green-600">
                          {formData.presentDays}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          Leave
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-700">
                          {formData.leaveDays || 0}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-500">
                          OT Hours
                        </p>

                        <p className="mt-1 text-lg font-bold text-green-600">
                          {formData.overtimeHours || 0}
                        </p>
                      </div>

                    </div>

                  </div>
                )}

              {/* BUTTONS */}

              <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={formLoading}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="rounded-lg bg-[#1BBD36] hover:bg-[#159A2C] px-5 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {formLoading
                    ? "Saving..."
                    : "Save Attendance"}
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