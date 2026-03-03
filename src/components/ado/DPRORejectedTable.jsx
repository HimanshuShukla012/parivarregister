import React, { useEffect, useState } from "react";
import { fetchRejectedBlocks } from "../../services/adoService";

const DPRORejectedTable = ({ blockName }) => {
  const [rejectedData, setRejectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRejectedData = async () => {
    if (!blockName) return;

    setLoading(true);
    setError("");
    try {
      const data = await fetchRejectedBlocks(blockName);
      setRejectedData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Failed to load rejected blocks.");
      setRejectedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRejectedData();
  }, [blockName]);

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">DPRO Rejected Blocks</h2>
        <div className="section-line"></div>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>Block Name</th>
                <th>Rejected Families</th>
                <th>Rejected Sabhas</th>
                <th>Rejected Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "16px" }}>
                    Loading...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "#b00020", padding: "16px" }}>
                    {error}
                  </td>
                </tr>
              ) : rejectedData.length > 0 ? (
                rejectedData.map((row, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{row.block_name || "—"}</td>
                    <td>{row.rejected_families || 0}</td>
                    <td>{row.rejected_sabhas || 0}</td>
                    <td>{row.rejected_date || "—"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", padding: "16px" }}>
                    No rejected data found.
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

export default DPRORejectedTable;