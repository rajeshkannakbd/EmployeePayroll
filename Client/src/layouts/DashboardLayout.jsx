import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../componenets/Sidebar";
import Header from "../componenets/Header";

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-100">
      {/* SIDEBAR */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() =>
          setSidebarCollapsed((previous) => !previous)
        }
      />

      {/* MAIN AREA */}
      <div
        className={`h-screen min-h-0 transition-all duration-200 ${
          sidebarCollapsed
            ? "pl-[76px]"
            : "pl-[270px]"
        }`}
      >
        {/* HEADER */}
        <Header />

        {/* CONTENT AREA */}
        <main className="h-[calc(100vh-4rem)] min-h-0 overflow-hidden p-1 sm:p-3 lg:p-4">
          <div className="mx-auto h-full min-h-0 w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;