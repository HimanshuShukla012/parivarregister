// src/components/admin/ApprovedDataView.jsx
import { useState, useEffect, useMemo } from "react";
import completeDataService from "../../services/completeDataService";

// ─── Download dropdown button ─────────────────────────────────────────────────
const DownloadMenu = ({ row, onPDF, onExcel }) => {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          padding: "0.45rem 0.9rem",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "white",
          border: "none",
          borderRadius: "10px",
          fontWeight: 700,
          fontSize: "0.82rem",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "5px",
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(245,158,11,0.3)",
          fontFamily: "inherit",
        }}
      >
        📥 डाउनलोड रजिस्टर
        <span style={{ fontSize: "10px", marginLeft: "2px" }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <>
          {/* backdrop */}
          <div
            style={{ position: "fixed", inset: 0, zIndex: 100 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              right: 0,
              zIndex: 101,
              background: "white",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
              border: "1px solid #e2e8f0",
              overflow: "hidden",
              minWidth: "170px",
              animation: "ddFadeIn 0.15s ease",
            }}
          >
            <button
              onClick={() => { setOpen(false); onPDF(row); }}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#1e293b",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#fef3c7"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <span style={{ fontSize: "18px" }}>📄</span>
              PDF में डाउनलोड
            </button>
            <div style={{ height: "1px", background: "#f1f5f9", margin: "0 0.75rem" }} />
            <button
              onClick={() => { setOpen(false); onExcel(row); }}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#1e293b",
                fontFamily: "inherit",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "#d1fae5"}
              onMouseLeave={(e) => e.currentTarget.style.background = "none"}
            >
              <span style={{ fontSize: "18px" }}>📊</span>
              Excel में डाउनलोड
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ApprovedDataView = () => {
  const [zilaList,       setZilaList]       = useState([]);
  const [blockList,      setBlockList]      = useState([]);
  const [selectedZila,   setSelectedZila]   = useState("");
  const [selectedBlock,  setSelectedBlock]  = useState("");
  const [tableData,      setTableData]      = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [zilaLoading,    setZilaLoading]    = useState(true);
  const [blockLoading,   setBlockLoading]   = useState(false);
  const [hasFetched,     setHasFetched]     = useState(false);
  const [search,         setSearch]         = useState("");

  // ── Load Zila list on mount ──
  useEffect(() => {
    (async () => {
      setZilaLoading(true);
      try {
        const data = await completeDataService.getZilaList();
        const list = Array.isArray(data) ? data : data?.data || [];
        setZilaList(list);
      } catch {
        setZilaList([]);
      } finally {
        setZilaLoading(false);
      }
    })();
  }, []);

  // ── Load Blocks when Zila changes ──
  const handleZilaChange = async (zila) => {
    setSelectedZila(zila);
    setSelectedBlock("");
    setBlockList([]);
    setTableData([]);
    setHasFetched(false);
    setSearch("");
    if (!zila) return;

    setBlockLoading(true);
    try {
      const data = await completeDataService.getBlocksByZila(zila);
      const list = Array.isArray(data)
        ? data.map((b) => (typeof b === "string" ? b : b?.block || b?.name)).filter(Boolean)
        : [];
      setBlockList(list);
    } catch {
      setBlockList([]);
    } finally {
      setBlockLoading(false);
    }
  };

  // ── Fetch table data ──
  const handleFetch = async () => {
    if (!selectedZila || !selectedBlock) {
      alert("कृपया जिला और ब्लाक दोनों चुनें");
      return;
    }
    setLoading(true);
    setTableData([]);
    setSearch("");
    try {
      const data = await completeDataService.getCompletedBlock(selectedZila, selectedBlock);
      const rows = Array.isArray(data) ? data : data?.data || [];
      setTableData(rows);
    } catch {
      setTableData([]);
      alert("डेटा लोड नहीं हुआ। पुनः प्रयास करें।");
    } finally {
      setLoading(false);
      setHasFetched(true);
    }
  };

  // ── Helpers ──
  const pick = (obj, keys, fallback = "") => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return fallback;
  };

  const getZilaName  = (item) => typeof item === "string" ? item : item?.zila  || "";
  const getBlockName = (item) => typeof item === "string" ? item : item?.block || item?.name || "";

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tableData;
    return tableData.filter((r) => {
      const zila   = pick(r, ["zila", "district", "zilaName"], "").toLowerCase();
      const tehsil = pick(r, ["tehsil", "tehsilName"], "").toLowerCase();
      const block  = pick(r, ["block", "blockName"], "").toLowerCase();
      return zila.includes(q) || tehsil.includes(q) || block.includes(q);
    });
  }, [tableData, search]);

  const handleDownloadPDF = (row) => {
    completeDataService.downloadRegisterPDF({
      zila:       pick(row, ["zila", "district"]),
      block:      pick(row, ["block", "blockName"]),
      tehsil:     pick(row, ["tehsil", "tehsilName"]),
      registerNo: pick(row, ["registerNo", "register_no", "regNo"]),
      gaonCode:   pick(row, ["gaonCode", "gaon_code"]),
    });
  };

  const handleDownloadExcel = (row) => {
    completeDataService.downloadRegisterExcel({
      zila:       pick(row, ["zila", "district"]),
      block:      pick(row, ["block", "blockName"]),
      tehsil:     pick(row, ["tehsil", "tehsilName"]),
      registerNo: pick(row, ["registerNo", "register_no", "regNo"]),
      gaonCode:   pick(row, ["gaonCode", "gaon_code"]),
    });
  };

  // ── Stats ──
  const totalBlocks  = tableData.length;
  const uniqueZilas  = new Set(tableData.map((r) => pick(r, ["zila", "district"]))).size;
  const uniqueTehsil = new Set(tableData.map((r) => pick(r, ["tehsil", "tehsilName"]))).size;

  const selectStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "2px solid #e2e8f0",
    borderRadius: "12px",
    fontSize: "0.95rem",
    outline: "none",
    background: "white",
    color: "#1e293b",
    cursor: "pointer",
    fontFamily: "inherit",
  };

  return (
    <>
      <style>{`
        @keyframes ddFadeIn  { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
        @keyframes spin      { to { transform: rotate(360deg); } }
        .adv-row:hover { background: #eff6ff !important; }
        .adv-fetch-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 20px rgba(59,130,246,0.4) !important; }
        .adv-zila-select:focus,
        .adv-block-select:focus { border-color:#3b82f6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .adv-search:focus { border-color:#3b82f6 !important; box-shadow:0 0 0 3px rgba(59,130,246,0.12); }
        .adv-stat-card { transition:transform 0.2s,box-shadow 0.2s; }
        .adv-stat-card:hover { transform:translateY(-2px); }
        .adv-table-row { animation: fadeSlide 0.2s ease; }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(to bottom right, #f8fafc, #e0e7ff)",
        padding: "2rem",
      }}>

        {/* ── Stat Cards (shown after fetch) ── */}
        {hasFetched && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1.5rem",
            maxWidth: "1400px",
            margin: "0 auto 2rem",
          }}>
            {[
              { label: "कुल ब्लाक",  value: totalBlocks,  gradient: "linear-gradient(135deg,#10b981,#059669)", shadow: "rgba(16,185,129,0.3)",  icon: "✅" },
              { label: "जिले",       value: uniqueZilas,  gradient: "linear-gradient(135deg,#3b82f6,#2563eb)", shadow: "rgba(59,130,246,0.3)",  icon: "🗺" },
              { label: "तहसील",      value: uniqueTehsil, gradient: "linear-gradient(135deg,#f59e0b,#d97706)", shadow: "rgba(245,158,11,0.3)",  icon: "📍" },
              { label: "फ़िल्टर्ड",   value: filteredRows.length, gradient: "linear-gradient(135deg,#8b5cf6,#7c3aed)", shadow: "rgba(139,92,246,0.3)", icon: "🔍" },
            ].map((c, i) => (
              <div key={i} className="adv-stat-card" style={{
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
        )}

        {/* ── Main Card ── */}
        <div style={{
          maxWidth: "1400px",
          margin: "0 auto",
          background: "white",
          borderRadius: "20px",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}>

          {/* Card Header */}
          <div style={{
            padding: "1.5rem 2rem",
            borderBottom: "2px solid #e2e8f0",
            background: "linear-gradient(135deg, #fef3c7, #fde68a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span>✅</span> Verified Blocks
              </h1>
              <p style={{ margin: "3px 0 0", color: "#64748b", fontSize: "0.875rem" }}>
                स्वीकृत/पूर्ण ब्लाक का डेटा देखें और डाउनलोड करें
              </p>
            </div>
            {hasFetched && tableData.length > 0 && (
              <div style={{
                background: "rgba(255,255,255,0.7)",
                border: "2px solid rgba(16,185,129,0.3)",
                borderRadius: "12px",
                padding: "0.6rem 1.2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                fontSize: "0.9rem",
                fontWeight: 700,
                color: "#059669",
              }}>
                <span>●</span> {tableData.length} रिकॉर्ड मिले
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div style={{
            padding: "1.5rem 2rem",
            borderBottom: "1px solid #f1f5f9",
            background: "#fafafa",
          }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr auto",
              gap: "1rem",
              alignItems: "end",
              maxWidth: "700px",
            }}>
              {/* Zila */}
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, color: "#475569", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ज़िला <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="adv-zila-select"
                  value={selectedZila}
                  onChange={(e) => handleZilaChange(e.target.value)}
                  disabled={zilaLoading}
                  style={selectStyle}
                >
                  <option value="">{zilaLoading ? "लोड हो रहा है..." : "जिला चुनें"}</option>
                  {zilaList.map((item, idx) => {
                    const name = getZilaName(item);
                    return name ? <option key={name + idx} value={name}>{name}</option> : null;
                  })}
                </select>
              </div>

              {/* Block */}
              <div>
                <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 700, color: "#475569", fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  ब्लाक <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <select
                  className="adv-block-select"
                  value={selectedBlock}
                  onChange={(e) => setSelectedBlock(e.target.value)}
                  disabled={!selectedZila || blockLoading}
                  style={{ ...selectStyle, opacity: !selectedZila ? 0.6 : 1 }}
                >
                  <option value="">
                    {blockLoading ? "लोड हो रहा है..." : !selectedZila ? "पहले जिला चुनें" : "ब्लाक चुनें"}
                  </option>
                  {blockList.map((b, idx) => {
                    const name = getBlockName(b);
                    return name ? <option key={name + idx} value={name}>{name}</option> : null;
                  })}
                </select>
              </div>

              {/* Fetch Button */}
              <button
                className="adv-fetch-btn"
                onClick={handleFetch}
                disabled={loading || !selectedZila || !selectedBlock}
                style={{
                  padding: "0.78rem 1.75rem",
                  background: loading || !selectedZila || !selectedBlock
                    ? "#cbd5e1"
                    : "linear-gradient(135deg, #3b82f6, #2563eb)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: loading || !selectedZila || !selectedBlock ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(59,130,246,0.3)",
                  transition: "all 0.2s",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  whiteSpace: "nowrap",
                }}
              >
                {loading ? (
                  <>
                    <span style={{ display: "inline-block", width: "14px", height: "14px", border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid white", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                    लोड हो रहा है...
                  </>
                ) : (
                  <><span>🔍</span> डाटा पाएं</>
                )}
              </button>
            </div>
          </div>

          {/* Search bar — shown only when data is present */}
          {hasFetched && tableData.length > 0 && (
            <div style={{ padding: "1rem 2rem", borderBottom: "1px solid #f1f5f9", background: "white" }}>
              <div style={{ position: "relative", maxWidth: "380px" }}>
                <span style={{ position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>🔍</span>
                <input
                  className="adv-search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by जिला, तहसील, ब्लाक..."
                  style={{
                    width: "100%",
                    padding: "0.7rem 1rem 0.7rem 2.75rem",
                    border: "2px solid #e2e8f0",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    outline: "none",
                    fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>
          )}

          {/* ── Table ── */}
          <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: hasFetched ? "520px" : "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
                <tr style={{ background: "linear-gradient(135deg, #fef3c7, #fde68a)", borderBottom: "2px solid #e2e8f0" }}>
                  {[
                    { label: "#",               width: "50px"  },
                    { label: "जिला",            width: ""      },
                    { label: "तहसील",           width: ""      },
                    { label: "ब्लाक",           width: ""      },
                    { label: "डाउनलोड रजिस्टर", width: "200px" },
                  ].map((h, i) => (
                    <th key={i} style={{
                      padding: "1rem 1.25rem",
                      textAlign: "left",
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.9rem",
                      width: h.width || "auto",
                      whiteSpace: "nowrap",
                      borderRight: i < 4 ? "1px solid rgba(0,0,0,0.06)" : "none",
                    }}>{h.label}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Loading state */}
                {loading && (
                  <tr>
                    <td colSpan={5} style={{ padding: "4rem", textAlign: "center" }}>
                      <div style={{ display: "inline-block", width: "44px", height: "44px", border: "4px solid #e2e8f0", borderTop: "4px solid #3b82f6", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      <p style={{ color: "#64748b", marginTop: "1rem", fontWeight: 500 }}>
                        डेटा लोड हो रहा है...
                      </p>
                    </td>
                  </tr>
                )}

                {/* Empty state — not yet fetched */}
                {!loading && !hasFetched && (
                  <tr>
                    <td colSpan={5} style={{ padding: "4rem", textAlign: "center" }}>
                      <div style={{ fontSize: "52px", marginBottom: "1rem", opacity: 0.25 }}>🗺</div>
                      <p style={{ color: "#94a3b8", fontSize: "1rem", fontWeight: 500 }}>
                        जिला और ब्लाक चुनकर <strong>डाटा पाएं</strong> पर क्लिक करें
                      </p>
                    </td>
                  </tr>
                )}

                {/* No results */}
                {!loading && hasFetched && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "4rem", textAlign: "center" }}>
                      <div style={{ fontSize: "52px", marginBottom: "1rem", opacity: 0.25 }}>
                        {search ? "🔍" : "📭"}
                      </div>
                      <p style={{ color: "#94a3b8", fontSize: "1rem", fontWeight: 500 }}>
                        {search
                          ? `"${search}" के लिए कोई रिकॉर्ड नहीं मिला`
                          : "इस ब्लाक के लिए कोई डेटा उपलब्ध नहीं है"}
                      </p>
                    </td>
                  </tr>
                )}

                {/* Data rows */}
                {!loading && filteredRows.map((row, idx) => {
                  const zila   = pick(row, ["zila", "district", "zilaName"],    "—");
                  const tehsil = pick(row, ["tehsil", "tehsilName"],             "—");
                  const block  = pick(row, ["block", "blockName"],              "—");

                  return (
                    <tr
                      key={idx}
                      className="adv-row adv-table-row"
                      style={{
                        borderBottom: "1px solid #e2e8f0",
                        background: idx % 2 === 0 ? "white" : "#f8fafc",
                        transition: "background 0.15s",
                      }}
                    >
                      <td style={{ padding: "0.9rem 1.25rem", color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem", borderRight: "1px solid #f1f5f9" }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", borderRight: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "14px" }}>🗺</span>
                          <span style={{ fontWeight: 600, color: "#1e293b" }}>{zila}</span>
                        </div>
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", color: "#475569", borderRight: "1px solid #f1f5f9" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{ fontSize: "13px" }}>📍</span>
                          {tehsil}
                        </div>
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem", borderRight: "1px solid #f1f5f9" }}>
                        <span style={{
                          background: "#d1fae5",
                          color: "#065f46",
                          padding: "0.3rem 0.75rem",
                          borderRadius: "20px",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                        }}>
                          ✓ {block}
                        </span>
                      </td>
                      <td style={{ padding: "0.9rem 1.25rem" }}>
                        <DownloadMenu
                          row={row}
                          onPDF={handleDownloadPDF}
                          onExcel={handleDownloadExcel}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer count */}
          {!loading && hasFetched && filteredRows.length > 0 && (
            <div style={{
              padding: "0.875rem 2rem",
              borderTop: "1px solid #f1f5f9",
              background: "#fafafa",
              color: "#94a3b8",
              fontSize: "0.85rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span>
                दिखाए जा रहे हैं <strong style={{ color: "#475569" }}>{filteredRows.length}</strong> / <strong style={{ color: "#475569" }}>{tableData.length}</strong> ब्लाक
                {search && <span> — खोज: "<em>{search}</em>"</span>}
              </span>
              <span style={{ color: "#10b981", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span>✓</span> {selectedZila} › {selectedBlock}
              </span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ApprovedDataView;