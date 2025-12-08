// src/components/hq/FilterRecordsPanel.jsx
import React, { useState } from 'react';
import hqService from '../../services/hqService';

const FilterRecordsPanel = ({ zilaList }) => {
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedGP, setSelectedGP] = useState('');
  const [selectedVillage, setSelectedVillage] = useState('');
  const [blocks, setBlocks] = useState([]);
  const [gps, setGPs] = useState([]);
  const [villages, setVillages] = useState([]);
  const [filterResults, setFilterResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  const handleDistrictChange = async (e) => {
    const district = e.target.value;
    setSelectedDistrict(district);
    setSelectedBlock('');
    setSelectedGP('');
    setSelectedVillage('');
    setBlocks([]);
    setGPs([]);
    setVillages([]);

    if (district) {
      try {
        const blockData = await hqService.getBlocksByZila(district);
        setBlocks(blockData);
      } catch (error) {
        console.error('Error fetching blocks:', error);
      }
    }
  };

  const handleBlockChange = async (e) => {
    const block = e.target.value;
    setSelectedBlock(block);
    setSelectedGP('');
    setSelectedVillage('');
    setGPs([]);
    setVillages([]);

    if (selectedDistrict && block) {
      try {
        const gpData = await hqService.getSabhasByBlock(selectedDistrict, block);
        setGPs(gpData);
      } catch (error) {
        console.error('Error fetching GPs:', error);
      }
    }
  };

  const handleGPChange = async (e) => {
    const gp = e.target.value;
    setSelectedGP(gp);
    setSelectedVillage('');
    setVillages([]);

    if (selectedDistrict && selectedBlock && gp) {
      try {
        const villageData = await hqService.getVillagesBySabha(
          selectedDistrict, 
          selectedBlock, 
          gp
        );
        setVillages(villageData);
      } catch (error) {
        console.error('Error fetching villages:', error);
      }
    }
  };

  const handleVillageChange = (e) => {
    setSelectedVillage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDistrict) {
      alert('Please select at least a district');
      return;
    }

    try {
      const params = {
        district: selectedDistrict,
        block: selectedBlock,
        gp: selectedGP,
        village: selectedVillage
      };

      const data = await hqService.filterRecords(params);
      setFilterResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error filtering records:', error);
      alert('Failed to filter records');
    }
  };

  const handleDownload = async () => {
    try {
      const params = {
        district: selectedDistrict,
        block: selectedBlock,
        gp: selectedGP,
        village: selectedVillage
      };

      const blob = await hqService.downloadFilteredRecords(params);
      
      let filename = selectedDistrict;
      if (selectedBlock) filename += `_${selectedBlock}`;
      if (selectedGP) filename += `_${selectedGP}`;
      if (selectedVillage) filename += `_${selectedVillage}`;
      filename += '_Filtered_Records.xlsx';

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed');
    }
  };

  // Determine which cards to show
  const shouldShowADO = !selectedGP && !selectedVillage;

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Filter Records</h2>
        <div className="section-line"></div>
      </div>
      <div className="filter-section">
        <h3 className="filter-title">Filter by Location</h3>
        <form id="filterRecordsForm" className="filter-form" onSubmit={handleSubmit}>
          <div className="filter-grid">
            <div className="filter-group">
              <label className="filter-label">Select District</label>
              <select 
                className="filter-select" 
                id="filterDistrict"
                value={selectedDistrict}
                onChange={handleDistrictChange}
              >
                <option value="">-- Select District --</option>
                {zilaList.map((zila) => (
                  <option key={zila.zila} value={zila.zila}>
                    {zila.zila}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Select Block</label>
              <select 
                className="filter-select" 
                id="filterBlock"
                value={selectedBlock}
                onChange={handleBlockChange}
                disabled={!selectedDistrict}
              >
                <option value="">-- Select Block --</option>
                {blocks.map((block) => (
                  <option key={block.block} value={block.block}>
                    {block.block}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Select Gram Panchayat</label>
              <select 
                className="filter-select" 
                id="filterGP"
                value={selectedGP}
                onChange={handleGPChange}
                disabled={!selectedBlock}
              >
                <option value="">-- Select GP --</option>
                {gps.map((gp) => (
                  <option key={gp.sabhaCode} value={gp.sabhaCode}>
                    {gp.sabha}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">Select Village</label>
              <select 
                className="filter-select" 
                id="filterVillage"
                value={selectedVillage}
                onChange={handleVillageChange}
                disabled={!selectedGP}
              >
                <option value="">-- Select Village --</option>
                {villages.map((village) => (
                  <option key={village.gaonCode} value={village.gaonCode}>
                    {village.gaon}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <button type="submit" className="submit-btn">
                <i className="fas fa-filter"></i> Apply Filter
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter Results Cards */}
      {showResults && filterResults && (
        <div id="filterResultsSection">
          <div className="filter-results-cards" id="filterResultsCards">
            <div className="filter-result-card">
              <div className="filter-result-value">
                {filterResults.registerReceived?.toLocaleString()}
              </div>
              <div className="filter-result-label">Register Received</div>
            </div>

            <div className="filter-result-card">
              <div className="filter-result-value">
                {filterResults.registerScanned?.toLocaleString()}
              </div>
              <div className="filter-result-label">Register Scanned</div>
            </div>

            <div className="filter-result-card">
              <div className="filter-result-value">
                {filterResults.registerPending?.toLocaleString()}
              </div>
              <div className="filter-result-label">Register Pending</div>
            </div>

            <div className="filter-result-card">
              <div className="filter-result-value">
                {filterResults.dataEntryCompleted?.toLocaleString()}
              </div>
              <div className="filter-result-label">Data Entry Completed</div>
            </div>

            <div className="filter-result-card">
              <div className="filter-result-value">
                {filterResults.sachivVerified?.toLocaleString()}
              </div>
              <div className="filter-result-label">Sachiv Verified</div>
            </div>

            <div className="filter-result-card">
              <div className="filter-result-value">
                {filterResults.sachivRollback?.toLocaleString()}
              </div>
              <div className="filter-result-label">Sachiv Rollback</div>
            </div>

            {shouldShowADO && (
              <>
                <div className="filter-result-card">
                  <div className="filter-result-value">
                    {filterResults.adoVerified?.toLocaleString()}
                  </div>
                  <div className="filter-result-label">ADO Verified</div>
                </div>

                <div className="filter-result-card">
                  <div className="filter-result-value">
                    {filterResults.dproVerified?.toLocaleString()}
                  </div>
                  <div className="filter-result-label">DPRO Verified</div>
                </div>

                <div className="filter-result-card">
                  <div className="filter-result-value">
                    {filterResults.ddVerified?.toLocaleString()}
                  </div>
                  <div className="filter-result-label">DD Verified</div>
                </div>
              </>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              className="download-btn"
              onClick={handleDownload}
            >
              <i className="fas fa-download"></i> Download Filtered Results
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterRecordsPanel;