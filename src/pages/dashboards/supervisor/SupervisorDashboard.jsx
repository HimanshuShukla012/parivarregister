// src/pages/dashboards/supervisor/SupervisorDashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supervisorService from '../../../services/supervisorService';
import SupervisorSidebar from '../../../components/supervisor/SupervisorSidebar';
import RegisterTable from '../../../components/supervisor/RegisterTable';
import EditFamilyModal from '../../../components/supervisor/EditFamilyModal';
import AddRecordModal from '../../../components/supervisor/AddRecordModal';
import ChangePasswordModal from '../../../components/supervisor/ChangePasswordModal';
import ManageOperatorModal from '../../../components/supervisor/ManageOperatorModal';
import AddOperatorModal from '../../../components/supervisor/AddOperatorModal';
import OperatorMonitoring from '../../../components/supervisor/OperatorMonitoring';
import DataMonitoring from '../../../components/supervisor/DataMonitoring';
import MessageModal from '../../../components/supervisor/MessageModal';
import '../../../assets/styles/pages/supervisor.css';

// Block mapping (same as original)
const BLOCKS = {
  'DESU121_01': ['Baskhari', 'Ram Nagar'],
  'DESU121_02': ['Bhiti'],
  'DESU121_03': ['Katehari'],
  'DESU129_01': ['Sidhaur'],
  'DESU129_02': ['Suratganj'],
  'DESU129_03': ['Harakh'],
  'DESU136_01': ['Mau'],
  'DESU136_02': ['Karwi'],
  'DESU136': ['Karwi', 'Mau'],
  'DESU136_04': ['Pahari'],
  'DESU140_01': ['Tarun'],
  'DESU140_03': ['Bikapur'],
  'DESU140_04': ['Masodha'],
  'DESU140_05': ['Haringatanganj', 'Maya Bazar', 'Rudauli', 'Milkipur', 'Pura Bazar'],
  'DESU149_01': ['Kurara'],
  'DESU151_01': ['Dakore', 'Kuthaund'],
  'DESU151_02': ['Nadigaon'],
  'DESU153_01': ['Chirgaon'],
  'DESU153_02': ['Moth'],
  'DESU153_03': ['Babina'],
  'DESU153_04': ['Gursarai'],
  'DESU153_05': ['Bamaur'],
  'DESU161_01': ['Talbehat', 'Birdha'],
  'DESU161_02': ['Bar'],
  'DESU161_03': ['Mehroni', 'Mandawara'],
  'DESU161_04': ['Jakhaura'],
  'DESU165_01': [],
  'DESU165_02': ['Jaitpur'],
  'DESU165_03': ['Charkhari', 'Kabrai', 'Panwari'],
  'DESU185_01': ['Akhand Nagar'],
  'DESU185_02': ['Dhanpatganj', 'Bhadaiya', 'Kurebhar'],
  'DESU185_03': ['Baldirai'],
  'DESU185_04': ['P.P.Kamaicha', 'Lambhua'],
  'DESU640_01': ['Shahgarh'],
  'DESU640_02': ['Jamo', 'Bhadar', 'Tiloi', 'Musafir Khana', 'Jagdishpur', 'Shukul Bazar'],
  'DESU640_05': ['Bhetua', 'Sangrampur', 'Amethi']
};

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    loginID: localStorage.getItem('loginID') || '',
    name: '',
    districts: []
  });

  const [viewMode, setViewMode] = useState('pending'); // pending, completed, rejected, dashboard, operators, vilNotStarted
  const [gaonData, setGaonData] = useState([]);
  const [selectedGaon, setSelectedGaon] = useState(null);
  const [rejectedHasFlicker, setRejectedHasFlicker] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showManageOperators, setShowManageOperators] = useState(false);
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [messageModal, setMessageModal] = useState({ show: false, message: '', color: '' });

  const [editFamilyData, setEditFamilyData] = useState(null);
  const [addRecordFamilyData, setAddRecordFamilyData] = useState(null);

  // Form states
  const [pendingForm, setPendingForm] = useState({
    block: '',
    gaonCode: '',
    status: '1'
  });
  const [completedForm, setCompletedForm] = useState({ block: '' });
  const [rejectedForm, setRejectedForm] = useState({ gaonCode: '' });

  // Villages lists
  const [villages, setVillages] = useState([]);
  const [rejectedVillages, setRejectedVillages] = useState([]);

  const loginID = user.loginID;
  const assignedDistrict = user.districts[0] || '';
  const assignedBlocks = BLOCKS[loginID] || [];

  useEffect(() => {
    initDashboard();

    const handleUnload = () => {
      supervisorService.ajaxLogout();
    };

    window.addEventListener('unload', handleUnload);
    return () => window.removeEventListener('unload', handleUnload);
  }, []);

  const initDashboard = async () => {
    const loginID = localStorage.getItem('loginID');
    if (!loginID) {
      navigate('/');
      return;
    }

    // In real implementation, fetch user details from backend
    // For now, using localStorage/hardcoded data
    setUser({
      loginID,
      name: 'Supervisor Name', // This should come from backend
      districts: ['District Name'] // This should come from backend
    });

    // Fetch rejected villages to check for flicker
    try {
      const rejectedList = await supervisorService.getRejectedGaonList(assignedBlocks.join(','));
      setRejectedVillages(rejectedList);
      setRejectedHasFlicker(rejectedList.length > 0);
    } catch (error) {
      console.error('Error fetching rejected villages:', error);
    }
  };

  const handlePendingRegisterClick = () => {
    setViewMode('pending');
    setGaonData([]);
  };

  const handleCompletedRegisterClick = () => {
    setViewMode('completed');
    setGaonData([]);
  };

  const handleRejectedFamiliesClick = () => {
    setViewMode('rejected');
    setGaonData([]);
  };

  const handleVilPendingClick = async () => {
    setViewMode('vilNotStarted');
    setLoading(true);
    try {
      const data = await supervisorService.vilNotStartedTblDESU(
        assignedDistrict,
        assignedBlocks.join(',')
      );
      setGaonData(data);
    } catch (error) {
      console.error('Error fetching villages pending for entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardClick = () => {
    setViewMode('dashboard');
    setGaonData([]);
  };

  const handleManageOperatorsClick = () => {
    setShowManageOperators(true);
  };

  const handlePendingFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await supervisorService.getPendingVilSupervisor(
        pendingForm.gaonCode,
        loginID,
        pendingForm.status
      );
      setGaonData(data);
      setSelectedGaon(pendingForm.gaonCode);
    } catch (error) {
      console.error('Error fetching pending register:', error);
      alert('Failed to load village data');
    } finally {
      setLoading(false);
    }
  };

  const handleCompletedFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await supervisorService.getCompletedVilSupervisor(
        loginID,
        assignedDistrict,
        completedForm.block
      );
      setGaonData(data);
    } catch (error) {
      console.error('Error fetching completed registers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectedFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await supervisorService.getRejectedFamilies(rejectedForm.gaonCode);
      // Sort data by family groups (same as original)
      data.sort((a, b) => {
        const keyA = (a.houseNumberNum || '') + (a.houseNumberText || '') + (a.familyHeadName || '');
        const keyB = (b.houseNumberNum || '') + (b.houseNumberText || '') + (b.familyHeadName || '');
        if (keyA === keyB) {
          return parseInt(a.serialNo) - parseInt(b.serialNo);
        }
        return keyA.localeCompare(keyB);
      });
      setGaonData(data);
      setSelectedGaon(rejectedForm.gaonCode);
    } catch (error) {
      console.error('Error fetching rejected families:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditFamily = (familyData) => {
    setEditFamilyData(familyData);
    setShowEditModal(true);
  };

  const handleAddRecord = (familyData) => {
    setAddRecordFamilyData(familyData);
    setShowAddRecordModal(true);
  };

  const handleDeleteRecord = async (id, gaonCode, serialNo) => {
    const text = serialNo === 1 
      ? "Do you want to delete this whole family record?" 
      : "Do you want to delete this record?";
    
    if (!window.confirm(text)) return;

    try {
      const result = viewMode === 'rejected'
        ? await supervisorService.deleteRejectedRecord(id, gaonCode)
        : await supervisorService.deleteRecord(id, gaonCode);

      if (result.success) {
        showMessage('Record deleted successfully!', 'green');
        // Refresh data
        if (viewMode === 'pending') {
          handlePendingFormSubmit({ preventDefault: () => {} });
        } else if (viewMode === 'rejected') {
          handleRejectedFormSubmit({ preventDefault: () => {} });
        }
      } else {
        showMessage('Error: ' + result.error, 'red');
      }
    } catch (error) {
      console.error('Error deleting record:', error);
      showMessage('An unexpected error occurred. Please try again.', 'red');
    }
  };

  const handleApproveFamily = async (id, gaonCode) => {
    if (!window.confirm('Do you want to approve this Family?')) return;

    try {
      const result = viewMode === 'rejected'
        ? await supervisorService.approveRejectedFamilySup(id, gaonCode)
        : await supervisorService.approveFamilySup(id, gaonCode);

      if (result.success) {
        showMessage('Family approved successfully!', 'green');
        // Refresh data
        if (viewMode === 'pending') {
          handlePendingFormSubmit({ preventDefault: () => {} });
        } else if (viewMode === 'rejected') {
          handleRejectedFormSubmit({ preventDefault: () => {} });
        }
      } else {
        showMessage(result.error || 'Failed to approve family', 'red');
      }
    } catch (error) {
      console.error('Error approving family:', error);
      showMessage('Failed to approve family', 'red');
    }
  };

  const handleVerifyRegister = async () => {
    const tableName = 'g' + selectedGaon;
    try {
      const result = await supervisorService.supervisorApprove(tableName);
      if (result.status === 'success') {
        showMessage('सत्यापित हो गया !', 'green');
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showMessage(`Error: ${result.error}!`, 'red');
      }
    } catch (error) {
      console.error('Error verifying register:', error);
      showMessage('Failed to verify register', 'red');
    }
  };

  const handleDeleteDuplicates = async () => {
    if (!selectedGaon) return;
    
    try {
      const result = await supervisorService.deleteDuplicate(selectedGaon);
      if (result.error) {
        showMessage(`Error: ${result.error}!`, 'red');
      } else {
        showMessage(`${result.deleted_count} Duplicate Entries Found & Deleted!`, 'green');
        handlePendingFormSubmit({ preventDefault: () => {} });
      }
    } catch (error) {
      console.error('Error deleting duplicates:', error);
      showMessage('Failed to delete duplicates', 'red');
    }
  };

  const handleDownloadRegister = () => {
    if (!selectedGaon) return;
    supervisorService.downloadPendingGaonExcel(selectedGaon);
  };

  const handleDownloadCompleted = (gaonCode) => {
    supervisorService.downloadGaonSupervisor(gaonCode);
  };

  const showMessage = (message, color) => {
    setMessageModal({ show: true, message, color });
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
      <div id="loading-screen" style={{ display: 'flex' }}>
        <div className="spinner"></div>
        <h2>&nbsp;&nbsp;&nbsp;Loading, please wait...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <SupervisorSidebar
        user={user}
        onPendingRegisterClick={handlePendingRegisterClick}
        onCompletedRegisterClick={handleCompletedRegisterClick}
        onRejectedFamiliesClick={handleRejectedFamiliesClick}
        onVilPendingClick={handleVilPendingClick}
        onDashboardClick={handleDashboardClick}
        onManageOperatorsClick={handleManageOperatorsClick}
        onChangePassword={() => setShowPasswordModal(true)}
        onLogout={handleLogout}
        rejectedHasFlicker={rejectedHasFlicker}
      />

      <div className="content" id="content">
        <div className="main-content">
          <div className="header" style={{ width: '66%' }}>
            <span className="title" id="registerTitle">
              {viewMode === 'pending' && 'Pending Register'}
              {viewMode === 'completed' && 'Completed Registers'}
              {viewMode === 'rejected' && 'Rejected Families'}
              {viewMode === 'vilNotStarted' && 'Villages Pending for Entry'}
              {viewMode === 'dashboard' && 'Dashboard'}
              {viewMode === 'operators' && 'Manage Operator'}
            </span>
          </div>

          <div className="button">
            {viewMode === 'pending' && selectedGaon && (
              <>
                <button className="download-btn" onClick={handleDownloadRegister}>
                  <i className="fas fa-download" style={{ marginRight: '10px' }}></i>
                  डाउनलोड रजिस्टर
                </button>
                <button className="download-btn" onClick={handleDeleteDuplicates}>
                  <i className="fas fa-trash" style={{ marginRight: '10px' }}></i>
                  डुप्लीकेट हटाये
                </button>
                <button 
                  className="verified-btn" 
                  onClick={handleVerifyRegister}
                  disabled={gaonData.some(row => row.status !== 'Approved')}
                >
                  <i className="fas fa-check" style={{ marginRight: '10px' }}></i>
                  सत्यापित करें
                </button>
              </>
            )}
            {viewMode === 'vilNotStarted' && gaonData.length > 0 && (
              <button 
                className="download-btn" 
                onClick={() => supervisorService.downloadVilNotStartedTblDESU(assignedDistrict, assignedBlocks.join(','))}
              >
                <i className="fas fa-download" style={{ marginRight: '10px' }}></i>
                Download
              </button>
            )}
          </div>
        </div>

        {/* Forms Section */}
        <div className="container main-container">
          {viewMode === 'pending' && (
            <form onSubmit={handlePendingFormSubmit} id="getPendingRegForm">
              <label htmlFor="pendingBlock">ब्लाक <span className="required">*</span></label>
              <select 
                name="pendingBlock" 
                id="pendingBlock"
                value={pendingForm.block}
                onChange={async (e) => {
                  setPendingForm({ ...pendingForm, block: e.target.value });
                  try {
                    const villages = await supervisorService.getGaonListWithCodeByBlock(e.target.value);
                    setVillages(villages);
                  } catch (error) {
                    console.error('Error fetching villages:', error);
                  }
                }}
                required
              >
                <option value="">Select Block</option>
                {assignedBlocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>

              <label htmlFor="gaonCode">गांव <span className="required">*</span></label>
              <select 
                name="gaonCode" 
                id="gaonCode"
                value={pendingForm.gaonCode}
                onChange={(e) => setPendingForm({ ...pendingForm, gaonCode: e.target.value })}
                required
              >
                <option value="">Select Gaon</option>
                {villages.map(v => (
                  <option key={v.gaonCode} value={v.gaonCode}>
                    {v.gaonCode} - {v.gaon}
                  </option>
                ))}
              </select>

              <label htmlFor="status">Approval status <span className="required">*</span></label>
              <select 
                name="status" 
                id="status"
                value={pendingForm.status}
                onChange={(e) => setPendingForm({ ...pendingForm, status: e.target.value })}
              >
                <option value="1">All</option>
                <option value="3">Remaining for approval</option>
                <option value="2">Approved</option>
              </select>

              <button type="submit">गांव का डाटा पाएं</button>
            </form>
          )}

          {viewMode === 'completed' && (
            <form onSubmit={handleCompletedFormSubmit} id="getCompletedRegForm">
              <label htmlFor="compBlock">ब्लाक</label>
              <select 
                name="compBlock" 
                id="compBlock"
                value={completedForm.block}
                onChange={(e) => setCompletedForm({ block: e.target.value })}
              >
                <option value="">Select Block</option>
                {assignedBlocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
              <button type="submit">डाटा पाएं</button>
            </form>
          )}

          {viewMode === 'rejected' && (
            <form onSubmit={handleRejectedFormSubmit} id="getRejectedFamForm">
              <label htmlFor="rejectedGC">गांव <span className="required">*</span></label>
              <select 
                name="rejectedGC" 
                id="rejectedGC"
                value={rejectedForm.gaonCode}
                onChange={(e) => setRejectedForm({ gaonCode: e.target.value })}
                required
              >
                <option value="">Select Gaon</option>
                {rejectedVillages.map(v => (
                  <option key={v.gaonCode} value={v.gaonCode}>
                    {v.gaonCode} - {v.gaon}
                  </option>
                ))}
              </select>
              <button type="submit">गांव का डाटा पाएं</button>
            </form>
          )}
        </div>

        {/* Main Content Area */}
        {viewMode === 'dashboard' && (
          <>
            <OperatorMonitoring 
              loginID={loginID}
              assignedDistrict={assignedDistrict}
              assignedBlocks={assignedBlocks}
            />
            <DataMonitoring 
              assignedDistrict={assignedDistrict}
              assignedBlocks={assignedBlocks}
            />
          </>
        )}

        {(viewMode === 'pending' || viewMode === 'rejected') && gaonData.length > 0 && (
          <div className="table-container">
            <RegisterTable
              data={gaonData}
              viewMode={viewMode}
              onEdit={handleEditFamily}
              onAdd={handleAddRecord}
              onDelete={handleDeleteRecord}
              onApprove={handleApproveFamily}
              onViewPDF={supervisorService.viewPDFPage}
            />
          </div>
        )}

        {viewMode === 'completed' && gaonData.length > 0 && (
          <div className="table-container">
            <table className="main-table" id="gaonTable">
              <thead>
                <tr>
                  <th>जनपद</th>
                  <th>तहसील</th>
                  <th>ब्लाक</th>
                  <th>गाँव सभा</th>
                  <th>गाँव</th>
                  <th>गाँव कोड</th>
                  <th>डाउनलोड रजिस्टर</th>
                </tr>
              </thead>
              <tbody>
                {gaonData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.zila}</td>
                    <td>{row.tehsil}</td>
                    <td>{row.block}</td>
                    <td>{row.sabha}</td>
                    <td>{row.gaon}</td>
                    <td>{row.gaonCode}</td>
                    <td>
                      <button 
                        className="editBtn" 
                        onClick={() => handleDownloadCompleted(row.gaonCode)}
                      >
                        डाउनलोड रजिस्टर
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === 'vilNotStarted' && gaonData.length > 0 && (
          <div className="table-container">
            <table className="main-table">
              <thead>
                <tr>
                  <th>जनपद</th>
                  <th>ब्लाक</th>
                  <th>गाँव</th>
                  <th>गाँव कोड</th>
                </tr>
              </thead>
              <tbody>
                {gaonData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.district}</td>
                    <td>{row.block}</td>
                    <td>{row.village}</td>
                    <td>{row.villageCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditFamilyModal
          familyData={editFamilyData}
          viewMode={viewMode}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            if (viewMode === 'pending') {
              handlePendingFormSubmit({ preventDefault: () => {} });
            } else if (viewMode === 'rejected') {
              handleRejectedFormSubmit({ preventDefault: () => {} });
            }
          }}
        />
      )}

      {showAddRecordModal && (
        <AddRecordModal
          familyData={addRecordFamilyData}
          viewMode={viewMode}
          onClose={() => setShowAddRecordModal(false)}
          onSave={() => {
            setShowAddRecordModal(false);
            if (viewMode === 'pending') {
              handlePendingFormSubmit({ preventDefault: () => {} });
            } else if (viewMode === 'rejected') {
              handleRejectedFormSubmit({ preventDefault: () => {} });
            }
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          loginID={loginID}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showManageOperators && (
        <ManageOperatorModal
          loginID={loginID}
          onClose={() => setShowManageOperators(false)}
          onAddOperator={() => {
            setShowManageOperators(false);
            setShowAddOperator(true);
          }}
        />
      )}

      {showAddOperator && (
        <AddOperatorModal
          supervisorID={loginID}
          onClose={() => setShowAddOperator(false)}
          onSuccess={() => {
            setShowAddOperator(false);
            setShowManageOperators(true);
          }}
        />
      )}

      {messageModal.show && (
        <MessageModal
          message={messageModal.message}
          color={messageModal.color}
          onClose={() => setMessageModal({ show: false, message: '', color: '' })}
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;