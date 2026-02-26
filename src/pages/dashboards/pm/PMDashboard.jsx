// NEW DEVELOPMENT FOR RAW DATA


// src/pages/dashboards/pm/PMDashboard.jsx
import { useState, useEffect } from "react";
import hqService from "../../../services/hqService";
import pmService from "../../../services/pmService";
import DistrictOverviewCards from "../../../components/hq/DistrictOverviewCards";
import DistrictDetailsView from "../../../components/hq/DistrictDetailsView";
import DistrictReportTable from "../../../components/hq/DistrictReportTable";
import VerificationStatusCards from "../../../components/hq/VerificationStatusCards";
import VerifyDataEntryForm from "../../../components/hq/VerifyDataEntryForm";
import GaonDataTable from "../../../components/hq/GaonDataTable";
import BlockReportView from "../../../components/hq/BlockReportView";
import ProjectMonitoringView from "../../../components/pm/ProjectMonitoringView";
import OperatorMonitoringView from "../../../components/pm/OperatorMonitoringView";
import DataMonitoringView from "../../../components/pm/DataMonitoringView";
import PMApprovalRollback from "../../../components/pm/ApprovalRollback";
import "../../../assets/styles/pages/pm.css";
import LiveDataEntriesView from "../../../components/pm/LiveDataEntriesView";
import ApprovalStatusView from "../../../components/pm/ApprovalStatusView";
import ManageSupervisorView from "../../../components/pm/ManageSupervisorView";
import UserManagementView from "../../../components/pm/UserManagementView";

const PMDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState("project-monitoring");
  const [zilaList, setZilaList] = useState([]);
  const [districtOverview, setDistrictOverview] = useState([]);
  const [districtReport, setDistrictReport] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtDetails, setDistrictDetails] = useState(null);
  const [gaonData, setGaonData] = useState([]);
  const [showGaonData, setShowGaonData] = useState(false);
  const [selectedDistrictForBlocks, setSelectedDistrictForBlocks] =
    useState(null);
  const [blockData, setBlockData] = useState([]);
  const [showBlockReport, setShowBlockReport] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);

  // ✅ Raw Data states
  const [rawSelectedZila, setRawSelectedZila] = useState("");
  const [rawBlockList, setRawBlockList] = useState([]);
  const [rawSelectedBlock, setRawSelectedBlock] = useState("");
  const [rawGaonList, setRawGaonList] = useState([]);
  const [rawSelectedGaonCode, setRawSelectedGaonCode] = useState("");
  const [rawTableData, setRawTableData] = useState([]);
  const [rawLoading, setRawLoading] = useState(false);

  const [notifCounts, setNotifCounts] = useState({ rejectedVillages: 0, pendingFamilies: 0 });
const [notifOpen, setNotifOpen] = useState(false);
const [sachivValidationTab, setSachivValidationTab] = useState("rejected");


  const collapseMenu = () => {
    setSidebarCollapsed(true);
  };

  const openMenu = () => {
    setSidebarCollapsed(false);
  };

  const toggleDashboardDropdown = () => {
    setDashboardDropdownOpen(!dashboardDropdownOpen);
  };

  const setActive = (view) => {
    setActiveView(view);
    setDashboardDropdownOpen(false);
  };

  useEffect(() => {
    initDashboard();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifOpen && !e.target.closest(".notif-wrapper")) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [notifOpen]);

  // ✅ FIX: Zila list should NOT depend on other APIs (Promise.all fail issue)
  const initDashboard = async () => {
    setLoading(true);
    try {
      // ✅ Always try loading zila list separately
      try {
        const zilas = await pmService.getZilaList();
        setZilaList(zilas);
        console.log("✅ zilaList API response:", zilas);
      } catch (e) {
        console.error("❌ zilaList load failed:", e);
        setZilaList([]);
      }


      try {
  const res = await fetch("/get_updated_rejected_families", { credentials: "include" });
  const payload = await res.json();
  if (payload?.success) {
    const groups = Array.isArray(payload.data?.groups) ? payload.data.groups : [];
    const uniqueVillages = new Set(groups.map(g => g?.gaonCode ?? g?.gaon_code)).size;
    const pendingFamilies = payload.data?.totalFamilies ?? groups.reduce((sum, g) => {
      return sum + (Array.isArray(g?.rejectedFamilyIds) ? g.rejectedFamilyIds.length : 0);
    }, 0);
    setNotifCounts({ rejectedVillages: uniqueVillages, pendingFamilies });
  }
} catch (e) {
  console.error("❌ notif counts failed:", e);
}

      // ✅ Keep existing dashboard data calls (safe)
      try {
        const [overview, report, verification] = await Promise.all([
          hqService.getDistrictOverview(),
          hqService.getDistrictReport(),
          hqService.getVerificationStatus(),
        ]);

        const reportMap = new Map(report.map((r) => [r.district, r]));
        const mergedOverview = overview.map((district) => ({
          ...district,
          data_entry_done:
            reportMap.get(district.district)?.families_data_entry_done || 0,
          sachiv_verified:
            reportMap.get(district.district)?.sachiv_verified || 0,
        }));

        setDistrictOverview(mergedOverview);
        setDistrictReport(report);
        setVerificationStatus(verification);
      } catch (e) {
        console.error("⚠️ Other dashboard APIs failed:", e);
      }
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictClick = async (districtCode) => {
    try {
      const details = await hqService.getDistrictDetails(districtCode);
      if (!details.zilaCode) {
        details.zilaCode = districtCode;
      }
      setDistrictDetails(details);
      setSelectedDistrict(districtCode);
    } catch (error) {
      console.error("Error loading district details:", error);
      alert("Failed to load district details");
    }
  };

  const handleBackToOverview = () => {
    setSelectedDistrict(null);
    setDistrictDetails(null);
  };

  const handleGaonDataLoad = (data) => {
    setGaonData(data);
    setShowGaonData(true);
  };

  const handleDistrictClickForBlocks = async (districtName) => {
    try {
      const blocks = await hqService.getBlockReport(districtName);
      setBlockData(blocks);
      setSelectedDistrictForBlocks(districtName);
      setShowBlockReport(true);
    } catch (error) {
      console.error("Error loading block data:", error);
      alert("Failed to load block data");
    }
  };

  const handleCloseBlockView = () => {
    setSelectedDistrictForBlocks(null);
    setBlockData([]);
    setShowBlockReport(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/";
    }
  };

  // ✅ Raw Data handlers (Zila -> Block -> Gaon -> Table)
  const handleRawZilaChange = async (zilaName) => {
    setRawSelectedZila(zilaName);
    setRawSelectedBlock("");
    setRawSelectedGaonCode("");
    setRawBlockList([]);
    setRawGaonList([]);
    setRawTableData([]);

    if (!zilaName) return;

    setRawLoading(true);
    try {
      const blocksRes = await pmService.getBlocksByZila(zilaName);

      const blocks = Array.isArray(blocksRes)
        ? blocksRes
            .map((b) => (typeof b === "string" ? b : b?.block || b?.name))
            .filter(Boolean)
        : [];

      setRawBlockList(blocks);
    } catch (e) {
      console.error("❌ getBlocksByZila failed:", e);
      setRawBlockList([]);
    } finally {
      setRawLoading(false);
    }
  };

  const handleRawBlockChange = async (blockName) => {
    setRawSelectedBlock(blockName);
    setRawSelectedGaonCode("");
    setRawGaonList([]);
    setRawTableData([]);

    if (!blockName) return;

    setRawLoading(true);
    try {
      const gaonRes = await pmService.getApprovedGaonsByBlock(blockName);

      const gaons = Array.isArray(gaonRes)
        ? gaonRes
            .map((g) => ({
              name: g?.gaon || g?.village || g?.gaonName || g?.name,
              code:
                g?.gaonCode ||
                g?.gaon_code ||
                g?.code ||
                g?.villageCode ||
                g?.village_code,
            }))
            .filter((x) => x.name && x.code)
        : [];

      setRawGaonList(gaons);
    } catch (e) {
      console.error("❌ getApprovedGaonsByBlock failed:", e);
      setRawGaonList([]);
    } finally {
      setRawLoading(false);
    }
  };

  const handleRawGaonChange = (gaonCode) => {
    setRawSelectedGaonCode(gaonCode);
    setRawTableData([]);
  };

  const handleRawGaonPayen = async () => {
    if (!rawSelectedGaonCode) {
      alert("कृपया गाँव चुनें");
      return;
    }

    setRawLoading(true);
    try {
      const data = await pmService.getGaonDataByCode(rawSelectedGaonCode);
      setRawTableData(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("❌ getGaonDataByCode failed:", e);
      alert("डेटा लोड नहीं हुआ");
      setRawTableData([]);
    } finally {
      setRawLoading(false);
    }
  };

  const getVal = (row, keys) => {
    for (const k of keys) {
      if (row && row[k] !== undefined && row[k] !== null && row[k] !== "") {
        return row[k];
      }
    }
    return "";
  };

  const handleViewPdf = (row) => {
    const pdfNo = 1;

    const gaonCode =
      getVal(row, ["gaonCode", "gaon_code", "villageCode", "village_code"]) ||
      rawSelectedGaonCode;

    const fromPage =
      Number(getVal(row, ["fromPage", "from_page", "pageNo"])) || 1;

    const toPage = fromPage;

    if (!gaonCode) {
      alert("Gaon code missing hai.");
      return;
    }

    const url = pmService.getPDFPageUrl({
      pdfNo,
      gaonCode,
      fromPage,
      toPage,
    });

    window.open(url, "_blank");
  };
  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
            <div
              className="absolute inset-2 border-4 border-transparent border-b-cyan-400 border-l-cyan-400 rounded-full animate-spin"
              style={{ animationDirection: "reverse" }}
            ></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            Loading Dashboard
          </h2>
          <p className="text-slate-400 text-sm">Preparing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-dashboard-wrapper">
      {/* Sidebar */}
      <div className={`pm-sidebar ${sidebarCollapsed ? "hidden" : ""}`}>
        <div
          style={{ textAlign: "end", paddingRight: "5px", paddingTop: "5px" }}
        >
          <button
            className="toggleBtn"
            id="collapseMenu"
            onClick={collapseMenu}
          >
            <i className="fa fa-arrow-left"></i>
          </button>
        </div>

        <div className="sidebar-header">
          <i className="fas fa-user-circle"></i>
          <span className="title">Project Monitoring</span>
        </div>

        {/* ✅ NEW: Scrollable area for sidebar menu (Logout stays fixed at bottom) */}
        <div className="sidebar-scroll">
          {/* Dashboards Dropdown */}
          <div className="dropdown">
            <button
              className="dropbtn"
              id="dashboardBtn"
              onClick={toggleDashboardDropdown}
            >
              Dashboards ▼
            </button>
            <div
              className={`dropdown-content ${
                dashboardDropdownOpen ? "show" : ""
              }`}
              id="dashboardDropdown"
            >
              <button
                className={`dropbtn1 ${
                  activeView === "project-monitoring" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveView("project-monitoring");
                  setActive("project-monitoring");
                }}
              >
                Project Monitoring
              </button>
              <button
                className={`dropbtn1 ${
                  activeView === "operator-monitoring" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveView("operator-monitoring");
                  setActive("operator-monitoring");
                }}
              >
                Operator Monitoring
              </button>
              <button
                className={`dropbtn1 ${
                  activeView === "data-monitoring" ? "active" : ""
                }`}
                onClick={() => {
                  setActiveView("data-monitoring");
                  setActive("data-monitoring");
                }}
              >
                Data Monitoring & Management
              </button>
            </div>
          </div>

          {/* HQ Dashboard */}
          <div className="dropdown">
            <button
              className={`dropbtn ${
                activeView === "hq-dashboard" ? "active" : ""
              }`}
              onClick={() => setActiveView("hq-dashboard")}
            >
              HQ Dashboard
            </button>
          </div>

          {/* Sachiv Validation - NEW ADDITION */}
          <div className="dropdown">
            <button
  className={`dropbtn ${
    activeView === "sachiv-validation" ? "active" : ""
  }`}
  onClick={() => {
    setSachivValidationTab("rejected");
    setActiveView("sachiv-validation");
  }}
>
  Sachiv Validation
</button>
          </div>

          {/* Approval Status */}
          <div className="dropdown">
            <button
              className={`dropbtn ${
                activeView === "approval-status" ? "active" : ""
              }`}
              onClick={() => setActiveView("approval-status")}
            >
              Approval Status
            </button>
          </div>

          {/* Live Data Entries */}
          <div className="dropdown">
            <button
              className={`dropbtn ${activeView === "live-entries" ? "active" : ""}`}
              onClick={() => setActiveView("live-entries")}
            >
              Live Data Entries
            </button>
          </div>

          {/* Raw Data */}
          <div className="dropdown">
            <button
              className={`dropbtn ${activeView === "raw-data" ? "active" : ""}`}
              onClick={() => setActiveView("raw-data")}
            >
              Raw Data
            </button>
          </div>

          {/* Manage Suoervisor */}
          <div className="dropdown">
            <button
              className={`dropbtn ${
                activeView === "manage-supervisor" ? "active" : ""
              }`}
              onClick={() => setActiveView("manage-supervisor")}
            >
              Manage Supervisor
            </button>
          </div>

          {/* User Management */}
          <div className="dropdown">
            <button
              className={`dropbtn ${
                activeView === "user-management" ? "active" : ""
              }`}
              onClick={() => setActiveView("user-management")}
            >
              User Management
            </button>
          </div>

        </div>

        {/* Logout */}
        <div className="logout" style={{ borderRadius: "2em" }}>
          <a href="/" onClick={handleLogout}>
            <i className="icon">
              <i className="fas fa-sign-out-alt"></i>
            </i>
            <span>Logout</span>
          </a>
        </div>
      </div>

      {/* Toggle button for collapsed sidebar */}
      <button
        id="openMenu"
        className={`toggleBtn ${sidebarCollapsed ? "" : "hidden"}`}
        onClick={openMenu}
      >
        <i className="fa fa-arrow-right"></i>
      </button>

      {/* Main Content */}
      <div
        className={`pm-content ${sidebarCollapsed ? "full-width" : ""}`}
        id="content"
      >
        <div className="pm-header-top">
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
            <div className="right-section" style={{ position: "relative", display: "flex", alignItems: "center", gap: "1rem" }}>
  
  {/* Notification Bell */}
  <div className="notif-wrapper" style={{ position: "relative" }}>
  <button
    onClick={() => setNotifOpen(!notifOpen)}
  style={{
    background: notifOpen ? "#f1f5f9" : "white",
    border: "2px solid #e2e8f0",
    borderRadius: "50%",
    cursor: "pointer",
    position: "relative",
    width: "44px",
    height: "44px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "all 0.2s ease",
  }}
>
  🔔
  {(notifCounts.rejectedVillages > 0 || notifCounts.pendingFamilies > 0) && (
    <span style={{
      position: "absolute",
      top: "-4px",
      right: "-4px",
      background: "#ef4444",
      color: "white",
      borderRadius: "999px",
      fontSize: "10px",
      fontWeight: "700",
      minWidth: "18px",
      height: "18px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "0 4px",
      lineHeight: 1,
    }}>
      {(notifCounts.rejectedVillages + notifCounts.pendingFamilies) > 99
        ? "99+"
        : notifCounts.rejectedVillages + notifCounts.pendingFamilies}
    </span>
  )}
</button>

    {/* Dropdown */}
    {notifOpen && (
      <div style={{
        position: "absolute",
        right: 0,
        top: "calc(100% + 8px)",
        background: "white",
        borderRadius: "12px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        minWidth: "260px",
        zIndex: 9999,
        overflow: "hidden",
        border: "1px solid #e2e8f0",
      }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #e2e8f0", fontWeight: "700", fontSize: "14px", color: "#1e293b" }}>
          Notifications
        </div>

        {notifCounts.rejectedVillages > 0 && (
          <div
            onClick={() => { setSachivValidationTab("rejected"); setActiveView("sachiv-validation"); setNotifOpen(false); }}

            style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", borderBottom: "1px solid #f1f5f9" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: "8px", padding: "6px 10px", fontWeight: "700", fontSize: "18px", minWidth: "40px", textAlign: "center" }}>
              {notifCounts.rejectedVillages}
            </span>
            <span style={{ fontSize: "13px", color: "#475569", fontWeight: "500" }}>Rejected Villages pending action</span>
          </div>
        )}

        {notifCounts.pendingFamilies > 0 && (
          <div
            onClick={() => { setSachivValidationTab("approval"); setActiveView("sachiv-validation"); setNotifOpen(false); }}

            style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}
            onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
            onMouseLeave={e => e.currentTarget.style.background = "white"}
          >
            <span style={{ background: "#fef3c7", color: "#d97706", borderRadius: "8px", padding: "6px 10px", fontWeight: "700", fontSize: "18px", minWidth: "40px", textAlign: "center" }}>
              {notifCounts.pendingFamilies}
            </span>
            <span style={{ fontSize: "13px", color: "#475569", fontWeight: "500" }}>Families pending approval</span>
          </div>
        )}

        {notifCounts.rejectedVillages === 0 && notifCounts.pendingFamilies === 0 && (
          <div style={{ padding: "16px", textAlign: "center", color: "#94a3b8", fontSize: "13px" }}>
            No pending notifications
          </div>
        )}
      </div>
    )}
  </div>

  <img
    src="/assets/images/Kds_logo.png"
    alt="KDS Logo"
    className="kds-logo"
  />
</div>
          </div>
        </div>

        <div className="main-content">
          {/* Project Monitoring */}
          {activeView === "project-monitoring" && (
            <>
              <h1
                style={{
                  textAlign: "center",
                  background: "rgb(255, 255, 255)",
                  padding: "16px 24px",
                  borderRadius: "12px",
                  fontSize: "22px",
                  fontWeight: 600,
                  boxShadow: "rgba(0, 0, 0, 0.08) 0px 2px 6px",
                  marginBottom: "20px",
                }}
              >
                Project Monitoring Dashboard
              </h1>
              <ProjectMonitoringView />
            </>
          )}

          {/* Operator Monitoring */}
          {activeView === "operator-monitoring" && (
            <>
              <h1 className="page-title">Operator Monitoring</h1>
              <OperatorMonitoringView zilaList={zilaList} />
            </>
          )}

          {/* Data Monitoring */}
          {activeView === "data-monitoring" && (
            <>
              <h1 className="page-title">Data Monitoring & Management</h1>
              <DataMonitoringView zilaList={zilaList} />
            </>
          )}

          {/* Sachiv Validation - NEW SECTION */}
          {activeView === "sachiv-validation" && (
  <>
    <h1 className="page-title">Data Approvals & Rollback</h1>
    <PMApprovalRollback
      key={sachivValidationTab}
      initialTab={sachivValidationTab}
    />
  </>
)}

          {/* HQ Dashboard */}
          {activeView === "hq-dashboard" && (
            <>
              <h1 className="page-title">
                Parivar Register Digitization System
              </h1>

              {showBlockReport ? (
                <BlockReportView
                  districtName={selectedDistrictForBlocks}
                  blockData={blockData}
                  onClose={handleCloseBlockView}
                />
              ) : (
                <>
                  {!selectedDistrict ? (
                    <DistrictOverviewCards
                      districts={districtOverview}
                      onDistrictClick={handleDistrictClick}
                    />
                  ) : (
                    <DistrictDetailsView
                      district={districtDetails}
                      onBack={handleBackToOverview}
                    />
                  )}

                  <DistrictReportTable
                    data={districtReport}
                    onDistrictClick={handleDistrictClickForBlocks}
                  />

                  <VerificationStatusCards status={verificationStatus} />

                  <VerifyDataEntryForm
                    zilaList={zilaList}
                    onGaonDataLoad={handleGaonDataLoad}
                  />

                  {showGaonData && <GaonDataTable data={gaonData} />}
                </>
              )}
            </>
          )}

          {/* Approval Status */}
{activeView === "approval-status" && (
  <ApprovalStatusView zilaList={zilaList} />
)}

          {/* Live Entries */}
          {activeView === "live-entries" && <LiveDataEntriesView />}

          {/* Raw Data */}
          {activeView === "raw-data" && (
            <div className="pm-rawdata-wrapper">
              {/* Page Title same style */}
              <div className="page-title">Raw Data</div>

              {/* Filter Bar */}
              <div className="pm-rawdata-filterbar">
                <div className="pm-rawdata-field">
                  <label>जिला *</label>
                  <select
                    value={rawSelectedZila}
                    onChange={(e) => handleRawZilaChange(e.target.value)}
                  >
                    <option value="">Select Zila</option>

                    {Array.isArray(zilaList) &&
                      zilaList.map((item, idx) => {
                        const zilaName =
                          typeof item === "string" ? item : item?.zila;

                        if (!zilaName) return null;

                        return (
                          <option key={zilaName || idx} value={zilaName}>
                            {zilaName}
                          </option>
                        );
                      })}
                  </select>
                </div>

                <div className="pm-rawdata-field">
                  <label>ब्लाक *</label>
                  <select
                    value={rawSelectedBlock}
                    onChange={(e) => handleRawBlockChange(e.target.value)}
                    disabled={!rawSelectedZila}
                  >
                    <option value="">
                      {rawSelectedZila ? "Select Block" : "Select Zila First"}
                    </option>
                    {rawBlockList.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pm-rawdata-field">
                  <label>गाँव *</label>
                  <select
                    value={rawSelectedGaonCode}
                    onChange={(e) => handleRawGaonChange(e.target.value)}
                    disabled={!rawSelectedBlock}
                  >
                    <option value="">
                      {rawSelectedBlock ? "Select Gaon" : "Select Block First"}
                    </option>
                    {rawGaonList.map((g) => (
                      <option key={g.code} value={g.code}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  className="pm-rawdata-goanbtn"
                  type="button"
                  onClick={handleRawGaonPayen}
                  disabled={rawLoading}
                >
                  गाँव पाएँ
                </button>
              </div>

              {/* Search */}
              <div className="pm-rawdata-search">
                <input type="text" placeholder="Search..." />
              </div>

              {/* ✅ Table */}
              {rawLoading && (
                <div style={{ padding: "10px", fontWeight: "600" }}>
                  Loading...
                </div>
              )}

              {!rawLoading &&
                Array.isArray(rawTableData) &&
                rawTableData.length > 0 && (
                  <div
                    style={{
                      overflowX: "auto",
                      overflowY: "auto",
                      maxHeight: "450px", // ✅ Y scroll height
                      marginTop: "10px",
                      border: "1px solid #cfcfcf",
                    }}
                  >
                    <table
                      className="table table-bordered"
                      style={{ width: "100%" }}
                    >
                      <thead style={{ background: "#f7d96b" }}>
                        <tr>
                          <th>जिला</th>
                          <th>तहसील</th>
                          <th>ब्लाक</th>
                          <th>गाँव सभा</th>
                          <th>गाँव कोड</th>
                          <th>गाँव</th>
                          <th>न्याय पंचायत</th>
                          <th>क्रम संख्या</th>
                          <th>मकान नम्बर(अंकों में)</th>
                          <th>मकान नम्बर (अक्षरों में)</th>
                          <th>परिवार के प्रमुख का नाम</th>
                          <th>परिवार के सदस्य का नाम</th>
                          <th>पिता या पति का नाम</th>
                          <th>पुरुष या महिला</th>
                          <th>धर्म</th>
                          <th>जाति</th>
                          <th>जन्म तिथि</th>
                          <th>व्यावसाय</th>
                          <th>साक्षर या निरक्षर</th>
                          <th>योग्यता</th>
                          <th>सर्किल छोड़ देने/ मृत्यु का दिनांक</th>
                          <th>विवरण</th>
                          <th>Action(s)</th>
                        </tr>
                      </thead>

                      <tbody>
                        {rawTableData.map((row, idx) => (
                          <tr key={row?.id || idx}>
                            <td>
                              {getVal(row, ["zila", "district", "zilaName"])}
                            </td>
                            <td>{getVal(row, ["tehsil", "tehsilName"])}</td>
                            <td>{getVal(row, ["block", "blockName"])}</td>
                            <td>
                              {getVal(row, ["sabha", "gaonSabha", "sabhaName"])}
                            </td>
                            <td>
                              {getVal(row, [
                                "gaonCode",
                                "gaon_code",
                                "villageCode",
                                "village_code",
                              ])}
                            </td>
                            <td>
                              {getVal(row, [
                                "gaon",
                                "village",
                                "gaonName",
                                "villageName",
                              ])}
                            </td>
                            <td>
                              {getVal(row, [
                                "nyayPanchayat",
                                "nyay_panchayat",
                                "nyay_panchayat_name",
                              ])}
                            </td>
                            <td>
                              {getVal(row, [
                                "serialNo",
                                "serial_no",
                                "memberSequence",
                              ])}
                            </td>
                            <td>
                              {getVal(row, [
                                "houseNumberNum",
                                "house_number_num",
                              ])}
                            </td>
                            <td>
                              {getVal(row, [
                                "houseNumberText",
                                "house_number_text",
                              ])}
                            </td>
                            <td>
                              {getVal(row, [
                                "familyHeadName",
                                "family_head_name",
                              ])}
                            </td>
                            <td>
                              {getVal(row, ["memberName", "member_name"])}
                            </td>
                            <td>
                              {getVal(row, [
                                "fatherOrHusbandName",
                                "fatherOrHusband",
                                "father_husband_name",
                              ])}
                            </td>
                            <td>{getVal(row, ["gender"])}</td>
                            <td>{getVal(row, ["religion"])}</td>
                            <td>{getVal(row, ["caste"])}</td>
                            <td>{getVal(row, ["dob", "dateOfBirth"])}</td>
                            <td>{getVal(row, ["business", "occupation"])}</td>
                            <td>{getVal(row, ["literacy", "isLiterate"])}</td>
                            <td>{getVal(row, ["qualification"])}</td>
                            <td>
                              {getVal(row, [
                                "leavingDate",
                                "leaving_date",
                                "deathDate",
                                "death_date",
                              ])}
                            </td>
                            <td>{getVal(row, ["desc", "description"])}</td>
                            <td style={{ textAlign: "center" }}>
                              <button
                                type="button"
                                onClick={() => handleViewPdf(row)}
                                style={{
                                  padding: "4px 10px",
                                  border: "1px solid #000",
                                  background: "#f7d96b",
                                  cursor: "pointer",
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
            </div>
          )}
          {activeView === "manage-supervisor" && (
  <ManageSupervisorView />
)}

{activeView === "user-management" && (
  <UserManagementView/>
)}

        </div>
      </div>
    </div>
  );
};

export default PMDashboard;
