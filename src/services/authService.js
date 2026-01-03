// src/services/authService.js
import api from "./api";

export const authService = {
  login: async (credentials) => {
    console.log("🔐 Attempting login for:", credentials.username);

    // First, get CSRF token
    const csrfResponse = await fetch("https://register.kdsgroup.co.in", {
      credentials: "include",
    });
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    console.log("🔐 CSRF Token obtained:", csrfToken ? "Yes" : "No");

    // Now login with CSRF token
    const response = await fetch("https://register.kdsgroup.co.in", {
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

    console.log("🍪 Cookies after login (visible only):", document.cookie);

    if (data.success) {
      console.log("✅ Login successful - session cookie set by backend");
    }

    return data;
  },

  forceLogout: async (loginID) => {
    console.log("🔄 Force logout for:", loginID);

    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];

    // Call the correct endpoint (note: it's '/force_logout/' not '/forceLogout/')
    const response = await fetch(
      "https://register.kdsgroup.co.in/force_logout/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify({ loginID }),
      }
    );

    const data = await response.json();
    console.log("✅ Force logout response:", data);
    return data;
  },

  logout: async () => {
    try {
      // Clear all browser caches before logout
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      await fetch("https://register.kdsgroup.co.in/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      console.log("✅ Logout successful");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear ALL localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
    }
  },

  getCurrentUser: () => {
    const loginID = localStorage.getItem("loginID");
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
