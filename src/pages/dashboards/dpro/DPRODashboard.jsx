// src/pages/dashboards/dpro/DPRODashboard.jsx
import { useState, useEffect } from "react";
import dproService from "../../../services/dproService";
import "../../../assets/styles/pages/hq.css"; // Reuse HQ styles

const DPRODashboard = () => {
  const [loading, setLoading] = useState(true);
  const [districtName, setDistrictName] = useState("");
  const [districtOverview, setDistrictOverview] = useState(null);
  const [districtDetails, setDistrictDetails] = useState(null);
  const [blockReport, setBlockReport] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [sachivVerifiedCount, setSachivVerifiedCount] = useState(0);
  const [showDetailsView, setShowDetailsView] = useState(false);
  const [selectedBlock, setSelectedBlock] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [gaons, setGaons] = useState([]);
  const [selectedGaon, setSelectedGaon] = useState("");
  const [gaonData, setGaonData] = useState([]);
  const [showGaonData, setShowGaonData] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Get district name from localStorage (set during login)
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const district = user.name || localStorage.getItem("districtName");
    
    if (!district) {
      alert("District information not found. Please login again.");
      window.location.href = "/";
      return;
    }
    
    setDistrictName(district);
    initDashboard(district);
  }, []);

  useEffect(() => {
    document.body.classList.add("hq-page");
    return () => {
      document.body.classList.remove("hq-page");
    };
  }, []);

  const initDashboard = async (district) => {
    setLoading(true);
    try {
      // Get loginId from localStorage
      const loginId = localStorage.getItem("loginID");
      
      if (!loginId) {
        alert("Login ID not found. Please login again.");
        window.location.href = "/";
        return;
      }

      const [overview, details, blocks, verification, districtData] = await Promise.all([
  dproService.getDistrictOverview(district),
  dproService.getDistrictDetails(district),
  dproService.getBlockReport(district),
  dproService.getVerificationStatus(district),
  dproService.getDistrictDataByLogin(loginId),
]);

// Merge block report data into overview for accurate totals
// Sum up data from all blocks for this district
const totalDataEntryDone = blocks.reduce((sum, block) => {
  return sum + (block.families_data_entry_done || 0);
}, 0);

const totalSachivVerified = blocks.reduce((sum, block) => {
  return sum + (block.sachiv_verified || 0);
}, 0);

const totalVillages = blocks.reduce((sum, block) => {
  return sum + (block.villages || 0);
}, 0);

const totalTargetedVillages = blocks.reduce((sum, block) => {
  return sum + (block.targeted_villages || 0);
}, 0);

const totalApproximateFamilies = blocks.reduce((sum, block) => {
  return sum + (block.approximate_families || 0);
}, 0);

const totalGP = blocks.reduce((sum, block) => {
  return sum + (block.gp || 0);
}, 0);

// Merge the totals into overview
const mergedOverview = {
  ...overview,
  data_entry_done: totalDataEntryDone,
  sachiv_verified: totalSachivVerified,
  villages: totalVillages,
  targeted_villages: totalTargetedVillages,
  approximate_families: totalApproximateFamilies,
  gp: totalGP,
};

setDistrictOverview(mergedOverview);
setDistrictDetails(details);
setBlockReport(blocks);

// Get sachiv verified and rejected from district data API
const sachivVerifiedFamilies = parseInt(districtData?.data?.sachivVerified || 0);
const sachivRejectedFamilies = parseInt(districtData?.data?.sachivRejected || 0);
const dataEntryDone = totalDataEntryDone || 0;

// Calculate percentages based on data entry done
const sachivVerifiedPercent = dataEntryDone > 0 ? ((sachivVerifiedFamilies / dataEntryDone) * 100) : 0;
const adoVerifiedPercent = verification?.ado_verified_percent || 0;
const dproVerifiedPercent = verification?.dpro_verified_percent || 0;

const calculatedVerification = {
  sachiv_verified_percent: sachivVerifiedPercent,
  ado_verified_percent: adoVerifiedPercent,
  dpro_verified_percent: dproVerifiedPercent,
  sachiv_verified_families: sachivVerifiedFamilies,
  sachiv_rejected_families: sachivRejectedFamilies,
  data_entry_done: dataEntryDone
};

setVerificationStatus(calculatedVerification);
setSachivVerifiedCount(sachivVerifiedFamilies);

    } catch (error) {
      console.error("Error initializing DPRO dashboard:", error);
      alert("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = () => {
    setShowDetailsView(true);
  };

  const handleBackToOverview = () => {
    setShowDetailsView(false);
  };

  const handleBlockChange = async (e) => {
    const block = e.target.value;
    setSelectedBlock(block);
    setSelectedGaon("");
    setGaons([]);
    setShowGaonData(false);
    setError("");

    if (block) {
      try {
        const gaonData = await dproService.getApprovedGaonListByBlock(block);
        setGaons(gaonData);
        if (gaonData.length === 0) {
          setError("No villages found for this block");
        }
      } catch (error) {
        console.error("Error fetching gaons:", error);
        setError("Failed to load villages");
        setGaons([]);
      }
    }
  };

  const handleGaonChange = (e) => {
    setSelectedGaon(e.target.value);
    setShowGaonData(false);
    setError("");
  };

  const handleViewGaonData = async () => {
    if (!selectedGaon) {
      setError("Please select a village");
      return;
    }

    try {
      const data = await dproService.getGaonData(selectedGaon);
      if (!data || data.length === 0) {
        setError("No data found for selected village");
        return;
      }
      setGaonData(data);
      setShowGaonData(true);
      setError("");
    } catch (error) {
      console.error("Error fetching gaon data:", error);
      setError("Failed to fetch village data");
    }
  };

  const handleDownloadMetric = async (metric, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const blob = await dproService.downloadMetricData(districtName, metric);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${districtName}_${metric.replace(/\s+/g, "_")}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleDownloadBlockReport = async () => {
    try {
      const blob = await dproService.downloadBlockReport(districtName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${districtName}_Block_Report.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleViewPDF = (pdfNo, fromPage, toPage, gaonCode) => {
    dproService.viewPDFPage(pdfNo, fromPage, toPage, gaonCode);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("loginID");
      localStorage.removeItem("user");
      localStorage.removeItem("districtName");
      window.location.href = "/";
    }
  };

  useEffect(() => {
    const loadBlocks = async () => {
      if (districtName) {
        try {
          const blockList = await dproService.getBlocksByDistrict(districtName);
          setBlocks(blockList);
        } catch (error) {
          console.error("Error loading blocks:", error);
        }
      }
    };
    loadBlocks();
  }, [districtName]);

  if (loading) {
    return (
      <div className="hq-dashboard hq-page">
        <div className="hq-loading-screen">
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
      </div>
    );
  }

  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  const safePercent = (value) => {
    const num = safeNumber(value, 0);
    return `${num.toFixed(2)}%`;
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
            <div className="user-info">
              <span style={{ marginRight: "12px", fontWeight: 600 }}>
                {districtName}
              </span>
              <a href="/" className="logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">
          DPRO Dashboard - {districtName} District
        </h1>

        {/* District Overview Card */}
        {!showDetailsView && districtOverview && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">District Overview</h2>
              <div className="section-line"></div>
            </div>
            <div className="district-cards">
              <div className="district-card" onClick={handleViewDetails}>
                <div className="district-name">{districtName}</div>
                <div className="district-metrics">
                  <div className="district-metric">
                    <div className="district-metric-value">
                      {safeNumber(districtOverview.gp)}
                    </div>
                    <div className="district-metric-label">Total GPs</div>
                  </div>
                  <div className="district-metric">
                    <div className="district-metric-value">
                      {Math.floor(
                        (safeNumber(districtOverview.gp) *
                          safeNumber(districtOverview.gp_scanned_percent)) /
                          100
                      )}
                    </div>
                    <div className="district-metric-label">GPs Scanned</div>
                  </div>
                  <div className="district-metric">
                    <div className="district-metric-value">
                      {safeNumber(districtOverview.approximate_families).toLocaleString()}
                    </div>
                    <div className="district-metric-label">Approx. Families</div>
                  </div>
                  <div className="district-metric">
                    <div className="district-metric-value">
                      {safeNumber(districtOverview.data_entry_done).toLocaleString()}
                    </div>
                    <div className="district-metric-label">Data Entry Done</div>
                  </div>
                  <div className="district-metric">
                    <div className="district-metric-value">
                      {sachivVerifiedCount.toLocaleString()}
                    </div>
                    <div className="district-metric-label">Sachiv Verified</div>
                  </div>
                  <div className="district-metric">
                    <div className="district-metric-value">
                      {safeNumber(districtOverview.villages)}
                    </div>
                    <div className="district-metric-label">Total Villages</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* District Details View */}
        {showDetailsView && districtDetails && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">
                {districtName} - Detailed Overview
              </h2>
              <div className="section-line"></div>
              <button className="back-btn" onClick={handleBackToOverview}>
                <i className="fas fa-arrow-left"></i> Back to Overview
              </button>
            </div>
            <div className="district-details-cards">
              {[
                { label: "Total GPs", value: safeNumber(districtDetails.gp) },
                {
                  label: "GPs Scanned",
                  value: safeNumber(districtDetails.gp_scanned),
                },
                {
                  label: "GP Scanned %",
                  value: safePercent(districtDetails.gp_scanned_percent),
                },
                {
                  label: "Total Villages",
                  value: safeNumber(districtDetails.villages),
                },
                {
                  label: "Villages Scanned",
                  value: safeNumber(districtDetails.villages_scanned),
                },
                {
                  label: "Villages Scanned %",
                  value: safePercent(districtDetails.villages_scanned_percent),
                },
                {
                  label: "Approx. Families",
                  value: safeNumber(districtDetails.approximateFamilies).toLocaleString(),
                },
                {
                  label: "Data Entry Done",
                  value: safeNumber(districtDetails.dataEntryDone).toLocaleString(),
                },
                {
                  label: "Data Entry %",
                  value: safePercent(districtDetails.dataEntryPercent),
                },
                {
                  label: "Sachiv Verified",
                  value: safeNumber(districtDetails.sachivVerifiedVillages),
                },
                {
                  label: "Sachiv Rollback",
                  value: safeNumber(districtDetails.sachivRollback),
                },
                {
                  label: "Sachiv Pending",
                  value: safeNumber(districtDetails.sachivPending),
                },
                {
                  label: "ADO Verified",
                  value: safeNumber(districtDetails.adoVerified),
                },
                {
                  label: "DPRO Verified",
                  value: safeNumber(districtDetails.dproVerified),
                },
              ].map((item, index) => (
                <div key={index} className="district-detail-card">
                  <div className="detail-card-value">{item.value}</div>
                  <div className="detail-card-label">{item.label}</div>
                  <button
                    className="download-btn"
                    onClick={(e) => handleDownloadMetric(item.label, e)}
                  >
                    <i className="fas fa-download"></i> Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Block Report Table */}
        {blockReport && blockReport.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Block Wise Summary</h2>
              <div className="section-line"></div>
            </div>
            <div className="table-container">
              <div className="table-header">
                <h3 className="table-title">Block Report - {districtName}</h3>
                <button
                  className="download-btn"
                  onClick={handleDownloadBlockReport}
                >
                  <i className="fas fa-download"></i> Download Report
                </button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Block Name</th>
                      <th>Total GP</th>
                      <th>Total Villages</th>
                      <th>Targeted Villages</th>
                      <th>Approximate Families</th>
                      <th>Data Entry Done</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockReport.map((block, index) => (
                      <tr key={index}>
                        <td>{block.block}</td>
                        <td>{block.gp}</td>
                        <td>{block.villages}</td>
                        <td>{block.targeted_villages}</td>
                        <td>{block.approximate_families?.toLocaleString()}</td>
                        <td>{block.families_data_entry_done?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Verification Status */}
        {verificationStatus && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Verification Status</h2>
              <div className="section-line"></div>
            </div>
            <div className="verification-cards">
              <div className="verification-card">
                <div className="verification-icon sachiv">
                  <i className="fas fa-user-check"></i>
                </div>
                <div className="verification-content">
                  <div className="verification-percentage">
                    {safePercent(verificationStatus.sachiv_verified_percent)}
                  </div>
                  <div className="verification-label">Sachiv Verified</div>
                </div>
              </div>
              <div className="verification-card">
                <div className="verification-icon ado">
                  <i className="fas fa-user-shield"></i>
                </div>
                <div className="verification-content">
                  <div className="verification-percentage">
                    {safePercent(verificationStatus.ado_verified_percent)}
                  </div>
                  <div className="verification-label">ADO Verified</div>
                </div>
              </div>
              <div className="verification-card">
                <div className="verification-icon dpro">
                  <i className="fas fa-user-tie"></i>
                </div>
                <div className="verification-content">
                  <div className="verification-percentage">
                    {safePercent(verificationStatus.dpro_verified_percent)}
                  </div>
                  <div className="verification-label">DPRO Verified</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Verify Data Entry Form */}
        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Verify Data Entry</h2>
            <div className="section-line"></div>
          </div>

          {error && (
            <div
              style={{
                padding: "12px",
                margin: "10px 0",
                backgroundColor: "#fee2e2",
                border: "1px solid #ef4444",
                borderRadius: "6px",
                color: "#dc2626",
                fontSize: "14px",
              }}
            >
              <i className="fas fa-exclamation-triangle" style={{ marginRight: "8px" }}></i>
              {error}
            </div>
          )}

          <div className="filter-section">
            <div className="formSubContainer">
              <div>
                <label htmlFor="blockSelect">
                  ब्लाक <span className="required">*</span>
                </label>
                <select
                  id="blockSelect"
                  value={selectedBlock}
                  onChange={handleBlockChange}
                >
                  <option value="">Select Block</option>
                  {blocks.map((block) => (
                    <option key={block.blockCode || block.block} value={block.block}>
                      {block.block}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="gaonSelect">
                  गाँव <span className="required">*</span>
                </label>
                <select
                  id="gaonSelect"
                  value={selectedGaon}
                  onChange={handleGaonChange}
                  disabled={!selectedBlock}
                >
                  <option value="">Select Gaon</option>
                  {gaons.map((gaon) => (
                    <option key={gaon.gaonCode} value={gaon.gaonCode}>
                      {gaon.gaon}
                    </option>
                  ))}
                </select>
              </div>

              <button
                id="gaonBtn"
                type="button"
                onClick={handleViewGaonData}
                disabled={!selectedGaon}
              >
                <i className="fas fa-search"></i> डेटा प्राप्त करें
              </button>
            </div>
          </div>
        </div>

        {/* Gaon Data Table */}
        {showGaonData && gaonData.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">गाँव डेटा</h2>
              <div className="section-line"></div>
            </div>
            <div className="table-container1">
              <table className="gaon-data-table">
                <thead>
                  <tr>
                    <th>जिला</th>
                    <th>तहसील</th>
                    <th>ब्लाक</th>
                    <th>गाँव सभा</th>
                    <th>गाँव कोड</th>
                    <th>गाँव</th>
                    <th>न्याय पंचायत</th>
                    <th>क्रम संख्या</th>
                    <th>मकान नम्बर</th>
                    <th>परिवार के प्रमुख का नाम</th>
                    <th>परिवार के सदस्य का नाम</th>
                    <th>पिता/पति का नाम</th>
                    <th>लिंग</th>
                    <th>धर्म</th>
                    <th>जाति</th>
                    <th>जन्म तिथि</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {gaonData.map((row, index) => (
                    <tr key={index}>
                      <td>{row.zila || ""}</td>
                      <td>{row.tehsil || ""}</td>
                      <td>{row.block || ""}</td>
                      <td>{row.sabha || ""}</td>
                      <td>{row.gaonCode || ""}</td>
                      <td>{row.gaon || ""}</td>
                      <td>{row.panchayat || ""}</td>
                      <td>{row.serialNo || ""}</td>
                      <td>{row.houseNumberNum || ""}</td>
                      <td>{row.familyHeadName || ""}</td>
                      <td>{row.memberName || ""}</td>
                      <td>{row.fatherOrHusbandName || ""}</td>
                      <td>{row.gender || ""}</td>
                      <td>{row.religion || ""}</td>
                      <td>{row.caste || ""}</td>
                      <td>{row.dob || ""}</td>
                      <td>
                        {(row.serialNo === "1" || row.serialNo === 1) && (
                          <button
                            className="editBtn"
                            onClick={() =>
                              handleViewPDF(
                                row.pdfNo,
                                row.fromPage,
                                row.toPage,
                                row.gaonCode
                              )
                            }
                          >
                            <i className="fas fa-eye"></i> View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DPRODashboard;