// src/services/authService.js
import api from "./api";

export const authService = {
  login: async (credentials) => {
    console.log("🔐 Attempting login for:", credentials.username);

    // ✅ CRITICAL FIX: Clear ALL storage BEFORE login attempt
    console.log("🧹 Clearing all storage before login...");
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ Storage cleared");

    // Capture old sessionid BEFORE login
    const oldSessionId = document.cookie
      .split('; ')
      .find(row => row.startsWith('sessionid='))
      ?.split('=')[1];
    
    console.log("🍪 OLD Session ID:", oldSessionId || "None");

    try {
      // First, get CSRF token - USE PROXY
      const csrfResponse = await fetch("/csrf/", {
        method: "GET",
        credentials: "include",
      });
      
      if (!csrfResponse.ok) {
        throw new Error("Failed to get CSRF token");
      }
      
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      console.log("🔐 CSRF Token obtained:", csrfToken ? "Yes" : "No");

      // Now login with CSRF token - USE PROXY
      const response = await fetch("/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({
          loginID: credentials.username,
          password: credentials.password,
        }),
      });

      const data = await response.json();

      console.log("📡 Login response:", data);

      // Capture new sessionid AFTER login
      const newSessionId = document.cookie
        .split('; ')
        .find(row => row.startsWith('sessionid='))
        ?.split('=')[1];
      
      console.log("🍪 NEW Session ID:", newSessionId || "None");
      
      // ⚠️ WARNING: Check if sessionid changed
      if (oldSessionId && newSessionId && oldSessionId === newSessionId) {
        console.error("❌ CRITICAL: Session ID did NOT change! Django backend issue!");
        console.error("❌ This means Django is NOT creating new sessions on login");
        console.error("❌ Backend must call: request.session.flush() and request.session.cycle_key()");
      } else if (newSessionId && oldSessionId !== newSessionId) {
        console.log("✅ Session ID changed successfully - new session created");
      } else if (!oldSessionId && newSessionId) {
        console.log("✅ New session created (first login)");
      }

      console.log("🍪 All cookies after login:", document.cookie);

      // Handle both success and specific error cases
      if (!response.ok) {
        // If max sessions reached, return special response for force logout
        if (data.showForceLogout) {
          console.log("⚠️ Max sessions reached - showing force logout option");
          return {
            success: false,
            error: data.error,
            showForceLogout: true,
            loginID: data.loginID,
          };
        }
        throw new Error(data.error || "Login failed");
      }

      if (data.success) {
        console.log("✅ Login successful - session cookie set by backend");
        
        // Verify that sessionid cookie was set
        const hasSessionId = document.cookie.includes('sessionid');
        console.log("🔍 SessionID cookie present:", hasSessionId);
        
        if (!hasSessionId) {
          console.error("❌ WARNING: No sessionid cookie found after login!");
          console.error("❌ Django backend is not creating sessions properly");
        }

        // ✅ CRITICAL: Save ONLY the NEW user's loginID
        localStorage.setItem("loginID", data.user.loginID);
        console.log("💾 Saved NEW loginID to localStorage:", data.user.loginID);
      }

      return data;
    } catch (error) {
      console.error("❌ Login error:", error);
      // ✅ On error, ensure storage is cleared
      localStorage.clear();
      sessionStorage.clear();
      throw error;
    }
  },

  forceLogout: async (loginID) => {
    console.log("🔄 Force logout for:", loginID);

    // ✅ CRITICAL: Clear storage immediately during force logout
    console.log("🧹 Clearing storage during force logout...");
    localStorage.clear();
    sessionStorage.clear();
    console.log("✅ Storage cleared");

    try {
      // Get CSRF token from cookie
      const csrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("csrftoken="))
        ?.split("=")[1];

      // Call the force logout endpoint
      const response = await fetch("/force_logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ loginID }),
      });

      const data = await response.json();
      console.log("✅ Force logout response:", data);
      return data;
    } catch (error) {
      console.error("❌ Force logout error:", error);
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    console.log("🚪 Logging out...");
    
    try {
      // Clear all browser caches before logout
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        console.log("🧹 Cleared browser caches");
      }
      
      await fetch("/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      console.log("✅ Logout API call successful");
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      // ✅ CRITICAL: Always clear ALL localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      console.log("🧹 Cleared all local/session storage");
    }
  },

  getCurrentUser: () => {
    const loginID = localStorage.getItem("loginID");
    console.log("👤 getCurrentUser - loginID from storage:", loginID || "None");
    return loginID ? { loginID } : null;
  },

  isAuthenticated: () => {
    const hasLoginID = !!localStorage.getItem("loginID");

    console.log("🔍 Auth check:", {
      hasLoginID,
      authenticated: hasLoginID,
    });

    return hasLoginID;
  },

  getUserRole: (loginID) => {
    if (!loginID) return null;

    const firstTwo = loginID.substring(0, 2).toUpperCase();
    const firstFour = loginID.substring(0, 4).toUpperCase();

    if (firstTwo === "OP") return "operator";
    if (firstTwo === "SA") return "sachiv";
    if (firstTwo === "AD") return "ado";
    if (firstTwo === "HQ") return "hq";
    if (firstTwo === "DP") return "dpro";
    if (firstTwo === "DD") return "dd";
    if (firstTwo === "TL") return "tl";
    if (firstTwo === "DI") return "director";
    if (firstFour === "SCSU") return "supervisorSC";
    if (firstFour === "DESU") return "supervisorDE";
    if (loginID.toLowerCase() === "admin") return "admin";
    if (loginID.toLowerCase() === "pm") return "pm";

    return null;
  },

  getDashboardRoute: (loginID) => {
    if (!loginID) return "/";

    const firstTwo = loginID.substring(0, 2).toUpperCase();
    const firstFour = loginID.substring(0, 4).toUpperCase();

    if (firstTwo === "OP") return "/operator/dashboard";
    if (firstTwo === "SA") return "/sachiv/dashboard";
    if (firstTwo === "AD") return "/ado/dashboard";
    if (firstTwo === "HQ") return "/hq/dashboard";
    if (firstTwo === "DP") return "/dpro/dashboard";
    if (firstTwo === "DD") return "/dd/dashboard";
    if (firstTwo === "TL") return "/tl/dashboard";
    if (firstTwo === "DI") return "/director/dashboard";
    if (firstFour === "SCSU") return "/supervisor-sc/dashboard";
    if (firstFour === "DESU") return "/supervisor-de/dashboard";
    if (loginID.toLowerCase() === "admin") return "/admin/dashboard";
    if (loginID.toLowerCase() === "pm") return "/pm/dashboard";

    return "/";
  },
};