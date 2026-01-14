// src/components/supervisor/OperatorMonitoring.jsx
import React, { useState, useEffect } from 'react';
import supervisorService from '../../services/supervisorService';

const OperatorMonitoring = ({ loginID, assignedDistrict, assignedBlocks }) => {
  const [cards, setCards] = useState({ totalOperatorCount: 0, liveOPCount: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [todayData, setTodayData] = useState([]);
  const [entriesData, setEntriesData] = useState([]);
  const [operators, setOperators] = useState([]);
  
  const [monthlyForm, setMonthlyForm] = useState({ month: '' });
  const [entriesForm, setEntriesForm] = useState({ operator: '', start: '', end: '' });

  const today = new Date();
  const maxMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;

  useEffect(() => {
    fetchCards();
    fetchOperators();
  }, []);

  const fetchCards = async () => {
    try {
      const data = await supervisorService.adminOpMonitoringCards(loginID);
      setCards(data);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const fetchOperators = async () => {
    try {
      const data = await supervisorService.getOperatorsByZila(assignedDistrict, loginID);
      setOperators(data);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    try {
      const [year, month] = monthlyForm.month ? monthlyForm.month.split('-') : ['', ''];
      const data = await supervisorService.getOperatorFamilyCountsMonthly(
        assignedDistrict,
        loginID,
        month,
        year
      );
      setMonthlyData(data);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
    }
  };

  const handleTodaySubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await supervisorService.getOperatorFamilyCountsToday(assignedDistrict, loginID);
      setTodayData(data);
    } catch (error) {
      console.error('Error fetching today data:', error);
    }
  };

  const handleEntriesSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await supervisorService.getOperatorMonthlyEntriesSummary(
        entriesForm.operator,
        entriesForm.start,
        entriesForm.end
      );
      setEntriesData(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const getCellColor = (value) => {
    if (value < 40) return 'red';
    if (value > 70) return 'green';
    return 'yellow';
  };

  return (
    <div id="operatorMonitoringSection" className="section">
      <div className="container">
        <div className="panel">
          <h1>Operator Overview</h1>
          <div className="Counts operatorCount">
            <div></div>
            <div className="card" id="numberofOperator">
              <div className="icon-container">
                <i className="fa fa-folder-open"></i>
              </div>
              <div className="CountContent">
                <p className="CountNumber">{cards.totalOperatorCount}</p>
                <span className="CountText" style={{ color: 'white' }}>Total No. of Operators</span>
              </div>
            </div>
            <div className="card tooltip" id="liveOPCount">
              <div className="icon-container">
                <i className="fa fa-arrow-up"></i>
              </div>
              <div className="CountContent">
                <span className="CountNumber">{cards.liveOPCount}</span>
                <div className="CountText">Total Live Operators</div>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Family Count */}
        <h4 className="backgroundRed1">
          Operator Wise Family Count {monthlyData.length > 0 && `(${monthlyData.length})`}
          {monthlyData.length > 0 && (
            <button
              className="downloadButton"
              onClick={() => {
                const [year, month] = monthlyForm.month.split('-');
                supervisorService.downloadOperatorFamilyCountsMonthly(assignedDistrict, loginID, month, year);
              }}
            >
              Download
            </button>
          )}
        </h4>
        <div id="formContainer" style={{ marginBottom: 0 }}>
          <form onSubmit={handleMonthlySubmit}>
            <label htmlFor="monthOPT1">For Month</label>
            <input
              type="month"
              id="monthOPT1"
              max={maxMonth}
              value={monthlyForm.month}
              onChange={(e) => setMonthlyForm({ month: e.target.value })}
            />
            <input type="submit" value="Get Data" />
          </form>
        </div>
        <div className="scanningTable1 scanningTableBorder">
          <div className="tableOverflow">
            <table>
              {monthlyData.length > 0 && (
                <>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Operator Name</th>
                      <th>District Allotted</th>
                      <th>Total Entries for the Month</th>
                      <th>Entries Compared to Target (Short/Over)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthlyData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row['Operator Name']}</td>
                        <td>{row['District Allotted']}</td>
                        <td>{row['Total Entries for the Month']}</td>
                        <td>{row['Entries Compared to Target (Short/Over)']}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>

        {/* Daily Progress */}
        <h4 className="backgroundRed1">
          Daily Progress Table {todayData.length > 0 && `(${todayData.length})`}
          {todayData.length > 0 && (
            <button
              className="downloadButton"
              onClick={() => supervisorService.downloadOperatorFamilyCountsToday(assignedDistrict, loginID)}
            >
              Download
            </button>
          )}
        </h4>
        <div id="formContainer" style={{ marginBottom: 0 }}>
          <form onSubmit={handleTodaySubmit}>
            <input type="submit" value="Get Data" />
          </form>
        </div>
        <div className="scanningTable1 scanningTableBorder">
          <div className="tableOverflow">
            <table>
              {todayData.length > 0 && (
                <>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Operator ID</th>
                      <th>Operator Name</th>
                      <th>Gaon Codes Worked On</th>
                      <th>Total Entries for Today</th>
                      <th>Entries Compared to Target (Short/Over)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row['Operator ID']}</td>
                        <td>{row['Operator Name']}</td>
                        <td>{row['Gaon Codes Worked On']}</td>
                        <td style={{ backgroundColor: getCellColor(row['Total Entries for Today']) }}>
                          {row['Total Entries for Today']}
                        </td>
                        <td>{row['Entries Compared to Target (Short/Over)']}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>

        {/* Monthly Entries Summary */}
        <h4 className="backgroundRed1">
          Monthly Progress Table {entriesData.length > 0 && `(${entriesData.length})`}
          {entriesData.length > 0 && (
            <button
              className="downloadButton"
              onClick={() => supervisorService.downloadOperatorMonthlyEntriesSummary(
                entriesForm.operator,
                entriesForm.start,
                entriesForm.end
              )}
            >
              Download
            </button>
          )}
        </h4>
        <div id="formContainer" style={{ marginBottom: 0 }}>
          <form onSubmit={handleEntriesSubmit}>
            <label htmlFor="operatorOPT3">Operator ID: <span className="required">*</span></label>
            <select
              id="operatorOPT3"
              value={entriesForm.operator}
              onChange={(e) => setEntriesForm(prev => ({ ...prev, operator: e.target.value }))}
              required
            >
              <option value="" disabled>Select Operator</option>
              {operators.map(([id, name]) => (
                <option key={id} value={id}>{id} - {name}</option>
              ))}
            </select>
            <label htmlFor="startOPT3">From Date <span className="required">*</span></label>
            <input
              type="date"
              id="startOPT3"
              value={entriesForm.start}
              onChange={(e) => setEntriesForm(prev => ({ ...prev, start: e.target.value }))}
              required
            />
            <label htmlFor="endOPT3">Till Date <span className="required">*</span></label>
            <input
              type="date"
              id="endOPT3"
              value={entriesForm.end}
              onChange={(e) => setEntriesForm(prev => ({ ...prev, end: e.target.value }))}
              required
            />
            <input type="submit" value="Get Data" />
          </form>
        </div>
        <div className="scanningTable1 scanningTableBorder">
          <div className="tableOverflow">
            <table>
              {entriesData.length > 0 && (
                <>
                  <thead>
                    <tr>
                      <th>Sr. No.</th>
                      <th>Operator Name</th>
                      <th>District</th>
                      <th>Date</th>
                      <th>Block</th>
                      <th>Village</th>
                      <th>Entries</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entriesData.map((row, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>{row['Operator Name']}</td>
                        <td>{row['District']}</td>
                        <td>{row['Date']}</td>
                        <td>{row['Block']}</td>
                        <td>{row['Village']}</td>
                        <td>{row['Entries']}</td>
                      </tr>
                    ))}
                  </tbody>
                </>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorMonitoring;