import React, { useState } from "react";
import { LogOut, UserCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import axios from "../services/axiosInstance";
import { Users } from "lucide-react";
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
        response = await axios.get(`/employees/${auth?.employeeId}`);
      }

      setEmployee(response.data);
    } catch (fetchError) {
      console.error("Profile loading error:", fetchError);

      setError(
        fetchError.response?.data?.message ||
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
    return auth?.employeeName?.charAt(0)?.toUpperCase() || "U";
  };

  const handleLogout = () => {
    logout();
    window.location.replace("/login");
  };

  return (
    <>
<header className="sticky top-0 z-30 h-16 border-b border-slate-200  bg-white/95 backdrop-blur">
  <div className="flex h-full items-center justify-between px-4 mx-3 sm:px-6">

    {/* LEFT — PAGE TITLE */}
<div className="flex items-center gap-3">
  <span className="h-6 w-1 rounded-full bg-indigo-600"></span>

  <div>
    <h3 className="text-lg font-bold tracking-tight text-slate-800">
      Employee Payroll Management
    </h3>
    <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
      Employee Directory
    </p>
  </div>
</div>
    {/* RIGHT — PROFILE + LOGOUT */}
    <div className="flex items-center gap-2 sm:gap-3">

      {/* PROFILE */}
      <button
        type="button"
        onClick={openProfile}
        className="group flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition hover:bg-slate-50 sm:px-3"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-700 ring-1 ring-indigo-100">
          {getInitial()}
        </div>

        <div className="hidden min-w-0 text-left sm:block">
          <p className="max-w-[170px] truncate text-sm font-semibold text-slate-800">
            {auth?.employeeName || "User"}
          </p>

          <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            {auth?.role || "USER"}
          </p>
        </div>
      </button>

      
      <button
        type="button"
        onClick={handleLogout}
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:text-sm"
      >
        <LogOut size={15} />
        <span>Logout</span>
      </button>

    </div>
  </div>
</header>

      {/* PROFILE MODAL */}
      {showProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {/* MODAL HEADER */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
                  <UserCircle size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    My Profile
                  </h2>
                  <p className="text-xs text-slate-500">
                    {employee
                      ? `${employee.firstName || ""} ${
                          employee.lastName || ""
                        }`.trim()
                      : auth?.employeeName || "User"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeProfile}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close profile"
              >
                ×
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="max-h-[calc(90vh-78px)] overflow-y-auto p-5 scroll-smooth sm:p-6">
              {loading && (
                <div className="py-16 text-center">
                  <p className="text-sm text-slate-500">
                    Loading employee details...
                  </p>
                </div>
              )}

              {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm text-red-700">{error}</p>

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
                <div className="space-y-6">
                  {/* PROFILE SUMMARY */}
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 sm:p-5 smooth-scroll">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">
                        {employee.firstName
                          ?.charAt(0)
                          ?.toUpperCase() || "U"}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-slate-800">
                          {employee.firstName} {employee.lastName}
                        </h3>
                      </div>

                      <span
                        className={`self-start rounded-full px-3 py-1.5 text-xs font-semibold sm:self-center ${
                          employee.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {employee.status || "-"}
                      </span>
                    </div>
                  </div>

                  <ProfileSection title="Basic Information">
                
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
                      value={employee.department?.departmentName}
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
      <h3 className="mb-3 border-b border-slate-200 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
        {title}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {children}
      </div>
    </section>
  );
};

const ProfileItem = ({ label, value }) => {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/60 px-3.5 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-semibold text-slate-700">
        {value || "-"}
      </p>
    </div>
  );
};

export default Header;
