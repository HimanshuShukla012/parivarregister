// src/components/supervisor/ChangePasswordModal.jsx
import React, { useState } from "react";
import supervisorService from "../../services/supervisorService";

const ChangePasswordModal = ({ loginID, onClose }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword !== confirmPassword) {
      setError("Confirm password is not same as the new password!");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    try {
      const result = await supervisorService.resetPassword(
        loginID,
        newPassword,
      );

      if (result.success) {
        setSuccess("Password Changed Successfully!");
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      setError("Failed to change password. Please try again.");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 1000,
        }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "400px",
          background: "#fff",
          borderRadius: "16px",
          overflow: "hidden",
          zIndex: 1001,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #6a5cff, #8b6cff)",
            padding: "15px 20px",
            color: "#fff",
            fontSize: "20px",
            fontWeight: "600",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Change Password
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.3)",
              border: "none",
              borderRadius: "50%",
              width: "28px",
              height: "28px",
              color: "#fff",
              cursor: "pointer",
              fontSize: "16px",
              padding: "7px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                padding: "10px",
                marginBottom: "15px",
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "6px",
                color: "#c00",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                padding: "10px",
                marginBottom: "15px",
                backgroundColor: "#efe",
                border: "1px solid #cfc",
                borderRadius: "6px",
                color: "#060",
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "14px" }}>
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginTop: "5px",
                  background: "#eef4ff",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "14px" }}>
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                  marginTop: "5px",
                }}
              />
            </div>
            <div
              style={{
                textAlign: "center",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                type="submit"
                style={{
                  width: "200px",
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "none",
                  background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginTop: "5px",
                  marginLeft: "10px",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;
