// src/services/authService.js
import api from "./api";

export const authService = {
  login: async (credentials) => {
    console.log("🔐 Attempting login for:", credentials.username);

    try {
      // 1️⃣ Get CSRF token
      const csrfResponse = await api.get("/csrf/", { withCredentials: true });
      const csrfToken = csrfResponse.data?.csrfToken;

      // 2️⃣ Login call
      const response = await api.post(
        "/login/",
        {
          loginID: credentials.username,
          password: credentials.password,
        },
        {
          withCredentials: true,
          headers: { "X-CSRFToken": csrfToken },
        },
      );

      console.log("📡 Login response:", response.data);

      // ✅ success (2xx only reaches here)
      const data = response.data;
      localStorage.setItem("loginID", credentials.username);
      localStorage.setItem("user", JSON.stringify(data.user));

      return data;
    } catch (error) {
      console.error("❌ Login error:", error);

      // ✅ IMPORTANT: read backend response
      const apiData = error.response?.data;

      if (apiData) {
        console.log("📡 API Error Data:", apiData);
        return apiData; // <-- return real backend JSON
      }

      // fallback network error
      return {
        success: false,
        error: "Network error. Please try again.",
      };
    }
  },

  forceLogout: async (loginID) => {
    console.log("🔄 Force logout for:", loginID);

    // Get CSRF token from cookie
    const csrfToken = document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];

    // Call the correct endpoint (note: it's '/force_logout/' not '/forceLogout/')
    const response = await api.post(
      "/force_logout/",
      {
        loginID,
      },
      {
        withCredentials: true,
        headers: {
          "X-CSRFToken": csrfToken,
        },
      },

      // {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //     "X-CSRFToken": csrfToken,
      //   },
      //   credentials: "include",
      //   body: JSON.stringify({ loginID }),
      // }
    );

    const data = await response;
    console.log("✅ Force logout response:", data);
    return data;
  },

  logout: async () => {
    try {
      await fetch("http://register.kdsgroup.co.in/logout/", {
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("loginID");
      console.log("🧹 Local storage cleared");
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
