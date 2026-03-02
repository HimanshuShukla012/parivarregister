// src/pages/dashboards/ado/ADODashboard.jsx
import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import GaonDataTable from "../../../components/hq/GaonDataTable";
import ADOVerifyDataEntryForm from "../../../components/ado/ADOVerifyDataEntryForm";
import ADOSabhaApprovalTable from "../../../components/ado/ADOSabhaApprovalTable";
import "../../../assets/styles/pages/hq.css";
import api from "../../../services/api";
import { fetchSabhaReport } from "../../../services/adoService";

const ADODashboard = () => {
  const DEFAULT_BLOCK = "Katehari";
  const [loading, setLoading] = useState(true);
  const [blockName, setBlockName] = useState("");
  const [sabhaReport, setSabhaReport] = useState([]);
  const [error, setError] = useState("");
  const [gaonData, setGaonData] = useState([]);
  const [showGaonData, setShowGaonData] = useState(false);

  // villages modal
  const [villagesOpen, setVillagesOpen] = useState(false);
  const [selectedSabha, setSelectedSabha] = useState(null);

  const handleGaonDataLoad = (data) => {
    setGaonData(data);
    setShowGaonData(true);
  };

  useEffect(() => {
    document.body.classList.add("hq-page");
    return () => document.body.classList.remove("hq-page");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlBlock = params.get("block");
    const resolved = (urlBlock || DEFAULT_BLOCK || "").trim();
    setBlockName(resolved);
    if (!urlBlock && resolved) {
      params.set("block", resolved);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`,
      );
    }
  }, []);

  const loadSabhaReport = async (block) => {
    if (!block) {
      setLoading(false);
      setSabhaReport([]);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await fetchSabhaReport(block);
      const rows = Array.isArray(data) ? data : data?.response || [];
      setSabhaReport(rows);
    } catch (e) {
      console.error(e);
      setSabhaReport([]);
      setError(e?.message || "Failed to load report.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSabhaReport(blockName);
  }, [blockName]);

  const pageTitle = useMemo(
    () => (blockName ? `ADO Dashboard — ${blockName} Block` : "ADO Dashboard"),
    [blockName],
  );

  const downloadSabhaReportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();
      const data = (sabhaReport || []).map((r, i) => ({
        "SL NO": r.sl_no ?? i + 1,
        "Sabha Name": r.sabha_name ?? "",
        "Sabha Code": r.sabha_code ?? "",
        "No. of Villages": r.no_of_villages ?? 0,
        "Uninhabited Villages": r.uninhabited_villages ?? 0,
        "Inhabited Villages": r.inhabited_villages ?? 0,
        "Registers Taken Over": r.registers_taken_over ?? 0,
        "Registers Scanned": r.registers_scanned ?? 0,
        "Families Registered": r.families_registered ?? 0,
        "Families Verified": r.families_verified ?? 0,
        "Families Rejected": r.families_rejected ?? 0,
        "Verification %": r.percentage_verification ?? 0,
        "Sabha Status": r.sabha_status ?? "",
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Sabha Report");
      XLSX.writeFile(wb, `${blockName || "ADO"}_Sabha_Report.xlsx`);
    } catch (e) {
      console.error(e);
    }
  };

  const openVillages = (row) => { setSelectedSabha(row); setVillagesOpen(true); };
  const closeVillages = () => { setVillagesOpen(false); setSelectedSabha(null); };

  const formatPercent = (val) => {
    const n = Number(val);
    return Number.isNaN(n) ? "0%" : `${n.toFixed(2)}%`;
  };

  return (
    <div className="hq-dashboard hq-page">
      {/* Header */}
      <div className="header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="/assets/images/Department_Logo.png"
              alt="Panchayati Raj Logo"
              className="logo-img"
            />
            <div className="title-section">
              <h1>पंचायती राज मंत्रालय</h1>
              <h2>Ministry of Panchayati Raj</h2>
            </div>
          </div>
          <div className="right-section">
            <img
              src="/assets/images/Kds_logo.png"
              alt="KDS Logo"
              className="kds-logo"
            />
            <div
              className="user-info"
              style={{ position: "relative", padding: "0px", overflow: "hidden" }}
            >
              <a
                href="/"
                className="logout"
                onClick={(e) => {
                  e.preventDefault();
                  if (window.confirm("Are you sure you want to logout?"))
                    window.location.href = "/";
                }}
                style={{ position: "relative", padding: "10px" }}
              >
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">{pageTitle}</h1>

        {/* ── Sabha Report Table ── */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Block Overview</h2>
            <div className="section-line"></div>
          </div>

          <div className="table-container">
            <div className="table-header">
              <h3 className="table-title">
                Sabha Report{blockName ? ` — ${blockName}` : ""}
              </h3>
              <button
                className="download-btn"
                onClick={downloadSabhaReportExcel}
                disabled={loading || !sabhaReport?.length}
                title={!sabhaReport?.length ? "No data to download" : ""}
              >
                <i className="fas fa-download"></i> Download Report
              </button>
            </div>

            {error && (
              <div style={{ padding: 12, color: "#b00020" }}>{error}</div>
            )}

            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>SL. NO.</th>
                    <th>Sabha Name</th>
                    <th>Sabha Code</th>
                    <th>No. of Villages</th>
                    <th>Uninhabited</th>
                    <th>Inhabited</th>
                    <th>Registers Taken Over</th>
                    <th>Registers Scanned</th>
                    <th>Families Registered</th>
                    <th>Families Verified</th>
                    <th>Families Rejected</th>
                    <th>Verification %</th>
                    <th>Status</th>
                    <th>Villages</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={14} style={{ textAlign: "center", padding: 16 }}>
                        Loading…
                      </td>
                    </tr>
                  ) : sabhaReport.length > 0 ? (
                    sabhaReport.map((row, index) => (
                      <tr key={row?.sabha_code || index}>
                        <td>{row?.sl_no ?? index + 1}</td>
                        <td>{row?.sabha_name ?? "—"}</td>
                        <td>{row?.sabha_code ?? "—"}</td>
                        <td>{row?.no_of_villages ?? 0}</td>
                        <td>{row?.uninhabited_villages ?? 0}</td>
                        <td>{row?.inhabited_villages ?? 0}</td>
                        <td>{row?.registers_taken_over ?? 0}</td>
                        <td>{row?.registers_scanned ?? 0}</td>
                        <td>{row?.families_registered ?? 0}</td>
                        <td>{row?.families_verified ?? 0}</td>
                        <td>{row?.families_rejected ?? 0}</td>
                        <td>{formatPercent(row?.percentage_verification)}</td>
                        <td>{row?.sabha_status ?? "—"}</td>
                        <td style={{ whiteSpace: "nowrap" }}>
                          <div className="view_button_box">
                            <span>
                              {Array.isArray(row?.villages) ? row.villages.length : 0}
                            </span>
                            <button
                              className="download-btn view_button"
                              onClick={() => openVillages(row)}
                              disabled={!Array.isArray(row?.villages) || row.villages.length === 0}
                              title={
                                !Array.isArray(row?.villages) || row.villages.length === 0
                                  ? "No villages"
                                  : "View villages"
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={14} style={{ textAlign: "center", padding: 16 }}>
                        No data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ── Sabha Approval Table ── */}
        <ADOSabhaApprovalTable
          sabhaList={sabhaReport}
          onRefresh={() => loadSabhaReport(blockName)}
        />

        {/* ── Verify Data Entry ── */}
        <ADOVerifyDataEntryForm
          sabhaList={sabhaReport}
          onGaonDataLoad={handleGaonDataLoad}
        />

        {showGaonData && <GaonDataTable data={gaonData} />}

        {/* Villages Modal */}
        {villagesOpen && (
          <div
            role="dialog"
            aria-modal="true"
            onClick={closeVillages}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 9999,
              padding: 16,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(900px, 95vw)",
                maxHeight: "85vh",
                background: "#fff",
                borderRadius: 12,
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderBottom: "1px solid #eee",
                }}
              >
                <div style={{ fontWeight: 700 }}>
                  Villages — {selectedSabha?.sabha_name || "—"} (
                  {selectedSabha?.sabha_code || "—"})
                </div>
                <button className="download-btn" onClick={closeVillages}>
                  Close
                </button>
              </div>
              <div
                style={{
                  padding: 12,
                  overflow: "auto",
                  maxHeight: "calc(85vh - 60px)",
                }}
              >
                <table>
                  <thead>
                    <tr>
                      <th>SL. NO.</th>
                      <th>Gaon Code</th>
                      <th>Gaon Name</th>
                      <th>Unpopulated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedSabha?.villages || []).map((v, i) => (
                      <tr key={v?.gaon_code || i}>
                        <td>{i + 1}</td>
                        <td>{v?.gaon_code ?? "—"}</td>
                        <td>{v?.gaon_name ?? "—"}</td>
                        <td>{v?.unpopulated ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                    {(!selectedSabha?.villages ||
                      selectedSabha.villages.length === 0) && (
                      <tr>
                        <td colSpan={4} style={{ textAlign: "center", padding: 16 }}>
                          No villages found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ADODashboard;