import React, { createContext, useState, useContext, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    console.log("🔍 AuthProvider mounted - current user:", currentUser);
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log("🔐 AuthContext: Starting login for", credentials.username);

      // ✅ CRITICAL: Clear user state FIRST
      setUser(null);
      localStorage.removeItem("loginID");
      console.log("🧹 AuthContext: Cleared user state and localStorage");

      // ✅ authService.login will handle localStorage setting on success
      const data = await authService.login(credentials);

      if (data.success) {
        console.log("✅ AuthContext: Login successful for", data.user.loginID);
        localStorage.setItem("loginID", JSON.stringify(data.user.loginID));

        // ✅ Set ONLY the NEW user data
        const newUser = { loginID: data.user.loginID };
        setUser(newUser);
        console.log("💾 AuthContext: Set new user state:", newUser);

        return {
  success: true,
  redirectTo: authService.getDashboardRoute(data.user.loginID),
  user: data.user,
};
      } else {
        console.log("❌ AuthContext: Login failed -", data.error);
        return {
          success: false,
          error: data.error,
          showForceLogout: data.showForceLogout,
          loginID: data.loginID || credentials.username,
        };
      }
    } catch (error) {
      console.error("❌ AuthContext: Login error:", error);
      // ✅ On error, ensure user is null
      setUser(null);
      return {
        success: false,
        error: error.message || "Login failed. Please try again.",
      };
    }
  };

  const forceLogout = async (loginID) => {
    try {
      console.log("🔄 AuthContext: Starting force logout for", loginID);

      // ✅ CRITICAL: Clear user state immediately
      setUser(null);
      console.log("🧹 AuthContext: Cleared user state");

      // ✅ authService.forceLogout will handle storage clearing
      const result = await authService.forceLogout(loginID);

      console.log("✅ AuthContext: Force logout completed:", result);
      return result;
    } catch (error) {
      console.error("❌ AuthContext: Force logout error:", error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log("🚪 AuthContext: Starting logout");

      // ✅ authService.logout will handle storage clearing
      await authService.logout();

      console.log("✅ AuthContext: Logout completed");
    } catch (error) {
      console.error("❌ AuthContext: Logout error:", error);
    } finally {
      // ✅ CRITICAL: Always clear user state, even if API fails
      setUser(null);
      console.log("🧹 AuthContext: User state cleared");
    }
  };

  const value = {
    user,
    login,
    logout,
    forceLogout,
    loading,
  };

  console.log("🔍 AuthContext current state:", { user, loading });

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
