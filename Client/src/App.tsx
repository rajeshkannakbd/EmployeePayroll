import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import EmployeeManagement from "./pages/EmployeeManagement";
import SalaryStructure from "./pages/SalaryStructure";
import AttendanceManagement from "./pages/AttendanceManagement";
import GeneratePayroll from "./pages/GeneratePayroll";
import PayrollHistory from "./pages/PayrollHistory";
import Payslip from "./pages/Payslip";
import DepartmentManagement from "./pages/DepartmentManagement"
import EmployeeAttendance from "./pages/EmployeeAttendance";
import EmployeePayrollHistory from "./pages/EmployeePayrollHistory";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>

          {/* =================================================
              PUBLIC ROUTE
          ================================================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* =================================================
              PROTECTED ROUTES
          ================================================= */}

          <Route element={<ProtectedRoute />}>

            {/* DASHBOARD LAYOUT */}

            <Route element={<DashboardLayout />}>

              <Route
                path="/"
                element={<Dashboard />}
              />

              <Route
                path="/employees"
                element={<EmployeeManagement />}
              />

              <Route
                path="/salary-structure"
                element={<SalaryStructure />}
              />

              <Route
                path="/attendance"
                element={<AttendanceManagement />}
              />
              <Route
                path="/departments"
                element={<DepartmentManagement />}
              />
              <Route
    path="/my-attendance"
    element={<EmployeeAttendance />}
/>

<Route
    path="/my-payroll"
    element={<EmployeePayrollHistory />}
/>
              <Route
                path="/payroll/generate"
                element={<GeneratePayroll />}
              />

              <Route
                path="/payroll/history"
                element={<PayrollHistory />}
              />

            </Route>

            {/* PAYSLIP */}

            <Route
              path="/payslip/:payrollId"
              element={<Payslip />}
            />

          </Route>

          {/* UNKNOWN ROUTE */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;