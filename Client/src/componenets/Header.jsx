import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../services/axiosInstance";

const Header = () => {
  const { auth, logout } = useAuth();

  const [showProfile, setShowProfile] = useState(false);
  const [employee, setEmployee] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      let response;

      if (auth?.role === "EMPLOYEE") {
        response = await axios.get("/employees/me");
      } else {
        response = await axios.get(
          `/employees/${auth?.employeeId}`
        );
      }

      setEmployee(response.data);
    } catch (error) {
      console.error("Profile loading error:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load employee details."
      );
    } finally {
      setLoading(false);
    }
  };

  const openProfile = () => {
    setShowProfile(true);
    fetchProfile();
  };

  const closeProfile = () => {
    setShowProfile(false);
    setError("");
  };

  const getInitial = () => {
    return (
      auth?.employeeName
        ?.charAt(0)
        ?.toUpperCase() || "U"
    );
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/login");
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">

        <div className="flex h-full items-center justify-between">

          {/* LEFT */}

          <div className="min-w-0">

            <h2 className="truncate text-base font-semibold text-slate-800 sm:text-lg">
               Ambigai Systems - ASPL
            </h2>

            <p className="hidden text-xs text-slate-500 sm:block">
              Employee Payroll Management - Manage employees, attendance and payroll
            </p>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2 sm:gap-4">

            {/* PROFILE */}

            <button
              type="button"
              onClick={openProfile}
              className="flex items-center gap-3 rounded-xl px-2 py-1.5 transition hover:bg-slate-100 sm:px-3"
            >

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                {getInitial()}
              </div>

              <div className="hidden text-left md:block">

                <p className="max-w-[150px] truncate text-sm font-semibold text-slate-800">
                  {auth?.employeeName || "User"}
                </p>

                <p className="text-xs text-slate-500">
                  {auth?.role || "USER"}
                </p>

              </div>

            </button>

            {/* LOGOUT */}

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg px-2 py-2 text-xs font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 sm:px-3 sm:text-sm"
            >
              Logout
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      {showProfile && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">

          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* HEADER */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">

              <div>

                <h2 className="text-xl font-bold text-slate-800">
                  My Profile
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Complete employee information
                </p>

              </div>

              <button
                type="button"
                onClick={closeProfile}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {/* BODY */}

            <div className="p-5 sm:p-6">

              {loading && (
                <div className="py-16 text-center">
                  <p className="text-sm text-slate-500">
                    Loading employee details...
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={fetchProfile}
                    className="mt-2 text-sm font-medium text-red-700 underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              {employee && !loading && !error && (
                <div className="space-y-7">

                  {/* PROFILE SUMMARY */}

                  <div className="rounded-2xl bg-gradient-to-r from-green-50 to-slate-50 p-5 sm:p-6">

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-2xl font-bold text-white">
                        {employee.firstName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div className="flex-1">

                        <h3 className="text-xl font-bold text-slate-800">
                          {employee.firstName}{" "}
                          {employee.lastName}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          {employee.employeeCode}
                        </p>

                      </div>

                      <span
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                          employee.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {employee.status}
                      </span>

                    </div>

                  </div>

                  {/* DETAILS */}

                  <ProfileSection title="Basic Information">

                    <ProfileItem
                      label="Employee ID"
                      value={employee.employeeId}
                    />

                    <ProfileItem
                      label="Employee Code"
                      value={employee.employeeCode}
                    />

                    <ProfileItem
                      label="First Name"
                      value={employee.firstName}
                    />

                    <ProfileItem
                      label="Last Name"
                      value={employee.lastName}
                    />

                    <ProfileItem
                      label="Email"
                      value={employee.email}
                    />

                    <ProfileItem
                      label="Phone"
                      value={employee.phone}
                    />

                  </ProfileSection>

                  <ProfileSection title="Employment Information">

                    <ProfileItem
                      label="Department"
                      value={
                        employee.department
                          ?.departmentName
                      }
                    />

                    <ProfileItem
                      label="Designation"
                      value={employee.designation}
                    />

                    <ProfileItem
                      label="Joining Date"
                      value={employee.joiningDate}
                    />

                    <ProfileItem
                      label="Employment Type"
                      value={employee.employmentType}
                    />

                    <ProfileItem
                      label="Location"
                      value={employee.location}
                    />

                    <ProfileItem
                      label="Status"
                      value={employee.status}
                    />

                  </ProfileSection>

                  <ProfileSection title="Statutory & Payment Information">

                    <ProfileItem
                      label="PAN Number"
                      value={employee.panNumber}
                    />

                    <ProfileItem
                      label="UAN Number"
                      value={employee.uanNumber}
                    />

                    <ProfileItem
                      label="Bank Account"
                      value={employee.bankAccountNumber}
                    />

                    <ProfileItem
                      label="IFSC Code"
                      value={employee.ifscCode}
                    />

                  </ProfileSection>

                  <ProfileSection title="Login Information">

                    <ProfileItem
                      label="Role"
                      value={auth?.role}
                    />

                    <ProfileItem
                      label="Login ID"
                      value={auth?.employeeCode}
                    />

                  </ProfileSection>

                </div>
              )}

            </div>

          </div>

        </div>

      )}
    </>
  );
};

const ProfileSection = ({ title, children }) => {
  return (
    <section>

      <h3 className="mb-4 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>

    </section>
  );
};

const ProfileItem = ({ label, value }) => {
  return (
    <div>

      <p className="text-xs font-medium text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>

    </div>
  );
};

export default Header;  