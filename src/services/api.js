// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "", // Use empty string to make relative URLs work correctly in both dev and prod
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // CRITICAL: Send cookies with every request
});

// Helper function to get CSRF token from cookies
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== "") {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === name + "=") {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Helper function to ensure trailing slash
function ensureTrailingSlash(url) {
  // Don't add trailing slash if URL already has one or has query parameters
  if (url.endsWith('/') || url.includes('?')) {
    return url;
  }
  
  // Split URL into path and query parts
  const [path, query] = url.split('?');
  
  // Add trailing slash to path
  const pathWithSlash = path.endsWith('/') ? path : `${path}/`;
  
  // Rejoin with query if it exists
  return query ? `${pathWithSlash}?${query}` : pathWithSlash;
}

// Request interceptor for CSRF token and trailing slash
api.interceptors.request.use(
  async (config) => {
    // Ensure trailing slash on URL
    config.url = ensureTrailingSlash(config.url);
    
    console.log(`📤 API Request: ${config.method.toUpperCase()} ${config.url}`);
    console.log("🍪 Current cookies:", document.cookie);

    // For POST, PUT, DELETE requests, add CSRF token
    if (
      ["post", "put", "delete", "patch"].includes(config.method.toLowerCase())
    ) {
      let csrfToken = getCookie("csrftoken");

      console.log("🔐 CSRF Token:", csrfToken ? "Found" : "Not found");

      // If not in cookie, fetch from endpoint
      if (!csrfToken) {
        try {
          console.log("🔄 Fetching CSRF token...");
          const response = await axios.get("/csrf/", {
            withCredentials: true,
          });
          csrfToken = response.data.csrfToken;
          console.log("✅ CSRF token fetched");
        } catch (error) {
          console.error("❌ Error fetching CSRF token:", error);
        }
      }

      if (csrfToken) {
        config.headers["X-CSRFToken"] = csrfToken;
      }
    }

    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`📥 API Response: ${response.config.url} - ${response.status}`);

    // Log cookies after response
    console.log("🍪 Cookies after response:", document.cookie);

    return response;
  },
  (error) => {
    console.error(
      `❌ API Error: ${error.config?.url} - ${error.response?.status}`
    );

    if (error.response?.status === 401) {
      console.warn("⚠️ 401 Unauthorized - Session expired or invalid");
      console.log("Current cookies:", document.cookie);

      // Only redirect if not already on login page
      if (
        !window.location.pathname.includes("/login") &&
        window.location.pathname !== "/"
      ) {
        localStorage.removeItem("loginID");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export default api;