// src/components/hq/VerificationStatusCards.jsx
import React from 'react';

const VerificationStatusCards = ({ status }) => {
  if (!status) return null;

  const verificationData = [
    {
      key: 'sachivVerified',
      label: 'Sachiv Verified',
      icon: 'fa-user-check',
      className: 'sachiv'
    },
    {
      key: 'adoVerified',
      label: 'ADO Verified',
      icon: 'fa-user-shield',
      className: 'ado'
    },
    {
      key: 'dproVerified',
      label: 'DPRO Verified',
      icon: 'fa-user-cog',
      className: 'dpro'
    },
    {
      key: 'ddVerified',
      label: 'DD Verified',
      icon: 'fa-user-tie',
      className: 'dd'
    }
  ];

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Overall Verification Status</h2>
        <div className="section-line"></div>
      </div>
      <div className="verification-cards" id="verificationCards">
        {verificationData.map((item) => (
          <div key={item.key} className="verification-card">
            <div className={`verification-icon ${item.className}`}>
              <i className={`fas ${item.icon}`}></i>
            </div>
            <div className="verification-content">
              <div className="verification-percentage" id={`${item.key}Percentage`}>
                {status[item.key]}%
              </div>
              <div className="verification-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VerificationStatusCards;