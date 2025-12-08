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
  const [viewMode, setViewMode] = useState('pending'); // 'pending', 'verification', 'completed'
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [editFamilyData, setEditFamilyData] = useState(null);
  const [rejectData, setRejectData] = useState({ id: null, gaonCode: null });
  const [selectedGaonForVerification, setSelectedGaonForVerification] = useState(null);

  // Fetch user data and villages on mount
  useEffect(() => {
    initDashboard();
    
    // Ajax logout on window unload
    const handleUnload = () => {
      sachivService.ajaxLogout();
    };
    
    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, []);

  const initDashboard = async () => {
  setLoading(true);
  try {
    const loginID = localStorage.getItem('loginID');
    
    if (!loginID) {
      navigate('/');
      return;
    }
    
    // Fetch villages - backend will use session to determine sabha
    const villageData = await sachivService.getGaonBySabha();
    
    if (villageData && villageData.length > 0) {
      // Extract user info from the first village record
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
      
      // Auto-select first pending verification village
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
          initDashboard(); // Refresh data
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
          // Refresh the verification table
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

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('loginID');
      navigate('/');
    }
  };

  if (loading && !gaonData.length) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <h2>&nbsp;&nbsp;&nbsp;Loading, please wait...</h2>
      </div>
    );
  }

  return (
    <div className="sachiv-dashboard">
      <RegisterSidebar
        user={user}
        villages={villages}
        selectedVillage={selectedVillage}
        onVillageClick={handleVillageClick}
        onChangePassword={() => setShowPasswordModal(true)}
        onLogout={handleLogout}
      />

      <div className="content" id="content">
        <div className="main-content">
          <div className="header">
            <span className="title" id="registerTitle">
              {selectedVillage ? `${selectedVillage.gaon} रजिस्टर` : 'No Pending Register'}
            </span>
          </div>

          {viewMode !== 'verification' && (
            <div className="button">
              <button className="download-btn" onClick={handleDownloadRegister}>
                <i className="fas fa-download" style={{ marginRight: '10px' }}></i>
                डाउनलोड रजिस्टर
              </button>
              <button className="verified-btn" id="verified-btn" onClick={handleApproveRegister}>
                <i className="fas fa-check" style={{ marginRight: '10px' }}></i>
                सत्यापित करें
              </button>
            </div>
          )}
        </div>

        {selectedVillage?.aDORemark && viewMode !== 'verification' && (
          <div className="remark main-content">
            <h4>ADO's Remark: </h4>
            <span>{selectedVillage.aDORemark}</span>
          </div>
        )}

        {viewMode !== 'verification' && (
          <KeyLegend onScrollToError={() => {
            const errorCell = document.querySelector("td[style*='background-color: red']");
            if (errorCell) {
              errorCell.scrollIntoView({ behavior: "smooth", block: "center" });
              errorCell.style.border = "4px solid black";
            } else {
              alert("No errors found!");
            }
          }} />
        )}

        <div className="container">
          {viewMode === 'verification' ? (
            <VerificationTable
              data={gaonData}
              onApprove={handleApproveFamily}
              onReject={handleRejectFamily}
              onViewPDF={sachivService.viewPDFPage}
              villageIndex={villages.findIndex(v => v.gaonCode === selectedVillage?.gaonCode)}
            />
          ) : (
            <RegisterTable
              data={gaonData}
              status={viewMode}
              onEdit={handleEditFamily}
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
    </div>
  );
};

export default SachivDashboard;