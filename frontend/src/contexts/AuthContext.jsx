import { createContext, useContext, useState, useEffect, useCallback } from "react";
import authenticationController from "../api/authentication/authentication";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const storedUser = authenticationController.getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email, password) => {
    const result = await authenticationController.login({ email, password });
    if (result.success) {
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const register = async (name, email, password, confirm) => {
    const result = await authenticationController.register({ name, email, password, confirm });
    if (result.success) {
      setUser(result.data.user);
      return { success: true };
    }
    return { success: false, message: result.message };
  };

  const logout = async () => {
    await authenticationController.logout();
    setUser(null);
  };

  const refresh = async () => {
    const result = await authenticationController.refresh();
    return result.success;
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    login,
    register,
    logout,
    refresh,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
