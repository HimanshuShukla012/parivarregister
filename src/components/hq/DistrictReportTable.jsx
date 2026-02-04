// src/components/hq/DistrictReportTable.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { downloadFile, createSafeFilename } from "../../utils/downloadHelper";

const DistrictReportTable = ({ data, onDistrictClick }) => {
  const [mergedData, setMergedData] = useState(data || []);

  useEffect(() => {
    let isMounted = true;

    const mergeSachivVerified = async () => {
      try {
        if (!data || data.length === 0) {
          if (isMounted) setMergedData([]);
          return;
        }

        const overviewRes = await axios.get("/district_overview_api/");

        const sachivMap = {};
        (overviewRes.data || []).forEach((item) => {
          const key = (item.district || "").trim().toLowerCase();
          sachivMap[key] = item.sachiv_verified ?? 0;
        });

        const merged = data.map((row) => {
          const key = (row.district || "").trim().toLowerCase();
          return {
            ...row,
            sachiv_verified: sachivMap[key] ?? row.sachiv_verified ?? 0,
          };
        });

        if (isMounted) setMergedData(merged);
      } catch (e) {
        console.error("Sachiv merge error:", e);
        if (isMounted) setMergedData(data || []);
      }
    };

    mergeSachivVerified();

    return () => {
      isMounted = false;
    };
  }, [data]);

  const handleDownload = async () => {
    try {
      const filename = createSafeFilename("District_Report");
      await downloadFile("/download_district_report_api/", filename);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Download failed: ${error.message}`);
    }
  };

  const handleDistrictNameClick = (districtName) => {
    if (onDistrictClick) {
      onDistrictClick(districtName);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">District Wise Summary</h2>
        <div className="section-line"></div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Comprehensive District Report</h3>
          <button
            id="downloadDistrictReport"
            className="download-btn"
            onClick={handleDownload}
          >
            <i className="fas fa-download"></i> Download Report
          </button>
        </div>
        <div className="table-wrapper">
          <table id="districtTable">
            <thead>
              <tr>
                <th>District Name</th>
                <th>Total Block</th>
                <th>Total Gram Panchayat</th>
                <th>Total Villages</th>
                <th>Uninhabited Villages</th>
                <th>Targeted Villages</th>
                <th>Approximate No. of Families</th>
                <th>No. of Families Data Entry Done</th>
                <th>Sachiv Verified</th>
              </tr>
            </thead>
            <tbody id="districtTableBody">
              {mergedData && mergedData.length > 0 ? (
                mergedData.map((district, index) => (
                  <tr key={index}>
                    <td>
                      <a
                        href="#"
                        className="district-link"
                        onClick={(e) => {
                          e.preventDefault();
                          handleDistrictNameClick(district.district);
                        }}
                      >
                        {district.district} {console.log(district)}
                      </a>
                    </td>
                    <td>{district.blocks}</td>
                    <td>{district.gp}</td>
                    <td>{district.villages}</td>
                    <td>{district.uninhabited_villages}</td>
                    <td>{district.targeted_villages}</td>
                    <td>{district.approximate_families?.toLocaleString()}</td>
                    <td>
                      {district.families_data_entry_done?.toLocaleString()}
                    </td>
                    <td>{district.sachiv_verified?.toLocaleString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="text-center text-muted">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DistrictReportTable;
