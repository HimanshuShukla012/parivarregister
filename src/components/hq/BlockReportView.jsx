// src/components/hq/BlockReportView.jsx
import React from 'react';
import { downloadFile, createSafeFilename } from '../../utils/downloadHelper';

const BlockReportView = ({ districtName, blockData, onClose }) => {
  const handleDownload = async () => {
    try {
      // ✅ FIXED: Use the correct download endpoint from Django URLs
      const url = `/download_block_target_report_api/?district=${encodeURIComponent(districtName)}`;
      const filename = createSafeFilename(`${districtName}_Block_Report`);
      
      console.log('🔽 Downloading from:', url);
      await downloadFile(url, filename);
      
    } catch (error) {
      console.error('Download error details:', error);
      alert(`Download failed: ${error.message}`);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{districtName} - Block Wise Report</h2>
        <div className="section-line"></div>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Block-wise Summary Report</h3>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="download-btn"
              onClick={handleDownload}
            >
              <i className="fas fa-download"></i> Download Report
            </button>
            <button 
              className="download-btn" 
              style={{ backgroundColor: '#6b7280' }}
              onClick={onClose}
            >
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </button>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Block Name</th>
                <th>Total Gram Panchayat</th>
                <th>Total Villages</th>
                <th>Uninhabited Villages</th>
                <th>Targeted Villages</th>
                
                <th>Data Entry Done</th>
                
              </tr>
            </thead>
            <tbody>
              {blockData && blockData.length > 0 ? (
                blockData.map((block, index) => {
                  const completionPercent = block.approximate_families > 0
                    ? ((block.families_data_entry_done / block.approximate_families) * 100).toFixed(2)
                    : 0;
                  
                  return (
                    <tr key={index}>
                      <td><strong>{block.block}</strong></td>
                      <td>{block.gp}</td>
                      <td>{block.villages}</td>
                      <td>{block.uninhabited_villages}</td>
                      <td>{block.targeted_villages}</td>
                      
                      <td>{block.families_data_entry_done?.toLocaleString()}</td>
                      
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center text-muted">
                    No block data available
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

export default BlockReportView;