import { useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  Key,
  User,
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

const DESIGNATIONS = [
  { label: "Admin", value: "Admin", color: "#06c4d9", bg: "#fffbeb" },
  { label: "Project Manager", value: "PM", color: "#0630d9", bg: "#fffbeb" },
  { label: "HQ", value: "HQ", color: "#06d95a", bg: "#fffbeb" },
  { label: "Division", value: "DD", color: "#d94206", bg: "#fffbeb" },
  { label: "ADO", value: "AD", color: "#6366f1", bg: "#eef2ff" },
  { label: "Sachiv", value: "SA", color: "#0891b2", bg: "#ecfeff" },
  { label: "Supervisor", value: "SU", color: "#059669", bg: "#ecfdf5" },
  { label: "Operator", value: "OP", color: "#d97706", bg: "#fffbeb" },
];

const UserManagementView = () => {
  const [selectedDesignation, setSelectedDesignation] = useState(
    DESIGNATIONS[0],
  );
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Reset password modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetResult, setResetResult] = useState(null); // { success, message }

  useEffect(() => {
    fetchUsers(selectedDesignation.value);
  }, [selectedDesignation]);

  const fetchUsers = async (designation) => {
    setLoading(true);
    setUsers([]);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/getLoginDetails/?designation=${designation}`,
      );
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to fetch users:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = (user) => {
    setSelectedUser(user);
    setNewPassword("");
    setConfirmPassword("");
    setResetResult(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setNewPassword("");
    setConfirmPassword("");
    setResetResult(null);
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setResetResult({
        success: false,
        message: "Please fill in both fields.",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setResetResult({ success: false, message: "Passwords do not match." });
      return;
    }
    if (newPassword.length < 3) {
      setResetResult({
        success: false,
        message: "Password must be at least 3 characters.",
      });
      return;
    }

    setResetting(true);
    setResetResult(null);
    try {
      const res = await fetch(
        "${import.meta.env.VITE_API_BASE_URL}/resetPassword/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            loginID: selectedUser.loginID,
            newPassword: newPassword,
          }),
        },
      );
      const data = await res.json();
      if (
        res.ok &&
        (data.success || data.message?.toLowerCase().includes("success"))
      ) {
        setResetResult({
          success: true,
          message: "Password reset successfully!",
        });
        setTimeout(() => closeModal(), 1800);
      } else {
        setResetResult({
          success: false,
          message: data.message || data.error || "Reset failed.",
        });
      }
    } catch (e) {
      setResetResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setResetting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.loginID?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Parse name: "District_Block_Sabha" format
  const parseName = (raw) => {
    const parts = (raw || "").split("_");
    if (parts.length >= 3) {
      return {
        district: parts[0],
        block: parts[1],
        sabha: parts.slice(2).join(" "),
      };
    }
    return { district: raw, block: "—", sabha: "—" };
  };

  return (
    <div style={{ padding: "1.5rem", fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          padding: "1.5rem 2rem",
          marginBottom: "1.5rem",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Shield size={20} color="white" />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              User Management
            </h2>
            <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
              {users.length} {selectedDesignation.label} accounts
            </p>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: "relative", width: "300px" }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#94a3b8",
            }}
          />
          <input
            type="text"
            placeholder="Search name or login ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 1rem 0.6rem 2.5rem",
              border: "2px solid #e2e8f0",
              borderRadius: "10px",
              fontSize: "0.875rem",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
            onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
          />
        </div>
      </div>

      {/* Designation Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {DESIGNATIONS.map((d) => (
          <button
            key={d.value}
            onClick={() => {
              setSelectedDesignation(d);
              setSearchTerm("");
            }}
            style={{
              padding: "0.6rem 1.5rem",
              borderRadius: "10px",
              border:
                selectedDesignation.value === d.value
                  ? `2px solid ${d.color}`
                  : "2px solid #e2e8f0",
              background:
                selectedDesignation.value === d.value ? d.bg : "white",
              color:
                selectedDesignation.value === d.value ? d.color : "#64748b",
              fontWeight: selectedDesignation.value === d.value ? "700" : "500",
              cursor: "pointer",
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
              boxShadow:
                selectedDesignation.value === d.value
                  ? `0 4px 12px ${d.color}30`
                  : "0 1px 4px rgba(0,0,0,0.05)",
            }}
          >
            {d.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          overflow: "hidden",
          border: "1px solid #f1f5f9",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 140px 130px",
            padding: "0.875rem 1.5rem",
            background: "#f8fafc",
            borderBottom: "2px solid #e2e8f0",
            fontSize: "0.75rem",
            fontWeight: "700",
            color: "#475569",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          <span>District</span>
          <span>Block</span>
          <span>Sabha</span>
          <span>Login ID</span>
          <span style={{ textAlign: "center" }}>Action</span>
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}
          >
            <RefreshCw
              size={32}
              color="#6366f1"
              style={{
                animation: "spin 1s linear infinite",
                margin: "0 auto 0.75rem",
                display: "block",
              }}
            />
            <p style={{ margin: 0, fontSize: "0.9rem" }}>Loading users...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && filteredUsers.length === 0 && (
          <div
            style={{ padding: "3rem", textAlign: "center", color: "#94a3b8" }}
          >
            <User
              size={40}
              style={{
                margin: "0 auto 0.75rem",
                opacity: 0.4,
                display: "block",
              }}
            />
            <p style={{ margin: 0 }}>No users found</p>
          </div>
        )}

        {/* Rows */}
        <div style={{ maxHeight: "520px", overflowY: "auto" }}>
          {!loading &&
            filteredUsers.map((user, idx) => {
              const parsed = parseName(user.name);
              return (
                <div
                  key={user.loginID}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 140px 130px",
                    padding: "0.875rem 1.5rem",
                    borderBottom:
                      idx < filteredUsers.length - 1
                        ? "1px solid #f1f5f9"
                        : "none",
                    background: idx % 2 === 0 ? "white" : "#fafbfc",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f0f4ff")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      idx % 2 === 0 ? "white" : "#fafbfc")
                  }
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#1e293b",
                      fontWeight: "500",
                    }}
                  >
                    {parsed.district}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "#475569" }}>
                    {parsed.block}
                  </span>
                  <span style={{ fontSize: "0.875rem", color: "#475569" }}>
                    {parsed.sabha}
                  </span>
                  <span>
                    <code
                      style={{
                        background: `${selectedDesignation.bg}`,
                        color: selectedDesignation.color,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: "700",
                        fontFamily: "monospace",
                        border: `1px solid ${selectedDesignation.color}30`,
                      }}
                    >
                      {user.loginID}
                    </code>
                  </span>
                  <div style={{ textAlign: "center" }}>
                    <button
                      onClick={() => openResetModal(user)}
                      style={{
                        padding: "0.4rem 0.9rem",
                        background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        fontSize: "0.78rem",
                        fontWeight: "600",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.35rem",
                        boxShadow: "0 2px 8px rgba(99,102,241,0.3)",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.transform = "translateY(-1px)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.transform = "translateY(0)")
                      }
                    >
                      <Key size={12} />
                      Reset
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Reset Password Modal */}
      {modalOpen && selectedUser && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 99999,
            animation: "fadeIn 0.2s ease",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "20px",
              padding: "2rem",
              width: "420px",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
              animation: "slideUp 0.25s ease",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Key size={20} color="white" />
              </div>
              <div>
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#0f172a",
                  }}
                >
                  Reset Password
                </h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                  {selectedUser.loginID} —{" "}
                  {parseName(selectedUser.name).district}
                </p>
              </div>
            </div>

            {/* User info pill */}
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "0.75rem 1rem",
                marginBottom: "1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User size={14} color="#64748b" />
              <span
                style={{
                  fontSize: "0.85rem",
                  color: "#334155",
                  fontWeight: "500",
                }}
              >
                {selectedUser.name?.replace(/_/g, " → ")}
              </span>
            </div>

            {/* New Password */}
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.4rem",
                }}
              >
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: "1.25rem" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "0.4rem",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                onKeyDown={(e) => e.key === "Enter" && handleResetPassword()}
                style={{
                  width: "100%",
                  padding: "0.7rem 1rem",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "0.875rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
              />
            </div>

            {/* Result message */}
            {resetResult && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1rem",
                  borderRadius: "10px",
                  marginBottom: "1rem",
                  background: resetResult.success ? "#f0fdf4" : "#fef2f2",
                  border: `1px solid ${resetResult.success ? "#bbf7d0" : "#fecaca"}`,
                  fontSize: "0.85rem",
                  fontWeight: "500",
                  color: resetResult.success ? "#166534" : "#dc2626",
                }}
              >
                {resetResult.success ? (
                  <CheckCircle size={16} color="#16a34a" />
                ) : (
                  <AlertTriangle size={16} color="#dc2626" />
                )}
                {resetResult.message}
              </div>
            )}

            {/* Buttons */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                onClick={closeModal}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "2px solid #e2e8f0",
                  borderRadius: "10px",
                  background: "white",
                  color: "#64748b",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                disabled={resetting}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  border: "none",
                  borderRadius: "10px",
                  background: resetting
                    ? "#c7d2fe"
                    : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  color: "white",
                  fontWeight: "600",
                  cursor: resetting ? "not-allowed" : "pointer",
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  boxShadow: resetting
                    ? "none"
                    : "0 4px 12px rgba(99,102,241,0.35)",
                }}
              >
                {resetting ? (
                  <>
                    <RefreshCw
                      size={14}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Resetting...
                  </>
                ) : (
                  <>
                    <Key size={14} /> Reset Password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default UserManagementView;
