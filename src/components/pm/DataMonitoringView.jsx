// src/components/pm/DataMonitoringView.jsx
import React, { useState, useEffect } from 'react';
import { FaDownload, FaSearch, FaChevronLeft, FaChevronRight, FaEye } from 'react-icons/fa';
import pmService from '../../services/pmService';
import '../../assets/styles/pages/pm.css';

const DataMonitoringView = ({ zilaList }) => {
  const [loading, setLoading] = useState(false);
  
  // PDF Overview State
  const [pdfZila, setPdfZila] = useState('');
  const [pdfBlock, setPdfBlock] = useState('');
  const [blockList, setBlockList] = useState([]);
  const [pdfData, setPdfData] = useState([]);
  const [pdfSearch, setPdfSearch] = useState('');
  
  // District Family Count
  const [districtData, setDistrictData] = useState([]);
  const [districtSearch, setDistrictSearch] = useState('');
  
  // Block Family Count
  const [blockZila, setBlockZila] = useState('');
  const [blockFamilyData, setBlockFamilyData] = useState([]);
  const [blockFamilySearch, setBlockFamilySearch] = useState('');
  
  // Village Family Count
  const [villageZila, setVillageZila] = useState('');
  const [villageBlock, setVillageBlock] = useState('');
  const [villageBlockList, setVillageBlockList] = useState([]);
  const [villageFamilyData, setVillageFamilyData] = useState([]);
  const [villageFamilySearch, setVillageFamilySearch] = useState('');
  
  // Supervisor Family Count
  const [supervisorData, setSupervisorData] = useState([]);
  const [supervisorSearch, setSupervisorSearch] = useState('');
  
  // Supervisor Monthly Entries
  const [supMonthZila, setSupMonthZila] = useState('');
  const [supervisorList, setSupervisorList] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [supMonth, setSupMonth] = useState('');
  const [supMonthData, setSupMonthData] = useState([]);
  const [supMonthSearch, setSupMonthSearch] = useState('');

  const [currentPages, setCurrentPages] = useState({});
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDistrictFamilyCount();
  }, []);

  const fetchDistrictFamilyCount = async () => {
    setLoading(true);
    try {
      const data = await pmService.getDataMonitoringCards();
      const tableData = Object.keys(data).map((district, index) => ({
        srNo: index + 1,
        zila: district,
        count: data[district]
      }));
      setDistrictData(tableData);
    } catch (error) {
      console.error('Error fetching district data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfZilaChange = async (zila) => {
    setPdfZila(zila);
    setPdfBlock('');
    try {
      const blocks = await pmService.getBlocksByZila(zila);
      setBlockList(blocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handlePdfSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPages({ ...currentPages, pdf: 1 });
    
    try {
      const data = await pmService.getPDFOverviewTable(pdfZila, pdfBlock);
      setPdfData(data);
    } catch (error) {
      console.error('Error fetching PDF data:', error);
      alert('Failed to load PDF overview data');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockFamilySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPages({ ...currentPages, blockFamily: 1 });
    
    try {
      const data = await pmService.getBlockFamilyCount(blockZila);
      const tableData = Object.keys(data).map((block, index) => ({
        srNo: index + 1,
        zila: blockZila,
        block: block,
        count: data[block]
      }));
      setBlockFamilyData(tableData);
    } catch (error) {
      console.error('Error fetching block family count:', error);
      alert('Failed to load block family count');
    } finally {
      setLoading(false);
    }
  };

  const handleVillageZilaChange = async (zila) => {
    setVillageZila(zila);
    setVillageBlock('');
    try {
      const blocks = await pmService.getBlocksByZila(zila);
      setVillageBlockList(blocks);
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const handleVillageFamilySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPages({ ...currentPages, villageFamily: 1 });
    
    try {
      const data = await pmService.getVillageFamilyCount(villageZila, villageBlock);
      const tableData = Object.keys(data).map((village, index) => ({
        srNo: index + 1,
        zila: villageZila,
        block: villageBlock,
        gaon: village,
        count: data[village]
      }));
      setVillageFamilyData(tableData);
    } catch (error) {
      console.error('Error fetching village family count:', error);
      alert('Failed to load village family count');
    } finally {
      setLoading(false);
    }
  };

  const handleSupervisorFamilySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPages({ ...currentPages, supervisor: 1 });
    
    try {
      const data = await pmService.getSupervisorFamilyCounts();
      const tableData = data.map((obj, index) => ({
        srNo: index + 1,
        supName: obj['Supervisor Name'],
        dist: obj['District Allotted'],
        block: obj['Block(s) Allotted'],
        entries: obj['Total Entries for Today']
      }));
      setSupervisorData(tableData);
    } catch (error) {
      console.error('Error fetching supervisor counts:', error);
      alert('Failed to load supervisor family counts');
    } finally {
      setLoading(false);
    }
  };

  const handleSupMonthZilaChange = async (zila) => {
    setSupMonthZila(zila);
    try {
      const sups = await pmService.getSupervisorsByZila(zila);
      setSupervisorList(sups);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleSupMonthSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setCurrentPages({ ...currentPages, supMonth: 1 });
    
    try {
      const data = await pmService.getSupervisorMonthlyEntries(selectedSupervisor, supMonth);
      const tableData = data.map((row, index) => ({
        srNo: index + 1,
        ...row
      }));
      setSupMonthData(tableData);
    } catch (error) {
      console.error('Error fetching supervisor monthly data:', error);
      alert('Failed to load supervisor monthly entries');
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

  const getPaginatedData = (data, tableName) => {
    const page = currentPages[tableName] || 1;
    const startIndex = (page - 1) * itemsPerPage;
    return data.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = (dataLength) => {
    return Math.ceil(dataLength / itemsPerPage);
  };

  const handlePageChange = (tableName, newPage) => {
    setCurrentPages({ ...currentPages, [tableName]: newPage });
  };

  const renderTable = (data, searchTerm, setSearchTerm, tableName, headers, downloadHandler) => {
    const filteredData = getFilteredData(data, searchTerm);
    const paginatedData = getPaginatedData(filteredData, tableName);
    const totalPages = getTotalPages(filteredData.length);
    const currentPage = currentPages[tableName] || 1;

    return (
      <>
        <div className="pm-table-actions" style={{ marginBottom: '1rem', justifyContent: 'space-between' }}>
          <div className="pm-search-wrapper">
            <FaSearch className="pm-search-icon" />
            <input
              type="text"
              className="pm-search-input"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); handlePageChange(tableName, 1); }}
            />
          </div>
          {downloadHandler && (
            <button className="pm-download-btn" onClick={downloadHandler}>
              <FaDownload /> Download
            </button>
          )}
        </div>

        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                {headers.map((header, idx) => (
                  <th key={idx}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx}>
                    {Object.values(row).map((cell, cellIdx) => (
                      <td key={cellIdx}>{cell}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="pm-no-data">
                    No Data Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pm-pagination">
            <button className="pm-page-btn" onClick={() => handlePageChange(tableName, currentPage - 1)} disabled={currentPage === 1}>
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
                  <button key={i} className={`pm-page-number ${currentPage === pageNum ? 'active' : ''}`} onClick={() => handlePageChange(tableName, pageNum)}>
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button className="pm-page-btn" onClick={() => handlePageChange(tableName, currentPage + 1)} disabled={currentPage === totalPages}>
              <FaChevronRight />
            </button>
            <span className="pm-page-info">Page {currentPage} of {totalPages}</span>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="pm-container">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="pm-section-title">Data Monitoring</h2>
      </div>

      {/* PDF Overview */}
      <section className="pm-section">
        <h3 className="pm-table-title">
          PDF Overview Table
          {pdfData.length > 0 && <span className="pm-table-count">({pdfData.length})</span>}
        </h3>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handlePdfSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                ज़िला <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={pdfZila}
                onChange={(e) => handlePdfZilaChange(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Zila</option>
                {zilaList.map(zila => (
                  <option key={zila.zila} value={zila.zila}>{zila.zila}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>ब्लाक</label>
              <select 
                value={pdfBlock}
                onChange={(e) => setPdfBlock(e.target.value)}
                disabled={!pdfZila}
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Block</option>
                {blockList.map(block => (
                  <option key={block.block} value={block.block}>{block.block}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              डाटा पाएं
            </button>
          </form>
        </div>

        {pdfData.length > 0 && renderTable(
          pdfData.map((row, idx) => ({
            srNo: idx + 1,
            zila: row.zila,
            block: row.block,
            gaon: row.gaon,
            count: row.count,
            download: (
              <button 
                className="pm-download-btn"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                onClick={() => pmService.downloadPDFZip(row.zila, row.block, row.gaon)}
              >
                <FaDownload />
              </button>
            )
          })),
          pdfSearch,
          setPdfSearch,
          'pdf',
          ['S.No.', 'District', 'Block', 'Village', 'No. of PDFs', 'Download'],
          null
        )}
      </section>

      {/* District Wise Family Count */}
      <section className="pm-section">
        <h3 className="pm-table-title">
          District Wise Family Counts
          {districtData.length > 0 && <span className="pm-table-count">({districtData.length})</span>}
        </h3>

        {renderTable(
          districtData,
          districtSearch,
          setDistrictSearch,
          'district',
          ['S.No.', 'District', 'No. of Family Counts'],
          () => pmService.downloadDistrictFamilyCount()
        )}
      </section>

      {/* Block Wise Family Count */}
      <section className="pm-section">
        <h3 className="pm-table-title">
          Block Wise Family Counts
          {blockFamilyData.length > 0 && <span className="pm-table-count">({blockFamilyData.length})</span>}
        </h3>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleBlockFamilySubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                ज़िला <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={blockZila}
                onChange={(e) => setBlockZila(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Zila</option>
                {zilaList.map(zila => (
                  <option key={zila.zila} value={zila.zila}>{zila.zila}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              डाटा पाएं
            </button>
          </form>
        </div>

        {blockFamilyData.length > 0 && renderTable(
          blockFamilyData,
          blockFamilySearch,
          setBlockFamilySearch,
          'blockFamily',
          ['S.No.', 'District', 'Block', 'No. of Family Counts'],
          () => pmService.downloadBlockFamilyCount(blockZila)
        )}
      </section>

      {/* Village Wise Family Count */}
      <section className="pm-section">
        <h3 className="pm-table-title">
          Village Wise Family Counts
          {villageFamilyData.length > 0 && <span className="pm-table-count">({villageFamilyData.length})</span>}
        </h3>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleVillageFamilySubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                ज़िला <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={villageZila}
                onChange={(e) => handleVillageZilaChange(e.target.value)}
                required
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Zila</option>
                {zilaList.map(zila => (
                  <option key={zila.zila} value={zila.zila}>{zila.zila}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                ब्लाक <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={villageBlock}
                onChange={(e) => setVillageBlock(e.target.value)}
                required
                disabled={!villageZila}
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Block</option>
                {villageBlockList.map(block => (
                  <option key={block.block} value={block.block}>{block.block}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              डाटा पाएं
            </button>
          </form>
        </div>

        {villageFamilyData.length > 0 && renderTable(
          villageFamilyData,
          villageFamilySearch,
          setVillageFamilySearch,
          'villageFamily',
          ['S.No.', 'District', 'Block', 'Village', 'No. of Family Counts'],
          () => pmService.downloadVillageFamilyCount(villageZila, villageBlock)
        )}
      </section>

      {/* Supervisor Wise Family Count */}
      <section className="pm-section">
        <h3 className="pm-table-title">
          Supervisor Wise Family Count
          {supervisorData.length > 0 && <span className="pm-table-count">({supervisorData.length})</span>}
        </h3>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleSupervisorFamilySubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              डाटा पाएं
            </button>
          </form>
        </div>

        {supervisorData.length > 0 && renderTable(
          supervisorData,
          supervisorSearch,
          setSupervisorSearch,
          'supervisor',
          ['S.No.', 'Supervisor Name', 'District Allotted', 'Block(s) Allotted', 'Total Entries for Today'],
          () => pmService.downloadSupervisorFamilyCounts()
        )}
      </section>

      {/* Month-wise Supervisor Family Count */}
      <section className="pm-section">
        <h3 className="pm-table-title">
          Month-wise Supervisor Family Count
          {supMonthData.length > 0 && <span className="pm-table-count">({supMonthData.length})</span>}
        </h3>

        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', marginBottom: '1rem' }}>
          <form onSubmit={handleSupMonthSubmit} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                District <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={supMonthZila}
                onChange={(e) => handleSupMonthZilaChange(e.target.value)}
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
                Supervisor ID <span style={{ color: 'red' }}>*</span>
              </label>
              <select 
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                required
                disabled={!supMonthZila}
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              >
                <option value="">Select Supervisor</option>
                {supervisorList.map((sup, idx) => (
                  <option key={idx} value={sup}>{sup}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '200px' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>For Month</label>
              <input 
                type="month"
                value={supMonth}
                onChange={(e) => setSupMonth(e.target.value)}
                style={{ width: '100%', padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '8px' }}
              />
            </div>

            <button 
              type="submit"
              style={{ padding: '0.625rem 1.5rem', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
            >
              डाटा पाएं
            </button>
          </form>
        </div>

        {supMonthData.length > 0 && renderTable(
          supMonthData,
          supMonthSearch,
          setSupMonthSearch,
          'supMonth',
          ['Sr. No.', 'Supervisor Name', 'District', 'Date', 'Block-Villages Worked On', 'Entries'],
          () => pmService.downloadSupervisorMonthlyEntries(selectedSupervisor, supMonth)
        )}
      </section>
    </div>
  );
};

export default DataMonitoringView;