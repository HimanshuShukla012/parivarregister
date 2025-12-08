import React, { useState } from 'react';
import api from '../../services/api';
import EditFamilyModal from './EditFamilyModal';

const DataTablePanel = ({ 
  gaonCode, 
  setGaonCode, 
  onGetVillageData, 
  tableData, 
  setTableData,
  onSuccess,
  onError,
  setLoading,
  showPDF 
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleNullDate = (value) => {
    if (!value) return '';
    return value.split('-').reverse().join('-');
  };

  const viewPDFPage = (pdfNo, fromPage, toPage, gaonCode) => {
    if (!pdfNo || !gaonCode) {
      alert("Both 'pdfNo' and 'gaonCode' are required.");
      return;
    }

    let url = `/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;

    window.open(url, '_blank');
  };

  const handleEdit = (index) => {
    const familyData = [tableData[index]];
    
    // Collect all family members
    for (let i = index + 1; i < tableData.length && tableData[i]['serialNo'] !== '1'; i++) {
      familyData.push(tableData[i]);
    }

    setEditData(familyData);
    setShowEditModal(true);
  };

  const checkDuplicate = (index) => {
    const row = tableData[index];
    const key = `${row['gaonCode']}-${row['houseNumberNum']}-${row['houseNumberText']}-${row['memberName']}-${row['fatherOrHusbandName']}`;
    
    for (let i = 0; i < index; i++) {
      const prevRow = tableData[i];
      const prevKey = `${prevRow['gaonCode']}-${prevRow['houseNumberNum']}-${prevRow['houseNumberText']}-${prevRow['memberName']}-${prevRow['fatherOrHusbandName']}`;
      if (key === prevKey) return true;
    }
    return false;
  };

  return (
    <div className="subContainer" style={{ width: showPDF ? '50%' : '100%' }}>
      <form onSubmit={onGetVillageData} id="getPendingRegForm">
        <label htmlFor="gaonCode1">गाँव कोड: <span className="required">*</span>&nbsp;</label>
        <input
          type="number"
          id="gaonCode1"
          value={gaonCode}
          onChange={(e) => setGaonCode(e.target.value)}
          required
          style={{ width: '40%' }}
        />
        <button type="submit">गांव का डाटा पाएं</button>
      </form>

      <table className="main-table" id="gaonTable">
        <thead>
          <tr>
            <th>क्रम संख्या</th>
            <th>मकान नम्बर(अंकों में)</th>
            <th>मकान नम्बर (अक्षरों में)</th>
            <th>परिवार के प्रमुख का नाम</th>
            <th>परिवार के सदस्य का नाम</th>
            <th>पिता या पति का नाम</th>
            <th>पुरुष या महिला</th>
            <th>धर्म</th>
            <th>जाति</th>
            <th>जन्म तिथि</th>
            <th>व्यावसाय</th>
            <th>साक्षर या निरक्षर</th>
            <th>योग्यता</th>
            <th>सर्किल छोड़ देने/ मृत्यु का दिनांक</th>
            <th>विवरण</th>
            <th>Actions</th>
            <th>PDF No.</th>
            <th>From Page No.</th>
            <th>To Page No.</th>
            <th>View/Approve</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length > 0 ? (
            tableData.map((row, index) => (
              <tr 
                key={index} 
                style={{ backgroundColor: checkDuplicate(index) ? 'red' : '' }}
              >
                <td>{row['serialNo']}</td>
                <td>{row['houseNumberNum']}</td>
                <td>{row['houseNumberText']}</td>
                <td>{row['familyHeadName']}</td>
                <td>{row['memberName']}</td>
                <td>{row['fatherOrHusbandName']}</td>
                <td>{row['gender']}</td>
                <td>{row['religion']}</td>
                <td>{row['caste']}</td>
                <td>{handleNullDate(row['dob'])}</td>
                <td>{row['business']}</td>
                <td>{row['literacy']}</td>
                <td>{row['qualification']}</td>
                <td>{handleNullDate(row['leavingDate'])}</td>
                <td>{row['description']}</td>
                <td>
                  {row['status'] !== 'Approved' && row['serialNo'] === '1' && (
                    <button className="editBtn" onClick={() => handleEdit(index)}>
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                </td>
                <td>{row['pdfNo'] || ''}</td>
                <td>{row['fromPage'] || ''}</td>
                <td>{row['toPage'] || ''}</td>
                <td>
                  {row['serialNo'] === '1' && row['pdfNo'] && row['fromPage'] && row['toPage'] ? (
                    <button onClick={() => viewPDFPage(row['pdfNo'], row['fromPage'], row['toPage'], row['gaonCode'])}>
                      <i className="fas fa-eye"></i>
                    </button>
                  ) : row['serialNo'] === '1' && (!row['pdfNo'] || !row['fromPage'] || !row['toPage']) ? (
                    'Add pdf & page no. first!'
                  ) : null}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="20" style={{ textAlign: 'center' }}>
                कोई डेटा उपलब्ध नहीं है
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {showEditModal && editData && (
        <EditFamilyModal
          familyData={editData}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            setShowEditModal(false);
            onSuccess();
            onGetVillageData({ preventDefault: () => {} });
          }}
          onError={onError}
          setLoading={setLoading}
        />
      )}
    </div>
  );
};

export default DataTablePanel;