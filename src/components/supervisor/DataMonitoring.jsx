// src/components/supervisor/DataMonitoring.jsx
import React, { useState, useEffect } from "react";
import supervisorService from "../../services/supervisorService";

const DataMonitoring = ({ assignedDistrict, assignedBlocks }) => {
  const [cards, setCards] = useState({});
  const [blockData, setBlockData] = useState([]);
  const [villageData, setVillageData] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [villageForm, setVillageForm] = useState({ block: "" });
  const [loading, setLoading] = useState(false); // ✅ loader state

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
      console.error("Error fetching cards:", error);
    }
  };

  const fetchBlocks = async () => {
    try {
      const data = await supervisorService.getBlockByZila(assignedDistrict);
      setBlocks(data);
    } catch (error) {
      console.error("Error fetching blocks:", error);
    }
  };

  const fetchBlockData = async () => {
    try {
      const data = await supervisorService.blockFamilyCount(assignedDistrict);
      const tableData = Object.entries(data).map(([block, count], idx) => ({
        srNo: idx + 1,
        zila: assignedDistrict,
        block,
        count,
      }));
      setBlockData(tableData);
    } catch (error) {
      console.error("Error fetching block data:", error);
    }
  };

  const handleVillageSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ start loader
    try {
      const data = await supervisorService.vilFamilyCount(
        assignedDistrict,
        villageForm.block,
      );
      const tableData = Object.entries(data).map(([gaon, count], idx) => ({
        srNo: idx + 1,
        zila: assignedDistrict,
        block: villageForm.block,
        gaon,
        count,
      }));
      setVillageData(tableData);
    } catch (error) {
      console.error("Error fetching village data:", error);
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  return (
    <div id="managementMonitoringSection" className="section">
      <div id="management-table-container">
        <div
          id="villageFamilyFormContainer"
          style={{
            background:
              "linear-gradient(90deg, rgb(111,123,247), rgb(123,76,160))",
            padding: "20px",
            borderRadius: "18px",
            marginBottom: "20px",
          }}
        >
          <div
            id="headingContainer"
            style={{
              color: "#fff",
              fontSize: "22px",
              fontWeight: "600",
              marginBottom: "14px",
            }}
          >
            <h4 id="villageFamilyHeading" style={{ margin: 0 }}>
              Village Wise Family Counts{" "}
              {villageData.length > 0 && `(${villageData.length})`}
            </h4>
          </div>

          <div
            id="formContainer"
            style={{
              background: "#fff",
              borderRadius: "14px",
              padding: "16px",
            }}
          >
            <form
              onSubmit={handleVillageSubmit}
              id="getVilForm"
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
                border: "none",
              }}
            >
              <label htmlFor="blockVilF" style={{ fontWeight: "500" }}>
                ब्लाक <span className="required">*</span>
              </label>

              <select
                name="blockVilF"
                id="blockVilF"
                value={villageForm.block}
                onChange={(e) => setVillageForm({ block: e.target.value })}
                required
                style={{
                  flex: 1,
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  height: "35px",
                  width: "300px",
                  margin: "0px",
                }}
              >
                <option value="">Select Block</option>
                {blocks.map((b) => (
                  <option key={b.block} value={b.block}>
                    {b.block}
                  </option>
                ))}
              </select>

              <input
                type="submit"
                value={loading ? "Loading..." : "Get Data"} // ✅ text change
                id="vBtn"
                disabled={loading} // ✅ disable while loading
                style={{
                  background: "rgb(34, 197, 94)",
                  color: "rgb(255, 255, 255)",
                  border: "none",
                  fontWeight: 600,
                  borderRadius: "8px",
                  height: "35px",
                  fontSize: "15px",
                  lineHeight: "35px",
                  cursor: loading ? "not-allowed" : "pointer",
                  width: "150px",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: loading ? 0.7 : 1,
                }}
              />

              {villageData.length > 0 && (
                <button
                  id="downloadVillageData"
                  className="download-btn2"
                  onClick={() =>
                    supervisorService.downloadVilFamilyCount(
                      assignedDistrict,
                      villageForm.block,
                    )
                  }
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "8px 18px",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                  }}
                >
                  Download
                </button>
              )}
            </form>
          </div>

          <div className="managementTable managementTableBorder ">
            <div
              className="tableContainer"
              id="newVillageTableContainer"
              style={{
                background: "rgb(255, 255, 255)",
                borderRadius: "16px",
                boxShadow: "rgba(0, 0, 0, 0.1) 0px 8px 25px",
                overflowX: "auto",
              }}
            >
              {villageData.length > 0 && (
                <table style={{ width: "100%" }}>
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
