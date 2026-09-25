import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import {
  LayoutDashboard,
  Users,
  Building2,
  PlayCircle,
  CircleDollarSign,
  FileText,
  CalendarDays,
  Clock3,
  UserRound,
  ReceiptText,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

const Sidebar = ({ collapsed, onToggle }) => {
  const { auth } = useAuth();

  const role = auth?.role;

  const sections = [
    {
      title: "CORE",
      items: [
        {
          name: "Dashboard",
          path: "/",
          icon: LayoutDashboard,
          roles: ["ADMIN", "HR", "EMPLOYEE"],
        },
        {
          name: "Employees",
          path: "/employees",
          icon: Users,
          roles: ["ADMIN", "HR"],
        },
        {
          name: "Departments",
          path: "/departments",
          icon: Building2,
          roles: ["ADMIN", "HR"],
        },
      ],
    },

    {
      title: "PAYROLL OPERATIONS",
      items: [
        {
          name: "Run Payroll",
          path: "/payroll/generate",
          icon: PlayCircle,
          roles: ["ADMIN", "HR"],
        },
        {
          name: "Salary Structure",
          path: "/salary-structure",
          icon: CircleDollarSign,
          roles: ["ADMIN", "HR"],
        },
        {
          name: "Payroll History",
          path: "/payroll/history",
          icon: FileText,
          roles: ["ADMIN", "HR"],
        },
      ],
    },

    {
      title: "TIME & ATTENDANCE",
      items: [
        {
          name: "Attendance Sheets",
          path: "/attendance",
          icon: CalendarDays,
          roles: ["ADMIN", "HR"],
        },
        {
          name: "Daily Attendance",
          path: null,
          icon: Clock3,
          roles: ["ADMIN", "HR"],
          comingSoon: true,
        },
      ],
    },

    {
      title: "SELF SERVICE (ESS)",
      items: [
        {
          name: "My Attendance",
          path: "/my-attendance",
          icon: UserRound,
          roles: ["EMPLOYEE"],
        },
        {
          name: "My Payslips",
          path: "/my-payroll",
          icon: ReceiptText,
          roles: ["EMPLOYEE"],
        },
      ],
    },

    {
      title: "ADMINISTRATION",
      items: [
        {
          name: "Audit Logs",
          path: null,
          icon: ShieldCheck,
          roles: ["ADMIN"],
          comingSoon: true,
        },
        {
          name: "Settings",
          path: null,
          icon: Settings,
          roles: ["ADMIN"],
          comingSoon: true,
        },
      ],
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("auth");
    window.location.href = "/login";
  };

  return (
    <aside
      className={`fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-200 ${
        collapsed ? "w-[76px]" : "w-[270px]"
      }`}
    >
      {/* BRAND */}
      <div
        className={`relative border-b border-slate-200 ${
          collapsed ? "px-3 py-4" : "px-6 py-5"
        }`}
      >
        <div
          className={`flex items-center ${
            collapsed ? "justify-center" : "gap-3"
          }`}
        >
          {/* LOGO */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img
              src="/src/assets/logo.png"
              alt="ABC Logo"
              className="h-9 w-9 object-contain"
            />
          </div>

          {/* COMPANY */}
          {!collapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="truncate text-[15px] font-bold text-slate-800">
                  ABC PVT.LTD
                </h1>

                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold tracking-wide text-slate-500">
                  ENTERPRISE
                </span>
              </div>

              <p className="mt-0.5 text-[11px] text-slate-400">
                Payroll Management
              </p>
            </div>
          )}
        </div>

        {/* COLLAPSE BUTTON */}
        <button
          type="button"
          onClick={onToggle}
          aria-label={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          title={
            collapsed ? "Expand sidebar" : "Collapse sidebar"
          }
          className={`absolute top-1/2 -translate-y-1/2 rounded-lg border border-slate-200 bg-white p-1.5 text-slate-400 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 ${
            collapsed ? "-right-3" : "-right-3"
          }`}
        >
          {collapsed ? (
            <PanelLeftOpen size={15} />
          ) : (
            <PanelLeftClose size={15} />
          )}
        </button>
      </div>

      {/* NAVIGATION */}
      <nav
        className={`flex-1 overflow-hidden ${
          collapsed ? "px-2 py-5" : "px-3 py-5"
        }`}
      >
        {sections.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.roles.includes(role)
          );

          if (visibleItems.length === 0) {
            return null;
          }

          return (
            <div
              key={section.title}
              className={`${collapsed ? "mb-4" : "mb-5"}`}
            >
              {/* SECTION TITLE */}
              {!collapsed && (
                <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.08em] text-slate-400">
                  {section.title}
                </p>
              )}

              <div className="space-y-0.5">
                {visibleItems.map((item) => {
                  const Icon = item.icon;

                  {/* COMING SOON */}
                  if (item.comingSoon) {
                    return (
                      <div
                        key={item.name}
                        title={collapsed ? item.name : undefined}
                        className={`flex items-center rounded-lg py-2.5 text-[13px] text-slate-300 ${
                          collapsed
                            ? "justify-center px-2"
                            : "gap-3 px-3"
                        }`}
                      >
                        <Icon
                          size={17}
                          strokeWidth={1.7}
                        />

                        {!collapsed && (
                          <>
                            <span className="flex-1">
                              {item.name}
                            </span>

                            <span className="text-[9px] text-slate-300">
                              Soon
                            </span>
                          </>
                        )}
                      </div>
                    );
                  }

                  {/* NORMAL LINK */}
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.path === "/"}
                      title={collapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `
                        group flex items-center rounded-lg
                        py-2.5 text-[13px] font-medium
                        transition-all duration-150
                        ${
                          collapsed
                            ? "justify-center px-2"
                            : "gap-3 px-3"
                        }
                        ${
                          isActive
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                        `
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            size={17}
                            strokeWidth={isActive ? 2 : 1.7}
                            className={
                              isActive
                                ? "text-indigo-600"
                                : "text-slate-400 group-hover:text-slate-600"
                            }
                          />

                          {!collapsed && (
                            <>
                              <span className="flex-1">
                                {item.name}
                              </span>

                              {isActive && (
                                <ChevronRight
                                  size={14}
                                  className="text-indigo-500"
                                />
                              )}
                            </>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* FOOTER */}
      <div
        className={`border-t border-slate-200 ${
          collapsed ? "px-2 py-4" : "px-4 py-4"
        }`}
      >
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "Logout" : undefined}
          className={`flex w-full items-center rounded-lg py-2.5 text-[13px] font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 ${
            collapsed
              ? "justify-center px-2"
              : "gap-3 px-3"
          }`}
        >
          <LogOut
            size={17}
            strokeWidth={1.7}
          />

          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;