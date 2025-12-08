// src/components/sachiv/RegisterSidebar.jsx
import React, { useState } from 'react';

const RegisterSidebar = ({ user, villages, selectedVillage, onVillageClick, onChangePassword, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const pendingVerificationRegisters = villages.filter(v => v.approvedBySachiv === 'N' && !v.status);
  const pendingValidationRegisters = villages.filter(v => v.approvedBySachiv === 'N' && v.status);
  const completedRegisters = villages.filter(v => v.approvedBySachiv === 'Y');

  return (
    <>
      <div className={`sidebar ${collapsed ? 'hidden' : ''}`}>
        <div style={{ textAlign: 'end', paddingRight: '5px', paddingTop: '5px' }}>
          <button className="toggleBtn" id="collapseMenu" onClick={() => setCollapsed(true)}>
            <i className="fa fa-arrow-left"></i>
          </button>
        </div>

        <div className="sidebar-header">
          <i className="fas fa-user-circle"></i>
          <span className="title">Sachiv</span>
        </div>

        <table className="data-table">
          <tbody>
            <tr>
              <td>गाँव सभा</td>
              <td>{user.sabha}</td>
            </tr>
            <tr>
              <td>ब्लाक</td>
              <td>{user.block}</td>
            </tr>
            <tr>
              <td>तहसील</td>
              <td>{user.tehsil}</td>
            </tr>
            <tr>
              <td>जनपद</td>
              <td>{user.zila}</td>
            </tr>
          </tbody>
        </table>

        {/* Register Verification Dropdown */}
        <div className="dropdown">
          <button className="dropbtn">Register Verification &#x25BC;</button>
          <div className="dropdown-content" id="pendingVerificationRegisters">
            {pendingVerificationRegisters.length > 0 ? (
              pendingVerificationRegisters.map((village, index) => (
                <a
                  key={index}
                  onClick={() => onVillageClick(village, 'verification')}
                  className={`gaonListItem ${selectedVillage?.gaonCode === village.gaonCode ? 'active' : ''}`}
                >
                  {village.gaon}
                </a>
              ))
            ) : (
              <a>No Register Available</a>
            )}
          </div>
        </div>

        {/* Register Validation Dropdown */}
        <div className="dropdown">
          <button className="dropbtn">Register Validation &#x25BC;</button>
          <div className="dropdown-content" id="pendingRegisters">
            {pendingValidationRegisters.length > 0 ? (
              pendingValidationRegisters.map((village, index) => (
                <a
                  key={index}
                  onClick={() => onVillageClick(village, 'pending')}
                  className={`gaonListItem ${selectedVillage?.gaonCode === village.gaonCode ? 'active' : ''}`}
                >
                  {village.gaon}
                </a>
              ))
            ) : (
              <a>No Register Available</a>
            )}
          </div>
        </div>

        {/* Completed Registers Dropdown */}
        <div className="dropdown">
          <button className="dropbtn">Completed Register(s) &#x25BC;</button>
          <div className="dropdown-content" id="completedRegisters">
            {completedRegisters.length > 0 ? (
              completedRegisters.map((village, index) => (
                <a
                  key={index}
                  onClick={() => onVillageClick(village, 'completed')}
                  className={`gaonListItem ${selectedVillage?.gaonCode === village.gaonCode ? 'active' : ''}`}
                >
                  {village.gaon}
                </a>
              ))
            ) : (
              <a>No Register Available</a>
            )}
          </div>
        </div>

        <div id="changePass" className="logout" onClick={onChangePassword}>
          <i className="fas fa-user-edit"></i> &nbsp;
          Change Password
        </div>

        <a href="#" className="logout" style={{ marginTop: '1em' }} onClick={onLogout}>
          <i className="icon">
            <i className="fas fa-sign-out-alt"></i>
          </i>
          <span>लॉग आउट</span>
        </a>
      </div>

      {collapsed && (
        <button
          id="openMenu"
          className="toggleBtn"
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed',
            left: '10px',
            top: '10px',
            zIndex: 1000
          }}
        >
          <i className="fa fa-arrow-right"></i>
        </button>
      )}
    </>
  );
};

export default RegisterSidebar;