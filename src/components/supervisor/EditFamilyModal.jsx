// src/components/supervisor/EditFamilyModal.jsx
import React, { useState, useEffect } from 'react';
import supervisorService from '../../services/supervisorService';

const EditFamilyModal = ({ familyData, viewMode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    common: {
      houseNumberNum: '',
      houseNumberText: '',
      familyHeadName: '',
      pdfNo: '',
      fromPage: '',
      toPage: ''
    },
    members: []
  });

  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  useEffect(() => {
    if (familyData && familyData.length > 0) {
      setFormData({
        common: {
          houseNumberNum: familyData[0].houseNumberNum || '',
          houseNumberText: familyData[0].houseNumberText || '',
          familyHeadName: familyData[0].familyHeadName || '',
          pdfNo: familyData[0].pdfNo || '',
          fromPage: familyData[0].fromPage || '',
          toPage: familyData[0].toPage || ''
        },
        members: familyData.map(member => ({ ...member }))
      });
    }
  }, [familyData]);

  const handleCommonChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      common: {
        ...prev.common,
        [field]: value
      }
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.map((member, i) => 
        i === index ? { ...member, [field]: value } : member
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const updatedFamilyData = formData.members.map(member => ({
        ...member,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName,
        pdfNo: formData.common.pdfNo,
        fromPage: formData.common.fromPage,
        toPage: formData.common.toPage
      }));

      const payload = {
        familyData: [{}, ...updatedFamilyData],
        gaonCode: updatedFamilyData[0].gaonCode,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName
      };

      const result = viewMode === 'rejected'
        ? await supervisorService.supervisorRejectedUpdate(payload)
        : await supervisorService.supervisorUpdate(payload);
      
      if (result.status === 'success' || result) {
        alert('Saved Successfully!');
        onSave();
      } else {
        alert('Error while saving data!');
      }
    } catch (error) {
      console.error('Error saving family data:', error);
      alert('Error while saving data!');
    }
  };

  const fieldConfig = {
    houseNumberNum: { label: "मकान नम्बर (अंकों में) *", type: "number", required: true },
    houseNumberText: { label: "मकान नम्बर (अक्षरों में)", type: "text" },
    familyHeadName: { label: "परिवार के प्रमुख का नाम *", type: "text", required: true },
    pdfNo: { label: "PDF No. *", type: "number", required: true },
    fromPage: { label: "From Page No. *", type: "number", required: true },
    toPage: { label: "To Page No. *", type: "number", required: true },
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
        <h1>परिवार रजिस्टर डाटा एंट्री एडिट फॉर्म</h1>
        
        <form id="familyForm" onSubmit={handleSubmit}>
          <div style={{ maxHeight: '64vh', overflowY: 'scroll' }}>
            {/* Common Fields */}
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
                परिवार की सामान्य जानकारी
              </h3>
              
              <div className="formGrid">
                {['houseNumberNum', 'houseNumberText', 'familyHeadName', 'pdfNo', 'fromPage', 'toPage'].map(field => (
                  <div key={field}>
                    <label>{fieldConfig[field].label}</label>
                    <input
                      type={fieldConfig[field].type}
                      value={formData.common[field]}
                      onChange={(e) => handleCommonChange(field, e.target.value)}
                      required={fieldConfig[field].required}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Members */}
            {formData.members.map((member, index) => (
              <div 
                key={index}
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
                  सदस्य #{index + 1}
                </h4>
                
                <div className="formGrid">
                  {Object.keys(fieldConfig).filter(k => !['houseNumberNum', 'houseNumberText', 'familyHeadName', 'pdfNo', 'fromPage', 'toPage'].includes(k)).map(field => (
                    <div key={field}>
                      <label>{fieldConfig[field].label}</label>
                      {fieldConfig[field].type === 'select' ? (
                        <select
                          value={member[field] || ''}
                          onChange={(e) => handleMemberChange(index, field, e.target.value)}
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
                          value={member[field] || ''}
                          onChange={(e) => handleMemberChange(index, field, e.target.value)}
                          required={fieldConfig[field].required}
                          {...(fieldConfig[field].attributes || {})}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
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
            सुरक्षित करें
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFamilyModal;