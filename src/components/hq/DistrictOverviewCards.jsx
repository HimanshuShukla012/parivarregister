// src/components/hq/DistrictOverviewCards.jsx
import React from "react";

const DistrictOverviewCards = ({ districts, onDistrictClick }) => {
  // Add safety checks
  if (!districts) {
    console.warn("⚠️ districts is null/undefined");
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">District Overview</h2>
          <div className="section-line"></div>
        </div>
        <p>Loading districts...</p>
      </div>
    );
  }

  if (!Array.isArray(districts)) {
    console.error("❌ districts is not an array:", districts);
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">District Overview</h2>
          <div className="section-line"></div>
        </div>
        <p style={{ color: "red" }}>Error: Invalid district data format</p>
      </div>
    );
  }

  if (districts.length === 0) {
    return (
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">District Overview</h2>
          <div className="section-line"></div>
        </div>
        <p>No districts found</p>
      </div>
    );
  }

  const getPendingColor = (gpPending) => {
    if (gpPending < 10) return "pending-green";
    if (gpPending >= 10 && gpPending <= 100) return "pending-yellow";
    return "pending-red";
  };

  return (
    <div className="section" id="districtOverviewSection">
      <div className="section-header">
        <h2 className="section-title">District Overview</h2>
        <div className="section-line"></div>
      </div>
      <div className="district-cards" id="districtCards">
        {districts.map((district) => {
          console.log(district, ">>>");

          // const totalGPs = district.gp || 0;
          // const gpScanned =
          //   Math.round(totalGPs * (district.gp_scanned_percent || 0)) / 100;
          // const gpPending = Math.floor(totalGPs - gpScanned);
          const totalGPs = district.gp || 0;
          const percent = district.gp_scanned_percent || 0;

          const rawScanned = (totalGPs * percent) / 100;

          const gpScanned =
            percent >= 90
              ? Math.round(rawScanned) // round when ≥ 90%
              : Math.floor(rawScanned); // otherwise floor

          const gpPending = totalGPs - gpScanned;
          const approximateFamilies = district.approximate_families || 0;

          // FIX 1: Use the merged data_entry_done value (district-specific)
          // This comes from the HQDashboard merge operation
          const dataEntryDone = district.data_entry_done || 0;
          const sachivVerified = district.sachiv_verified;

          return (
            <div
              key={district.zilaCode || district.district}
              className="district-card"
              onClick={() => onDistrictClick(district.zilaCode)}
              style={{ cursor: "pointer" }}
            >
              <div className="district-name">{district.district}</div>
              <div className="district-metrics">
                <div className="district-metric">
                  <div className="district-metric-value">{totalGPs}</div>
                  <div className="district-metric-label">Total GPs</div>
                </div>
                <div className="district-metric">
                  <div className="district-metric-value">{gpScanned}</div>
                  <div className="district-metric-label">GPs Scanned</div>
                </div>
                <div className="district-metric">
                  <div
                    className={`district-metric-value ${getPendingColor(gpPending)}`}
                  >
                    {gpPending}
                  </div>
                  <div className="district-metric-label">GPs Pending</div>
                </div>
                <div className="district-metric">
                  <div className="district-metric-value">
                    {approximateFamilies.toLocaleString()}
                  </div>
                  <div className="district-metric-label">Approx. Families</div>
                </div>
                <div className="district-metric">
                  <div className="district-metric-value">
                    {dataEntryDone.toLocaleString()}
                  </div>
                  <div className="district-metric-label">Data Entry Done</div>
                </div>
                <div className="district-metric">
                  <div className="district-metric-value">
                    {sachivVerified.toLocaleString()}
                  </div>
                  <div className="district-metric-label">Sachiv Verified</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DistrictOverviewCards;
