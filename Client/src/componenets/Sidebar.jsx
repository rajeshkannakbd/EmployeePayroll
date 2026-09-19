import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const { auth } = useAuth();

  const role = auth?.role;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/",
      roles: ["ADMIN", "HR", "EMPLOYEE"],
    },
    {
      name: "Employee Management",
      path: "/employees",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "Department Management",
      path: "/departments",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "Salary Structure",
      path: "/salary-structure",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "Attendance Management",
      path: "/attendance",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "Payroll Generation",
      path: "/payroll/generate",
      roles: ["ADMIN", "HR"],
    },
    {
      name: "Payroll History",
      path: "/payroll/history",
      roles: ["ADMIN", "HR"],
    },
  ];

  const visibleItems = menuItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col bg-[#060606] text-white">

      {/* BRAND */}

      <div className="border-b border-slate-800 px-6 py-6 bg-[#060606] text-white">

        <div className="flex items-center gap-3">

          <div className="">
               <img className=" h-11 w-11" src="/src/assets/logo.png" alt="Logo" />
          </div>
          
          <div>
            <h1 className="text-lg font-bold">
              Ambigai Systems
            </h1>

            <p className="text-xs text-slate-500">
              Management Portal
            </p>
          </div>

        </div>

      </div>

      {/* USER */}

      <div className="border-b border-slate-800 px-5 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 font-bold text-green-400">
            {auth?.employeeName
              ?.charAt(0)
              ?.toUpperCase() || "U"}
          </div>

          <div className="min-w-0">

            <p className="truncate text-sm font-semibold text-slate-200">
              {auth?.employeeName || "User"}
            </p>

            <p className="truncate text-xs text-slate-500">
              {auth?.employeeCode || ""}
            </p>

          </div>

        </div>

        <div className="mt-3">

          <span className="inline-flex rounded-full border border-green-500/20 bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-300">
            {role || "USER"}
          </span>

        </div>

      </div>

      {/* NAVIGATION */}

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">

        <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Main Menu
        </p>

        {visibleItems.map((item) => (
           
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#1BBD36] text-white shadow-md shadow-green-900/20"
                  : "text-slate-300 hover:bg-slate-900 hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>

        ))}

      </nav>

      {/* FOOTER */}

      <div className="border-t border-slate-800 px-5 py-4">

        <p className="text-xs text-slate-600">
          Employee Payroll System
        </p>

        <p className="mt-1 text-[11px] text-slate-700">
          Version 1.0
        </p>

      </div>

    </aside>
  );
};

export default Sidebar;