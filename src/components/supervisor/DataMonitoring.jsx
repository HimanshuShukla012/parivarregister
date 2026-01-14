// src/components/supervisor/DataMonitoring.jsx
import React, { useState, useEffect } from 'react';
import supervisorService from '../../services/supervisorService';

const DataMonitoring = ({ assignedDistrict, assignedBlocks }) => {
  const [cards, setCards] = useState({});
  const [blockData, setBlockData] = useState([]);
  const [villageData, setVillageData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villageForm, setVillageForm] = useState({ block: '' });

  useEffect(() => {
    fetchCards();
    fetchBlocks();
    fetchBlockData();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await supervisorService.adminDataMonitoringCards();
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchBlocks = async () => {
    try {
      const data = await supervisorService.getBlockByZila(assignedDistrict);
      setBlocks(data);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const fetchBlockData = async () => {
    try {
      const data = await supervisorService.blockFamilyCount(assignedDistrict);
      const tableData = Object.entries(data).map(([block, count], idx) => ({
        srNo: idx + 1,
        zila: assignedDistrict,
        block,
        count
      }));
      setBlockData(tableData);
    } catch (error) {
      console.error('Error fetching block data:', error);
    }
  };

  const handleVillageSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await supervisorService.vilFamilyCount(assignedDistrict, villageForm.block);
      const tableData = Object.entries(data).map(([gaon, count], idx) => ({
        srNo: idx + 1,
        zila: assignedDistrict,
        block: villageForm.block,
        gaon,
        count
      }));
      setVillageData(tableData);
    } catch (error) {
      console.error('Error fetching village data:', error);
    }
  };

  return (
    <div id="managementMonitoringSection" className="section">
      <div className="left-aligned-container">
        <div className="panel">
          <h1>Data Overview</h1>
          
          <div className="grid-container">
            <div className="stat-card single-stat-card" id="noOfFamily">
              <div className="icon-wrapper">
                <i className="fa fa-users"></i>
              </div>
              <div className="content-wrapper">
                <span className="number">{cards[assignedDistrict] || 0}</span>
                <span className="CountText" style={{ color: 'white' }}>
                  Total Family Counts in
                </span>
                <div className="label">{assignedDistrict}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Block Wise Family Counts */}
      <div id="management-table-container">
        <div id="blockWiseFormContainer">
          <div id="headingContainer" className="headingContainer">
            <h4 className="backgroundRed1" id="blockWiseHeading">
              Block Wise Family Counts {blockData.length > 0 && `(${blockData.length})`}
            </h4>
            {blockData.length > 0 && (
              <button
                id="downloadBWData"
                className="download-btn2"
                onClick={() => supervisorService.downloadBlockFamilyCount(assignedDistrict)}
              >
                Download
              </button>
            )}
          </div>
          <div className="managementTable managementTableBorder">
            <div className="tableContainer" id="newBWTableContainer">
              {blockData.length > 0 && (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>District</th>
                      <th>Block</th>
                      <th>No. of Family Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blockData.map((row) => (
                      <tr key={row.srNo}>
                        <td>{row.srNo}</td>
                        <td>{row.zila}</td>
                        <td>{row.block}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        {/* Village Wise Family Counts */}
        <div id="villageFamilyFormContainer">
          <div id="headingContainer" className="headingContainer">
            <h4 className="backgroundRed1" id="villageFamilyHeading">
              Village Wise Family Counts {villageData.length > 0 && `(${villageData.length})`}
            </h4>
            {villageData.length > 0 && (
              <button
                id="downloadVillageData"
                className="download-btn2"
                onClick={() => supervisorService.downloadVilFamilyCount(assignedDistrict, villageForm.block)}
              >
                Download
              </button>
            )}
          </div>
          <div id="formContainer">
            <form onSubmit={handleVillageSubmit} id="getVilForm">
              <label htmlFor="blockVilF">ब्लाक <span className="required">*</span></label>
              <select
                name="blockVilF"
                id="blockVilF"
                value={villageForm.block}
                onChange={(e) => setVillageForm({ block: e.target.value })}
                required
              >
                <option value="">Select Block</option>
                {blocks.map((b) => (
                  <option key={b.block} value={b.block}>
                    {b.block}
                  </option>
                ))}
              </select>
              <input type="submit" value="डाटा पाएं" id="vBtn" />
            </form>
          </div>
          <div className="managementTable managementTableBorder">
            <div className="tableContainer" id="newVillageTableContainer">
              {villageData.length > 0 && (
                <table style={{ width: '100%' }}>
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>District</th>
                      <th>Block</th>
                      <th>Village</th>
                      <th>No. of Family Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {villageData.map((row) => (
                      <tr key={row.srNo}>
                        <td>{row.srNo}</td>
                        <td>{row.zila}</td>
                        <td>{row.block}</td>
                        <td>{row.gaon}</td>
                        <td>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataMonitoring;