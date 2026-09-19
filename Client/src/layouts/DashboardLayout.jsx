import React from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../componenets/Sidebar";
import Header from "../componenets/Header";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-slate-100">

      {/* SIDEBAR */}

      <Sidebar />              

      {/* MAIN AREA */}

      <div className="min-h-screen pl-64">

        <Header />

        <main className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>

      </div>

    </div>
  );
};

export default DashboardLayout;