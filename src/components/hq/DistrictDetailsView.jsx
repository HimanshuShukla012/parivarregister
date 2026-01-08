// src/components/hq/DistrictDetailsView.jsx
import React from 'react';
import { downloadFile, createSafeFilename } from '../../utils/downloadHelper';

const DistrictDetailsView = ({ district, onBack }) => {
  if (!district) return null;

  // DEBUG: Log the actual district data
  console.log('=== DISTRICT DETAILS DEBUG ===');
  console.log('Full district object:', district);
  console.log('Available keys:', Object.keys(district));

  // Helper function to safely parse numbers
  const safeNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) ? defaultValue : num;
  };

  // Helper function to safely format percentage
  const safePercent = (value) => {
    const num = safeNumber(value, 0);
    return `${num.toFixed(2)}%`;
  };

  // YOUR API RETURNS CAMELCASE - Let's use those exact property names
  const detailsData = [
    { 
      label: 'Total GPs', 
      value: safeNumber(district.gp, 0)
    },
    { 
      label: 'GPs Scanned', 
      value: safeNumber(district.gp_scanned, 0)
    },
    { 
      label: 'GP Scanned %', 
      value: safePercent(district.gp_scanned_percent)
    },
    { 
      label: 'Total Villages', 
      value: safeNumber(district.villages, 0)
    },
    { 
      label: 'Villages Scanned', 
      value: safeNumber(district.villages_scanned, 0)
    },
    { 
      label: 'Villages Scanned %', 
      value: safePercent(district.villages_scanned_percent)
    },
    
    { 
      label: 'Approx. Families', 
      value: safeNumber(district.approximateFamilies, 0).toLocaleString()
    },
    { 
      label: 'Data Entry Done', 
      value: safeNumber(district.dataEntryDone, 0).toLocaleString()
    },
    { 
      label: 'Data Entry %', 
      value: safePercent(district.dataEntryPercent)
    },
    { 
      label: 'Sachiv Verified', 
      value: safeNumber(district.sachivVerifiedVillages, 0)
    },
    { 
      label: 'Sachiv Rollback', 
      value: safeNumber(district.sachivRollback, 0)
    },
    { 
      label: 'Sachiv Pending', 
      value: safeNumber(district.sachivPending, 0)
    },
    { 
      label: 'ADO Verified', 
      value: safeNumber(district.adoVerified, 0)
    },
    { 
      label: 'DPRO Verified', 
      value: safeNumber(district.dproVerified, 0)
    }
  ];

  const handleDownload = async (metric, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Download clicked for metric:', metric);
    console.log('District object:', district);
    
    // Use district name for the API call
const districtParam = district.district;

if (!districtParam) {
  console.error('❌ district name missing from district object');
  alert('Cannot download: District name is missing. Please refresh the page.');
  return;
}
    
    console.log('✅ Using district code:', districtParam);
    
    try {
      // Build URL with the district parameter
      const url = `/district_download_api/?district=${encodeURIComponent(districtParam)}&metric=${encodeURIComponent(metric)}`;
      const filename = createSafeFilename(`${district.district}_${metric}`, 'xlsx');
      
      console.log('Download request:', { 
  districtName: districtParam, 
  metric,
  url 
});
      
      await downloadFile(url, filename);
      console.log('✅ Download completed successfully');
      
    } catch (error) {
      console.error('❌ Download error:', error);
      
      // Better error messages
      if (error.message.includes('Session expired')) {
        alert('Your session has expired. Please refresh the page and log in again.');
      } else if (error.message.includes('not reaching Django')) {
        alert('Backend connection error. Please ensure Django server is running on port 8000.');
      } else {
        alert(`Download failed: ${error.message}`);
      }
    }
  };

  return (
    <div className="section" id="districtDetailsSection">
      <div className="section-header">
        <h2 className="section-title" id="districtDetailsTitle">
          {district.district || 'District'} - Detailed Overview
        </h2>
        <div className="section-line"></div>
        <button id="backToOverview" className="back-btn" onClick={onBack}>
          <i className="fas fa-arrow-left"></i> Back to Overview
        </button>
      </div>
      <div className="district-details-cards" id="districtDetailsCards">
        {detailsData.map((item, index) => (
          <div key={index} className="district-detail-card">
            <div className="detail-card-value">{item.value}</div>
            <div className="detail-card-label">{item.label}</div>
            <button 
              className="download-btn" 
              onClick={(e) => handleDownload(item.label, e)}
              title={`Download ${item.label} data for ${district.district}`}
            >
              <i className="fas fa-download"></i> Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistrictDetailsView;