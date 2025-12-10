// src/components/pm/SachivValidationView.jsx
import React, { useState, useEffect } from 'react';
import {
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaUserPlus,
  FaExclamationTriangle
} from 'react-icons/fa';
import sachivService from '../../services/sachivService';
import '../../assets/styles/pages/pm.css';

const SachivValidationView = () => {
  const [loading, setLoading] = useState(true);
  const [rejectedGaonList, setRejectedGaonList] = useState([]);
  const [supervisorList, setSupervisorList] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedGaon, setSelectedGaon] = useState(null);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [assigning, setAssigning] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchRejectedGaonList();
    fetchSupervisors();
  }, []);

  const fetchRejectedGaonList = async () => {
    setLoading(true);
    try {
      const data = await sachivService.getRejectedGaonList();
      setRejectedGaonList(data);
    } catch (error) {
      console.error('Error fetching rejected gaon list:', error);
      alert('Failed to load rejected villages');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupervisors = async () => {
    try {
      const data = await sachivService.getSupervisorsDesu();
      setSupervisorList(data);
    } catch (error) {
      console.error('Error fetching supervisors:', error);
    }
  };

  const handleAssignClick = (gaon) => {
    setSelectedGaon(gaon);
    setSelectedSupervisor('');
    setShowAssignModal(true);
  };

  const handleCloseModal = () => {
    setShowAssignModal(false);
    setSelectedGaon(null);
    setSelectedSupervisor('');
  };

  const handleAssignSupervisor = async () => {
    if (!selectedSupervisor) {
      alert('Please select a supervisor');
      return;
    }

    setAssigning(true);
    try {
      await sachivService.assignSupervisorToRejectedFamilies(
        selectedGaon.gaon_code,
        selectedSupervisor
      );
      alert('Supervisor assigned successfully!');
      handleCloseModal();
      fetchRejectedGaonList();
    } catch (error) {
      console.error('Error assigning supervisor:', error);
      alert('Failed to assign supervisor. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const getFilteredData = () => {
    if (!searchTerm) return rejectedGaonList;
    return rejectedGaonList.filter(row =>
      Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  };

  const getPaginatedData = () => {
    const filteredData = getFilteredData();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredData().length / itemsPerPage);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{ width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p style={{ marginTop: '20px', fontSize: '16px', color: '#666' }}>Loading validation data...</p>
      </div>
    );
  }

  const paginatedData = getPaginatedData();
  const totalPages = getTotalPages();
  const filteredCount = getFilteredData().length;

  return (
    <div className="pm-container">
      {/* Header Section */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 className="pm-section-title">Sachiv Validation - Rollback Villages</h2>
        <p style={{ color: '#6b7280', marginTop: '0.5rem' }}>
          Assign supervisors to rejected/rollback villages for re-verification
        </p>
      </div>

      {/* Stats Card */}
      <div style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', color: 'white', boxShadow: '0 4px 6px rgba(239, 68, 68, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              {rejectedGaonList.length}
            </h3>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>Total Rejected Villages</p>
          </div>
          <FaExclamationTriangle style={{ fontSize: '3rem', opacity: 0.3 }} />
        </div>
      </div>

      {/* Table Section */}
      <section className="pm-section">
        <div className="pm-table-header">
          <h3 className="pm-table-title">
            Rejected Villages
            {filteredCount > 0 && (
              <span className="pm-table-count">({filteredCount})</span>
            )}
          </h3>
        </div>

        {/* Search Bar */}
        <div className="pm-table-actions" style={{ marginBottom: '1rem' }}>
          <div className="pm-search-wrapper">
            <FaSearch className="pm-search-icon" />
            <input
              type="text"
              className="pm-search-input"
              placeholder="Search by district, block, village..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="pm-table-wrapper">
          <table className="pm-table">
            <thead>
              <tr>
                <th>Sr. No.</th>
                <th>District</th>
                <th>Block</th>
                <th>Village Code</th>
                <th>Village Name</th>
                <th>Rejected Families</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                    <td>{row.zila || row.district || '-'}</td>
                    <td>{row.block || '-'}</td>
                    <td>{row.gaon_code || '-'}</td>
                    <td>{row.gaon || row.village_name || '-'}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#ef4444' }}>
                      {row.rejected_count || row.total_rejected || 0}
                    </td>
                    <td>
                      <button
                        onClick={() => handleAssignClick(row)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.5rem 1rem',
                          background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '500',
                          margin: '0 auto',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 6px rgba(59, 130, 246, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <FaUserPlus /> Assign Supervisor
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="pm-no-data">
                    {searchTerm ? 'No matching villages found' : 'No Rejected Villages Found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pm-pagination">
            <button
              className="pm-page-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
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
                  <button
                    key={i}
                    className={`pm-page-number ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              className="pm-page-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FaChevronRight />
            </button>
            <span className="pm-page-info">Page {currentPage} of {totalPages}</span>
          </div>
        )}
      </section>

      {/* Assign Supervisor Modal */}
      {showAssignModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '2rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937' }}>
                Assign Supervisor
              </h3>
              <button
                onClick={handleCloseModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  color: '#6b7280',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Village Details */}
            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Village: </span>
                <span style={{ color: '#6b7280' }}>{selectedGaon?.gaon || selectedGaon?.village_name}</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>Block: </span>
                <span style={{ color: '#6b7280' }}>{selectedGaon?.block}</span>
              </div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: '600', color: '#374151' }}>District: </span>
                <span style={{ color: '#6b7280' }}>{selectedGaon?.zila || selectedGaon?.district}</span>
              </div>
              <div>
                <span style={{ fontWeight: '600', color: '#374151' }}>Rejected Families: </span>
                <span style={{ color: '#ef4444', fontWeight: '600' }}>
                  {selectedGaon?.rejected_count || selectedGaon?.total_rejected || 0}
                </span>
              </div>
            </div>

            {/* Supervisor Selection */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#374151' }}>
                Select Supervisor <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  color: '#374151'
                }}
              >
                <option value="">-- Select Supervisor --</option>
                {supervisorList.map((sup, idx) => (
                  <option key={idx} value={sup.supervisor_id || sup.id}>
                    {sup.supervisor_id || sup.id} - {sup.name || sup.supervisor_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseModal}
                disabled={assigning}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: assigning ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSupervisor}
                disabled={assigning || !selectedSupervisor}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: assigning || !selectedSupervisor ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: assigning || !selectedSupervisor ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default SachivValidationView;