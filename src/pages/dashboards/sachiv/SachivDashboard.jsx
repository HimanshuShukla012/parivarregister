// src/pages/dashboards/sachiv/SachivDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

import sachivService from '../../../services/sachivService';
import RegisterSidebar from '../../../components/sachiv/RegisterSidebar';
import RegisterTable from '../../../components/sachiv/RegisterTable';
import VerificationTable from '../../../components/sachiv/VerificationTable';
import EditFamilyModal from '../../../components/sachiv/EditFamilyModal';
import RejectRemarkModal from '../../../components/sachiv/RejectRemarkModal';
import ChangePasswordModal from '../../../components/sachiv/ChangePasswordModal';
import KeyLegend from '../../../components/sachiv/KeyLegend';
import PDFFamilyViewer from '../../../components/sachiv/PDFFamilyViewer';
import '../../../assets/styles/pages/sachiv.css';

const SachivDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    loginID: localStorage.getItem('loginID') || '',
    sabha: '',
    block: '',
    tehsil: '',
    zila: ''
  });

  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [gaonData, setGaonData] = useState([]);
  const [viewMode, setViewMode] = useState('pending');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editFamilyData, setEditFamilyData] = useState(null);
  const [rejectData, setRejectData] = useState({ id: null, gaonCode: null });
  const [selectedGaonForVerification, setSelectedGaonForVerification] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showPDFViewer, setShowPDFViewer] = useState(false);
  const [pdfViewerData, setPdfViewerData] = useState({ url: null, familyData: null });


  // Calculate statistics
  const [stats, setStats] = useState({
    totalFamilies: 0,
    totalMembers: 0,
    approvedFamilies: 0,
    approvedMembers: 0
  });
  useEffect(() => {
    initDashboard();
    
    const handleUnload = () => {
      sachivService.ajaxLogout();
    };
    
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, []);

  // Update stats when gaonData changes
  useEffect(() => {
    if (gaonData && gaonData.length > 0) {
      // Total families and members (including both approved and pending)
      const totalFamilies = gaonData.filter(row => String(row.serialNo) === '1').length;
      const totalMembers = gaonData.length;
      
      // Approved families and members only
      const approvedFamilies = gaonData.filter(row => String(row.serialNo) === '1' && row.status === 'Approved').length;
      const approvedMembers = gaonData.filter(row => row.status === 'Approved').length;
      
      setStats({
        totalFamilies,
        totalMembers,
        approvedFamilies,
        approvedMembers
      });
    } else {
      setStats({ totalFamilies: 0, totalMembers: 0, approvedFamilies: 0, approvedMembers: 0 });
    }
  }, [gaonData]);

  const initDashboard = async () => {
    setLoading(true);
    try {
      const loginID = localStorage.getItem('loginID');
      
      if (!loginID) {
        navigate('/');
        return;
      }
      
      const villageData = await sachivService.getGaonBySabha();
      
      if (villageData && villageData.length > 0) {
        const firstVillage = villageData[0];
        const userInfo = {
          loginID: loginID,
          zila: firstVillage.zila,
          tehsil: firstVillage.tehsil,
          block: firstVillage.block,
          sabha: firstVillage.sabha
        };
        
        setUser(userInfo);
        setVillages(villageData);
        
        const firstPendingVerification = villageData.find(
          v => v.approvedBySachiv === 'N' && !v.aDORemark
        );
        if (firstPendingVerification) {
          handleVillageClick(firstPendingVerification, 'verification');
        }
      } else {
        alert('No villages found for your Sabha. Please contact administrator.');
      }
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      alert('Failed to load dashboard data. Please check your login.');
    } finally {
      setLoading(false);
    }
  };

  const handleVillageClick = async (village, mode = 'pending') => {
    setLoading(true);
    setSelectedVillage(village);
    setViewMode(mode);
    
    try {
      const data = await sachivService.getGaonData(village.gaonCode);
      setGaonData(data);
      
      if (mode === 'verification') {
        setSelectedGaonForVerification(village);
      }
    } catch (error) {
      console.error('Error fetching gaon data:', error);
      alert('Failed to load village data');
    } finally {
      setLoading(false);
    }
  };

  const handleEditFamily = (familyData) => {
    setEditFamilyData(familyData);
    setShowEditModal(true);
  };

  const handleApproveRegister = async () => {
    if (!selectedVillage) return;
    
    if (window.confirm('क्या आप इस रजिस्टर को सत्यापित करना चाहते हैं?')) {
      try {
        const result = await sachivService.sachivApprove(`g${selectedVillage.gaonCode}`);
        if (result.status === 'success') {
          alert('सत्यापित हो गया!');
          initDashboard();
        }
      } catch (error) {
        console.error('Error approving register:', error);
        alert('Approval failed');
      }
    }
  };

  const handleDownloadRegister = () => {
    if (!selectedVillage) return;
    window.location.href = `/downloadGaonSachiv/?gaonCode=${selectedVillage.gaonCode}`;
  };

  const handleApproveFamily = async (id, gaonCode, villageIndex) => {
    if (window.confirm('Do you want to approve this Family?')) {
      try {
        const result = await sachivService.approveFamilySachiv(id, gaonCode);
        if (result.success) {
          alert('Family approved successfully!');
          if (selectedGaonForVerification) {
            handleVillageClick(selectedGaonForVerification, 'verification');
          }
        }
      } catch (error) {
        console.error('Error approving family:', error);
        alert('Failed to approve family');
      }
    }
  };

  const handleRejectFamily = (id, gaonCode) => {
    setRejectData({ id, gaonCode });
    setShowRejectModal(true);
  };


  const handleViewPDF = (pdfNo, fromPage, toPage, gaonCode, familyData) => {
    // CRITICAL FIX: No trailing slash before query params!
    let url = `/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;
    
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;
    
    console.log('🔍 PDF URL:', url);
    
    setPdfViewerData({ url, familyData });
    setShowPDFViewer(true);
  };


  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('loginID');
      navigate('/');
    }
  };

  if (loading && !gaonData.length) {
    return (
      <div className="sachiv-loading-screen">
        <div className="sachiv-spinner"></div>
        <h2>&nbsp;&nbsp;&nbsp;Loading, please wait...</h2>
      </div>
    );
  }

  return (
    <div className="sachiv-dashboard-wrapper">
      <RegisterSidebar
        user={user}
        villages={villages}
        selectedVillage={selectedVillage}
        onVillageClick={handleVillageClick}
        onChangePassword={() => setShowPasswordModal(true)}
        onLogout={handleLogout}
      />

      <div className="sachiv-content" id="content">
        <div className="sachiv-main-content">
          <div className="sachiv-header">
            <span className="sachiv-title" id="registerTitle">
              {selectedVillage ? `${selectedVillage.gaon} रजिस्टर` : 'No Pending Register'}
            </span>
          </div>

          {/* Show tabs only in verification mode */}
          {selectedVillage?.approvedBySachiv === 'N' && !selectedVillage?.aDORemark && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              marginTop: '15px',
              borderBottom: '2px solid #e5e7eb',
              paddingBottom: '10px'
            }}>
              <button
                onClick={() => setViewMode('verification')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: viewMode === 'verification' ? '#667eea' : 'transparent',
                  color: viewMode === 'verification' ? 'white' : '#4b5563',
                  border: 'none',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
              >
                <i className="fas fa-clock" style={{ marginRight: '8px' }}></i>
                लंबित परिवार
              </button>
              <button
                onClick={() => setViewMode('approved')}
                style={{
                  padding: '10px 20px',
                  backgroundColor: viewMode === 'approved' ? '#667eea' : 'transparent',
                  color: viewMode === 'approved' ? 'white' : '#4b5563',
                  border: 'none',
                  borderRadius: '6px 6px 0 0',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.95rem',
                  transition: 'all 0.3s'
                }}
              >
                <i className="fas fa-check-circle" style={{ marginRight: '8px' }}></i>
                स्वीकृत परिवार
              </button>
            </div>
          )}

          {(viewMode === 'verification' || viewMode === 'approved') && (
  <div className="sachiv-button-group">
    <button className="sachiv-download-btn" onClick={handleDownloadRegister}>
      <i className="fas fa-download" style={{ marginRight: '10px' }}></i>
      डाउनलोड रजिस्टर
    </button>
    {viewMode === 'approved' && (
      <button 
        className="sachiv-verified-btn" 
        id="verified-btn" 
        onClick={handleApproveRegister}
        disabled={gaonData.filter(row => !row.status).length > 0}
        style={{
          opacity: gaonData.filter(row => !row.status).length > 0 ? 0.5 : 1,
          cursor: gaonData.filter(row => !row.status).length > 0 ? 'not-allowed' : 'pointer'
        }}
      >
        <i className="fas fa-check" style={{ marginRight: '10px' }}></i>
        सत्यापित करें
      </button>
    )}
  </div>
)}
        </div>

        {selectedVillage?.aDORemark && viewMode !== 'verification' && (
          <div className="sachiv-remark sachiv-main-content">
            <h4>ADO's Remark: </h4>
            <span>{selectedVillage.aDORemark}</span>
          </div>
        )}

        {/* Statistics Cards */}
        {selectedVillage && (
          <div className="sachiv-stats-container">
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">कुल परिवार</div>
                <div className="sachiv-stat-value">{stats.totalFamilies}</div>
              </div>
            </div>
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon sachiv-stat-icon-members">
                <i className="fas fa-users"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">कुल सदस्य</div>
                <div className="sachiv-stat-value">{stats.totalMembers}</div>
              </div>
            </div>
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon" style={{ backgroundColor: '#10b981' }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">सत्यापित परिवार</div>
                <div className="sachiv-stat-value">{stats.approvedFamilies}</div>
              </div>
            </div>
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon sachiv-stat-icon-members" style={{ backgroundColor: '#10b981' }}>
                <i className="fas fa-user-check"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">सत्यापित सदस्य</div>
                <div className="sachiv-stat-value">{stats.approvedMembers}</div>
              </div>
            </div>
          </div>
        )}

        {(viewMode === 'approved' || (viewMode !== 'verification' && viewMode !== 'completed')) && (
          <KeyLegend 
            onScrollToError={() => {
              const errorCell = document.querySelector("td[style*='background-color: red']");
              if (errorCell) {
                errorCell.scrollIntoView({ behavior: "smooth", block: "center" });
                errorCell.style.border = "4px solid black";
              } else {
                alert("No errors found!");
              }
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        )}

        <div className="sachiv-container">
          {viewMode === 'verification' ? (
            <VerificationTable
              data={gaonData}
              onApprove={handleApproveFamily}
              onReject={handleRejectFamily}
              onViewPDF={handleViewPDF}
              onEdit={handleEditFamily}
              villageIndex={villages.findIndex(v => v.gaonCode === selectedVillage?.gaonCode)}
            />
          ) : viewMode === 'approved' ? (
            <RegisterTable
              data={gaonData}
              status="approved"
              onEdit={handleEditFamily}
              searchTerm={searchTerm}
            />
          ) : (
            <RegisterTable
              data={gaonData}
              status={viewMode}
              onEdit={handleEditFamily}
              searchTerm={searchTerm}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditFamilyModal
          familyData={editFamilyData}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            if (selectedVillage) {
              handleVillageClick(selectedVillage, viewMode);
            }
          }}
        />
      )}

      {showRejectModal && (
        <RejectRemarkModal
          rejectData={rejectData}
          onClose={() => setShowRejectModal(false)}
          onSave={() => {
            setShowRejectModal(false);
            if (selectedGaonForVerification) {
              handleVillageClick(selectedGaonForVerification, 'verification');
            }
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          loginID={user.loginID}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {/* PDF VIEWER MODAL */}
      {showPDFViewer && (
        <PDFFamilyViewer
          isOpen={showPDFViewer}
          onClose={() => setShowPDFViewer(false)}
          pdfUrl={pdfViewerData.url}
          familyData={pdfViewerData.familyData}
          onApprove={handleApproveFamily}
          onReject={(id, gaonCode, remark) => {
            sachivService.rejectFamilySachiv(id, gaonCode, remark).then(() => {
              alert('परिवार अस्वीकृत कर दिया गया!');
              setShowPDFViewer(false);
              if (selectedGaonForVerification) {
                handleVillageClick(selectedGaonForVerification, 'verification');
              }
            });
          }}
          onEdit={(editedFamilyData) => {
  // Use the same format as EditFamilyModal
  const updatedFamilyData = editedFamilyData.map(member => ({
    ...member,
    houseNumberNum: editedFamilyData[0].houseNumberNum,
    houseNumberText: editedFamilyData[0].houseNumberText,
    familyHeadName: editedFamilyData[0].familyHeadName
  }));

  const payload = {
    familyData: [{},...updatedFamilyData],
    gaonCode: updatedFamilyData[0].gaonCode,
    houseNumberNum: editedFamilyData[0].houseNumberNum,
    houseNumberText: editedFamilyData[0].houseNumberText,
    familyHeadName: editedFamilyData[0].familyHeadName
  };

  sachivService.updateAndInsert(payload).then(() => {
    alert('परिवार सफलतापूर्वक अपडेट हो गया!');
    setShowPDFViewer(false);
    if (selectedGaonForVerification) {
      handleVillageClick(selectedGaonForVerification, 'verification');
    }
  }).catch(error => {
    console.error('Error updating family:', error);
    alert('अपडेट करने में त्रुटि हुई');
  });
}}
          isApproved={pdfViewerData.familyData?.[0]?.status === 'Approved'}
        />
      )}
    </div>
  );
};

export default SachivDashboard;