// src/components/sachiv/RegisterSidebar.jsx
import React, { useState } from 'react';

const RegisterSidebar = ({ user, villages, selectedVillage, onVillageClick, onChangePassword, onLogout }) => {
  const [collapsed, setCollapsed] = useState(false);

  const pendingVerificationRegisters = villages.filter(v => v.approvedBySachiv === 'N' && !v.aDORemark);
  const rejectedRegisters = villages.filter(v => v.aDORemark);
  const completedRegisters = villages.filter(v => v.approvedBySachiv === 'Y');

  return (
    <>
      <div className={`sachiv-sidebar ${collapsed ? 'sachiv-hidden' : ''}`}>
        <div className="sachiv-sidebar-header">
          <i className="fas fa-user-shield"></i>
          <div className="sachiv-title">सचिव पैनल</div>
        </div>

        <table className="sachiv-data-table">
          <thead>
            <tr>
              <th>Field</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Login ID</td>
              <td>{user.loginID}</td>
            </tr>
            <tr>
              <td>जिला</td>
              <td>{user.zila}</td>
            </tr>
            <tr>
              <td>तहसील</td>
              <td>{user.tehsil}</td>
            </tr>
            <tr>
              <td>ब्लॉक</td>
              <td>{user.block}</td>
            </tr>
            <tr>
              <td>सभा</td>
              <td>{user.sabha}</td>
            </tr>
          </tbody>
        </table>

        {/* Pending Verification Villages */}
        <div className="sachiv-dropdown">
          <button className="sachiv-dropbtn">
            <span>
              <i className="fas fa-hourglass-half" style={{marginRight: '8px'}}></i>
              लंबित सत्यापन
            </span>
            <span style={{
              background: 'rgba(59, 130, 246, 0.2)',
              color: '#93c5fd',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {pendingVerificationRegisters.length}
            </span>
          </button>
          <div className="sachiv-dropdown-content">
            {pendingVerificationRegisters.length > 0 ? (
              pendingVerificationRegisters.map((village, index) => (
                <a
                  key={index}
                  onClick={() => onVillageClick(village, 'verification')}
                  className={selectedVillage?.gaonCode === village.gaonCode ? 'sachiv-active' : ''}
                >
                  {village.gaon}
                </a>
              ))
            ) : (
              <a style={{color: '#9ca3af', fontStyle: 'italic', cursor: 'default'}}>
                कोई लंबित गाँव नहीं
              </a>
            )}
          </div>
        </div>

        {/* Rejected Villages */}
        <div className="sachiv-dropdown">
          <button className="sachiv-dropbtn">
            <span>
              <i className="fas fa-times-circle" style={{marginRight: '8px'}}></i>
              ADO द्वारा अस्वीकृत
            </span>
            <span style={{
              background: 'rgba(239, 68, 68, 0.2)',
              color: '#fca5a5',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {rejectedRegisters.length}
            </span>
          </button>
          <div className="sachiv-dropdown-content">
            {rejectedRegisters.length > 0 ? (
              rejectedRegisters.map((village, index) => (
                <a
                  key={index}
                  onClick={() => onVillageClick(village, 'pending')}
                  className={selectedVillage?.gaonCode === village.gaonCode ? 'sachiv-active' : ''}
                >
                  {village.gaon}
                </a>
              ))
            ) : (
              <a style={{color: '#9ca3af', fontStyle: 'italic', cursor: 'default'}}>
                कोई अस्वीकृत गाँव नहीं
              </a>
            )}
          </div>
        </div>

        {/* Completed Registers */}
        <div className="sachiv-dropdown">
          <button className="sachiv-dropbtn">
            <span>
              <i className="fas fa-check-circle" style={{marginRight: '8px'}}></i>
              पूर्ण रजिस्टर
            </span>
            <span style={{
              background: 'rgba(34, 197, 94, 0.2)',
              color: '#86efac',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {completedRegisters.length}
            </span>
          </button>
          <div className="sachiv-dropdown-content">
            {completedRegisters.length > 0 ? (
              completedRegisters.map((village, index) => (
                <a
                  key={index}
                  onClick={() => onVillageClick(village, 'completed')}
                  className={selectedVillage?.gaonCode === village.gaonCode ? 'sachiv-active' : ''}
                >
                  {village.gaon}
                </a>
              ))
            ) : (
              <a style={{color: '#9ca3af', fontStyle: 'italic', cursor: 'default'}}>
                कोई पूर्ण गाँव नहीं
              </a>
            )}
          </div>
        </div>

        {/* Change Password */}
        <div className="sachiv-dropdown">
          <button 
            className="sachiv-dropbtn" 
            onClick={onChangePassword}
            style={{borderBottom: 'none'}}
          >
            <span>
              <i className="fas fa-key" style={{marginRight: '8px'}}></i>
              पासवर्ड बदलें
            </span>
          </button>
        </div>

        {/* Logout Button */}
        <div className="sachiv-logout">
          <a onClick={onLogout}>
            <i className="fas fa-sign-out-alt sachiv-icon"></i>
            <span>लॉग आउट</span>
          </a>
        </div>
      </div>

      {collapsed && (
        <button
          id="openMenu"
          className="sachiv-toggleBtn"
          onClick={() => setCollapsed(false)}
          style={{
            position: 'fixed',
            left: '10px',
            top: '10px',
            zIndex: 1000,
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}
        >
          <i className="fa fa-bars"></i>
        </button>
      )}
    </>
  );
};

export default RegisterSidebar;