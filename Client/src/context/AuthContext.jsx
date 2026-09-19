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

  useEffect(() => {
    const savedAuth =
      localStorage.getItem(STORAGE_KEY);

    if (savedAuth) {
      try {
        setAuth(JSON.parse(savedAuth));
      } catch (error) {
        console.error(
          "Invalid stored authentication data:",
          error
        );

        localStorage.removeItem(STORAGE_KEY);
      }
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

  return (
    <AuthContext.Provider
      value={{
        auth,
        login,
        logout,
        isAuthenticated: !!auth?.token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};