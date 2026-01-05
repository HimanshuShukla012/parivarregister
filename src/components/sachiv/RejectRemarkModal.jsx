// src/components/sachiv/RejectRemarkModal.jsx
import React, { useState } from 'react';
import sachivService from '../../services/sachivService';

const RejectRemarkModal = ({ rejectData, onClose, onSave }) => {
  const [remark, setRemark] = useState('');

  const handleSubmit = async () => {
    if (!remark.trim()) {
      alert('Please add a remark');
      return;
    }

    if (window.confirm("Do you want to reject this Family's data entry?")) {
      try {
        const result = await sachivService.rejectFamilySachiv(
          rejectData.id,
          rejectData.gaonCode,
          remark
        );

        if (result.success) {
          alert('Family rejected!');
          onSave();
        } else {
          alert(result.error || 'Failed to reject family');
        }
      } catch (error) {
        console.error('Error rejecting family:', error);
        alert('Failed to reject family');
      }
    }
  };

  return (
    <div 
      className="rejectPopup isVisible" 
      onClick={(e) => e.target.className.includes('rejectPopup') && onClose()}
    >
      <div className="popupModal">
        <div className="headerbg"></div>
        <button className="close-button" onClick={onClose}>X</button>
        <h1>Add remark for rejection</h1>

        <div style={{ padding: '20px' }}>
          <textarea
            rows="5"
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #ddd',
              borderRadius: '8px',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
            placeholder="Add remark *"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            required
          />

          <button
  onClick={handleSubmit}
  style={{
    marginTop: '15px',
    padding: '12px 30px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(102, 126, 234, 0.3)'
  }}
  onMouseEnter={(e) => {
    e.target.style.transform = 'translateY(-2px)';
    e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
  }}
  onMouseLeave={(e) => {
    e.target.style.transform = 'translateY(0)';
    e.target.style.boxShadow = '0 2px 4px rgba(102, 126, 234, 0.3)';
  }}
>
  <i className="fas fa-save" style={{ marginRight: '8px' }}></i>
  Save Remark
</button>
        </div>
      </div>
    </div>
  );
};

export default RejectRemarkModal;