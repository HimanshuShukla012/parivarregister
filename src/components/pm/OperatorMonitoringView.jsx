// src/components/pm/OperatorMonitoringView.jsx
import React, { useState, useEffect } from 'react';
import { 
  FaFolderOpen, 
  FaArrowUp,
  FaDownload,
  FaSearch,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import pmService from '../../services/pmService';
import '../../assets/styles/pages/pm.css';

const OperatorMonitoringView = ({ zilaList }) => {
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState(null);
  
  // Monthly Progress State
  const [monthlyZila, setMonthlyZila] = useState('');
  const [monthlyMonth, setMonthlyMonth] = useState('');
  const [monthlyData, setMonthlyData] = useState([]);
  const [monthlySearch, setMonthlySearch] = useState('');
  
  // Daily Progress State
  const [dailyZila, setDailyZila] = useState('');
  const [dailyData, setDailyData] = useState([]);
  const [dailySearch, setDailySearch] = useState('');
  
  // Operator Entries State
  const [entriesZila, setEntriesZila] = useState('');
  const [operatorList, setOperatorList] = useState([]);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [entriesData, setEntriesData] = useState([]);
  const [entriesSearch, setEntriesSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const [activeTable, setActiveTable] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    fetchOperatorCards();
    setMaxMonth();
  }, []);

  const fetchOperatorCards = async () => {
    setLoading(true);
    try {
      const data = await pmService.getOperatorMonitoringCards();
      setCards(data);
    } catch (error) {
      console.error('Error fetching operator cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const setMaxMonth = () => {
    const today = new Date();
    const maxMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    document.getElementById('monthOPT1')?.setAttribute('max', maxMonth);
  };

  const handleMonthlySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveTable('monthly');
    setCurrentPage(1);
    
    try {
      let url = `/get_operator_family_counts_monthly/?zila=${monthlyZila}`;
      if (monthlyMonth) {
        const [year, month] = monthlyMonth.split('-');
        url += `&month=${month}&year=${year}`;
      }
      
      const response = await pmService.getOperatorFamilyCountsMonthly(monthlyZila, monthlyMonth);
      setMonthlyData(response);
    } catch (error) {
      console.error('Error fetching monthly data:', error);
      alert('Failed to load monthly data');
    } finally {
      setLoading(false);
    }
  };

  const handleDailySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveTable('daily');
    setCurrentPage(1);
    
    try {
      const response = await pmService.getOperatorFamilyCountsToday(dailyZila);
      setDailyData(response);
    } catch (error) {
      console.error('Error fetching daily data:', error);
      alert('Failed to load daily data');
    } finally {
      setLoading(false);
    }
  };

  const handleEntriesZilaChange = async (zila) => {
    setEntriesZila(zila);
    try {
      const response = await pmService.getOperatorsByZila(zila);
      setOperatorList(response);
    } catch (error) {
      console.error('Error fetching operators:', error);
    }
  };

  const handleEntriesSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setActiveTable('entries');
    setCurrentPage(1);
    
    try {
      const response = await pmService.getOperatorMonthlyEntries(
        selectedOperator, 
        startDate, 
        endDate
      );
      setEntriesData(response);
    } catch (error) {
      console.error('Error fetching entries data:', error);
      alert('Failed to load entries data');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredData = (data, searchTerm) => {
    if (!searchTerm) return data;
    return data.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const handleDownload = (type, params = {}) => {
    switch(type) {
      case 'monthly':
        pmService.downloadOperatorMonthly(params.zila, params.month);
        break;
      case 'daily':
        pmService.downloadOperatorDaily(params.zila);
        break;
      case 'entries':
        pmService.downloadOperatorEntries(params.operator, params.start, params.end);
        break;
    }
  };

  if (loading && !cards) {
    return (
      <div className="pm-loading">
        <div className="spinner-border" />
        <p className="mt-3">Loading operator data...</p>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total No. of Operators',
      value: cards?.totalOperatorCount || 0,
      icon: <FaFolderOpen />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
      title: 'Total Live Operators',
      value: cards?.liveOPCount || 0,
      icon: <FaArrowUp />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    }
  ];

  // Get current table data
  let currentTableData = [];
  let currentSearchTerm = '';
  
  if (activeTable === 'monthly') {
    currentTableData = getFilteredData(monthlyData, monthlySearch);
    currentSearchTerm = monthlySearch;
  } else if (activeTable === 'daily') {
    currentTableData = getFilteredData(dailyData, dailySearch);
    currentSearchTerm = dailySearch;
  } else if (activeTable === 'entries') {
    currentTableData = getFilteredData(entriesData, entriesSearch);
    currentSearchTerm = entriesSearch;
  }

  const paginatedData = getPaginatedData(currentTableData);
  const totalPages = getTotalPages(currentTableData.length);

  return (
    <div className="pm-container">
      {/* Overview Cards */}
      <section className="pm-section">
        <div className="pm-section-header">
          <h2 className="pm-section-title">Operator Overview</h2>
        </div>
        
        <div className="pm-cards-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {overviewCards.map((card, index) => (
            <div 
              key={index} 
              className="pm-stat-card"
              style={{ background: card.gradient }}
            >
              <div className="pm-card-icon-wrapper">
                {card.icon}
              </div>
              <div className="pm-card-body">
                <h3 className="pm-card-value">{card.value.toLocaleString()}</h3>
                <p className="pm-card-title">{card.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Operator Wise Family Count (Monthly) */}
      <section className="pm-section">
        <div className="pm-table-header">
          <h3 className="pm-table-title">
            Operator Wise Family Count
            {monthlyData.length > 0 && <span className="pm-table-count">({monthlyData.length})</span>}
          </h3>
          {monthlyData.length > 0 && (
            <button 
              className="pm-download-btn"
              onClick={() => handleDownload('monthly', { zila: monthlyZila, month: monthlyMonth })}
            >
              <FaDownload /> Download
            </button>
          )}
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleMonthlySubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                District <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={monthlyZila}
                onChange={(e) => setMonthlyZila(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select District</option>
                {zilaList.map(zila => (
                  <option key={zila.zila} value={zila.zila}>{zila.zila}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>For Month</label>
              <input 
                type="month"
                id="monthOPT1"
                value={monthlyMonth}
                onChange={(e) => setMonthlyMonth(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>
            
            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Get Data
            </button>
          </form>
        </div>

        {activeTable === 'monthly' && monthlyData.length > 0 && (
          <>
            <div className="pm-table-actions" style={{ marginBottom: '1rem' }}>
              <div className="pm-search-wrapper">
                <FaSearch className="pm-search-icon" />
                <input
                  type="text"
                  className="pm-search-input"
                  placeholder="Search..."
                  value={monthlySearch}
                  onChange={(e) => { setMonthlySearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="pm-table-wrapper">
              <table className="pm-table">
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
                  {paginatedData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{row['Operator Name']}</td>
                      <td>{row['District Allotted']}</td>
                      <td>{row['Total Entries for the Month']}</td>
                      <td>{row['Entries Compared to Target (Short/Over)']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pm-pagination">
                <button className="pm-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <FaChevronLeft />
                </button>
                <div className="pm-page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button key={i} className={`pm-page-number ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button className="pm-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <FaChevronRight />
                </button>
                <span className="pm-page-info">Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </section>

      {/* Daily Progress Table */}
      <section className="pm-section">
        <div className="pm-table-header">
          <h3 className="pm-table-title">
            Daily Progress Table
            {dailyData.length > 0 && <span className="pm-table-count">({dailyData.length})</span>}
          </h3>
          {dailyData.length > 0 && (
            <button 
              className="pm-download-btn"
              onClick={() => handleDownload('daily', { zila: dailyZila })}
            >
              <FaDownload /> Download
            </button>
          )}
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleDailySubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                District <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={dailyZila}
                onChange={(e) => setDailyZila(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select District</option>
                {zilaList.map(zila => (
                  <option key={zila.zila} value={zila.zila}>{zila.zila}</option>
                ))}
              </select>
            </div>
            
            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Get Data
            </button>
          </form>
        </div>

        {activeTable === 'daily' && dailyData.length > 0 && (
          <>
            <div className="pm-table-actions" style={{ marginBottom: '1rem' }}>
              <div className="pm-search-wrapper">
                <FaSearch className="pm-search-icon" />
                <input
                  type="text"
                  className="pm-search-input"
                  placeholder="Search..."
                  value={dailySearch}
                  onChange={(e) => { setDailySearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="pm-table-wrapper">
              <table className="pm-table">
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
                  {paginatedData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{row['Operator ID']}</td>
                      <td>{row['Operator Name']}</td>
                      <td>{row['Gaon Codes Worked On']}</td>
                      <td style={{ 
                        backgroundColor: row['Total Entries for Today'] < 40 ? '#fee2e2' : 
                                       row['Total Entries for Today'] > 70 ? '#dcfce7' : '#fef3c7'
                      }}>
                        {row['Total Entries for Today']}
                      </td>
                      <td>{row['Entries Compared to Target (Short/Over)']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pm-pagination">
                <button className="pm-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <FaChevronLeft />
                </button>
                <div className="pm-page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button key={i} className={`pm-page-number ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button className="pm-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <FaChevronRight />
                </button>
                <span className="pm-page-info">Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </section>

      {/* Monthly Progress Table */}
      <section className="pm-section">
        <div className="pm-table-header">
          <h3 className="pm-table-title">
            Monthly Progress Table
            {entriesData.length > 0 && <span className="pm-table-count">({entriesData.length})</span>}
          </h3>
          {entriesData.length > 0 && (
            <button 
              className="pm-download-btn"
              onClick={() => handleDownload('entries', { operator: selectedOperator, start: startDate, end: endDate })}
            >
              <FaDownload /> Download
            </button>
          )}
        </div>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleEntriesSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                District <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={entriesZila}
                onChange={(e) => handleEntriesZilaChange(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select District</option>
                {zilaList.map(zila => (
                  <option key={zila.zila} value={zila.zila}>{zila.zila}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Operator ID <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={selectedOperator}
                onChange={(e) => setSelectedOperator(e.target.value)}
                required
                disabled={!entriesZila}
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Operator</option>
                {operatorList.map((op, idx) => (
                  <option key={idx} value={op[0]}>{op[0]} - {op[1]}</option>
                ))}
              </select>
            </div>
            
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                From Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>

            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                Till Date <span style={{ color: 'red' }}>*</span>
              </label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>
            
            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              Get Data
            </button>
          </form>
        </div>

        {activeTable === 'entries' && entriesData.length > 0 && (
          <>
            <div className="pm-table-actions" style={{ marginBottom: '1rem' }}>
              <div className="pm-search-wrapper">
                <FaSearch className="pm-search-icon" />
                <input
                  type="text"
                  className="pm-search-input"
                  placeholder="Search..."
                  value={entriesSearch}
                  onChange={(e) => { setEntriesSearch(e.target.value); setCurrentPage(1); }}
                />
              </div>
            </div>

            <div className="pm-table-wrapper">
              <table className="pm-table">
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
                  {paginatedData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                      <td>{row['Operator Name']}</td>
                      <td>{row['District']}</td>
                      <td>{row['Date']}</td>
                      <td>{row['Block']}</td>
                      <td>{row['Village']}</td>
                      <td>{row['Entries']}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pm-pagination">
                <button className="pm-page-btn" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                  <FaChevronLeft />
                </button>
                <div className="pm-page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = i + 1;
                    if (totalPages > 5) {
                      if (currentPage <= 3) pageNum = i + 1;
                      else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                      else pageNum = currentPage - 2 + i;
                    }
                    return (
                      <button key={i} className={`pm-page-number ${currentPage === pageNum ? 'active' : ''}`} onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button className="pm-page-btn" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                  <FaChevronRight />
                </button>
                <span className="pm-page-info">Page {currentPage} of {totalPages}</span>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default OperatorMonitoringView;