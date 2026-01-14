// src/components/supervisor/SupervisorSidebar.jsx
import React, { useState } from 'react';

const SupervisorSidebar = ({ 
  user, 
  onPendingRegisterClick,
  onCompletedRegisterClick,
  onRejectedFamiliesClick,
  onVilPendingClick,
  onDashboardClick,
  onManageOperatorsClick,
  onChangePassword, 
  onLogout,
  rejectedHasFlicker 
}) => {
  const [collapsed, setCollapsed] = useState(false);

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
          <span className="title">{user.name}</span>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>Allotted District</th>
            </tr>
          </thead>
          <tbody>
            {user.districts.map((district, idx) => (
              <tr key={idx}>
                <td>{district}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button 
          className="guideline" 
          style={{ margin: '0 20px 10px 20px', padding: '0', border: 'none', background: 'none' }}
        >
          <a 
            href="/static/assets/Data Entry Supervisor Role & Responsibilities.pdf"
            target="_blank" 
            className="guidelineBtn" 
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#f0f0f0',
              color: '#000',
              fontSize: '14px',
              textDecoration: 'underline',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              transition: 'background-color 0.3s, transform 0.2s'
            }}
          >
            View/Download Guidelines
          </a>
        </button>

        <button 
          className="guideline" 
          style={{ margin: '0 20px 10px 20px', padding: '0', border: 'none', background: 'none' }}
        >
          <a 
            href="/static/assets/Supervisor_demo.mp4"
            target="_blank" 
            className="guidelineBtn" 
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              borderRadius: '8px',
              backgroundColor: '#f0f0f0',
              color: '#000',
              fontSize: '14px',
              textDecoration: 'underline',
              boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
              transition: 'background-color 0.3s, transform 0.2s'
            }}
          >
            Watch Demo Video
          </a>
        </button>

        <div className="dropdown">
          <button className="dropbtn" onClick={onDashboardClick}>Dashboard</button>
        </div>

        <div className="dropdown">
          <button className="dropbtn" onClick={onManageOperatorsClick}>
            Manage Operator
          </button>
        </div>

        <div className="dropdown">
          <button className="dropbtn" onClick={onVilPendingClick}>
            Villages Pending for Entry
          </button>
        </div>

        <div className="dropdown">
          <button className="dropbtn" onClick={onPendingRegisterClick}>
            Pending Register
          </button>
        </div>

        <div className="dropdown">
          <button className="dropbtn" onClick={onCompletedRegisterClick}>
            Completed Registers
          </button>
        </div>

        <div className="dropdown" style={{ borderBottom: '2px solid black' }}>
          <button 
            className="dropbtn" 
            onClick={onRejectedFamiliesClick}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <span 
              id="flicker" 
              className={rejectedHasFlicker ? '' : 'hidden'}
              style={{ marginRight: '8px' }}
            >
              &nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            Rejected Families
          </button>
        </div>

        <div className="logout" onClick={onChangePassword} style={{ cursor: 'pointer' }}>
          <i className="fas fa-user-edit" style={{ marginRight: '10px' }}></i>
          <span>Change Password</span>
        </div>

        <a href="#" onClick={onLogout} className="logout" style={{ marginTop: '1em' }}>
          <i className="icon">
            <i className="fas fa-sign-out-alt"></i>
          </i>
          <span>Logout</span>
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
            zIndex: 1000,
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none',
            padding: '10px',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          <i className="fa fa-arrow-right"></i>
        </button>
      )}
    </>
  );
};

export default SupervisorSidebar;