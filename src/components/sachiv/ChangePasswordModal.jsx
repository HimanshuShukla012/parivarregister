// src/components/sachiv/ChangePasswordModal.jsx
import React, { useState } from 'react';
import sachivService from '../../services/sachivService';

const ChangePasswordModal = ({ loginID, onClose }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Confirm password is not same as the new password!');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      const result = await sachivService.resetPassword(loginID, newPassword);

      if (result.success) {
        setSuccess('Password Changed Successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setError(result.error || 'Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setError('Failed to change password. Please try again.');
    }
  };

  return (
    <>
      <div 
        className="popup-overlay" 
        style={{ display: 'block' }}
        onClick={onClose}
      ></div>
      
      <div id="changePassPopup" style={{ display: 'block' }}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h2>Reset Password Form</h2>

        <div style={{ padding: '20px' }}>
          {error && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: '5px',
              color: '#c00'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              padding: '10px',
              marginBottom: '15px',
              backgroundColor: '#efe',
              border: '1px solid #cfc',
              borderRadius: '5px',
              color: '#060'
            }}>
              {success}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="newPass">Enter New Password:</label>
            <input
              type="password"
              id="newPass"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="confirmPass">Confirm Password:</label>
            <input
              type="password"
              id="confirmPass"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
          </div>

          <button
            onClick={handleSubmit}
            style={{
              backgroundColor: '#4CAF50',
              padding: '12px 20px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              color: 'white',
              width: '100%'
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </>
  );
};

export default ChangePasswordModal;