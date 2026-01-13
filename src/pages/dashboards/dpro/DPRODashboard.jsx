// src/pages/dashboards/dpro/DPRODashboard.jsx
import { useState, useEffect, useRef } from "react";
import dproService from "../../../services/dproService";
import * as XLSX from "xlsx";
import "../../../assets/styles/pages/hq.css"; // Reuse HQ styles

const DPRODashboard = () => {
  const gpSectionRef = useRef(null);
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
  const [gpData, setGpData] = useState([]);
  const [gpPendingData, setPendingData] = useState([]);
  const [showGpData, setShowGpData] = useState(false);
  const [showPendingGpData, setShowPendingGpData] = useState(false);

  console.log("blockReport", blockReport);

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

      const [overview, details, blocks, verification, districtData] =
        await Promise.all([
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
      const sachivVerifiedFamilies = parseInt(
        districtData?.data?.sachivVerified || 0
      );
      const sachivRejectedFamilies = parseInt(
        districtData?.data?.sachivRejected || 0
      );
      const dataEntryDone = totalDataEntryDone || 0;

      // Calculate percentages based on data entry done
      const sachivVerifiedPercent =
        dataEntryDone > 0 ? (sachivVerifiedFamilies / dataEntryDone) * 100 : 0;
      const adoVerifiedPercent = verification?.ado_verified_percent || 0;
      const dproVerifiedPercent = verification?.dpro_verified_percent || 0;

      const calculatedVerification = {
        sachiv_verified_percent: sachivVerifiedPercent,
        ado_verified_percent: adoVerifiedPercent,
        dpro_verified_percent: dproVerifiedPercent,
        sachiv_verified_families: sachivVerifiedFamilies,
        sachiv_rejected_families: sachivRejectedFamilies,
        data_entry_done: dataEntryDone,
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

  const handleCompletedGpData = async (block) => {
    console.log("bjbjlkj", block);
    // setSelectedBlock(block);
    setShowGpData(false);

    if (block) {
      try {
        const gaonData = await dproService.getCompletedGPReport(block);
        setShowGpData(true);
        setGpData(gaonData);
        if (gaonData.length === 0) {
          setError("No villages found for this block");
        }
        // 👉 scroll to GP section
        requestAnimationFrame(() => {
          gpSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } catch (error) {
        console.error("Error fetching gaons:", error);
        setError("Failed to load villages");
        setGaons([]);
      }
    }
  };

  const handlePendingGpData = async (block) => {
    console.log("bjbjlkj", block);
    // setSelectedBlock(block);
    setShowPendingGpData(false);

    if (block) {
      try {
        const gaonData = await dproService.getPendingGPReport(block);
        console.log("gaonData", gaonData);

        setShowPendingGpData(true);
        setPendingData(gaonData);
        if (gaonData.length === 0) {
          setError("No villages found for this block");
        }
        // 👉 scroll to GP section
        requestAnimationFrame(() => {
          gpSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } catch (error) {
        console.error("Error fetching gaons:", error);
        setError("Failed to load villages");
        setGaons([]);
      }
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

  const downloadBlockReportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const data = blockReport.map((b, i) => ({
        "SL NO": i + 1,
        "Block Name": b.block_name,
        "No. of GPs": b.no_of_gps,
        "GPs Scanned": b.no_of_gps_scanned,
        "Families Registered": b.no_of_families_registered,
        "Families Verified": b.no_of_families_record_verified,
        "% Data Verification": b.percentage_data_verification,
        "GPs Data Verified": b.no_of_gps_data_verified,
        "Pending GPs": b.pending_gps_for_verification,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Block Report");

      XLSX.writeFile(wb, `${districtName}_Block_Report.xlsx`);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadCompletedGpExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const data = gpData.map((g, i) => ({
        "SL NO": i + 1,
        "Block Name": g.name_of_block,
        "GP Name": g.name_of_gp,
        "Families Registered": g.no_of_families_registered_in_gp,
        "Families Verified": g.no_of_families_data_verified,
        "% Data Verification": g.percentage_of_data_verification,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Completed GPs");

      XLSX.writeFile(wb, `${districtName}_Completed_GP_Report.xlsx`);
    } catch (e) {
      console.error(e);
    }
  };

  const downloadPendingGpExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const data = gpPendingData.map((g, i) => ({
        "SL NO": i + 1,
        "Block Name": g.name_of_block,
        "Pending GP": g.name_of_pending_gps,
        "Families Registered": g.no_of_families_registered_in_gp,
        "Families Verified": g.no_of_families_data_verified,
        "Pending Families": g.pending_families_for_verification,
        "% Data Verification": g.percentage_of_data_verification,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(wb, ws, "Pending GPs");

      XLSX.writeFile(wb, `${districtName}_Pending_GP_Report.xlsx`);
    } catch (e) {
      console.error(e);
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
              <a
                href="/"
                className="logout"
                style={{ position: "relative", padding: "10px" }}
                onClick={handleLogout}
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
        <h1 className="page-title">DPRO Dashboard - {districtName} District</h1>

        {/* District Overview Card */}
        {!showDetailsView && districtOverview && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">District Overview</h2>
              <div className="section-line"></div>
            </div>
            {/* <div className="district-cards">
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
            </div> */}
            <div className="table-container">
              <div className="table-header">
                <h3 className="table-title">Block Report - {districtName}</h3>
                <button
                  className="download-btn"
                  onClick={downloadBlockReportExcel}
                >
                  <i className="fas fa-download"></i> Download Report
                </button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>SL. NO.</th>
                      <th>Block Name</th>
                      <th>No. of GP's</th>
                      <th>No. of GP's Scanned</th>
                      <th>No. of Families registered</th>
                      <th>No. of Families record verified</th>
                      <th>% of Data Verification</th>
                      <th>No. of GP's Data verified</th>
                      <th>Pending GP's for verification</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockReport.map((block, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{block.block_name}</td>
                        <td>{block.no_of_gps}</td>
                        <td>{block.no_of_gps_scanned}</td>
                        <td>{block.no_of_families_registered}</td>
                        <td>{block.no_of_families_record_verified}</td>
                        <td>{block.percentage_data_verification}</td>
                        <td style={{ cursor: "pointer" }}>
                          <div className="view_button_box">
                            <span>{block.no_of_gps_data_verified}</span>
                            {/* {block.no_of_gps_data_verified != 0 && ( */}
                            <button
                              className="download-btn view_button"
                              onClick={() =>
                                handleCompletedGpData(block.block_name)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {/* )} */}
                          </div>
                        </td>
                        <td>
                          <div className="view_button_box">
                            <span>{block.pending_gps_for_verification}</span>
                            {/* {block.pending_gps_for_verification != 0 && ( */}
                            <button
                              className="download-btn view_button"
                              onClick={() =>
                                handlePendingGpData(block.block_name)
                              }
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {/* )} */}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                  value: safeNumber(
                    districtDetails.approximateFamilies
                  ).toLocaleString(),
                },
                {
                  label: "Data Entry Done",
                  value: safeNumber(
                    districtDetails.dataEntryDone
                  ).toLocaleString(),
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
        {showGpData && gpData.length > 0 && (
          <div className="section" ref={gpSectionRef}>
            <div className="section-header">
              <h2 className="section-title">Completed GP's Table</h2>
              <div className="section-line"></div>
            </div>
            <div className="table-container">
              <div className="table-header">
                <h3 className="table-title">
                  Block Report - {gpData[0]?.name_of_block}
                </h3>
                <button
                  className="download-btn"
                  onClick={downloadCompletedGpExcel}
                >
                  <i className="fas fa-download"></i> Download Report
                </button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Block</th>
                      <th>Name of GP</th>
                      <th>No. of Families registered in GP</th>
                      <th>No. of families data verified</th>
                      <th>% of Data Verification</th>
                      {/* <th>Data Entry Done</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {gpData.map((block, index) => (
                      <tr key={index}>
                        <td>{block.name_of_block}</td>
                        <td>{block.name_of_gp}</td>
                        <td>{block.no_of_families_registered_in_gp}</td>
                        <td>{block.no_of_families_data_verified}</td>
                        <td>{block.percentage_of_data_verification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Block Report Table */}
        {showPendingGpData && gpPendingData.length > 0 && (
          <div className="section" ref={gpSectionRef}>
            <div className="section-header">
              <h2 className="section-title">Pending GP's Table</h2>
              <div className="section-line"></div>
            </div>
            <div className="table-container">
              <div className="table-header">
                <h3 className="table-title">
                  Block Report - {gpPendingData[0]?.name_of_block}
                </h3>
                <button
                  className="download-btn"
                  onClick={downloadPendingGpExcel}
                >
                  <i className="fas fa-download"></i> Download Report
                </button>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Name of Block</th>
                      <th>Name of Pending GP's</th>
                      <th>No. of Families registered in GP</th>
                      <th>No. of families data verified</th>
                      <th>Pending families for verification</th>
                      <th>% of Data Verification</th>
                      {/* <th>Data Entry Done</th> */}
                    </tr>
                  </thead>
                  <tbody>
                    {gpPendingData.map((block, index) => (
                      <tr key={index}>
                        <td>{block.name_of_block}</td>
                        <td>{block.name_of_pending_gps}</td>
                        <td>{block.no_of_families_registered_in_gp}</td>
                        <td>{block.no_of_families_data_verified}</td>
                        <td>{block.pending_families_for_verification}</td>
                        <td>{block.percentage_of_data_verification}</td>
                      </tr>
                    ))}
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

export default DPRODashboard;
