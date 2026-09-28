import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "payroll_auth";

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem(STORAGE_KEY);

      if (savedAuth) {
        setAuth(JSON.parse(savedAuth));
      }
    } catch (error) {
      console.error("Invalid stored authentication data:", error);
      localStorage.removeItem(STORAGE_KEY);
      setAuth(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (loginResponse) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(loginResponse)
    );

    setAuth(loginResponse);
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setAuth(null);
  };


  // =========================================================
  // PERMISSION CHECK
  // =========================================================

  const hasPermission = (permission) => {

    if (!auth?.token) {
      return false;
    }

    try {
      const payload = JSON.parse(
        atob(auth.token.split(".")[1])
      );

      const permissions = payload?.permissions || [];

      return permissions.includes(permission);

    } catch (error) {
      console.error("Unable to read permissions from token:", error);
      return false;
    }
  };


  // =========================================================
  // CHECK ANY PERMISSION
  // =========================================================

  const hasAnyPermission = (permissions) => {

    return permissions.some((permission) =>
      hasPermission(permission)
    );
  };


  // =========================================================
  // CHECK ALL PERMISSIONS
  // =========================================================

  const hasAllPermissions = (permissions) => {

    return permissions.every((permission) =>
      hasPermission(permission)
    );
  };


  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        loading,
        isAuthenticated: !!auth?.token,

        // Permission helpers
        hasPermission,
        hasAnyPermission,
        hasAllPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};