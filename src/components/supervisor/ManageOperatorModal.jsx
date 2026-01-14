// src/components/supervisor/ManageOperatorModal.jsx
import React, { useState, useEffect } from 'react';
import supervisorService from '../../services/supervisorService';

const ManageOperatorModal = ({ loginID, onClose, onAddOperator }) => {
  const [operators, setOperators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetData, setResetData] = useState({ name: '', loginID: '' });
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    setLoading(true);
    try {
      const data = await supervisorService.getOperators(loginID);
      setOperators(data);
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      alert('Confirm password is not same as the new password!');
      return;
    }

    try {
      const result = await supervisorService.resetPassword(resetData.loginID, newPassword);
      if (result.success) {
        alert('Password changed successfully!');
        setShowResetForm(false);
        setNewPassword('');
        setConfirmPassword('');
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      alert('Failed to reset password');
    }
  };

  const handleDelete = async (operatorLoginID) => {
    if (!window.confirm('Do you want to delete this Operator?')) return;

    try {
      const result = await supervisorService.deleteOperator(operatorLoginID);
      if (result) {
        alert('Deleted Successfully!');
        fetchOperators();
      } else {
        alert('Error while deleting data!');
      }
    } catch (error) {
      console.error('Error deleting operator:', error);
      alert('Failed to delete operator');
    }
  };

  return (
    <>
      <div 
        className="popup-overlay" 
        style={{ display: 'block' }}
        onClick={onClose}
      ></div>
      
      <div className="popup" style={{ display: 'block', maxWidth: '800px' }}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h1 style={{ marginBottom: '20px' }}>Manage Operators</h1>

        <button
          onClick={onAddOperator}
          style={{
            marginBottom: '20px',
            padding: '10px 20px',
            backgroundColor: '#7ED957',
            border: '2px solid black',
            borderRadius: '30px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <i className="fas fa-user-plus" style={{ marginRight: '5px' }}></i>
          Add Operator
        </button>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="main-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Login ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {operators.length > 0 ? (
                operators.map((op, idx) => (
                  <tr key={idx}>
                    <td>{op.name}</td>
                    <td>{op.loginID}</td>
                    <td>
                      {op.documentUrl ? (
                        <a href={op.documentUrl} target="_blank" rel="noopener noreferrer">
                          <button style={{ marginRight: '5px' }}>View Doc</button>
                        </a>
                      ) : (
                        <span style={{ color: 'gray', marginRight: '5px' }}>No Document</span>
                      )}
                      <button
                        className="reset-btn"
                        onClick={() => {
                          setResetData({ name: op.name, loginID: op.loginID });
                          setShowResetForm(true);
                        }}
                        style={{ marginRight: '5px' }}
                      >
                        Reset Password
                      </button>
                      <button onClick={() => handleDelete(op.loginID)}>Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No operators available</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Reset Password Form */}
      {showResetForm && (
        <>
          <div 
            className="popup-overlay" 
            style={{ display: 'block', zIndex: 1002 }}
            onClick={() => setShowResetForm(false)}
          ></div>
          
          <div className="popup" id="resetForm" style={{ display: 'block', zIndex: 1003 }}>
            <button className="close-btn" onClick={() => setShowResetForm(false)}>X</button>
            <h1>Reset Password</h1>
            <form id="resetPasswordForm" onSubmit={handleResetPassword}>
              <div>
                <label htmlFor="formName">Name:</label>
                <input type="text" id="formName" value={resetData.name} disabled />
              </div>
              <div>
                <label htmlFor="formLoginId">Login Id:</label>
                <input type="text" id="formLoginId" value={resetData.loginID} disabled />
              </div>
              <div>
                <label htmlFor="newPassword">Enter New Password:</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword">Confirm Password:</label>
                <input
                  type="password"
                  id="confirmNewPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit">Reset</button>
            </form>
          </div>
        </>
      )}
    </>
  );
};

export default ManageOperatorModal;