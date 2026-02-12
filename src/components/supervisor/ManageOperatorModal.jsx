// src/components/supervisor/ManageOperatorModal.jsx
import React, { useState, useEffect } from "react";
import supervisorService from "../../services/supervisorService";

const ManageOperatorModal = ({ loginID, onClose, onAddOperator }) => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({ name: "", loginID: "" });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const data = await supervisorService.getOperators(loginID);
      setOperators(data);
    } catch (error) {
      console.error("Error fetching operators:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Confirm password is not same as the new password!");
      return;
    }

    try {
      const result = await supervisorService.resetPassword(
        resetData.loginID,
        newPassword,
      );
      if (result.success) {
        alert("Password changed successfully!");
        setShowResetForm(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error resetting password:", error);
      alert("Failed to reset password");
    }
  };

  const handleDelete = async (operatorLoginID) => {
    if (!window.confirm("Do you want to delete this Operator?")) return;

    try {
      const result = await supervisorService.deleteOperator(operatorLoginID);
      if (result) {
        alert("Deleted Successfully!");
        fetchOperators();
      } else {
        alert("Error while deleting data!");
      }
    } catch (error) {
      console.error("Error deleting operator:", error);
      alert("Failed to delete operator");
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div
        className="popup-overlay"
        style={{
          display: "block",
          background: "rgba(0,0,0,0.4)",
        }}
        onClick={(e) => {
          if (e.target.className === "popup-overlay") {
            onClose();
          }
        }}
      ></div>

      {/* Modal */}
      <div
        className="popup-overlay"
        style={{
          display: "block",
          maxWidth: "900px",
          width: "100%",
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
          zIndex: 1001,
          padding: "0",
          borderRadius: "16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg, #6f7bf7, #7b4ca0)",
            padding: "16px 24px",
            color: "#fff",
            fontSize: "22px",
            fontWeight: "600",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Manage Operators
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.2)",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              textAlign: "center",
              height: "36px",
              color: "#fff",
              padding: "12px",
              fontSize: "18px",
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ margin: 0 }}>Operator List</h2>

            <button
              onClick={onAddOperator}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(90deg,#6f7bf7,#7b4ca0)",
                borderRadius: "30px",
                cursor: "pointer",
                fontSize: "15px",
                color: "#fff",
                border: "none",
              }}
            >
              <i class="fas fa-plus"></i> Add Operator
            </button>
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : (
            <div
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ background: "#f3f4f6" }}>
                  <tr>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Login ID</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.length > 0 ? (
                    operators.map((op, idx) => (
                      <tr key={idx}>
                        <td style={tdStyle}>{op.name}</td>
                        <td style={tdStyle}>{op.loginID}</td>
                        <td style={tdStyle}>
                          {op.documentUrl ? (
                            <a
                              href={op.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                ...actionBtnStyle,
                                background: "#19c538",
                              }}
                            >
                              View <i class="fas fa-eye"></i>
                            </a>
                          ) : (
                            <span style={{ color: "gray", marginRight: "8px" }}>
                              No Document
                            </span>
                          )}

                          <button
                            onClick={() => {
                              setResetData({
                                name: op.name,
                                loginID: op.loginID,
                              });
                              setShowResetForm(true);
                            }}
                            style={actionBtnStyle}
                          >
                            Reset Password
                          </button>

                          <button
                            onClick={() => handleDelete(op.loginID)}
                            style={{
                              ...actionBtnStyle,
                              background: "#ef4444",
                            }}
                          >
                            Delete <i class="fas fa-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="3"
                        style={{ textAlign: "center", padding: "12px" }}
                      >
                        No operators available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Form */}
      {showResetForm && (
        <>
          {/* Overlay */}
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 999,
            }}
            onClick={() => setShowResetForm(false)}
          ></div>

          {/* Modal */}
          <div
            id="resetForm"
            style={{
              display: "block",
              zIndex: 1003,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "430px",
              background: "#fff",
              borderRadius: "18px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: "linear-gradient(90deg,#7a7cf3,#8c63d6)",
                padding: "15px 20px",
                color: "#fff",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2 style={{ margin: 0 }}>Reset Password</h2>
              <button
                className="close-btn"
                onClick={() => setShowResetForm(false)}
                style={{
                  background: "rgba(255,255,255,0.3)",
                  border: "none",
                  color: "#fff",
                  fontSize: "18px",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div style={{ padding: "20px" }}>
              <form id="resetPasswordForm" onSubmit={handleResetPassword}>
                <div style={{ marginBottom: "12px" }}>
                  <label>Name</label>
                  <input
                    type="text"
                    id="formName"
                    value={resetData.name}
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #e1e5ee",
                      marginTop: "5px",
                      background: "#eef4ff",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Login ID</label>
                  <input
                    type="text"
                    id="formLoginId"
                    value={resetData.loginID}
                    disabled
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #e1e5ee",
                      marginTop: "5px",
                      background: "#eef4ff",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Enter New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #e1e5ee",
                      marginTop: "5px",
                      background: "#eef4ff",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "12px" }}>
                  <label>Confirm Password</label>
                  <input
                    type="password"
                    id="confirmNewPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "10px",
                      border: "1px solid #e1e5ee",
                      marginTop: "5px",
                      background: "#fff",
                    }}
                  />
                </div>
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "25px",
                      border: "none",
                      background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                      color: "#fff",
                      fontSize: "16px",
                      cursor: "pointer",
                      marginTop: "10px",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const thStyle = {
  padding: "10px",
  textAlign: "left",
  fontWeight: "600",
  borderBottom: "1px solid #ddd",
};

const tdStyle = {
  padding: "10px",
  borderBottom: "1px solid #eee",
};

const actionBtnStyle = {
  marginLeft: "6px",
  padding: "6px 12px",
  borderRadius: "20px",
  border: "none",
  background: "#6366f1",
  color: "#fff",
  cursor: "pointer",
  fontSize: "13px",
};

export default ManageOperatorModal;
