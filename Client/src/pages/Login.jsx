import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import axiosInstance from "../services/axiosInstance";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { auth, login } = useAuth();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // IF ALREADY LOGGED IN
  // --------------------------------------------------

useEffect(() => {
  if (!auth?.token) {
    return;
  }

  if (
    auth.role === "EMPLOYEE" &&
    auth.mustChangePassword === true
  ) {
    navigate("/change-password", { replace: true });
    return;
  }

  navigate("/", { replace: true });
}, [auth, navigate]);

  // --------------------------------------------------
  // LOGIN
  // --------------------------------------------------

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    const trimmedIdentifier =
      identifier.trim();

    if (!trimmedIdentifier) {
      setError(
        "Please enter your employee code, mobile number or email."
      );
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await axiosInstance.post(
        "/auth/login",
        {
          identifier: trimmedIdentifier,
          password: password,
        }
      );

      const loginData = response.data;

      if (!loginData?.token) {
        setError(
          "Login response did not contain a valid token."
        );
        return;
      }


      login(loginData);

if (
    loginData.role === "EMPLOYEE" &&
    loginData.mustChangePassword
) {
    navigate("/change-password", {
        replace: true,
    });
} else {
    navigate("/", {
        replace: true,
    });
}
    } catch (error) {
      console.error(
        "Login failed:",
        error
      );

      if (error.response?.status === 401) {
        setError(
          "Invalid login credentials."
        );
      } else if (
        error.response?.data?.message
      ) {
        setError(
          error.response.data.message
        );
      } else if (
        typeof error.response?.data ===
        "string"
      ) {
        setError(
          error.response.data
        );
      } else {
        setError(
          "Unable to login. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =================================================
            LEFT PANEL
        ================================================= */}

        <div className="hidden bg-[#0B1F3A] lg:flex lg:flex-col lg:justify-between lg:p-12">

          <div>

            <div className="flex items-center gap-3">

              <div className="flex h-12 w-12 items-center justify-center rounded-xl  text-xl font-bold text-white">
                <img className="h-12 w-12" src="/src/assets/logo.png" alt="Logo" />
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

              <p className="text-sm font-medium text-indigo-400">
                EMPLOYEE PAYROLL MANAGEMENT
              </p>

              <h2 className="mt-4 text-4xl font-bold leading-tight text-white">
                Manage your workforce and payroll in one place.
              </h2>

              <p className="mt-6 text-base leading-7 text-slate-400">
                Manage employees, salary structures,
                attendance, payroll processing and
                payslips through a single system.
              </p>

            </div>

          </div>

          <div className="text-xs text-slate-500">
            Secure employee payroll management system
          </div>

        </div>
    
        {/* =================================================
            RIGHT LOGIN PANEL
        ================================================= */}

        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">

            {/* MOBILE BRAND */}

            <div className="mb-8 flex items-center gap-3 lg:hidden">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-600 font-bold text-white">
                P
              </div>

              <div>

                <h1 className="text-lg font-bold text-slate-800">
                  Payroll System
                </h1>

                <p className="text-xs text-slate-500">
                  Employee Management
                </p>

              </div>

            </div>

            {/* LOGIN CARD */}

            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-8">

              {/* TITLE */}

              <div className="mb-7">

                <h2 className="text-2xl font-bold text-slate-800">
                  Welcome back
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Sign in to access your payroll dashboard.
                </p>

              </div>

              {/* ERROR */}

              {error && (
                <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                  <p className="text-sm font-medium text-red-700">
                    {error}
                  </p>

                </div>
              )}

              {/* FORM */}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* IDENTIFIER */}

                <div>

                  <label
                    htmlFor="identifier"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Login ID
                  </label>

                  <input
                    id="identifier"
                    type="text"
                    value={identifier}
                    onChange={(event) =>
                      setIdentifier(
                        event.target.value
                      )
                    }
                    placeholder="Employee Code, Mobile or Email"
                    autoComplete="username"
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                  />

                  <p className="mt-2 text-xs text-slate-400">
                    You can use any one of your registered login identifiers.
                  </p>

                </div>

                {/* PASSWORD */}

                <div>

                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 px-4 py-3 pr-20 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-green-600 focus:ring-2 focus:ring-green-100 disabled:bg-slate-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      disabled={loading}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      {showPassword
                        ? "Hide"
                        : "Show"}
                    </button>

                  </div>

                </div>

                {/* LOGIN BUTTON */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-indigo-700 px-5 py-3 font-semibold text-white transition hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? "Signing in..."
                    : "Sign In"}
                </button>

              </form>

              {/* NO SIGN UP */}

              <div className="mt-6 border-t border-slate-200 pt-5">

                <p className="text-center text-xs leading-5 text-slate-400">
                  Login access is provided by the system administrator.
                  <br />
                  There is no self-registration.
                </p>

              </div>

            </div>

            {/* <div className="mt-6 border-t border-slate-200 pt-5">

  <p className="text-center text-sm text-slate-500">
    Don't have an account?{" "}

    <Link
      to="/signup"
      className="font-semibold text-green-700 hover:text-green-800"
    >
      Create Account
    </Link>
  </p>

              </div> */}

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

export default Login;