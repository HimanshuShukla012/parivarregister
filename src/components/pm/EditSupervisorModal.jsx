// src/components/pm/EditSupervisorModal.jsx
import { useEffect, useState } from "react";
import manageSupervisorService from "../../services/manageSupervisorService";

const ROLE_OPTIONS = [
  { label: "Data Entry Supervisor", value: "DE" },
  { label: "Scanning Supervisor",   value: "SC" },
];

const EditSupervisorModal = ({ isOpen, onClose, onUpdate, row }) => {
  const pick = (obj, keys, fallback = "") => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return fallback;
  };

  // ── Form state ────────────────────────────────────────────────────────────
  const [role,              setRole]              = useState("DE");
  const [name,              setName]              = useState("");
  const [aadharNo,          setAadharNo]          = useState("");
  const [docFile,           setDocFile]           = useState(null);
  const [docFileName,       setDocFileName]       = useState("");
  const [saving,            setSaving]            = useState(false);
  const [error,             setError]             = useState("");
  const [saved,             setSaved]             = useState(false);

  // ── Zila / Block state ────────────────────────────────────────────────────
  const [zilaBlocks,        setZilaBlocks]        = useState([]); // raw API data
  const [zilaLoading,       setZilaLoading]       = useState(false);
  const [selectedZilaCode,  setSelectedZilaCode]  = useState(""); // zilaCode (sent to API)
  const [availableBlocks,   setAvailableBlocks]   = useState([]); // blocks for selected zila
  const [selectedBlocks,    setSelectedBlocks]    = useState([]); // [{blockName, blockCode}] multi-select

  const isAdd = !row;

  // ── Fetch zila+block list once on open ───────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const load = async () => {
      setZilaLoading(true);
      try {
        const data = await manageSupervisorService.getZilaBlocks();
        setZilaBlocks(Array.isArray(data) ? data : []);
      } catch {
        setZilaBlocks([]);
      } finally {
        setZilaLoading(false);
      }
    };
    load();
  }, [isOpen]);

  // ── When zila changes, refresh available blocks ───────────────────────────
  useEffect(() => {
    if (!selectedZilaCode) { setAvailableBlocks([]); setSelectedBlocks([]); return; }
    const zila = zilaBlocks.find((z) => String(z.zilaCode) === String(selectedZilaCode));
    const blocks = zila?.blocks || [];
    setAvailableBlocks(blocks);
    // Pre-select blocks from row when editing
    if (row && Array.isArray(row.assignedBlocks) && row.assignedBlocks.length > 0) {
      const preSelected = blocks.filter((b) =>
        row.assignedBlocks.some(
          (rb) => rb.toLowerCase() === b.blockName?.toLowerCase()
        )
      );
      setSelectedBlocks(preSelected);
    } else {
      setSelectedBlocks([]);
    }
  }, [selectedZilaCode, zilaBlocks]);

  // ── Pre-fill when editing ─────────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (!row) {
      setRole("DE"); setName(""); setAadharNo("");
      setDocFile(null); setDocFileName("");
      setSelectedZilaCode(""); setSelectedBlocks([]);
      setError("");
      return;
    }
    setRole(pick(row, ["role", "Role"], "DE"));
    setName(pick(row, ["name", "fullName", "supervisorName"], ""));
    setAadharNo(pick(row, ["aadhar", "aadhaar", "aadharNo", "gst", "gstNo"], ""));
    setDocFile(null); setDocFileName("");
    setError("");
    // Pre-select zila by matching assignedLocation name against zilaBlocks list
    const existingLocName = pick(row, ["assignedLocation", "location", "zila", "district"], "");
    const existingZilaCode = pick(row, ["zilaCode", "assignedLocationCode"], "");
    if (existingZilaCode) {
      setSelectedZilaCode(String(existingZilaCode));
    } else if (existingLocName && zilaBlocks.length > 0) {
      const match = zilaBlocks.find(
        (z) => z.zilaName?.toLowerCase() === existingLocName.toLowerCase()
      );
      if (match) setSelectedZilaCode(String(match.zilaCode));
    }
  }, [row, isOpen, zilaBlocks]);

  if (!isOpen) return null;

  // ── Block multi-select toggle ─────────────────────────────────────────────
  const toggleBlock = (block) => {
    setSelectedBlocks((prev) => {
      const exists = prev.find((b) => b.blockCode === block.blockCode);
      return exists
        ? prev.filter((b) => b.blockCode !== block.blockCode)
        : [...prev, block];
    });
  };

  const isBlockSelected = (block) =>
    selectedBlocks.some((b) => b.blockCode === block.blockCode);

  // ── File input ────────────────────────────────────────────────────────────
  const handleFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setDocFile(f);
    setDocFileName(f ? f.name : "");
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
  setError("");

  if (isAdd) {
  if (!role)                       { setError("Please select a role."); return; }
  if (!name.trim())                { setError("Full name is required."); return; }
  if (!aadharNo.trim())            { setError("Aadhar number is required."); return; }
  if (!selectedZilaCode)           { setError("Please select a district."); return; }
  if (selectedBlocks.length === 0) { setError("Please select at least one block."); return; }
  if (!docFile)                    { setError("Please upload a document (PDF)."); return; }
}
   else {
    if (selectedBlocks.length === 0) { setError("Please select at least one block."); return; }
  }

    setSaving(true);
    try {
      const [firstBlock, ...extraBlocks] = selectedBlocks;

      if (isAdd) {
        // Create supervisor + assign extra blocks
        const selectedZila = zilaBlocks.find((z) => String(z.zilaCode) === String(selectedZilaCode));
        await manageSupervisorService.insertSupervisorWithBlocks(
          {
            name:             name.trim(),
            role,
            aadharNo:         aadharNo.trim(),
            assignedLocation: selectedZila?.zilaName || selectedZilaCode, // zilaName
            assignedBlock:    firstBlock.blockName,                        // blockName
            document:         docFile,
          },
          extraBlocks.map((b) => b.blockName)
        );
      } else {
// Edit: pass all selected blocks as a single comma-separated call
        const supervisorId = row?.loginId || row?.loginID;
        if (!supervisorId) { setError("Supervisor ID not found."); setSaving(false); return; }

        const blockNames = selectedBlocks.map((b) => b.blockName).join(",");
        await manageSupervisorService.addBlockToSupervisor(supervisorId, blockNames);
        setSaving(false);
        setSaved(true);
        setTimeout(() => { setSaved(false); onClose(); onUpdate?.(); }, 1800);
        return;
      }

      onUpdate?.();
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem",
    border: "2px solid #e2e8f0", borderRadius: "12px",
    fontSize: "0.95rem", outline: "none", fontFamily: "inherit",
    color: "#1e293b", background: "white",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const labelStyle = {
    display: "block", marginBottom: "0.4rem",
    fontWeight: "600", color: "#475569",
    fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px",
  };

  // Selected block name pills summary
  const blockSummary = selectedBlocks.length === 0
    ? "No blocks selected"
    : selectedBlocks.map((b) => b.blockName).join(", ");

  return (
    <>
      <style>{`
        .esm-overlay { animation: esmFadeIn 0.2s ease; }
        .esm-card    { animation: esmSlideUp 0.25s cubic-bezier(0.34,1.56,0.64,1); }
        @keyframes esmFadeIn  { from{opacity:0} to{opacity:1} }
        @keyframes esmSlideUp { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .esm-input:focus   { border-color:#3b82f6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .esm-select:focus  { border-color:#3b82f6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .esm-close:hover   { background:#fee2e2 !important; color:#dc2626 !important; }
        .esm-cancel:hover  { background:#f1f5f9 !important; }
        .esm-save:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 20px rgba(59,130,246,0.35) !important; }
        .esm-file-label:hover { border-color:#3b82f6 !important; background:#eff6ff !important; }
        .esm-block-chip { transition: all 0.15s; cursor: pointer; user-select: none; }
        .esm-block-chip:hover { transform: translateY(-1px); }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>

      <div
        className="esm-overlay"
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1000,
          background: "rgba(15,23,42,0.45)", backdropFilter: "blur(3px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div
          className="esm-card"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "white", borderRadius: "20px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
            width: "100%", maxWidth: "600px",
            overflow: "hidden", maxHeight: "90vh", display: "flex", flexDirection: "column",
          }}
        >
          {/* ── Header ── */}
          <div style={{
            background: "linear-gradient(135deg,#3b82f6,#2563eb)",
            padding: "1.5rem 1.75rem",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            flexShrink: 0,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <div style={{
                background: "rgba(255,255,255,0.2)", borderRadius: "10px",
                width: "38px", height: "38px", display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: "18px",
              }}>
                {isAdd ? "+" : "✎"}
              </div>
              <div>
                <h2 style={{ margin: 0, color: "white", fontSize: "1.2rem", fontWeight: 700 }}>
                  {isAdd ? "Add Supervisor" : "Edit Supervisor"}
                </h2>
                <p style={{ margin: 0, color: "rgba(255,255,255,0.75)", fontSize: "0.8rem", marginTop: "2px" }}>
                  {isAdd ? "Fill details to register a new supervisor" : `Editing: ${name || "Supervisor"}`}
                </p>
              </div>
            </div>
            <button
              className="esm-close"
              onClick={onClose}
              style={{
                background: "rgba(255,255,255,0.15)", border: "none",
                borderRadius: "10px", width: "36px", height: "36px",
                color: "white", fontSize: "20px", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s", lineHeight: 1,
              }}
            >×</button>
          </div>

          {/* ── Scrollable Body ── */}
          <div style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.1rem", overflowY: "auto" }}>

            {/* Error banner */}
            {error && (
              <div style={{
                background: "#fef2f2", border: "1px solid #fecaca",
                borderRadius: "10px", padding: "0.75rem 1rem",
                color: "#dc2626", fontSize: "0.875rem", fontWeight: 600,
                display: "flex", gap: "0.5rem", alignItems: "center",
              }}>
                <span>⚠️</span> {error}
              </div>
            )}

            {/* Success banner */}
            {saved && (
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: "10px", padding: "0.75rem 1rem",
                color: "#166534", fontSize: "0.875rem", fontWeight: 600,
                display: "flex", gap: "0.5rem", alignItems: "center",
              }}>
                <span>✅</span> Changes saved successfully!
              </div>
            )}

            {/* Role */}
            <div>
              <label style={labelStyle}>Role</label>
              {isAdd ? (
                <select className="esm-select" value={role} onChange={(e) => setRole(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                  {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              ) : (
                <div style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}>
                  {ROLE_OPTIONS.find((r) => r.value === role)?.label || role}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label style={labelStyle}>Full Name <span style={{ color: "#ef4444" }}>*</span></label>
              {isAdd ? (
                <input className="esm-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" style={inputStyle} />
              ) : (
                <div style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}>{name || "—"}</div>
              )}
            </div>

            {/* Aadhar */}
            <div>
              <label style={labelStyle}>Aadhar No.</label>
              {isAdd ? (
                <input className="esm-input" value={aadharNo} onChange={(e) => setAadharNo(e.target.value)} placeholder="Enter 12-digit Aadhar number" style={inputStyle} />
              ) : (
                <div style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}>{aadharNo || "—"}</div>
              )}
            </div>

            {/* District (Zila) */}
            <div>
              <label style={labelStyle}>
                District <span style={{ color: "#ef4444" }}>*</span>
                {zilaLoading && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: "0.5rem" }}>Loading...</span>}
              </label>
              {isAdd ? (
                <select
                  className="esm-select"
                  value={selectedZilaCode}
                  onChange={(e) => setSelectedZilaCode(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                  disabled={zilaLoading}
                >
                  <option value="">Select district</option>
                  {zilaBlocks.map((z) => (
                    <option key={z.zilaCode} value={z.zilaCode}>{z.zilaName}</option>
                  ))}
                </select>
              ) : (
                <div style={{ ...inputStyle, background: "#f8fafc", color: "#94a3b8", cursor: "not-allowed" }}>
                  {zilaBlocks.find((z) => String(z.zilaCode) === String(selectedZilaCode))?.zilaName || row?.assignedLocation || "—"}
                </div>
              )}
            </div>

            {/* Block multi-select — displays names as chips, sends blockName in API */}
            <div>
              <label style={labelStyle}>
                Blocks <span style={{ color: "#ef4444" }}>*</span>
                <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", marginLeft: "0.5rem", fontSize: "0.8rem" }}>
                  (select one or more)
                </span>
              </label>

              {!selectedZilaCode ? (
                <div style={{
                  padding: "1rem", border: "2px dashed #e2e8f0", borderRadius: "12px",
                  color: "#94a3b8", fontSize: "0.875rem", textAlign: "center",
                }}>
                  Select a district first
                </div>
              ) : availableBlocks.length === 0 ? (
                <div style={{
                  padding: "1rem", border: "2px dashed #e2e8f0", borderRadius: "12px",
                  color: "#94a3b8", fontSize: "0.875rem", textAlign: "center",
                }}>
                  No blocks available for this district
                </div>
              ) : (
                <>
                  {/* Selected summary */}
                  {selectedBlocks.length > 0 && (
                    <div style={{
                      marginBottom: "0.6rem", padding: "0.5rem 0.75rem",
                      background: "#eff6ff", borderRadius: "8px",
                      fontSize: "0.8rem", color: "#1d4ed8", fontWeight: 600,
                    }}>
                      ✓ {selectedBlocks.length} block{selectedBlocks.length > 1 ? "s" : ""} selected: {blockSummary}
                    </div>
                  )}

                  {/* Chip grid */}
                  <div style={{
                    display: "flex", flexWrap: "wrap", gap: "0.5rem",
                    padding: "0.875rem", border: "2px solid #e2e8f0",
                    borderRadius: "12px", background: "#f8fafc",
                    maxHeight: "180px", overflowY: "auto",
                  }}>
                    {availableBlocks.map((block) => {
                      const selected = isBlockSelected(block);
                      return (
                        <button
                          key={block.blockCode}
                          type="button"
                          className="esm-block-chip"
                          onClick={() => toggleBlock(block)}
                          style={{
                            padding: "0.4rem 0.875rem",
                            borderRadius: "20px",
                            border: `2px solid ${selected ? "#3b82f6" : "#e2e8f0"}`,
                            background: selected ? "#3b82f6" : "white",
                            color: selected ? "white" : "#475569",
                            fontWeight: selected ? 700 : 500,
                            fontSize: "0.8rem",
                            fontFamily: "inherit",
                          }}
                          title={`Block code: ${block.blockCode}`}
                        >
                          {selected && <span style={{ marginRight: "0.3rem" }}>✓</span>}
                          {block.blockName}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

{/* Document upload — add only */}
            {isAdd && <div>
              <label style={labelStyle}>Document (PDF only) <span style={{ color: "#ef4444" }}>*</span></label>
              <label
                className="esm-file-label"
                style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.875rem 1rem",
                  border: `2px dashed ${docFileName ? "#10b981" : "#e2e8f0"}`,
                  borderRadius: "12px", cursor: "pointer",
                  background: docFileName ? "#f0fdf4" : "#f8fafc",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "22px" }}>{docFileName ? "📄" : "📁"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "0.9rem",
                    color: docFileName ? "#059669" : "#64748b",
                    fontWeight: docFileName ? 600 : 400,
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>
                    {docFileName || "Click to browse PDF file"}
                  </div>
                  {!docFileName && <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginTop: "2px" }}>Max size: 10 MB</div>}
                </div>
                {docFileName && (
                  <span
                    onClick={(e) => { e.preventDefault(); setDocFile(null); setDocFileName(""); }}
                    style={{ color: "#ef4444", fontWeight: 700, fontSize: "16px", cursor: "pointer", flexShrink: 0 }}
                  >✕</span>
                )}
                <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: "none" }} />
              </label>
            </div>}
          </div>

          {/* ── Footer ── */}
          <div style={{
            padding: "1.25rem 1.75rem",
            borderTop: "2px solid #f1f5f9",
            display: "flex", gap: "0.75rem", justifyContent: "flex-end",
            background: "#f8fafc", flexShrink: 0,
          }}>
            <button
              className="esm-cancel"
              onClick={onClose}
              style={{
                padding: "0.75rem 1.5rem", border: "2px solid #e2e8f0",
                borderRadius: "12px", background: "white", color: "#64748b",
                fontWeight: 600, cursor: "pointer", fontSize: "0.9rem",
                transition: "all 0.2s", fontFamily: "inherit",
              }}
            >Cancel</button>

            <button
              className="esm-save"
              onClick={handleSubmit}
              disabled={saving}
              style={{
                padding: "0.75rem 2rem", border: "none", borderRadius: "12px",
                background: saving ? "#cbd5e1" : "linear-gradient(135deg,#3b82f6,#2563eb)",
                color: "white", fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                fontSize: "0.9rem", boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                transition: "all 0.2s", fontFamily: "inherit",
                display: "flex", alignItems: "center", gap: "0.5rem",
              }}
            >
              {saving
                ? <>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    Saving...
                  </>
                : (isAdd ? "Add Supervisor" : "Save Changes")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditSupervisorModal;