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
            className="editBtn"
            style={{
              marginTop: '15px',
              padding: '10px 25px',
              background: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectRemarkModal;