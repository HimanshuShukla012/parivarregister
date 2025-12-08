import React, { useState, useEffect } from 'react';

const FamilyMemberForm = ({ memberIndex, data = {}, onChange }) => {
  const [showQualification, setShowQualification] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Initialize conditional fields based on existing data
  useEffect(() => {
    setShowQualification(data.literacy === 'साक्षर');
    setShowDescription(data.reason === 'सर्किल छोड़ दिया');
  }, [data.literacy, data.reason]);

  const handleChange = (field, value) => {
    onChange(memberIndex, field, value);
  };

  const handleLiteracyChange = (e) => {
    const value = e.target.value;
    handleChange('literacy', value);
    setShowQualification(value === 'साक्षर');
    
    // Clear qualification if not साक्षर
    if (value !== 'साक्षर') {
      handleChange('qualification', '');
    }
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    handleChange('reason', value);
    setShowDescription(value === 'सर्किल छोड़ दिया');
    
    // Clear description if not सर्किल छोड़ दिया
    if (value !== 'सर्किल छोड़ दिया') {
      handleChange('desc', '');
    }
  };

  const handleHindiInput = (e) => {
    const regex = /^[\u0900-\u097F ]*$/;
    if (!regex.test(e.target.value)) {
      e.target.value = e.target.value.replace(/[^\u0900-\u097F ]/g, '');
    }
  };

  return (
    <div className="repeaterForm">
      <h4>सदस्य #<span id={`familyNumber_${memberIndex}`}>{memberIndex}</span></h4>

      <div>
        <label htmlFor={`memberName_${memberIndex}`}>
          परिवार के सदस्य का नाम <span className="required">*</span>
        </label>
        <input
          type="text"
          name="memberName"
          id={`memberName_${memberIndex}`}
          value={data.memberName || ''}
          onChange={(e) => handleChange('memberName', e.target.value)}
          onInput={handleHindiInput}
          required
        />
      </div>

      <div>
        <label htmlFor={`fatherOrHusbandName_${memberIndex}`}>
          पिता या पति का नाम
        </label>
        <input
          type="text"
          name="fatherOrHusbandName"
          id={`fatherOrHusbandName_${memberIndex}`}
          value={data.fatherOrHusbandName || ''}
          onChange={(e) => handleChange('fatherOrHusbandName', e.target.value)}
          onInput={handleHindiInput}
        />
      </div>

      <div>
        <label htmlFor={`gender_${memberIndex}`}>
          पुरुष / महिला <span className="required">*</span>
        </label>
        <select
          name="gender"
          id={`gender_${memberIndex}`}
          value={data.gender || ''}
          onChange={(e) => handleChange('gender', e.target.value)}
          required
        >
          <option value="" disabled>कृपया लिंग का चयन करें</option>
          <option value="पुरुष">पुरुष</option>
          <option value="महिला">महिला</option>
          <option value="अन्य">अन्य</option>
        </select>
      </div>

      <div>
        <label htmlFor={`dob_${memberIndex}`}>जन्म तिथि</label>
        <input
          type="date"
          name="dob"
          id={`dob_${memberIndex}`}
          value={data.dob || '1900-01-01'}
          onChange={(e) => handleChange('dob', e.target.value)}
          min="1900-01-01"
          max={today}
        />
      </div>

      <div>
        <label htmlFor={`business_${memberIndex}`}>व्यावसाय</label>
        <input
          type="text"
          name="business"
          id={`business_${memberIndex}`}
          value={data.business || ''}
          onChange={(e) => handleChange('business', e.target.value)}
          onInput={handleHindiInput}
        />
      </div>

      <div>
        <label htmlFor={`literacy_${memberIndex}`}>साक्षर या निरक्षर</label>
        <select
          name="literacy"
          id={`literacy_${memberIndex}`}
          value={data.literacy || ''}
          onChange={handleLiteracyChange}
        >
          <option value="">कृपया साक्षर या निरक्षर का चयन करें</option>
          <option value="साक्षर">साक्षर</option>
          <option value="निरक्षर">निरक्षर</option>
        </select>
      </div>

      {showQualification && (
        <div>
          <label htmlFor={`qualification_${memberIndex}`}>योग्यता</label>
          <select
            name="qualification"
            id={`qualification_${memberIndex}`}
            value={data.qualification || ''}
            onChange={(e) => handleChange('qualification', e.target.value)}
          >
            <option value="">कृपया योग्यता का चयन करें</option>
            <option value="<5">&lt;5</option>
            <option value="5 से 9">5 से 9</option>
            <option value="10">10</option>
            <option value="11">11</option>
            <option value="12">12</option>
            <option value="ग्रेजुएशन">ग्रेजुएशन</option>
            <option value="डिप्लोमा">डिप्लोमा</option>
            <option value="पोस्ट ग्रेजुएशन">पोस्ट ग्रेजुएशन</option>
            <option value="पीएचडी">पीएचडी</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor={`leavingDate_${memberIndex}`}>
          सर्किल छोड़ देने/ मृत्यु का दिनांक
        </label>
        <input
          type="date"
          name="leavingDate"
          id={`leavingDate_${memberIndex}`}
          value={data.leavingDate || ''}
          onChange={(e) => handleChange('leavingDate', e.target.value)}
          min="1900-01-01"
          max={today}
        />
      </div>

      <div>
        <label htmlFor={`reason_${memberIndex}`}>सर्किल छोड़ा/ मृत्यु</label>
        <select
          name="reason"
          id={`reason_${memberIndex}`}
          value={data.reason || ''}
          onChange={handleReasonChange}
        >
          <option value="">कृपया चयन करें</option>
          <option value="मृत्यु">मृत्यु हो गयी</option>
          <option value="सर्किल छोड़ दिया">सर्किल छोड़ दिया</option>
        </select>
      </div>

      {showDescription && (
        <div>
          <label htmlFor={`desc_${memberIndex}`}>विवरण</label>
          <input
            type="text"
            name="desc"
            id={`desc_${memberIndex}`}
            value={data.desc || ''}
            onChange={(e) => handleChange('desc', e.target.value)}
            onInput={handleHindiInput}
          />
        </div>
      )}
    </div>
  );
};

export default FamilyMemberForm;