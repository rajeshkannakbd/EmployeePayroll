import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";

const ChangePassword = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setServerError("");
    setSuccessMessage("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required.";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword =
        "New password must be at least 8 characters.";
    } else if (formData.newPassword.length > 100) {
      newErrors.newPassword =
        "New password cannot exceed 100 characters.";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        "Please confirm your new password.";
    } else if (
      formData.newPassword !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setServerError("");
    setSuccessMessage("");

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/change-password",
        {
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }
      );

      const message =
        response.data?.message ||
        "Password changed successfully.";

      setSuccessMessage(message);

      // Keep the same JWT/session but mark first-login
      // password change as completed in frontend auth state.
      if (auth) {
        login({
          ...auth,
          mustChangePassword: false,
        });
      }

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1000);
    } catch (error) {
      console.error("Change password failed:", error);

      const responseData = error.response?.data;

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

        if (responseData.message) {
          setServerError(responseData.message);
        }
      } else if (responseData?.message) {
        setServerError(responseData.message);
      } else if (typeof responseData === "string") {
        setServerError(responseData);
      } else {
        setServerError(
          "Unable to change password. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (name) =>
    `w-full rounded-xl border ${
      errors[name]
        ? "border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-100"
        : "border-slate-300 focus:border-[#1BBD36] focus:ring-[#1BBD36]/10"
    } px-4 py-3 pr-20 text-sm text-slate-800 outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100`;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT PANEL */}
        <div className="hidden bg-slate-900 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
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

            <div className="mt-20 max-w-md">
              <p className="text-sm font-medium text-green-400">
                SECURITY UPDATE
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
                Set a new password to continue securely.
              </h2>

              <p className="mt-6 text-base leading-7 text-slate-400">
                Your account was created with a temporary password.
                You must change it before accessing the payroll system.
              </p>

              <div className="mt-10 space-y-5">
                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    1
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Enter temporary password
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Use the password provided by your organization.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    2
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Create your password
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Choose a password of at least 8 characters.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                    3
                  </div>

                  <div>
                    <p className="font-medium text-white">
                      Continue to payroll
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      After the password is changed, your dashboard
                      becomes available.
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

        {/* RIGHT PANEL */}
        <div className="flex items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">

            {/* BRAND */}
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

            {/* CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-8">

              <div className="mb-7">
                <h2 className="text-2xl font-bold text-slate-800">
                  Change your password
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  This is required before you can continue to your
                  payroll dashboard.
                </p>
              </div>

              {serverError && (
                <div
                  role="alert"
                  className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-red-700">
                    Unable to change password
                  </p>

                  <p className="mt-1 text-sm text-red-600">
                    {serverError}
                  </p>
                </div>
              )}

              {successMessage && (
                <div
                  role="status"
                  className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3"
                >
                  <p className="text-sm font-semibold text-green-700">
                    Password updated
                  </p>

                  <p className="mt-1 text-sm text-green-600">
                    {successMessage}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                noValidate
                className="space-y-5"
              >

                {/* CURRENT PASSWORD */}
                <div>
                  <label
                    htmlFor="currentPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Current Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type={
                        showCurrentPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.currentPassword}
                      onChange={handleChange}
                      placeholder="Enter temporary password"
                      autoComplete="current-password"
                      disabled={loading}
                      className={inputClass("currentPassword")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowCurrentPassword(
                          !showCurrentPassword
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1BBD36] hover:text-[#159A2C]"
                    >
                      {showCurrentPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.currentPassword && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* NEW PASSWORD */}
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    New Password
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={
                        showNewPassword
                          ? "text"
                          : "password"
                      }
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Enter a new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className={inputClass("newPassword")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowNewPassword(!showNewPassword)
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1BBD36] hover:text-[#159A2C]"
                    >
                      {showNewPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.newPassword && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.newPassword}
                    </p>
                  )}

                  <p className="mt-1.5 text-xs text-slate-400">
                    Password must contain at least 8 characters.
                  </p>
                </div>

                {/* CONFIRM PASSWORD */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Confirm New Password
                    <span className="ml-1 text-red-500">*</span>
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
                      placeholder="Re-enter your new password"
                      autoComplete="new-password"
                      disabled={loading}
                      className={inputClass("confirmPassword")}
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(
                          !showConfirmPassword
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#1BBD36] hover:text-[#159A2C]"
                    >
                      {showConfirmPassword ? "Hide" : "Show"}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <p className="mt-1.5 text-xs font-medium text-red-600">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* SECURITY NOTE */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs leading-5 text-slate-500">
                    Your new password is securely encrypted before it
                    is stored. You will use the new password for future
                    logins.
                  </p>
                </div>

                {/* SUBMIT */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1BBD36] px-5 py-3 font-semibold text-white transition hover:bg-[#159A2C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Changing password..."
                    : "Change Password"}
                </button>

              </form>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              Employee Payroll Management System
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChangePassword;
