import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login, forceLogout } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showForceLogout, setShowForceLogout] = useState(false);
  const [currentLoginID, setCurrentLoginID] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
    setShowForceLogout(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login(formData);

      console.log("Login result:", result); // Debug log

      if (result.success) {
        console.log("Redirecting to:", result.redirectTo);
        navigate(result.redirectTo);
      } else {
        setError(result.error);
        if (result.showForceLogout) {
          setShowForceLogout(true);
          setCurrentLoginID(result.loginID);
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async () => {
    setLoading(true);
    setError("");

    try {
      console.log("Starting force logout for:", currentLoginID);

      // Call force logout
      const logoutResult = await forceLogout(currentLoginID);
      console.log("Force logout result:", logoutResult);

      if (!logoutResult.success) {
        throw new Error(logoutResult.error || "Force logout failed");
      }

      // Wait for sessions to clear
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Clear force logout state
      setShowForceLogout(false);

      // Auto-retry login
      console.log("Retrying login after force logout...");
      const result = await login(formData);

      console.log("Retry login result:", result);

      if (result.success) {
        console.log("Login successful, navigating to:", result.redirectTo);
        navigate(result.redirectTo);
      } else {
        setError(result.error || "Login failed after force logout");
        if (result.showForceLogout) {
          setShowForceLogout(true);
          setCurrentLoginID(result.loginID);
        }
      }
    } catch (err) {
      console.error("Force logout error:", err);
      setError(err.message || "Force logout failed. Please try again.");
      setShowForceLogout(true); // Keep showing force logout button
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.overlay}></div>
      <div style={styles.card}>
        {/* Left Panel - Login Form */}
        <div style={styles.leftPanel}>
          <div style={styles.logoContainer}>
            <img
              src="/assets/images/Department_Logo.png"
              alt="Department Logo"
              style={styles.logo}
            />
          </div>
          <div style={styles.header}>
            <h1 style={styles.title}>Parivar Register</h1>
            <p style={styles.subtitle}>Login to your account</p>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {error && (
              <div style={styles.errorBox}>
                <p style={styles.errorText}>{error}</p>
                {showForceLogout && (
                  <button
                    type="button"
                    onClick={handleForceLogout}
                    style={{
                      ...styles.forceLogoutButton,
                      opacity: loading ? 0.6 : 1,
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    disabled={loading}
                  >
                    {loading
                      ? "Logging out..."
                      : "Force Logout from all devices"}
                  </button>
                )}
              </div>
            )}

            <div style={styles.formGroup}>
              <label style={styles.label}>Login ID</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your Login ID"
                disabled={loading}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={styles.input}
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...styles.button,
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <div style={styles.footer}>
            <p style={styles.footerText}>
              Enter your Login ID to access your dashboard
            </p>
          </div>
        </div>

        {/* Right Panel - Branding */}
        <div style={styles.rightPanel}>
          <div style={styles.logoContainer}>
            <img
              src="/assets/images/Kds_logo.png"
              alt="KDS Logo"
              style={styles.logo}
            />
          </div>

          <h2 style={styles.brandTitle}>Parivar Register</h2>
          <h3 style={styles.brandSubtitle}>Digitization System</h3>

          <div style={styles.divider}></div>

          <div style={styles.poweredBy}>
            <p style={styles.poweredByText}>Powered by</p>
            <h4 style={styles.companyName}>KDS Services Pvt. Ltd.</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundImage:
      'url("https://images.unsplash.com/photo-1601933470096-0e34634ffcde?q=80&w=2070")',
    backgroundSize: "cover",
    backgroundPosition: "center",
    position: "relative",
    padding: "1rem",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    zIndex: 1,
  },
  card: {
    backgroundColor: "transparent",
    borderRadius: "20px",
    overflow: "hidden",
    display: "flex",
    width: "100%",
    maxWidth: "900px",
    minHeight: "550px",
    position: "relative",
    zIndex: 2,
    boxShadow: "0 25px 50px rgba(0, 0, 0, 0.5)",
  },
  leftPanel: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    padding: "2.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  rightPanel: {
    flex: 1,
    backgroundColor: "rgba(30, 41, 59, 0.95)",
    padding: "2.5rem",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    color: "white",
    borderLeft: "3px solid rgba(59, 130, 246, 0.5)",
  },
  logoContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "1.5rem",
  },
  logo: {
    maxWidth: "200px",
    height: "auto",
    objectFit: "contain",
  },
  header: {
    marginBottom: "1.5rem",
  },
  title: {
    fontSize: "1.75rem",
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: "0.5rem",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "0.9rem",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    fontWeight: "600",
    color: "#374151",
    fontSize: "0.95rem",
  },
  input: {
    padding: "0.75rem",
    border: "2px solid #e5e7eb",
    borderRadius: "8px",
    fontSize: "0.95rem",
    transition: "border-color 0.2s",
    outline: "none",
  },
  button: {
    padding: "0.75rem",
    backgroundColor: "#3b82f6",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "0.95rem",
    fontWeight: "600",
    marginTop: "0.5rem",
    transition: "background-color 0.2s",
  },
  errorBox: {
    padding: "1rem",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  errorText: {
    color: "#dc2626",
    fontSize: "0.9rem",
    margin: 0,
  },
  forceLogoutButton: {
    padding: "0.625rem",
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "0.875rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  footer: {
    marginTop: "1.25rem",
    textAlign: "center",
    paddingTop: "1.25rem",
    borderTop: "1px solid #e5e7eb",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "0.8rem",
    margin: 0,
  },
  brandTitle: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    letterSpacing: "-0.5px",
  },
  brandSubtitle: {
    fontSize: "1.25rem",
    fontWeight: "300",
    color: "#94a3b8",
    marginBottom: "1.5rem",
  },
  divider: {
    width: "60px",
    height: "3px",
    backgroundColor: "#3b82f6",
    margin: "1.5rem auto",
    borderRadius: "2px",
  },
  poweredBy: {
    marginBottom: "1.5rem",
  },
  poweredByText: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    marginBottom: "0.5rem",
  },
  companyName: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#3b82f6",
    margin: 0,
  },
};

export default Login;
