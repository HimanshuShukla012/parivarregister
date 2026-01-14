// src/components/supervisor/MessageModal.jsx
import React from 'react';

const MessageModal = ({ message, color, onClose }) => {
  return (
    <>
      <div 
        className="popup-overlay" 
        id="msgPopupOverlay"
        style={{ display: 'block' }}
        onClick={onClose}
      ></div>
      
      <div 
        className="popup" 
        id="msgPopup" 
        style={{ display: 'block' }}
      >
        <button className="close-btn" onClick={onClose}>X</button>
        <h1 
          id="msg" 
          style={{ 
            color: color,
            margin: 'auto',
            marginTop: '1.5em',
            marginBottom: '13px',
            textAlign: 'center'
          }}
          dangerouslySetInnerHTML={{ __html: message }}
        />
      </div>
    </>
  );
};

export default MessageModal;