// src/components/pm/ProjectMonitoringView.jsx
import React, { useState, useEffect } from "react";
import {
  FaAddressBook,
  FaClock,
  FaTimesCircle,
  FaHome,
  FaUserCheck,
  FaUserShield,
  FaFlagCheckered,
  FaChartLine,
  FaDownload,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaCalendarAlt,
} from "react-icons/fa";
import api from "../../services/api";
import pmService from "../../services/pmService";
import supervisorService from "../../services/supervisorService";

const ProjectMonitoringView = () => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState(null);
  const [tables, setTables] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [currentPages, setCurrentPages] = useState({});
  const [itemsPerPage] = useState(10);
  const [btnLoading, setBtnLoading] = useState(false);

  // Form states
  const [zilaList, setZilaList] = useState([]);
  const [selectedZilaForBlock, setSelectedZilaForBlock] = useState("");
  const [selectedZilaForDigi, setSelectedZilaForDigi] = useState("");

  // Additional form states for new reports from Service Provider
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [thsDistrict, setThsDistrict] = useState("");
  const [thsBlock, setThsBlock] = useState("");
  const [thsBlocks, setThsBlocks] = useState([]);

  useEffect(() => {
    fetchProjectData();
    fetchZilaList();
  }, []);

  // Fetch blocks when THS district changes
  useEffect(() => {
    if (thsDistrict) {
      fetchBlocksForDistrict(thsDistrict);
    }
  }, [thsDistrict]);

  const fetchZilaList = async () => {
    try {
      const response = await api.get("/getZila/");
      setZilaList(response.data);
    } catch (error) {
      console.error("Error fetching zila list:", error);
    }
  };

  const fetchBlocksForDistrict = async (zila) => {
    try {
      const response = await api.get(`/getBlockByZila/?zila=${zila}`);
      setThsBlocks(response.data);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const [cardsRes, tablesRes] = await Promise.all([
        api.get("/adminProjectMonitoringCards/"),
        api.get("/adminProjectMonitoringTbls/"),
      ]);

      setCards(cardsRes.data);
      setTables(tablesRes.data);

      const initialPages = {};
      Object.keys(tablesRes.data || {}).forEach((key) => {
        initialPages[key] = 1;
      });
      setCurrentPages(initialPages);
    } catch (error) {
      console.error("Error fetching project data:", error);
    } finally {
      setLoading(false);
    }
  };

  // const handleDownloadReport = async (url) => {
  //   window.location.href = url;
  //   target = "_blank";
  // };
  // const handleDownloadReport = (url) => {
  //   window.location.href = url; // opens in same tab
  // };

  // const handleDownloadReport = async () => {
  //   const res = await api.get("/district_overview_excel_api/", {
  //     responseType: "blob",
  //   });

  //   const url = window.URL.createObjectURL(new Blob([res.data]));
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "DistrictReport.xlsx");
  //   document.body.appendChild(link);
  //   link.click();
  // };

const handleDownloadReport = async (url) => {
    try {
      const response = await api.get(url, { responseType: "blob" });
      const blob = new Blob([response.data], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      const disposition = response.headers["content-disposition"];
      let filename = url.split("/").filter(Boolean).pop().split("?")[0] + ".xlsx";
      if (disposition) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("❌ Download failed:", error);
      alert("Download failed. Please try again.");
    }
  };

  const handleDownloadGPReport = () => {
    // if (!selectedZilaForBlock) {
    //   alert("Please select a district");
    //   return;
    // }
    handleDownloadReport(
      `${import.meta.env.VITE_API_BASE_URL}/download_gp_wise_report/`,
    );
  };

  const handleBlockReportDownload = () => {
    // if (!selectedZilaForBlock) {
    //   alert("Please select a district");
    //   return;
    // }
    handleDownloadReport(
      `${import.meta.env.VITE_API_BASE_URL}/download_block_wise_report/`,
    );
  };

  const handleDigiStatusDownload = () => {
    if (!selectedZilaForDigi) {
      alert("Please select a district");
      return;
    }
    handleDownloadReport(
      `/downloadDigitisationStatusTblByZila?zila=${selectedZilaForDigi}`,
    );
  };

  const handleDateRangeDownload = () => {
    if (!dateRange.from || !dateRange.to) {
      alert("Please select both start and end dates");
      return;
    }
    handleDownloadReport(
      `/downloadEntryDoneInRange?from=${dateRange.from}&to=${dateRange.to}`,
    );
  };

  const handleTHSDownload = () => {
    if (!thsDistrict) {
      alert("Please select a district");
      return;
    }
    const blockParam = thsBlock ? `&block=${thsBlock}` : "";
    handleDownloadReport(
      `/downloadTakeoverHandoverSummary?zila=${thsDistrict}${blockParam}`,
    );
  };

  const handleSearch = (tableKey, value) => {
    setSearchTerms((prev) => ({ ...prev, [tableKey]: value }));
    setCurrentPages((prev) => ({ ...prev, [tableKey]: 1 }));
  };

  const getFilteredData = (data, tableKey) => {
    const searchTerm = searchTerms[tableKey]?.toLowerCase() || "";
    if (!searchTerm) return data;

    return data.filter((row) =>
      Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchTerm),
      ),
    );
  };

  const getPaginatedData = (data, tableKey) => {
    const page = currentPages[tableKey] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const handlePageChange = (tableKey, newPage) => {
    setCurrentPages((prev) => ({ ...prev, [tableKey]: newPage }));
  };

  const styles = {
    card: {
      background: "rgb(255, 255, 255)",
      color: "rgb(255, 255, 255)",
      fontSize: "22px",
      fontWeight: 600,
      alignItems: "center",
      borderRadius: "16px",
      padding: "16px 20px",
      boxShadow: "rgba(0, 0, 0, 0.08) 0px 2px 4px",
      border: "1px solid rgb(229, 231, 235)",
      width: "100%",
    },
    cardHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: "8px",
    },
    cardTitle: {
      fontSize: "16px",
      fontWeight: "600",
      color: "#374151",
      display: "flex",
      alignItems: "center",
      gap: "8px",
    },
    downloadBtn: {
      background: "rgb(34, 197, 94)",
      color: "white",
      padding: "8px 14px",
      borderRadius: "6px",
      border: "none",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "6px",
      fontSize: "14px",
      fontWeight: "500",
    },
    formRow: {
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
    },
    label: {
      fontSize: "14px",
      marginBottom: "4px",
      display: "block",
      color: "#374151",
    },
    input: {
      width: "100%",
      padding: "8px",
      borderRadius: "6px",
      border: "1px solid #d1d5db",
      fontSize: "14px",
    },
  };

  const renderTable = (tableKey, data, headers, heading, downloadUrl) => {
    if (!data || data.length === 0) return null;

    const filteredData = getFilteredData(data, tableKey);
    const paginatedData = getPaginatedData(filteredData, tableKey);
    const totalPages = getTotalPages(filteredData.length);
    const currentPage = currentPages[tableKey] || 1;

    return (
      <section style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <h3 style={{ fontSize: "20px", fontWeight: "600", color: "#1f2937" }}>
            {heading}{" "}
            <span style={{ color: "#6b7280", fontSize: "16px" }}>
              ({filteredData.length})
            </span>
          </h3>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <FaSearch
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#9ca3af",
                  fontSize: "14px",
                }}
              />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerms[tableKey] || ""}
                onChange={(e) => handleSearch(tableKey, e.target.value)}
                style={{
                  paddingLeft: "36px",
                  paddingRight: "12px",
                  paddingTop: "8px",
                  paddingBottom: "8px",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  fontSize: "14px",
                  width: "200px",
                }}
              />
            </div>
            {downloadUrl && (
              <button
                onClick={() => handleDownloadReport(downloadUrl)}
                style={{
                  background: "#3b82f6",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                <FaDownload /> Download
              </button>
            )}
          </div>
        </div>

        <div
          style={{
            overflowX: "auto",
            background: "white",
            borderRadius: "8px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "14px",
            }}
          >
            <thead
              style={{
                background: "#f9fafb",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              <tr>
                <th
                  style={{
                    padding: "12px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                  }}
                >
                  Sr. No.
                </th>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, rIdx) => (
                  <tr key={rIdx} style={{ borderBottom: "1px solid #e5e7eb" }}>
                    <td style={{ padding: "12px", color: "#6b7280" }}>
                      {(currentPage - 1) * itemsPerPage + rIdx + 1}
                    </td>
                    {Object.values(row).map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        style={{ padding: "12px", color: "#374151" }}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    style={{
                      padding: "24px",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: "12px",
              marginTop: "16px",
            }}
          >
            <button
              onClick={() => handlePageChange(tableKey, currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "white",
                cursor: currentPage === 1 ? "not-allowed" : "pointer",
                opacity: currentPage === 1 ? 0.5 : 1,
              }}
            >
              <FaChevronLeft />
            </button>

            <div style={{ display: "flex", gap: "6px" }}>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum =
                  totalPages <= 5
                    ? i + 1
                    : currentPage <= 3
                      ? i + 1
                      : currentPage >= totalPages - 2
                        ? totalPages - 4 + i
                        : currentPage - 2 + i;
                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(tableKey, pageNum)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      background: currentPage === pageNum ? "#3b82f6" : "white",
                      color: currentPage === pageNum ? "white" : "#374151",
                      cursor: "pointer",
                      fontWeight: currentPage === pageNum ? "600" : "400",
                    }}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(tableKey, currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                background: "white",
                cursor: currentPage === totalPages ? "not-allowed" : "pointer",
                opacity: currentPage === totalPages ? 0.5 : 1,
              }}
            >
              <FaChevronRight />
            </button>

            <span
              style={{ color: "#6b7280", fontSize: "14px", marginLeft: "8px" }}
            >
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </section>
    );
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "5px solid #f3f3f3",
            borderTop: "5px solid #3b82f6",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ marginTop: "20px", fontSize: "16px", color: "#666" }}>
          Loading project data...
        </p>
      </div>
    );
  }

  {
    /* ================= REPORTS & DOWNLOADS (YOUR OLD CODE) ================= */
  }
  {
    /* Yahan se tumhara existing Reports & Downloads wala pura code as-it-is rahega */
  }

  return (
    <div style={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Reports Section with Forms */}
      <section>
        <div style={{ padding: "20px" }}>
          <h2
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
            Project Overview
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "40px",
            }}
          >
            {[
              {
                label: "No. of Villages Pending for Scanning",
                value: cards?.noOfVilScanPending ?? "?",
                icon: <i className="fas fa-clock"></i>,
                color: "#22C55E",
                onClick: () =>
                  handleDownloadReport(
                    `${import.meta.env.VITE_API_BASE_URL}/downloadVilScanPendingTbl/`,
                  ),
              },
              {
                label: "No. of Villages Entry Not Started",
                value: cards?.noOfVillagesNotStarted ?? "?",

                icon: <i className="fas fa-times-circle"></i>,
                color: "#22C55E",
              },
              {
                label: "No. of Villages Entry Done",
                value: cards?.noOfVillagesSupervisorApproved ?? "?",

                icon: <i className="fas fa-home"></i>,
                color: "#6366F1",
              },
              {
                label: "No. of Villages Verified By Sachiv",
                value: cards?.noOfVillagesSachivApproved ?? "?",

                icon: <i className="fas fa-check-circle"></i>,
                color: "#22C55E",
              },
              {
                label: "No. of Blocks Verified By ADO",
                value: cards?.noOfBlocksADOApproved ?? "?",

                icon: <i className="fas fa-shield-alt"></i>,
                color: "#6366F1",
              },
              {
                label: "No. of Districts Completed",
                value: cards?.noOfDistrictsCompleted ?? "?",

                icon: <i className="fas fa-home"></i>,
                color: "#22C55E",
              },
            ].map((item, i) => (
              <div
                key={i}
                onClick={item.onClick || undefined}
                style={{
                  background: "#fff",
                  borderRadius: "16px",
                  padding: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                  cursor: item.onClick ? "pointer" : "default",
                }}
              >
                <div
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "14px",
                    background: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "22px",
                    color: "#fff",
                  }}
                >
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontSize: "14px", color: "#555" }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: "28px", fontWeight: "700" }}>
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ marginBottom: "40px" }}>
        <h2
          style={{
            fontSize: "28px",
            fontWeight: "bold",
            marginBottom: "24px",
            color: "#1f2937",
          }}
        >
          Reports & Downloads
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            width: "100%",
          }}
        >
          {/* Data Entries Completed in Range */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>
                <FaCalendarAlt /> Data Entries Completed in Range
              </h4>
              <button
                onClick={handleDateRangeDownload}
                style={styles.downloadBtn}
              >
                <FaDownload /> Download
              </button>
            </div>

            <div style={styles.formRow}>
              <div style={{ flex: 1 }}>
                <label style={styles.label}>From Date</label>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, from: e.target.value })
                  }
                  style={styles.input}
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={styles.label}>To Date</label>
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, to: e.target.value })
                  }
                  style={styles.input}
                />
              </div>
            </div>
          </div>

          {/* Digitisation District-wise Report */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>
                Digitisation District-wise Report
              </h4>
              <button
                onClick={() =>
  window.open(
    `${import.meta.env.VITE_API_BASE_URL}/district_overview_excel_api/`,
    "_blank"
  )
}
                style={styles.downloadBtn}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>

          {/* Digitisation GP-wise Report */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>Digitisation GP Report</h4>
              <button
                onClick={() =>
  window.open(
    `${import.meta.env.VITE_API_BASE_URL}/download_gp_wise_report/`,
    "_blank"
  )
}
                style={styles.downloadBtn}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>

          {/* Digitisation Block-wise Report */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>Digitisation Block-wise Report</h4>
              <button
                onClick={() =>
  window.open(
    `${import.meta.env.VITE_API_BASE_URL}/download_block_wise_report/`,
    "_blank"
  )
}
                style={styles.downloadBtn}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>

          {/* Family Register Digitisation Master Report */}
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>
                Family Register Digitisation Master Report
              </h4>
              <button
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_API_BASE_URL}/export_village_detailed_report/`,
                    "_blank",
                  )
                }
                style={styles.downloadBtn}
              >
                <FaDownload /> Download
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Tables from adminProjectMonitoringTbls */}
      {tables &&
        Object.entries(tables).map(([tableKey, tableData], index) => {
          if (!tableData || !tableData.data) return null;

          return renderTable(
            tableKey,
            tableData.data,
            tableData.headers || ["District", "Block", "Village"],
            tableData.heading,
            tableData.download ? `/${tableData.download}` : null,
          );
        })}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        button:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
          transition: all 0.2s;
        }
        button:active:not(:disabled) {
          transform: translateY(0);
        }
        select:focus, input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
};

export default ProjectMonitoringView;
