// src/components/supervisor/AddRecordModal.jsx
import React, { useState, useEffect } from 'react';
import supervisorService from '../../services/supervisorService';

const AddRecordModal = ({ familyData, viewMode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    common: {
      houseNumberNum: '',
      houseNumberText: '',
      familyHeadName: ''
    },
    newMember: {}
  });

  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (familyData && familyData.length > 0) {
      setFormData({
        common: {
          houseNumberNum: familyData[0].houseNumberNum || '',
          houseNumberText: familyData[0].houseNumberText || '',
          familyHeadName: familyData[0].familyHeadName || ''
        },
        newMember: {
          ...familyData[0], // Copy base structure
          serialNo: '', // Will be set by backend
          memberName: '',
          fatherOrHusbandName: '',
          gender: '',
          religion: '',
          caste: '',
          dob: '',
          business: '',
          literacy: '',
          qualification: '',
          leavingDate: '',
          description: ''
        }
      });
    }
  }, [familyData]);

  const handleMemberChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      newMember: {
        ...prev.newMember,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedMember = {
        ...formData.newMember,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName
      };

      const payload = {
        familyData: [{}, updatedMember],
        gaonCode: updatedMember.gaonCode,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName
      };

      const result = viewMode === 'rejected'
        ? await supervisorService.addRejectedRecordAfter(payload)
        : await supervisorService.addRecordAfter(payload);
      
      if (result.success) {
        alert('Saved Successfully!');
        onSave();
      } else {
        alert('Error: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error adding record:', error);
      alert('Error while saving data!');
    }
  };

  const fieldConfig = {
    memberName: { label: "परिवार के सदस्य का नाम *", type: "text", required: true },
    fatherOrHusbandName: { label: "पिता या पति का नाम", type: "text" },
    gender: { label: "पुरुष / महिला *", type: "select", required: true, options: ["पुरुष", "महिला", "अन्य"] },
    religion: { label: "धर्म *", type: "select", required: true, options: ["हिन्दू", "मुस्लिम", "ईसाई", "सिख", "बौद्ध", "जैन", "अन्य"] },
    caste: { label: "जाति", type: "text" },
    dob: { label: "जन्म तिथि", type: "date", attributes: { min: "1900-01-01", max: maxDate } },
    business: { label: "व्यावसाय", type: "text" },
    literacy: { label: "साक्षर या निरक्षर", type: "select", options: ["साक्षर", "निरक्षर"] },
    qualification: { label: "योग्यता", type: "select", options: ["<5", "5 से 9", "10", "11", "12", "ग्रेजुएशन", "डिप्लोमा", "पोस्ट ग्रेजुएशन", "पीएचडी"] },
    leavingDate: { label: "सर्किल छोड़ देने/ मृत्यु का दिनांक", type: "date", attributes: { min: "1900-01-01", max: maxDate } },
    description: { label: "विवरण", type: "text" }
  };

  return (
    <div 
      className="formModal isVisible"
      onClick={(e) => {
        if (e.target.className.includes('formModal')) onClose();
      }}
    >
      <div className="popupModal">
        <div className="headerbg"></div>
        <button className="close-button" onClick={onClose}>X</button>
        <h1>नया सदस्य जोड़ें</h1>
        
        <form id="addRecordForm" onSubmit={handleSubmit}>
          {/* Common Fields (Disabled) */}
          <div 
            style={{
              marginBottom: '32px',
              padding: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              borderRadius: '12px',
              border: '2px solid #cbd5e1'
            }}
          >
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#1e293b',
              fontSize: '1.1rem',
              fontWeight: '700'
            }}>
              परिवार की जानकारी
            </h3>
            
            <div className="formGrid">
              <div>
                <label>मकान नम्बर (अंकों में)</label>
                <input
                  type="number"
                  value={formData.common.houseNumberNum}
                  disabled
                />
              </div>
              <div>
                <label>मकान नम्बर (अक्षरों में)</label>
                <input
                  type="text"
                  value={formData.common.houseNumberText}
                  disabled
                />
              </div>
              <div>
                <label>परिवार के प्रमुख का नाम</label>
                <input
                  type="text"
                  value={formData.common.familyHeadName}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* New Member Fields */}
          <div 
            style={{
              marginBottom: '24px',
              padding: '24px',
              background: 'white',
              borderRadius: '12px',
              border: '2px solid #e2e8f0'
            }}
          >
            <h4 style={{
              margin: '0 0 20px 0',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '700',
              background: 'linear-gradient(135deg, #667eea, #764ba2)',
              padding: '12px 20px',
              borderRadius: '8px'
            }}>
              नए सदस्य का विवरण
            </h4>
            
            <div className="formGrid">
              {Object.keys(fieldConfig).map(field => (
                <div key={field}>
                  <label>{fieldConfig[field].label}</label>
                  {fieldConfig[field].type === 'select' ? (
                    <select
                      value={formData.newMember[field] || ''}
                      onChange={(e) => handleMemberChange(field, e.target.value)}
                      required={fieldConfig[field].required}
                    >
                      <option value="">{fieldConfig[field].label}</option>
                      {fieldConfig[field].options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fieldConfig[field].type}
                      value={formData.newMember[field] || ''}
                      onChange={(e) => handleMemberChange(field, e.target.value)}
                      required={fieldConfig[field].required}
                      {...(fieldConfig[field].attributes || {})}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={{
            marginTop: '15px',
            padding: '12px 30px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}>
            जोड़ें
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;