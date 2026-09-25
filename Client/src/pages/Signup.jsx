import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";

const Signup = () => {
  const navigate = useNavigate();

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    employeeCode: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // =========================================================
  // UI STATES
  // =========================================================

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear only this field's error
    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    // Clear general backend error when user starts correcting
    setServerError("");

    // Clear success message
    setSuccessMessage("");

    // ---------------------------------------------------------
    // Live confirm password validation
    // ---------------------------------------------------------

    if (name === "confirmPassword") {
      if (!value) {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "Please confirm your password.",
        }));
      } else if (value !== formData.password) {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "Passwords do not match.",
        }));
      }
    }

    // ---------------------------------------------------------
    // Live password validation
    // ---------------------------------------------------------

    if (name === "password") {
      if (!value) {
        setErrors((previous) => ({
          ...previous,
          password: "Password is required.",
        }));
      } else if (value.length < 8) {
        setErrors((previous) => ({
          ...previous,
          password: "Password must be at least 8 characters.",
        }));
      }

      // Re-check confirm password if user changes password
      if (
        formData.confirmPassword &&
        value !== formData.confirmPassword
      ) {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "Passwords do not match.",
        }));
      } else if (
        formData.confirmPassword &&
        value === formData.confirmPassword
      ) {
        setErrors((previous) => ({
          ...previous,
          confirmPassword: "",
        }));
      }
    }
  };

  // =========================================================
  // FRONTEND VALIDATION
  // =========================================================

  const validateForm = () => {
    const newErrors = {};

    const employeeCode = formData.employeeCode.trim();
    const email = formData.email.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;

    // =======================================================
    // EMPLOYEE CODE
    // =======================================================

    if (!employeeCode) {
      newErrors.employeeCode = "Employee code is required.";
    } else if (!/^EMP-\d+$/i.test(employeeCode)) {
      newErrors.employeeCode =
        "Employee code must be in the format EMP-1001.";
    }

    // =======================================================
    // EMAIL
    // =======================================================

    if (!email) {
      newErrors.email = "Email is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      newErrors.email = "Enter a valid email address.";
    }

    // =======================================================
    // PASSWORD
    // =======================================================

    if (!password) {
      newErrors.password = "Password is required.";
    } else if (password.length < 8) {
      newErrors.password =
        "Password must be at least 8 characters.";
    } else if (password.length > 100) {
      newErrors.password =
        "Password cannot exceed 100 characters.";
    }

    // =======================================================
    // CONFIRM PASSWORD
    // =======================================================

    if (!confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your password.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // =========================================================
  // HANDLE SUBMIT
  // =========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Clear previous messages
    setServerError("");
    setSuccessMessage("");

    // Run frontend validation
    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/signup",
        {
          employeeCode: formData.employeeCode.trim(),
          email: formData.email.trim(),
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }
      );

      // =====================================================
      // SUCCESS
      // =====================================================

      const message =
        response.data?.message ||
        "Account created successfully. You can now login.";

      setSuccessMessage(message);

      // Clear form
      setFormData({
        employeeCode: "",
        email: "",
        password: "",
        confirmPassword: "",
      });

      setErrors({});

      // Redirect to login
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (error) {
      console.error("Signup failed:", error);

      const responseData = error.response?.data;

      // =====================================================
      // CLEAR PREVIOUS ERRORS
      // =====================================================

      setErrors({});
      setServerError("");

      // =====================================================
      // CASE 1:
      // Spring validation errors
      //
      // Example:
      // {
      //   "errors": {
      //      "email": "Enter a valid email"
      //   }
      // }
      // =====================================================

      if (responseData?.errors) {
        const backendErrors = {};

        Object.entries(responseData.errors).forEach(
          ([field, message]) => {
            backendErrors[field] = Array.isArray(message)
              ? message[0]
              : message;
          }
        );

        setErrors(backendErrors);

        // If there are field errors, don't show generic error
        // at the top unless there is also a message.
        if (responseData?.message) {
          setServerError(responseData.message);
        }

        return;
      }

      // =====================================================
      // CASE 2:
      // Spring validation may return field errors directly
      //
      // Example:
      // {
      //   "employeeCode": "Employee code is required",
      //   "email": "Enter a valid email"
      // }
      // =====================================================

      const possibleFields = [
        "employeeCode",
        "email",
        "password",
        "confirmPassword",
      ];

      const directFieldErrors = {};

      possibleFields.forEach((field) => {
        if (responseData?.[field]) {
          directFieldErrors[field] =
            Array.isArray(responseData[field])
              ? responseData[field][0]
              : responseData[field];
        }
      });

      if (Object.keys(directFieldErrors).length > 0) {
        setErrors(directFieldErrors);

        if (responseData?.message) {
          setServerError(responseData.message);
        }

        return;
      }

      // =====================================================
      // CASE 3:
      // RuntimeException from AuthService
      //
      // Example:
      // "Employee not found. Please contact HR."
      //
      // "Employee code and registered email do not match"
      //
      // "An account already exists for this employee"
      // =====================================================

      if (responseData?.message) {
        setServerError(responseData.message);
        return;
      }

      // =====================================================
      // CASE 4:
      // Backend returned plain text
      // =====================================================

      if (typeof responseData === "string") {
        setServerError(responseData);
        return;
      }

      // =====================================================
      // CASE 5:
      // Specific HTTP status messages
      // =====================================================

      if (error.response?.status === 400) {
        setServerError(
          "Invalid signup details. Please check your information."
        );
        return;
      }

      if (error.response?.status === 401) {
        setServerError(
          "You are not authorized to create this account."
        );
        return;
      }

      if (error.response?.status === 403) {
        setServerError(
          "You do not have permission to create this account."
        );
        return;
      }

      if (error.response?.status === 404) {
        setServerError(
          "The requested signup service was not found."
        );
        return;
      }

      if (error.response?.status === 409) {
        setServerError(
          "An account already exists for this employee."
        );
        return;
      }

      if (error.response?.status >= 500) {
        setServerError(
          "Server error. Please try again later."
        );
        return;
      }

      // =====================================================
      // CASE 6:
      // Network error
      // =====================================================

      if (!error.response) {
        setServerError(
          "Unable to connect to the server. Please check your connection."
        );
        return;
      }

      // =====================================================
      // FALLBACK
      // =====================================================

      setServerError(
        "Unable to create account. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INPUT CLASS
  // =========================================================

  const inputClass = (field) =>
    `w-full rounded-xl border px-4 py-3 text-sm text-slate-800 outline-none transition
    placeholder:text-slate-400
    focus:ring-2
    disabled:bg-slate-100
    ${
      errors[field]
        ? "border-red-400 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-green-600 focus:ring-green-100"
    }`;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <div className="hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">

          <div>

            {/* BRAND */}

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl">

                <img
                  src="/src/assets/logo.png"
                  alt="ABC Logo"
                  className="h-12 w-12 object-contain"
                />

              </div>

              <div>

                <h1 className="text-xl font-bold text-white">
                  ABC PVT.LTD
                </h1>

                <p className="text-xs text-slate-400">
                  Management Portal
                </p>

              </div>

            </div>

            {/* CONTENT */}

            <div className="mt-20 max-w-md">

              <p className="text-sm font-medium text-green-400">
                EMPLOYEE PAYROLL MANAGEMENT
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
                Create your secure employee account.
              </h2>

              <p className="mt-6 text-base leading-7 text-slate-400">
                Activate your payroll system account using
                your registered employee code and company
                email address.
              </p>

              {/* STEPS */}

              <div className="mt-10 space-y-5">

                <div className="flex gap-4">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    1
                  </div>

                  <div>

                    <p className="font-medium text-white">
                      Verify employee details
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Use the employee code and email
                      registered by HR.
                    </p>

                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    2
                  </div>

                  <div>

                    <p className="font-medium text-white">
                      Create password
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Your password is securely stored using
                      BCrypt hashing.
                    </p>

                  </div>

                </div>

                <div className="flex gap-4">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    3
                  </div>

                  <div>

                    <p className="font-medium text-white">
                      Login securely
                    </p>

                    <p className="mt-1 text-sm text-slate-500">
                      Login and receive your JWT authentication
                      token.
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          <div className="text-xs text-slate-500">
            Secure employee payroll management system
          </div>

        </div>

        {/* =================================================
            RIGHT PANEL
        ================================================= */}

        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl">

                <img
                  src="/src/assets/logo.png"
                  alt="ABC Logo"
                  className="h-11 w-11 object-contain"
                />

              </div>

              <div>

                <h1 className="text-lg font-bold text-slate-800">
                  ABC PVT.LTD
                </h1>

                <p className="text-xs text-slate-500">
                  Employee Payroll Management
                </p>

              </div>

            </div>

            {/* SIGNUP CARD */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-8">

              {/* TITLE */}

              <div className="mb-7">

                <h2 className="text-2xl font-bold text-slate-800">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Use the employee details provided by your
                  organization to activate your account.
                </p>

              </div>

              {/* =================================================
                  SERVER ERROR
              ================================================= */}

              {serverError && (

                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >

                  <div className="flex items-start gap-3">

                    <span className="mt-0.5 text-red-600">
                      ⚠
                    </span>

                    <div>

                      <p className="text-sm font-semibold text-red-700">
                        Unable to create account
                      </p>

                      <p className="mt-1 text-sm text-red-600">
                        {serverError}
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* =================================================
                  SUCCESS
              ================================================= */}

              {successMessage && (

                <div
                  role="status"
                  className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                >

                  <div className="flex items-start gap-3">

                    <span className="mt-0.5 text-green-600">
                      ✓
                    </span>

                    <div>

                      <p className="text-sm font-semibold text-green-700">
                        Account created successfully
                      </p>

                      <p className="mt-1 text-sm text-green-600">
                        {successMessage}
                      </p>

                    </div>

                  </div>

                </div>

              )}

              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
              >

                {/* =================================================
                    EMPLOYEE CODE
                ================================================= */}

                <div>

                  <label
                    htmlFor="employeeCode"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Employee Code
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="employeeCode"
                    name="employeeCode"
                    type="text"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    placeholder="EMP-1001"
                    autoComplete="username"
                    disabled={loading}
                    className={inputClass("employeeCode")}
                  />

                  {errors.employeeCode && (

                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.employeeCode}
                    </p>

                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    Use the employee code provided by HR.
                  </p>

                </div>

                {/* =================================================
                    EMAIL
                ================================================= */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Registered Email
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your company email"
                    autoComplete="email"
                    disabled={loading}
                    className={inputClass("email")}
                  />

                  {errors.email && (

                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.email}
                    </p>

                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    This must match the email registered with
                    your employee record.
                  </p>

                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      name="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      disabled={loading}
                      className={`${inputClass(
                        "password"
                      )} pr-20`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 hover:text-green-800"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                  {errors.password && (

                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.password}
                    </p>

                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    Password must contain at least 8 characters.
                  </p>

                </div>

                {/* =================================================
                    CONFIRM PASSWORD
                ================================================= */}

                <div>

                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm Password
                    <span className="ml-1 text-red-500">
                      *
                    </span>
                  </label>

                  <div className="relative">

                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={
                        showConfirmPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      autoComplete="new-password"
                      disabled={loading}
                      className={`${inputClass(
                        "confirmPassword"
                      )} pr-20`}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-green-600 hover:text-green-800"
                    >
                      {showConfirmPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                  {errors.confirmPassword && (

                    <p
                      role="alert"
                      className="mt-1.5 text-xs font-medium text-red-600"
                    >
                      {errors.confirmPassword}
                    </p>

                  )}

                </div>

                {/* =================================================
                    SECURITY INFORMATION
                ================================================= */}

                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                  <p className="text-xs leading-5 text-slate-500">
                    Your password is securely encrypted before
                    it is stored. Your account role is managed
                    by the organization.
                  </p>

                </div>

                {/* =================================================
                    SIGNUP BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-green-700 px-5 py-3 font-semibold text-white transition hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-300 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Creating account..."
                    : "Create Account"}

                </button>

              </form>

              {/* =================================================
                  LOGIN
              ================================================= */}

              <div className="mt-6 border-t border-slate-200 pt-5">

                <p className="text-center text-sm text-slate-500">

                  Already have an account?{" "}

                  <Link
                    to="/login"
                    className="font-semibold text-green-700 hover:text-green-800"
                  >
                    Sign in
                  </Link>

                </p>

              </div>

            </div>

            {/* FOOTER */}

            <p className="mt-6 text-center text-xs text-slate-400">
              Employee Payroll Management System
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Signup;
