// src/components/ado/ADOSabhaApprovalTable.jsx
import React, { useState } from "react";
import { approveSabha, rejectSabha } from "../../services/adoService";

/**
 * ADOSabhaApprovalTable
 * Props:
 *   sabhaList   – array of { sabha_name, sabha_code, sabha_status, ... }
 *   onRefresh   – callback() to reload sabha data after approve/reject
 */
const ADOSabhaApprovalTable = ({ sabhaList = [], onRefresh }) => {
  const [actionLoading, setActionLoading] = useState({}); // { [sabha_name]: 'approve'|'reject' }
  const [rejectModal, setRejectModal] = useState(null);   // { sabha_name, sabha_code }
  const [remark, setRemark] = useState("");
  const [remarkError, setRemarkError] = useState("");
  const [toast, setToast] = useState(null); // { type: 'success'|'error', message }

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async (sabhaName) => {
    if (!window.confirm(`Approve Sabha "${sabhaName}"?`)) return;

    setActionLoading((p) => ({ ...p, [sabhaName]: "approve" }));
    try {
      await approveSabha(sabhaName);
      showToast("success", `"${sabhaName}" approved successfully.`);
      onRefresh?.();
    } catch (e) {
      console.error(e);
      showToast("error", `Failed to approve "${sabhaName}". Please try again.`);
    } finally {
      setActionLoading((p) => ({ ...p, [sabhaName]: null }));
    }
  };

  const openRejectModal = (sabha) => {
    setRejectModal(sabha);
    setRemark("");
    setRemarkError("");
  };

  const closeRejectModal = () => {
    setRejectModal(null);
    setRemark("");
    setRemarkError("");
  };

  const handleRejectSubmit = async () => {
    if (!remark.trim()) {
      setRemarkError("Remark is required to reject a Sabha.");
      return;
    }

    const sabhaName = rejectModal.sabha_name;
    setActionLoading((p) => ({ ...p, [sabhaName]: "reject" }));
    closeRejectModal();

    try {
      await rejectSabha(sabhaName, remark.trim());
      showToast("success", `"${sabhaName}" rejected.`);
      onRefresh?.();
    } catch (e) {
      console.error(e);
      showToast("error", `Failed to reject "${sabhaName}". Please try again.`);
    } finally {
      setActionLoading((p) => ({ ...p, [sabhaName]: null }));
    }
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toLowerCase();
    const styles = {
      approved:  { background: "#dcfce7", color: "#166534", border: "1px solid #bbf7d0" },
      rejected:  { background: "#fee2e2", color: "#991b1b", border: "1px solid #fecaca" },
      pending:   { background: "#fef9c3", color: "#854d0e", border: "1px solid #fde68a" },
    };
    const key = s.includes("approv") ? "approved" : s.includes("reject") ? "rejected" : "pending";
    return (
      <span style={{
        ...styles[key],
        padding: "3px 10px",
        borderRadius: "20px",
        fontSize: "12px",
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}>
        {status || "Pending"}
      </span>
    );
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Sabha Approval</h2>
        <div className="section-line"></div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 99999,
          padding: "14px 20px",
          borderRadius: "10px",
          background: toast.type === "success" ? "#166534" : "#991b1b",
          color: "#fff",
          fontWeight: 600,
          fontSize: "14px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          animation: "fadeIn 0.2s ease",
          maxWidth: "380px",
        }}>
          <i className={`fas ${toast.type === "success" ? "fa-check-circle" : "fa-times-circle"}`}></i>
          {toast.message}
        </div>
      )}

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th style={{ width: "60px" }}>Sr. No.</th>
                <th>Sabha Name</th>
                <th>Sabha Code</th>
                <th style={{ width: "120px", textAlign: "center" }}>Status</th>
                <th style={{ width: "200px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sabhaList.filter((r) => (r.sabha_status || "").toLowerCase() !== "pending").length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "24px", color: "#9ca3af" }}>
                    No sabhas pending approval.
                  </td>
                </tr>
              ) : (
                sabhaList.filter((r) => (r.sabha_status || "").toLowerCase() !== "pending").map((row, idx) => {
                  const name = row.sabha_name;
                  const busy = actionLoading[name];
                  const status = (row.sabha_status || "").toLowerCase();
                  const isApproved = status.includes("approv");
                  const isRejected = status.includes("reject");
                  const isActioned = isApproved || isRejected;

                  return (
                    <tr key={row.sabha_code || idx}>
                      <td style={{ textAlign: "center", color: "#9ca3af", fontWeight: 600 }}>
                        {idx + 1}
                      </td>
                      <td style={{ fontWeight: 500 }}>{name}</td>
                      <td style={{ color: "#6b7280" }}>{row.sabha_code || "—"}</td>
                      <td style={{ textAlign: "center" }}>
                        {getStatusBadge(row.sabha_status)}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                          {/* Approve */}
                          <button
                            onClick={() => handleApprove(name)}
                            disabled={!!busy || isActioned}
                            title={isApproved ? "Already approved" : "Approve Sabha"}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              border: "none",
                              background: isApproved ? "#d1fae5" : "#16a34a",
                              color: isApproved ? "#166534" : "#fff",
                              fontWeight: 600,
                              fontSize: "13px",
                              cursor: busy || isActioned ? "not-allowed" : "pointer",
                              opacity: busy === "approve" ? 0.6 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.2s",
                            }}
                          >
                            {busy === "approve" ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-check"></i>
                            )}
                            {isApproved ? "Approved" : "Approve"}
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() => openRejectModal(row)}
                            disabled={!!busy || isActioned}
                            title={isRejected ? "Already rejected" : "Reject Sabha"}
                            style={{
                              padding: "6px 14px",
                              borderRadius: "8px",
                              border: "none",
                              background: isRejected ? "#fee2e2" : "#dc2626",
                              color: isRejected ? "#991b1b" : "#fff",
                              fontWeight: 600,
                              fontSize: "13px",
                              cursor: busy || isActioned ? "not-allowed" : "pointer",
                              opacity: busy === "reject" ? 0.6 : 1,
                              display: "flex",
                              alignItems: "center",
                              gap: "5px",
                              transition: "all 0.2s",
                            }}
                          >
                            {busy === "reject" ? (
                              <i className="fas fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fas fa-times"></i>
                            )}
                            {isRejected ? "Rejected" : "Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div
          onClick={closeRejectModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,0.5)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "16px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "28px",
              width: "min(460px, 95vw)",
              boxShadow: "0 25px 60px rgba(0,0,0,0.2)",
              animation: "slideUp 0.2s ease",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "12px",
                background: "linear-gradient(135deg,#ef4444,#dc2626)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                <i className="fas fa-times" style={{ color: "#fff", fontSize: "18px" }}></i>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                  Reject Sabha
                </h3>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>
                  {rejectModal.sabha_name}
                  {rejectModal.sabha_code ? ` (${rejectModal.sabha_code})` : ""}
                </p>
              </div>
            </div>

            {/* Remark input */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{
                display: "block", fontSize: "13px", fontWeight: 600,
                color: "#374151", marginBottom: "6px",
              }}>
                Reason for Rejection <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                rows={4}
                value={remark}
                onChange={(e) => { setRemark(e.target.value); setRemarkError(""); }}
                placeholder="Enter reason for rejection…"
                autoFocus
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: remarkError ? "2px solid #ef4444" : "2px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "14px",
                  resize: "vertical",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  lineHeight: "1.5",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => !remarkError && (e.target.style.borderColor = "#ef4444")}
                onBlur={(e) => !remarkError && (e.target.style.borderColor = "#e2e8f0")}
              />
              {remarkError && (
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#ef4444" }}>
                  <i className="fas fa-exclamation-circle" style={{ marginRight: "4px" }}></i>
                  {remarkError}
                </p>
              )}
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                onClick={closeRejectModal}
                style={{
                  flex: 1, padding: "10px",
                  border: "2px solid #e2e8f0", borderRadius: "10px",
                  background: "#fff", color: "#64748b",
                  fontWeight: 600, cursor: "pointer", fontSize: "14px",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                style={{
                  flex: 1, padding: "10px",
                  border: "none", borderRadius: "10px",
                  background: "linear-gradient(135deg,#ef4444,#dc2626)",
                  color: "#fff", fontWeight: 700, cursor: "pointer",
                  fontSize: "14px", fontFamily: "inherit",
                  boxShadow: "0 4px 12px rgba(239,68,68,0.35)",
                  display: "flex", alignItems: "center",
                  justifyContent: "center", gap: "6px",
                }}
              >
                <i className="fas fa-times-circle"></i> Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes slideUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default ADOSabhaApprovalTable;