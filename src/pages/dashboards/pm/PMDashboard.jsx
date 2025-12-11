// src/pages/dashboards/pm/PMDashboard.jsx
import { useState, useEffect } from 'react';
import hqService from '../../../services/hqService';
import DistrictOverviewCards from '../../../components/hq/DistrictOverviewCards';
import DistrictDetailsView from '../../../components/hq/DistrictDetailsView';
import DistrictReportTable from '../../../components/hq/DistrictReportTable';
import VerificationStatusCards from '../../../components/hq/VerificationStatusCards';
import VerifyDataEntryForm from '../../../components/hq/VerifyDataEntryForm';
import GaonDataTable from '../../../components/hq/GaonDataTable';
import BlockReportView from '../../../components/hq/BlockReportView';
import ProjectMonitoringView from '../../../components/pm/ProjectMonitoringView';
import OperatorMonitoringView from '../../../components/pm/OperatorMonitoringView';
import DataMonitoringView from '../../../components/pm/DataMonitoringView';
import SachivValidationView from '../../../components/pm/SachivValidationView';
import '../../../assets/styles/pages/pm.css';

const PMDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('project-monitoring');
  const [zilaList, setZilaList] = useState([]);
  const [districtOverview, setDistrictOverview] = useState([]);
  const [districtReport, setDistrictReport] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtDetails, setDistrictDetails] = useState(null);
  const [gaonData, setGaonData] = useState([]);
  const [showGaonData, setShowGaonData] = useState(false);
  const [selectedDistrictForBlocks, setSelectedDistrictForBlocks] = useState(null);
  const [blockData, setBlockData] = useState([]);
  const [showBlockReport, setShowBlockReport] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dashboardDropdownOpen, setDashboardDropdownOpen] = useState(false);

  const collapseMenu = () => {
    setSidebarCollapsed(true);
  };

  const openMenu = () => {
    setSidebarCollapsed(false);
  };

  const toggleDashboardDropdown = () => {
    setDashboardDropdownOpen(!dashboardDropdownOpen);
  };

  const setActive = (view) => {
    setActiveView(view);
    setDashboardDropdownOpen(false);
  };

  useEffect(() => {
    initDashboard();
  }, []);

  const initDashboard = async () => {
    setLoading(true);
    try {
      const [zilas, overview, report, verification] = await Promise.all([
        hqService.getZilaList(),
        hqService.getDistrictOverview(),
        hqService.getDistrictReport(),
        hqService.getVerificationStatus()
      ]);

      setZilaList(zilas);
      
      const reportMap = new Map(report.map(r => [r.district, r]));
      const mergedOverview = overview.map(district => ({
        ...district,
        data_entry_done: reportMap.get(district.district)?.families_data_entry_done || 0,
        sachiv_verified: reportMap.get(district.district)?.sachiv_verified || 0
      }));
      
      setDistrictOverview(mergedOverview);
      setDistrictReport(report);
      setVerificationStatus(verification);
    } catch (error) {
      console.error('Error initializing dashboard:', error);
      alert('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictClick = async (districtCode) => {
    try {
      const details = await hqService.getDistrictDetails(districtCode);
      if (!details.zilaCode) {
        details.zilaCode = districtCode;
      }
      setDistrictDetails(details);
      setSelectedDistrict(districtCode);
    } catch (error) {
      console.error('Error loading district details:', error);
      alert('Failed to load district details');
    }
  };

  const handleBackToOverview = () => {
    setSelectedDistrict(null);
    setDistrictDetails(null);
  };

  const handleGaonDataLoad = (data) => {
    setGaonData(data);
    setShowGaonData(true);
  };

  const handleDistrictClickForBlocks = async (districtName) => {
    try {
      const blocks = await hqService.getBlockReport(districtName);
      setBlockData(blocks);
      setSelectedDistrictForBlocks(districtName);
      setShowBlockReport(true);
    } catch (error) {
      console.error('Error loading block data:', error);
      alert('Failed to load block data');
    }
  };

  const handleCloseBlockView = () => {
    setSelectedDistrictForBlocks(null);
    setBlockData([]);
    setShowBlockReport(false);
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm('Are you sure you want to logout?')) {
      window.location.href = '/login/';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center z-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-4 border-transparent border-b-cyan-400 border-l-cyan-400 rounded-full animate-spin" style={{ animationDirection: 'reverse' }}></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-slate-400 text-sm">Preparing your data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pm-dashboard-wrapper">
      {/* Sidebar */}
      <div className={`pm-sidebar ${sidebarCollapsed ? 'hidden' : ''}`}>
        <div style={{ textAlign: 'end', paddingRight: '5px', paddingTop: '5px' }}>
          <button className="toggleBtn" id="collapseMenu" onClick={collapseMenu}>
            <i className="fa fa-arrow-left"></i>
          </button>
        </div>
        
        <div className="sidebar-header">
          <i className="fas fa-user-circle"></i>
          <span className="title">Project Monitoring</span>
        </div>

        {/* Dashboards Dropdown */}
        <div className="dropdown">
          <button 
            className="dropbtn" 
            id="dashboardBtn" 
            onClick={toggleDashboardDropdown}
          >
            Dashboards ▼
          </button>
          <div className={`dropdown-content ${dashboardDropdownOpen ? 'show' : ''}`} id="dashboardDropdown">
            <button 
              className={`dropbtn1 ${activeView === 'project-monitoring' ? 'active' : ''}`}
              onClick={() => { setActiveView('project-monitoring'); setActive('project-monitoring'); }}
            >
              Project Monitoring
            </button>
            <button 
              className={`dropbtn1 ${activeView === 'operator-monitoring' ? 'active' : ''}`}
              onClick={() => { setActiveView('operator-monitoring'); setActive('operator-monitoring'); }}
            >
              Operator Monitoring
            </button>
            <button 
              className={`dropbtn1 ${activeView === 'data-monitoring' ? 'active' : ''}`}
              onClick={() => { setActiveView('data-monitoring'); setActive('data-monitoring'); }}
            >
              Data Monitoring & Management
            </button>
          </div>
        </div>

        {/* HQ Dashboard */}
        <div className="dropdown">
          <button 
            className={`dropbtn ${activeView === 'hq-dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('hq-dashboard')}
          >
            HQ Dashboard
          </button>
        </div>

        {/* Sachiv Validation - NEW ADDITION */}
        <div className="dropdown">
          <button 
            className={`dropbtn ${activeView === 'sachiv-validation' ? 'active' : ''}`}
            onClick={() => setActiveView('sachiv-validation')}
          >
            Sachiv Validation
          </button>
        </div>

        {/* Approval Status */}
        <div className="dropdown">
          <button 
            className={`dropbtn ${activeView === 'approval-status' ? 'active' : ''}`}
            onClick={() => setActiveView('approval-status')}
          >
            Approval Status
          </button>
        </div>

        {/* Live Data Entries */}
        <div className="dropdown">
          <button 
            className={`dropbtn ${activeView === 'live-entries' ? 'active' : ''}`}
            onClick={() => setActiveView('live-entries')}
          >
            Live Data Entries
          </button>
        </div>

        {/* Raw Data */}
        <div className="dropdown">
          <button 
            className={`dropbtn ${activeView === 'raw-data' ? 'active' : ''}`}
            onClick={() => setActiveView('raw-data')}
          >
            Raw Data
          </button>
        </div>

        {/* Logout */}
        <div className="logout" style={{ borderRadius: '2em' }}>
          <a href="/login/" onClick={handleLogout}>
            <i className="icon"><i className="fas fa-sign-out-alt"></i></i>
            <span>Logout</span>
          </a>
        </div>
      </div>

      {/* Toggle button for collapsed sidebar */}
      <button 
        id="openMenu" 
        className={`toggleBtn ${sidebarCollapsed ? '' : 'hidden'}`} 
        onClick={openMenu}
      >
        <i className="fa fa-arrow-right"></i>
      </button>

      {/* Main Content */}
      <div className={`pm-content ${sidebarCollapsed ? 'full-width' : ''}`} id="content">
        <div className="pm-header-top">
          <div className="header-content">
            <div className="logo-section">
              <img src="/assets/images/Department_Logo.png" alt="Panchayati Raj Logo" className="logo-img" />
              <div className="title-section">
                <h1>पंचायती राज मंत्रालय</h1>
                <h2>Ministry of Panchayati Raj</h2>
              </div>
            </div>
            <div className="right-section">
              <img src="/assets/images/Kds_logo.png" alt="KDS Logo" className="kds-logo" />
            </div>
          </div>
        </div>

        <div className="main-content">
          {/* Project Monitoring */}
          {activeView === 'project-monitoring' && (
            <>
              <h1 className="page-title">Project Monitoring Dashboard</h1>
              <ProjectMonitoringView />
            </>
          )}
          
          {/* Operator Monitoring */}
          {activeView === 'operator-monitoring' && (
            <>
              <h1 className="page-title">Operator Monitoring</h1>
              <OperatorMonitoringView zilaList={zilaList} />
            </>
          )}
          
          {/* Data Monitoring */}
          {activeView === 'data-monitoring' && (
            <>
              <h1 className="page-title">Data Monitoring & Management</h1>
              <DataMonitoringView zilaList={zilaList} />
            </>
          )}

          {/* Sachiv Validation - NEW SECTION */}
          {activeView === 'sachiv-validation' && (
            <>
              <h1 className="page-title">Sachiv Validation</h1>
              <SachivValidationView />
            </>
          )}
          
          {/* HQ Dashboard */}
          {activeView === 'hq-dashboard' && (
            <>
              <h1 className="page-title">Parivar Register Digitization System</h1>
              
              {showBlockReport ? (
                <BlockReportView 
                  districtName={selectedDistrictForBlocks}
                  blockData={blockData}
                  onClose={handleCloseBlockView}
                />
              ) : (
                <>
                  {!selectedDistrict ? (
                    <DistrictOverviewCards 
                      districts={districtOverview} 
                      onDistrictClick={handleDistrictClick}
                    />
                  ) : (
                    <DistrictDetailsView 
                      district={districtDetails}
                      onBack={handleBackToOverview}
                    />
                  )}

                  <DistrictReportTable 
                    data={districtReport} 
                    onDistrictClick={handleDistrictClickForBlocks}
                  />

                  <VerificationStatusCards status={verificationStatus} />

                  <VerifyDataEntryForm 
                    zilaList={zilaList} 
                    onGaonDataLoad={handleGaonDataLoad}
                  />

                  {showGaonData && <GaonDataTable data={gaonData} />}
                </>
              )}
            </>
          )}
          
          {/* Approval Status */}
          {activeView === 'approval-status' && (
            <div className="page-title">Approval Status - Coming Soon</div>
          )}
          
          {/* Live Entries */}
          {activeView === 'live-entries' && (
            <div className="page-title">Live Data Entries - Coming Soon</div>
          )}
          
          {/* Raw Data */}
          {activeView === 'raw-data' && (
            <div className="page-title">Raw Data - Coming Soon</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PMDashboard;