import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
  const { auth, loading } = useAuth();
  const location = useLocation();

  // Wait for localStorage authentication to be restored
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-100">
        <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  // Only redirect when the user is genuinely not logged in
  if (!auth?.token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  // Stay on whatever URL the browser currently has
  return <Outlet />;
};

export default ProtectedRoute;