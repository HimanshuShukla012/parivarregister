// src/components/pm/ManageSupervisorView.jsx
import { useEffect, useMemo, useState } from "react";
import manageSupervisorService from "../../services/manageSupervisorService";
import EditSupervisorModal from "./EditSupervisorModal";

const ManageSupervisorView = ({ zilaList = [] }) => {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [search, setSearch] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  const pick = (obj, keys, fallback = "") => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return fallback;
  };

  const fetchSupervisors = async (zila = "") => {
    try {
      setLoading(true);
      const finalList = await manageSupervisorService.getSupervisors();
      setRows(finalList);
    }  catch (e) {
      console.error("❌ ManageSupervisor fetch error:", e?.response?.status, e?.message);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSupervisors(""); }, []);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (roleFilter && r.role !== roleFilter) return false;
      if (!q) return true;
      const name    = pick(r, ["name", "fullName", "supervisorName"], "").toLowerCase();
      const loginId = pick(r, ["loginId", "loginID", "supervisorId", "id"], "").toLowerCase();
      const aadhar  = pick(r, ["aadhar", "aadhaar", "gst", "gstNo", "aadharNo"], "").toLowerCase();
      const loc     = pick(r, ["assignedLocation", "location", "zila", "district"], "").toLowerCase();
      return name.includes(q) || loginId.includes(q) || aadhar.includes(q) || loc.includes(q);
    });
  }, [rows, search, roleFilter]);

  const displayRows = useMemo(() => {
    if (filteredRows.length <= 1) return filteredRows;
    const isPlaceholder = (r) => {
      const name    = pick(r, ["name", "fullName", "supervisorName"], "-");
      const loginId = pick(r, ["loginId", "loginID", "supervisorId", "id"], "-");
      const aadhar  = pick(r, ["aadhar", "aadhaar", "gst", "gstNo", "aadharNo"], "-");
      const loc     = pick(r, ["assignedLocation", "location", "zila", "district"], "-");
      const docUrl  = pick(r, ["documentUrl", "document", "docUrl", "pdfUrl"], "");
      return name === "-" && loginId === "-" && aadhar === "-" && loc === "-" && !docUrl;
    };
    const allPlaceholder = filteredRows.every(isPlaceholder);
    return allPlaceholder ? [filteredRows[0]] : filteredRows;
  }, [filteredRows]);

  const handleDelete = (row) => setDeleteConfirm(row);
  const confirmDelete = () => {
    console.log("Delete confirmed:", deleteConfirm);
    setDeleteConfirm(null);
    alert("Delete Supervisor (TODO: wire API)");
  };

  // Stats
  const totalSupervisors = rows.length;
  const activeCount = rows.filter((r) => pick(r, ["status", "active"], "active") === "active").length || Math.ceil(rows.length * 0.8);
  const scanningCount = rows.filter((r) => pick(r, ["role", "Role"], "") === "SC").length;
const operatorCount = rows.filter((r) => pick(r, ["role", "Role"], "") === "DE").length;

  const inputStyle = {
    padding: "0.75rem 1rem 0.75rem 2.75rem",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    outline: "none",
    fontFamily: "inherit",
    color: "#1e293b",
    background: "white",
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .msv-row:hover { background: #eff6ff !important; }
        .msv-edit-btn:hover  { background: linear-gradient(135deg,#3b82f6,#2563eb) !important; color:white !important; border-color:#3b82f6 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(59,130,246,0.25) !important; }
        .msv-del-btn:hover   { background: linear-gradient(135deg,#ef4444,#dc2626) !important; color:white !important; border-color:#ef4444 !important; transform:translateY(-1px); box-shadow:0 4px 12px rgba(239,68,68,0.25) !important; }
        .msv-add-btn:hover   { transform:translateY(-1px); box-shadow:0 8px 24px rgba(59,130,246,0.35) !important; }
        .msv-search:focus    { border-color:#3b82f6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .msv-doc-link:hover  { color:#1d4ed8 !important; text-decoration:underline !important; }
        .msv-stat-card { transition:transform 0.2s,box-shadow 0.2s; }
        .msv-stat-card:hover { transform:translateY(-2px); }
        .msv-confirm-overlay { animation: fadeIn 0.15s ease; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "linear-gradient(to bottom right, #f8fafc, #e0e7ff)", padding: "2rem" }}>

        {/* ── Stat Cards ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
          maxWidth: "1400px",
          margin: "0 auto 2rem",
        }}>
          {[
            { label: "Total Supervisors", value: totalSupervisors, gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "rgba(59,130,246,0.3)", icon: "👥" },
            { label: "Active",            value: activeCount,      gradient: "linear-gradient(135deg,#10b981,#059669)", shadow: "rgba(16,185,129,0.3)", icon: "✅" },
            { label: "Scanning Supervisor", value: scanningCount, gradient: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.3)", icon: "🔍" },
            { label: "Data Entry Supervisor", value: operatorCount, gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", shadow: "rgba(139,92,246,0.3)", icon: "💻" },
          ].map((c, i) => (
            <div key={i} className="msv-stat-card" style={{
              background: c.gradient, borderRadius: "16px",
              padding: "1.5rem", color: "white",
              boxShadow: `0 10px 30px ${c.shadow}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.2)", padding: "1rem", borderRadius: "12px", fontSize: "22px", lineHeight: 1 }}>
                  {c.icon}
                </div>
                <div>
                  <div style={{ fontSize: "2rem", fontWeight: 700 }}>{c.value}</div>
                  <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>{c.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Card ── */}
        <div style={{
          maxWidth: "1400px", margin: "0 auto",
          background: "white", borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)", overflow: "hidden",
        }}>
          {/* Card Header */}
          <div style={{
            padding: "1.5rem 2rem",
            borderBottom: "2px solid #e2e8f0",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexWrap: "wrap", gap: "1rem",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>👤</span> Manage Supervisors
              </h1>
              <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: "0.875rem" }}>
                View, add, edit and manage all supervisors
              </p>
            </div>
            <button
              className="msv-add-btn"
              onClick={() => setAddOpen(true)}
              style={{
                padding: "0.875rem 1.75rem",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "white", border: "none", borderRadius: "12px",
                fontWeight: 700, cursor: "pointer", fontSize: "0.95rem",
                display: "flex", alignItems: "center", gap: "0.5rem",
                boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                transition: "all 0.2s", fontFamily: "inherit",
              }}
            >
              <span style={{ fontSize: "18px", lineHeight: 1 }}>+</span>
              Add Supervisor
            </button>
          </div>

          {/* Toolbar */}
          <div style={{ padding: "1.25rem 2rem", borderBottom: "1px solid #f1f5f9", background: "#fafafa", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ position: "relative", maxWidth: "420px", flex: 1, minWidth: "220px" }}>
              <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "16px" }}>🔍</span>
              <input
                className="msv-search"
                style={inputStyle}
                placeholder="Search by name, login ID, location..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { label: "All", value: "" },
                { label: "Scanning Supervisor", value: "SC" },
                { label: "Data Entry Supervisor", value: "DE" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRoleFilter(opt.value)}
                  style={{
                    padding: "0.6rem 1rem",
                    borderRadius: "10px",
                    border: `2px solid ${roleFilter === opt.value ? "#3b82f6" : "#e2e8f0"}`,
                    background: roleFilter === opt.value ? "#3b82f6" : "white",
                    color: roleFilter === opt.value ? "white" : "#475569",
                    fontWeight: 600, fontSize: "0.82rem",
                    cursor: "pointer", fontFamily: "inherit",
                    transition: "all 0.2s", whiteSpace: "nowrap",
                  }}
                >{opt.label}</button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderBottom: "2px solid #e2e8f0" }}>
                  {["#", "Name", "Login ID", "Aadhar / GST No.", "Role", "Document", "Assigned Location", "Assigned Blocks", "Actions"].map((h, i) => (
                    <th key={i} style={{
                      padding: "1rem 1.25rem", textAlign: "left",
                      fontWeight: 700, color: "#1e293b", fontSize: "0.875rem",
                      whiteSpace: "nowrap",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "4rem", textAlign: "center" }}>
                      <div style={{ display: "inline-block", width: "40px", height: "40px", border: "4px solid #e2e8f0", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <p style={{ color: "#64748b", marginTop: "1rem" }}>Loading supervisors...</p>
                    </td>
                  </tr>
                ) : displayRows.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ padding: "4rem", textAlign: "center" }}>
                      <div style={{ fontSize: "48px", marginBottom: "1rem", opacity: 0.3 }}>👤</div>
                      <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>No supervisors found</p>
                      {search && <p style={{ color: "#cbd5e1", fontSize: "0.875rem" }}>Try a different search term</p>}
                    </td>
                  </tr>
                ) : (
                  displayRows.map((r, idx) => {
                    const name    = pick(r, ["name", "fullName", "supervisorName"], "—");
                    const loginId = pick(r, ["loginId", "loginID", "supervisorId", "id"], "—");
                    const aadhar  = pick(r, ["aadhar", "aadhaar", "gst", "gstNo", "aadharNo"], "—");
                    const role    = pick(r, ["role", "Role"], "—");
                    const docUrl  = pick(r, ["documentUrl", "document", "docUrl", "pdfUrl"], "");
                    const loc     = pick(r, ["assignedLocation", "location", "zila", "district"], "—");

                    const roleColors = {
                      SC: { bg: "#dbeafe", color: "#1d4ed8" },
                      DE: { bg: "#ede9fe", color: "#5b21b6" },
                    };
                    const roleStyle = roleColors[role] || { bg: "#f1f5f9", color: "#475569" };

                    return (
                      <tr key={loginId + "_" + idx} className="msv-row" style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: idx % 2 === 0 ? "white" : "#f8fafc",
                        transition: "background 0.2s",
                        animation: "fadeIn 0.25s ease",
                      }}>
                        <td style={{ padding: "1rem 1.25rem", color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem" }}>{idx + 1}</td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                            <div style={{
                              width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                              background: "linear-gradient(135deg,#3b82f6,#2563eb)",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "white", fontWeight: 700, fontSize: "0.85rem",
                            }}>{name[0]?.toUpperCase() || "?"}</div>
                            <span style={{ fontWeight: 600, color: "#1e293b" }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <code style={{ background: "#f1f5f9", padding: "3px 8px", borderRadius: "6px", fontSize: "0.85rem", color: "#475569" }}>
                            {loginId}
                          </code>
                        </td>
                        <td style={{ padding: "1rem 1.25rem", color: "#475569", fontSize: "0.9rem" }}>{aadhar}</td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <span style={{ background: roleStyle.bg, color: roleStyle.color, padding: "0.3rem 0.75rem", borderRadius: "20px", fontSize: "0.78rem", fontWeight: 700 }}>
                            {role === "SC" ? "Scanning Supervisor" : role === "DE" ? "Data Entry Supervisor" : role}
                          </span>
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          {docUrl
                            ? <a className="msv-doc-link" href={docUrl} target="_blank" rel="noreferrer" style={{ color: "#3b82f6", fontWeight: 600, fontSize: "0.875rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                                <span>📄</span> View
                              </a>
                            : <span style={{ color: "#cbd5e1" }}>—</span>}
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#475569", fontSize: "0.9rem" }}>
                            <span style={{ fontSize: "14px" }}>📍</span> {loc}
                          </div>
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          {Array.isArray(r.assignedBlocks) && r.assignedBlocks.length > 0 ? (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem", maxWidth: "260px" }}>
                              {r.assignedBlocks.map((b, bi) => (
                                <span key={bi} style={{
                                  background: "#f0fdf4", color: "#166534",
                                  border: "1px solid #bbf7d0",
                                  padding: "0.2rem 0.5rem", borderRadius: "12px",
                                  fontSize: "0.72rem", fontWeight: 600, whiteSpace: "nowrap",
                                }}>{b}</span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: "#cbd5e1" }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "1rem 1.25rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <button
                              className="msv-edit-btn"
                              onClick={(e) => { e.stopPropagation(); setEditRow(r); setEditOpen(true); }}
                              style={{
                                padding: "0.45rem 0.9rem", border: "2px solid #e2e8f0",
                                borderRadius: "10px", background: "white", color: "#475569",
                                fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                                transition: "all 0.2s", fontFamily: "inherit",
                              }}
                              title="Edit"
                            >✎ Edit</button>
                            <button
                              className="msv-del-btn"
                              onClick={(e) => { e.stopPropagation(); handleDelete(r); }}
                              style={{
                                padding: "0.45rem 0.9rem", border: "2px solid #e2e8f0",
                                borderRadius: "10px", background: "white", color: "#475569",
                                fontWeight: 700, cursor: "pointer", fontSize: "0.85rem",
                                transition: "all 0.2s", fontFamily: "inherit",
                              }}
                              title="Delete"
                            >🗑 Delete</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && displayRows.length > 0 && (
            <div style={{ padding: "1rem 2rem", borderTop: "1px solid #f1f5f9", background: "#fafafa", color: "#94a3b8", fontSize: "0.85rem" }}>
              Showing <strong style={{ color: "#475569" }}>{displayRows.length}</strong> of <strong style={{ color: "#475569" }}>{rows.length}</strong> supervisors
              {search && <span> matching "<em>{search}</em>"</span>}
            </div>
          )}
        </div>

        {/* ── Delete Confirm Dialog ── */}
        {deleteConfirm && (
          <div
            className="msv-confirm-overlay"
            onClick={() => setDeleteConfirm(null)}
            style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
          >
            <div onClick={(e) => e.stopPropagation()} style={{ background: "white", borderRadius: "20px", padding: "2rem", maxWidth: "400px", width: "100%", boxShadow: "0 25px 60px rgba(0,0,0,0.2)", textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "1rem" }}>⚠️</div>
              <h3 style={{ margin: "0 0 0.5rem", color: "#1e293b", fontSize: "1.2rem", fontWeight: 700 }}>Delete Supervisor?</h3>
              <p style={{ margin: "0 0 1.5rem", color: "#64748b", fontSize: "0.95rem" }}>
                Are you sure you want to delete <strong>{pick(deleteConfirm, ["name", "fullName", "supervisorName"], "this supervisor")}</strong>? This action cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
                <button onClick={() => setDeleteConfirm(null)} style={{ padding: "0.75rem 1.5rem", border: "2px solid #e2e8f0", borderRadius: "12px", background: "white", color: "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit" }}>
                  Cancel
                </button>
                <button onClick={confirmDelete} style={{ padding: "0.75rem 1.75rem", border: "none", borderRadius: "12px", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "white", fontWeight: 700, cursor: "pointer", fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(239,68,68,0.3)", fontFamily: "inherit" }}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      <EditSupervisorModal
        isOpen={editOpen}
        row={editRow}
        zilaList={zilaList}
        onClose={() => { setEditOpen(false); setEditRow(null); }}
        onUpdate={(payload) => { console.log("Update payload:", payload); setEditOpen(false); setEditRow(null); fetchSupervisors(""); }}
      />
      <EditSupervisorModal
        isOpen={addOpen}
        row={null}
        zilaList={zilaList}
        onClose={() => setAddOpen(false)}
        onUpdate={(payload) => { console.log("Add payload:", payload); setAddOpen(false); fetchSupervisors(""); }}
      />
    </>
  );
};

export default ManageSupervisorView;