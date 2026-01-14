// src/components/supervisor/AddOperatorModal.jsx
import React, { useState } from 'react';
import supervisorService from '../../services/supervisorService';

const AddOperatorModal = ({ supervisorID, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    document: null
  });
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are allowed.');
      e.target.value = '';
      return;
    }

    // Validate file size (1MB = 1048576 bytes)
    if (file.size > 1048576) {
      alert('File size exceeds 1MB. Please upload a smaller PDF.');
      e.target.value = '';
      return;
    }

    setFormData(prev => ({ ...prev, document: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Confirm password is not same as the new password!');
      return;
    }

    if (!formData.document) {
      setError('Please upload a document (PDF only, max 1MB)');
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('underSupervisor', supervisorID);
      data.append('password', formData.password);
      data.append('document', formData.document);

      const result = await supervisorService.insertNewOperator(data);

      if (result.success) {
        alert('Saved Successfully!');
        onSuccess();
      } else {
        setError('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error adding operator:', error);
      setError('Failed to add operator. Please try again.');
    }
  };

  return (
    <>
      <div 
        className="popup-overlay" 
        style={{ display: 'block' }}
        onClick={onClose}
      ></div>
      
      <div className="popup" id="addOperatorPopup" style={{ display: 'block' }}>
        <button className="close-btn" onClick={onClose}>X</button>
        <h1>Add Operator</h1>

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

        <form id="addOperatorForm" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="operatorName">
              Name:<span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              id="operatorName"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="password">Enter Password:</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword">Confirm Password:</label>
            <input
              type="password"
              id="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              required
            />
          </div>

          <div>
            <label htmlFor="docUpload">
              Document Upload (PDF only):<span style={{ color: 'red' }}>*</span>
              <br />
              <small style={{ color: '#888' }}>File size must be less than or equal to 1MB.</small>
            </label>
            <input
              type="file"
              id="docUpload"
              accept=".pdf"
              onChange={handleFileChange}
              required
            />
          </div>

          <button type="submit" id="submitOperator">Submit</button>
        </form>
      </div>
    </>
  );
};

export default AddOperatorModal;