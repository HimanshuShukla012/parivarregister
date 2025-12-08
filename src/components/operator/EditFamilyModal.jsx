import React, { useState } from 'react';
import api from '../../services/api';

const EditFamilyModal = ({ familyData, onClose, onSuccess, onError, setLoading }) => {
  const [formData, setFormData] = useState(familyData);
  const today = new Date().toISOString().split('T')[0];

  const fieldConfig = {
    houseNumberNum: { label: 'मकान नम्बर (अंकों में) *', type: 'number', required: true },
    houseNumberText: { label: 'मकान नम्बर (अक्षरों में)', type: 'text' },
    familyHeadName: { label: 'परिवार के प्रमुख का नाम *', type: 'text', required: true },
    pdfNo: { label: 'PDF No. *', type: 'number', required: true },
    fromPage: { label: 'From Page No. *', type: 'number', required: true },
    toPage: { label: 'To Page No. *', type: 'number', required: true },
    memberName: { label: 'परिवार के सदस्य का नाम *', type: 'text', required: true },
    fatherOrHusbandName: { label: 'पिता या पति का नाम', type: 'text' },
    gender: { 
      label: 'पुरुष / महिला *', 
      type: 'select', 
      required: true, 
      options: ['पुरुष', 'महिला', 'अन्य'] 
    },
    religion: { 
      label: 'धर्म *', 
      type: 'select', 
      required: true, 
      options: ['हिन्दू', 'मुस्लिम', 'ईसाई', 'सिख', 'बौद्ध', 'जैन', 'अन्य'] 
    },
    caste: { label: 'जाति', type: 'text' },
    dob: { 
      label: 'जन्म तिथि', 
      type: 'date', 
      attributes: { min: '1900-01-01', max: today } 
    },
    business: { label: 'व्यावसाय', type: 'text' },
    literacy: { 
      label: 'साक्षर या निरक्षर', 
      type: 'select', 
      options: ['साक्षर', 'निरक्षर'] 
    },
    qualification: { 
      label: 'योग्यता', 
      type: 'select', 
      options: ['<5', '5 से 9', '10', '11', '12', 'ग्रेजुएशन', 'डिप्लोमा', 'पोस्ट ग्रेजुएशन', 'पीएचडी'] 
    },
    leavingDate: { 
      label: 'सर्किल छोड़ देने/ मृत्यु का दिनांक', 
      type: 'date', 
      attributes: { min: '1900-01-01', max: today } 
    },
    description: { label: 'विवरण', type: 'text' }
  };

  const commonFields = ['houseNumberNum', 'houseNumberText', 'familyHeadName', 'pdfNo', 'fromPage', 'toPage'];
  const hiddenFields = [
    'id', 'zilaCode', 'zila', 'tehsilCode', 'tehsil', 'blockCode', 'block',
    'sabhaCode', 'sabha', 'panchayat', 'gaon', 'gaonCode', 'serialNo',
    'byOperator', 'entryDate', 'status', 'remark'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      familyData: formData,
      gaonCode: formData[0].gaonCode,
      houseNumberNum: formData[0].houseNumberNum,
      houseNumberText: formData[0].houseNumberText,
      familyHeadName: formData[0].familyHeadName
    };

    try {
      const response = await api.post('/supervisorUpdate/', payload);
      if (response.data.status === 'success') {
        onSuccess();
      } else {
        onError('Error: ' + response.data.error);
      }
    } catch (error) {
      onError('Error while updating data!');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (memberIndex, fieldName, value) => {
    const updatedData = [...formData];
    updatedData[memberIndex][fieldName] = value;
    setFormData(updatedData);
  };

  const renderField = (key, memberIndex, isCommon = false) => {
    const config = fieldConfig[key];
    if (!config) return null;

    const value = isCommon ? formData[0][key] : formData[memberIndex][key];
    const fieldId = isCommon ? `common-${key}` : `field-${key}-${memberIndex}`;

    return (
      <div key={fieldId} className="form-group">
        <label htmlFor={fieldId}>{config.label}</label>
        {config.type === 'select' ? (
          <select
            id={fieldId}
            className="form-control"
            value={value || ''}
            onChange={(e) => handleFieldChange(isCommon ? 0 : memberIndex, key, e.target.value)}
            required={config.required}
          >
            <option value="">{config.label}</option>
            {config.options.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ) : (
          <input
            id={fieldId}
            type={config.type}
            className="form-control"
            value={value || ''}
            onChange={(e) => handleFieldChange(isCommon ? 0 : memberIndex, key, e.target.value)}
            required={config.required}
            {...(config.attributes || {})}
          />
        )}
      </div>
    );
  };

  return (
    <div className="formModal isVisible" onClick={(e) => e.target.classList.contains('formModal') && onClose()}>
      <div className="popupModal1">
        <div className="headerbg"></div>
        <h1>परिवार रजिस्टर डाटा एंट्री एडिट फॉर्म</h1>
        
        <form id="familyForm1" onSubmit={handleSubmit}>
          <div style={{ overflowY: 'scroll', maxHeight: '64vh' }}>
            {/* Common Fields */}
            <div className="form-row common-fields">
              {commonFields.map((key) => renderField(key, 0, true))}
            </div>

            {/* Family Members */}
            {formData.map((member, idx) => (
              <div key={idx}>
                <h5 className="form-member-heading">सदस्य #{idx + 1}</h5>
                <div className="form-row">
                  {/* Hidden fields */}
                  {hiddenFields.map((key) => (
                    <input
                      key={`hidden-${key}-${idx}`}
                      type="hidden"
                      value={member[key] || ''}
                      readOnly
                    />
                  ))}
                  
                  {/* Visible fields */}
                  {Object.keys(fieldConfig).filter(key => !commonFields.includes(key)).map((key) => 
                    renderField(key, idx, false)
                  )}
                </div>
              </div>
            ))}
          </div>

          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditFamilyModal;