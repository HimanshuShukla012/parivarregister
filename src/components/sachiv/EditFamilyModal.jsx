// src/components/sachiv/EditFamilyModal.jsx
import React, { useState, useEffect } from 'react';
import sachivService from '../../services/sachivService';

const EditFamilyModal = ({ familyData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    common: {
      houseNumberNum: '',
      houseNumberText: '',
      familyHeadName: ''
    },
    members: []
  });

  useEffect(() => {
    if (familyData && familyData.length > 0) {
      setFormData({
        common: {
          houseNumberNum: familyData[0].houseNumberNum || '',
          houseNumberText: familyData[0].houseNumberText || '',
          familyHeadName: familyData[0].familyHeadName || ''
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

  const handleSubmit = async () => {
    try {
      // Prepare payload
      const updatedFamilyData = formData.members.map(member => ({
        ...member,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName
      }));

      const payload = {
        familyData: updatedFamilyData,
        gaonCode: updatedFamilyData[0].gaonCode,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName
      };

      const result = await sachivService.updateAndInsert(payload);
      
      if (result) {
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

  return (
    <div className="formModal isVisible" onClick={(e) => e.target.className.includes('formModal') && onClose()}>
      <div className="popupModal">
        <div className="headerbg"></div>
        <button className="close-button" onClick={onClose}>X</button>
        <h1>परिवार रजिस्टर डाटा एंट्री एडिट फॉर्म</h1>

        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '20px' }}>
          {/* Common Fields */}
          <div className="form-row common-fields" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '15px',
            marginBottom: '20px',
            padding: '15px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <div className="form-group">
              <label>मकान नम्बर (अंकों में) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                className="form-control"
                value={formData.common.houseNumberNum}
                onChange={(e) => handleCommonChange('houseNumberNum', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>मकान नम्बर (अक्षरों में)</label>
              <input
                type="text"
                className="form-control"
                value={formData.common.houseNumberText}
                onChange={(e) => handleCommonChange('houseNumberText', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>परिवार के प्रमुख का नाम <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                className="form-control"
                value={formData.common.familyHeadName}
                onChange={(e) => handleCommonChange('familyHeadName', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Member Fields */}
          {formData.members.map((member, index) => (
            <div key={index} style={{ marginBottom: '30px' }}>
              <h5 style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold', 
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#667eea',
                color: 'white',
                borderRadius: '5px'
              }}>
                सदस्य #{index + 1}
              </h5>
              
              <div className="form-row" style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(3, 1fr)', 
                gap: '15px',
                padding: '15px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                <div className="form-group">
                  <label>परिवार के सदस्य का नाम <span style={{ color: 'red' }}>*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    value={member.memberName || ''}
                    onChange={(e) => handleMemberChange(index, 'memberName', e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>पिता या पति का नाम</label>
                  <input
                    type="text"
                    className="form-control"
                    value={member.fatherOrHusbandName || ''}
                    onChange={(e) => handleMemberChange(index, 'fatherOrHusbandName', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>पुरुष / महिला <span style={{ color: 'red' }}>*</span></label>
                  <select
                    className="form-control"
                    value={member.gender || ''}
                    onChange={(e) => handleMemberChange(index, 'gender', e.target.value)}
                    required
                  >
                    <option value="">कृपया लिंग का चयन करें</option>
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>धर्म <span style={{ color: 'red' }}>*</span></label>
                  <select
                    className="form-control"
                    value={member.religion || ''}
                    onChange={(e) => handleMemberChange(index, 'religion', e.target.value)}
                    required
                  >
                    <option value="">कृपया धर्म का चयन करें</option>
                    <option value="हिन्दू">हिन्दू</option>
                    <option value="मुस्लिम">मुस्लिम</option>
                    <option value="ईसाई">ईसाई</option>
                    <option value="सिख">सिख</option>
                    <option value="बौद्ध">बौद्ध</option>
                    <option value="जैन">जैन</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>जाति</label>
                  <input
                    type="text"
                    className="form-control"
                    value={member.caste || ''}
                    onChange={(e) => handleMemberChange(index, 'caste', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>जन्म तिथि</label>
                  <input
                    type="date"
                    className="form-control"
                    value={member.dob || '1900-01-01'}
                    onChange={(e) => handleMemberChange(index, 'dob', e.target.value)}
                    min="1900-01-01"
                  />
                </div>

                <div className="form-group">
                  <label>व्यावसाय</label>
                  <input
                    type="text"
                    className="form-control"
                    value={member.business || ''}
                    onChange={(e) => handleMemberChange(index, 'business', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>साक्षर या निरक्षर</label>
                  <select
                    className="form-control"
                    value={member.literacy || ''}
                    onChange={(e) => handleMemberChange(index, 'literacy', e.target.value)}
                  >
                    <option value="">कृपया साक्षर या निरक्षर का चयन करें</option>
                    <option value="साक्षर">साक्षर</option>
                    <option value="निरक्षर">निरक्षर</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>सर्किल छोड़ देने/ मृत्यु का दिनांक</label>
                  <input
                    type="date"
                    className="form-control"
                    value={member.leavingDate || ''}
                    onChange={(e) => handleMemberChange(index, 'leavingDate', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>विवरण</label>
                  <input
                    type="text"
                    className="form-control"
                    value={member.description || ''}
                    onChange={(e) => handleMemberChange(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          style={{
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            color: '#fff',
            padding: '12px 28px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: '700',
            cursor: 'pointer',
            marginTop: '20px'
          }}
        >
          Submit
        </button>
      </div>
    </div>
  );
};

export default EditFamilyModal;