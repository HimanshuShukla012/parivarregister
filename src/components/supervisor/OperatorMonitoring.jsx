// src/components/supervisor/OperatorMonitoring.jsx
import React, { useState, useEffect } from "react";
import supervisorService from "../../services/supervisorService";

const OperatorMonitoring = ({ loginID, assignedDistrict, assignedBlocks }) => {
  const [cards, setCards] = useState({ totalOperatorCount: 0, liveOPCount: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [entriesData, setEntriesData] = useState([]);
  const [operators, setOperators] = useState([]);

  const [monthlyForm, setMonthlyForm] = useState({ month: "" });
  const [entriesForm, setEntriesForm] = useState({
    operator: "",
    start: "",
    end: "",
  });

  const [loading, setLoading] = useState(false); // ✅ loader state

  const today = new Date();
  const maxMonth = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}`;

  useEffect(() => {
    fetchCards();
    fetchOperators();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await supervisorService.adminOpMonitoringCards(loginID);
      setCards(data);
    } catch (error) {
      console.error("Error fetching cards:", error);
    }
  };

  const fetchOperators = async () => {
    try {
      const data = await supervisorService.getOperatorsByZila(
        assignedDistrict,
        loginID,
      );
      setOperators(data);
    } catch (error) {
      console.error("Error fetching operators:", error);
    }
  };

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ start loader
    try {
      const [year, month] = monthlyForm.month
        ? monthlyForm.month.split("-")
        : ["", ""];
      const data = await supervisorService.getOperatorFamilyCountsMonthly(
        assignedDistrict,
        loginID,
        month,
        year,
      );
      setMonthlyData(data);
    } catch (error) {
      console.error("Error fetching monthly data:", error);
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  const handleTodaySubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ start loader
    try {
      const data = await supervisorService.getOperatorFamilyCountsToday(
        assignedDistrict,
        loginID,
      );
      setTodayData(data);
    } catch (error) {
      console.error("Error fetching today data:", error);
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  const handleEntriesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // ✅ start loader
    try {
      const data = await supervisorService.getOperatorMonthlyEntriesSummary(
        entriesForm.operator,
        entriesForm.start,
        entriesForm.end,
      );
      setEntriesData(data);
    } catch (error) {
      console.error("Error fetching entries:", error);
    } finally {
      setLoading(false); // ✅ stop loader
    }
  };

  const getCellColor = (value) => {
    if (value < 40) return "#f87171";
    if (value > 70) return "#4ade80";
    return "#facc15";
  };

  /* ================= LOADER ================= */
  if (loading) {
    return (
      <div className="supervisor-page">
        <div id="loading-screen" style={{ display: "flex" }}>
          <div className="spinner"></div>
          <h2>&nbsp;&nbsp;&nbsp;Loading, please wait...</h2>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#f5f7fb", padding: "20px" }}>
      {/* Header */}
      <div
        style={{
          background: "#fff",
          padding: "16px 24px",
          borderRadius: "12px",
          fontSize: "22px",
          fontWeight: "600",
          boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
          marginBottom: "20px",
        }}
      >
        Operator Register
      </div>

      {/* Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div style={cardStyle("#6366f1")}>
          <div style={iconStyle}>
            <span
              style={{
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                padding: "10px 12px",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "1.75rem",
                marginRight: "10px",
              }}
            >
              <i class="fas fa-user-alt"></i>
            </span>
          </div>
          <div>
            <div style={labelStyle}>Total Operators</div>
            <div style={numberStyle}>{cards.totalOperatorCount}</div>
          </div>
        </div>

        <div style={cardStyle("#22c55e")}>
          <div style={iconStyle}>
            <span
              style={{
                background: "linear-gradient(135deg, #22c55e, #34d399)",
                padding: "10px 12px",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "1.75rem",
                marginRight: "10px",
              }}
            >
              <i class="far fa-check-circle"></i>
            </span>
          </div>
          <div>
            <div style={labelStyle}>Live Operators</div>
            <div style={numberStyle}>{cards.liveOPCount}</div>
          </div>
        </div>
      </div>

      {/* Monthly Section */}
      <div
        style={{
          background:
            "linear-gradient(90deg, rgb(111, 123, 247), rgb(123, 76, 160))",
          padding: "16px 24px",
          color: "rgb(255, 255, 255)",
          fontSize: "22px",
          fontWeight: 600,
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "16px",
        }}
      >
        <SectionTitle title="Operator Wise Family Count" />

        <form onSubmit={handleMonthlySubmit} style={formStyle}>
          <input
            type="month"
            max={maxMonth}
            value={monthlyForm.month}
            onChange={(e) => setMonthlyForm({ month: e.target.value })}
            style={inputStyle}
          />
          <div style={{ textAlign: "center" }}>
            <button style={buttonStyle}>Get Data</button>
          </div>
        </form>

        {monthlyData.length > 0 && (
          <TableWrapper>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Operator Name</th>
                  <th>District Allotted</th>
                  <th>Total Entries for the Month</th>
                  <th>Entries Compared to Target</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row["Operator Name"]}</td>
                    <td>{row["District Allotted"]}</td>
                    <td>{row["Total Entries for the Month"]}</td>
                    <td>{row["Entries Compared to Target (Short/Over)"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </div>

      {/* Daily Section */}
      <div
        style={{
          background:
            "linear-gradient(90deg, rgb(111, 123, 247), rgb(123, 76, 160))",
          padding: "16px 24px",
          color: "rgb(255, 255, 255)",
          fontSize: "22px",
          fontWeight: 600,
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "16px",
          marginTop: "20px",
        }}
      >
        <SectionTitle title="Daily Progress Table" />

        <form onSubmit={handleTodaySubmit} style={formStyle}>
          <button style={buttonStyle}>Get Data</button>
        </form>

        {todayData.length > 0 && (
          <TableWrapper>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Operator ID</th>
                  <th>Operator Name</th>
                  <th>Gaon Codes Worked On</th>
                  <th>Total Entries for Today</th>
                  <th>Entries Compared to Target</th>
                </tr>
              </thead>
              <tbody>
                {todayData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{row["Operator ID"]}</td>
                    <td>{row["Operator Name"]}</td>
                    <td>{row["Gaon Codes Worked On"]}</td>
                    <td
                      style={{
                        background: getCellColor(
                          row["Total Entries for Today"],
                        ),
                        color: "#000",
                      }}
                    >
                      {row["Total Entries for Today"]}
                    </td>
                    <td>{row["Entries Compared to Target (Short/Over)"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableWrapper>
        )}
      </div>
    </div>
  );
};

/* ---------- Styles ---------- */

const cardStyle = (color) => ({
  background: "#fff",
  borderRadius: "14px",
  padding: "16px",
  display: "flex",
  alignItems: "center",
  gap: "14px",
  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
  borderLeft: `6px solid ${color}`,
});

const iconStyle = { fontSize: "28px" };
const labelStyle = { fontSize: ".875rem", color: "#64748b", fontWeight: "600" };
const numberStyle = { fontSize: "2rem", fontWeight: "700" };

const formStyle = {
  marginBottom: "12px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "12px",
  background: "rgb(255, 255, 255)",
  padding: "20px",
  borderRadius: "16px",
  boxShadow: "rgba(0, 0, 0, 0.15) 0px 8px 25px",
  width: "100%",
  marginTop: "10px",
};

const inputStyle = {
  padding: "8px 12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  padding: "8px 16px",
  background: "#22c55e",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  width: "150px",
  textAlign: "center",
  display: "flex",
  justifyContent: "center",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const TableWrapper = ({ children }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: "12px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
      padding: "12px",
      marginBottom: "24px",
      overflowX: "auto",
    }}
  >
    {children}
  </div>
);

const SectionTitle = ({ title }) => (
  <h3 style={{ margin: "12px 0", fontWeight: "600" }}>{title}</h3>
);

export default OperatorMonitoring;
