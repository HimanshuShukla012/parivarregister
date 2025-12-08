// COMPLETE FIX for FamilyEntryForm.jsx
// Replace the entire component with this fixed version:

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import FamilyMemberForm from './FamilyMemberForm';

const FamilyEntryForm = ({ userId, onSuccess, onError, setLoading, onGaonCodeChange }) => {
  const [familyMembers, setFamilyMembers] = useState([1]);
  
  const [memberData, setMemberData] = useState({
    1: {
      memberName: '',
      fatherOrHusbandName: '',
      gender: '',
      dob: '1900-01-01',
      business: '',
      literacy: '',
      qualification: '',
      leavingDate: '',
      reason: '',
      desc: ''
    }
  });
  
  const [formData, setFormData] = useState({
    byOperator: userId || '',  // Initialize with userId
    gaonCode: '',
    zilaCode: '',
    zila: '',
    tehsilCode: '',
    tehsil: '',
    blockCode: '',
    block: '',
    sabhaCode: '',
    sabha: '',
    gaon: '',
    panchayat: '',
    pdfNo: '',
    fromPage: '',
    toPage: '',
    houseNumberNum: '',
    houseNumberText: '',
    familyHeadName: '',
    religion: '',
    caste: ''
  });
  
  const [pdfOptions, setPdfOptions] = useState([]);

  // ✅ CRITICAL: Update byOperator when userId changes
  useEffect(() => {
    if (userId) {
      setFormData(prev => ({
        ...prev,
        byOperator: userId
      }));
    }
  }, [userId]);

  const handleMemberDataChange = (memberId, field, value) => {
    setMemberData(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        [field]: value
      }
    }));
  };

  const handleVillageData = async (e) => {
    e.preventDefault();
    if (!formData.gaonCode) {
      alert('कृपया गाँव कोड डालें!');
      return;
    }

    try {
      const params = new URLSearchParams({ gaonCode: formData.gaonCode });
      const response = await api.get(`/gaon/?${params.toString()}`);
      const data = response.data;

      setFormData(prev => ({
        ...prev,
        zilaCode: data.zilaCode || '',
        zila: data.zila || '',
        tehsilCode: data.tehsilCode || '',
        tehsil: data.tehsil || '',
        blockCode: data.blockCode || '',
        block: data.block || '',
        sabhaCode: data.sabhaCode || '',
        sabha: data.sabha || '',
        gaon: data.gaon || ''
      }));

      const options = [];
      const numRegisters = parseInt(data.noOfRegisters) || 0;
      for (let i = 1; i <= numRegisters; i++) {
        options.push(i);
      }
      setPdfOptions(options);

      if (onGaonCodeChange) {
        onGaonCodeChange(formData.gaonCode);
      }
    } catch (error) {
      console.error('Error fetching village data:', error);
      
      if (error.response?.status === 404) {
        alert('यह गाँव कोड मौजूद नहीं है!');
      } else if (error.response?.status === 500) {
        alert('सर्वर में त्रुटि हुई। कृपया बाद में पुनः प्रयास करें।');
      } else if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('कृपया सही गाँव कोड डालें!');
      }
      
      setFormData(prev => ({
        ...prev,
        zilaCode: '',
        zila: '',
        tehsilCode: '',
        tehsil: '',
        blockCode: '',
        block: '',
        sabhaCode: '',
        sabha: '',
        gaon: ''
      }));
      setPdfOptions([]);
      
      if (onGaonCodeChange) {
        onGaonCodeChange('');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ CRITICAL: Validate byOperator exists
    if (!formData.byOperator) {
      alert('Error: User ID missing. Please refresh and try again.');
      console.error('❌ byOperator is missing:', formData.byOperator);
      return;
    }
    
    // ✅ Validate pages
    if (parseInt(formData.fromPage) > parseInt(formData.toPage)) {
      alert('From Page, To Page से छोटा या बराबर होना चाहिए!');
      return;
    }
    
    setLoading(true);

    const pdfNo = parseInt(formData.pdfNo);
    const fromPage = parseInt(formData.fromPage);
    const toPage = parseInt(formData.toPage);

    // ✅ Build payload with explicit byOperator
    const allMembers = familyMembers.map((memberIndex, idx) => ({
      // Family-level fields from formData
      gaonCode: formData.gaonCode,
      zilaCode: formData.zilaCode,
      zila: formData.zila,
      tehsilCode: formData.tehsilCode,
      tehsil: formData.tehsil,
      blockCode: formData.blockCode,
      block: formData.block,
      sabhaCode: formData.sabhaCode,
      sabha: formData.sabha,
      gaon: formData.gaon,
      panchayat: formData.panchayat,
      houseNumberNum: formData.houseNumberNum,
      houseNumberText: formData.houseNumberText,
      familyHeadName: formData.familyHeadName,
      religion: formData.religion,
      caste: formData.caste,
      
      // ✅ CRITICAL: Explicitly include byOperator
      byOperator: formData.byOperator,
      
      // Member-specific fields
      memberName: memberData[memberIndex]?.memberName || '',
      fatherOrHusbandName: memberData[memberIndex]?.fatherOrHusbandName || '',
      gender: memberData[memberIndex]?.gender || '',
      dob: memberData[memberIndex]?.dob || '1900-01-01',
      business: memberData[memberIndex]?.business || '',
      literacy: memberData[memberIndex]?.literacy || '',
      qualification: memberData[memberIndex]?.qualification || '',
      leavingDate: memberData[memberIndex]?.leavingDate || '',
      reason: memberData[memberIndex]?.reason || '',
      desc: memberData[memberIndex]?.desc || '',
      
      // Member sequence
      memberSequence: memberIndex,
      
      // PDF info (only for first member)
      pdfNo: idx === 0 ? pdfNo : null,
      fromPage: idx === 0 ? fromPage : null,
      toPage: idx === 0 ? toPage : null
    }));

    console.log('📊 Data being sent to API:', JSON.stringify(allMembers, null, 2));

    try {
      const response = await api.post('/insertFamilyMember/', allMembers);
      console.log('✅ API Response:', response);
      console.log('✅ Response data:', response.data);
      console.log('✅ Response status:', response.status);
      
      // ✅ FIX: Check for 200/201 status instead of response.data
      if (response.status === 200 || response.status === 201) {
        onSuccess();
        resetForm();
      } else {
        onError('Error while saving data!');
      }
    } catch (error) {
      console.error('Error saving family data:', error);
      
      if (error.response?.data?.detail) {
        onError(`Error: ${error.response.data.detail}`);
      } else if (error.response?.data?.message) {
        onError(`Error: ${error.response.data.message}`);
      } else {
        onError('Error while saving data!');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFamilyMembers([1]);
    setMemberData({ 1: {} });
    
    setFormData(prev => ({
      byOperator: prev.byOperator,  // Keep byOperator
      gaonCode: prev.gaonCode,
      zilaCode: prev.zilaCode,
      zila: prev.zila,
      tehsilCode: prev.tehsilCode,
      tehsil: prev.tehsil,
      blockCode: prev.blockCode,
      block: prev.block,
      sabhaCode: prev.sabhaCode,
      sabha: prev.sabha,
      gaon: prev.gaon,
      panchayat: prev.panchayat,
      pdfNo: '',
      fromPage: '',
      toPage: '',
      houseNumberNum: '',
      houseNumberText: '',
      familyHeadName: '',
      religion: '',
      caste: ''
    }));
  };

  const addMember = (e) => {
    e.preventDefault();
    const newMemberId = Math.max(...familyMembers) + 1;
    setFamilyMembers(prev => [...prev, newMemberId]);
    
    setMemberData(prev => ({
      ...prev,
      [newMemberId]: {
        memberName: '',
        fatherOrHusbandName: '',
        gender: '',
        dob: '1900-01-01',
        business: '',
        literacy: '',
        qualification: '',
        leavingDate: '',
        reason: '',
        desc: ''
      }
    }));
  };

  const removeMember = (e) => {
    e.preventDefault();
    if (familyMembers.length > 1) {
      const lastMemberId = familyMembers[familyMembers.length - 1];
      setFamilyMembers(prev => prev.slice(0, -1));
      
      setMemberData(prev => {
        const newData = { ...prev };
        delete newData[lastMemberId];
        return newData;
      });
    }
  };

  return (
    <div className="subContainer">
      <h4>परिवार रजिस्टर डाटा एंट्री फॉर्म</h4>
      
      <form id="familyForm" onSubmit={handleSubmit}>
        {/* Village Information Section */}
        <div className="normalForm">
          <div style={{ display: 'none' }}>
            <label htmlFor="byOperator">Operator ID <span className="required">*</span></label>
            <input 
              type="text" 
              id="byOperator" 
              value={formData.byOperator || ''} 
              disabled 
            />
          </div>

          <div>
            <label htmlFor="gaonCode">गाँव कोड <span className="required">*</span></label>
            <input
              type="number"
              id="gaonCode"
              value={formData.gaonCode || ''}
              onChange={(e) => setFormData({ ...formData, gaonCode: e.target.value })}
              required
            />
          </div>

          <div className="actionButtons">
            <button id="villageBtn" onClick={handleVillageData}>
              गांव का डाटा पाएं
            </button>
          </div>

          <div></div>

          <div>
            <label htmlFor="zila">जनपद <span className="required">*</span></label>
            <input 
              type="text" 
              id="zila" 
              value={formData.zila || ''} 
              disabled 
            />
          </div>

          <div>
            <label htmlFor="tehsil">तहसील <span className="required">*</span></label>
            <input 
              type="text" 
              id="tehsil" 
              value={formData.tehsil || ''} 
              disabled 
            />
          </div>

          <div>
            <label htmlFor="block">ब्लाक <span className="required">*</span></label>
            <input 
              type="text" 
              id="block" 
              value={formData.block || ''} 
              disabled 
            />
          </div>

          <div>
            <label htmlFor="sabha">गाँव सभा <span className="required">*</span></label>
            <input 
              type="text" 
              id="sabha" 
              value={formData.sabha || ''} 
              disabled 
            />
          </div>

          <div>
            <label htmlFor="gaon">गाँव <span className="required">*</span></label>
            <input 
              type="text" 
              id="gaon" 
              value={formData.gaon || ''} 
              disabled 
            />
          </div>

          <div>
            <label htmlFor="panchayat">न्याय पंचायत</label>
            <input
              type="text"
              id="panchayat"
              value={formData.panchayat || ''}
              onChange={(e) => setFormData({ ...formData, panchayat: e.target.value })}
            />
          </div>
        </div>

        <hr />

        <h4>परिवार की डेटा एन्ट्री</h4>
        <div className="normalForm">
          <div>
            <label htmlFor="pdfNo">PDF Number <span className="required">*</span></label>
            <select
              id="pdfNo"
              value={formData.pdfNo || ''}
              onChange={(e) => setFormData({ ...formData, pdfNo: e.target.value })}
              required
            >
              <option value="" disabled>Select PDF No.</option>
              {pdfOptions.map(num => (
                <option key={num} value={num}>{num}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="fromPage">From Page <span className="required">*</span></label>
            <input
              type="number"
              id="fromPage"
              min="1"
              value={formData.fromPage || ''}
              onChange={(e) => setFormData({ ...formData, fromPage: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="toPage">To Page <span className="required">*</span></label>
            <input
              type="number"
              id="toPage"
              min="1"
              value={formData.toPage || ''}
              onChange={(e) => setFormData({ ...formData, toPage: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="houseNumberNum">मकान नम्बर (अंकों में) <span className="required">*</span></label>
            <input
              type="number"
              id="houseNumberNum"
              value={formData.houseNumberNum || ''}
              onChange={(e) => setFormData({ ...formData, houseNumberNum: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="houseNumberText">मकान नम्बर (अक्षरों में)</label>
            <input
              type="text"
              id="houseNumberText"
              value={formData.houseNumberText || ''}
              onChange={(e) => setFormData({ ...formData, houseNumberText: e.target.value })}
            />
          </div>

          <div>
            <label htmlFor="familyHeadName">परिवार के प्रमुख का नाम <span className="required">*</span></label>
            <input
              type="text"
              id="familyHeadName"
              value={formData.familyHeadName || ''}
              onChange={(e) => setFormData({ ...formData, familyHeadName: e.target.value })}
              required
            />
          </div>

          <div>
            <label htmlFor="religion">धर्म <span className="required">*</span></label>
            <select
              id="religion"
              value={formData.religion || ''}
              onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
              required
            >
              <option value="" disabled>कृपया धर्म का चयन करें</option>
              <option value="हिन्दू">हिन्दू</option>
              <option value="मुस्लिम">मुस्लिम</option>
              <option value="ईसाई">ईसाई</option>
              <option value="सिख">सिख</option>
              <option value="बौद्ध">बौद्ध</option>
              <option value="जैन">जैन</option>
              <option value="अन्य">अन्य</option>
            </select>
          </div>

          <div>
            <label htmlFor="caste">जाति</label>
            <input
              type="text"
              id="caste"
              value={formData.caste || ''}
              onChange={(e) => setFormData({ ...formData, caste: e.target.value })}
            />
          </div>
        </div>

        {familyMembers.map((memberIndex) => (
          <FamilyMemberForm 
            key={memberIndex} 
            memberIndex={memberIndex}
            data={memberData[memberIndex]}
            onChange={handleMemberDataChange}
          />
        ))}

        <div className="actionButtons">
          <button id="newMemberBtn" onClick={addMember}>
            <svg width="16" height="17" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.129 7.984v1.032a.392.392 0 0 1-.387.387H8.903v2.839a.392.392 0 0 1-.387.387H7.484a.373.373 0 0 1-.387-.387V9.403H4.258a.373.373 0 0 1-.387-.387V7.984c0-.194.161-.387.387-.387h2.839V4.758c0-.193.161-.387.387-.387h1.032c.194 0 .387.194.387.387v2.839h2.839c.193 0 .387.193.387.387ZM16 8.5c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8 8 3.58 8 8Zm-1.548 0c0-3.548-2.904-6.452-6.452-6.452A6.45 6.45 0 0 0 1.548 8.5 6.43 6.43 0 0 0 8 14.952 6.45 6.45 0 0 0 14.452 8.5Z" fill="currentColor" />
            </svg>
            नया सदस्य जोड़ें
          </button>

          {familyMembers.length > 1 && (
            <button id="removeMemberBtn" onClick={removeMember}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="16" width="17" viewBox="0 0 330 330">
                <g>
                  <path d="M281.633,48.328C250.469,17.163,209.034,0,164.961,0C120.888,0,79.453,17.163,48.289,48.328   c-64.333,64.334-64.333,169.011,0,233.345C79.453,312.837,120.888,330,164.962,330c44.073,0,85.507-17.163,116.671-48.328   c31.165-31.164,48.328-72.599,48.328-116.672S312.798,79.492,281.633,48.328z M260.42,260.46   C234.922,285.957,201.021,300,164.962,300c-36.06,0-69.961-14.043-95.46-39.54c-52.636-52.637-52.636-138.282,0-190.919   C95,44.042,128.901,30,164.961,30s69.961,14.042,95.459,39.54c25.498,25.499,39.541,59.4,39.541,95.46   S285.918,234.961,260.42,260.46z" />
                  <path d="M254.961,150H74.962c-8.284,0-15,6.716-15,15s6.716,15,15,15h179.999c8.284,0,15-6.716,15-15S263.245,150,254.961,150z" />
                </g>
              </svg>
              सदस्य हटाएं
            </button>
          )}
        </div>

        <br />
        <input type="submit" value="Save" />
      </form>
    </div>
  );
};

export default FamilyEntryForm;