// src/components/hq/DistrictReportTable.jsx
import React from 'react';
import hqService from '../../services/hqService';
import { downloadFile, createSafeFilename } from '../../utils/downloadHelper';

const DistrictReportTable = ({ data, onDistrictClick }) => {
  const handleDownload = async () => {
  try {
    const filename = createSafeFilename('District_Report');
    await downloadFile('/download_district_report_api/', filename);
  } catch (error) {
    console.error('Download error:', error);
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
              </tr>
            </thead>
            <tbody id="districtTableBody">
              {data && data.length > 0 ? (
                data.map((district, index) => (
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
                        {district.district}
                      </a>
                    </td>
                    <td>{district.blocks}</td>
                    <td>{district.gp}</td>
                    <td>{district.villages}</td>
                    <td>{district.uninhabited_villages}</td>
                    <td>{district.targeted_villages}</td>
                    <td>{district.approximate_families?.toLocaleString()}</td>
                    <td>{district.families_data_entry_done?.toLocaleString()}</td>
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