// src/components/supervisor/RegisterTable.jsx
import React from 'react';

const RegisterTable = ({ data, viewMode, onEdit, onAdd, onDelete, onApprove, onViewPDF }) => {
  const handleNullDate = (value) => {
    if (!value) return '';
    return value.split("-").reverse().join("-");
  };

  const findFamilyMembers = (index) => {
    const familyData = [data[index]];
    for (let i = index + 1; i < data.length && String(data[i].serialNo) !== '1'; i++) {
      familyData.push(data[i]);
    }
    return familyData;
  };

  return (
    <table className="main-table" id="gaonTable">
      <thead id="gaonTableHeader">
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
          {viewMode === 'rejected' && <th>Remark</th>}
        </tr>
      </thead>
      <tbody id="gaonTableBody">
        {data.length > 0 ? (
          data.map((row, index) => (
            <tr key={index}>
              <td>{row.serialNo || ''}</td>
              <td>{row.houseNumberNum || ''}</td>
              <td>{row.houseNumberText || ''}</td>
              <td>{row.familyHeadName || ''}</td>
              <td>{row.memberName || ''}</td>
              <td>{row.fatherOrHusbandName || ''}</td>
              <td>{row.gender || ''}</td>
              <td>{row.religion || ''}</td>
              <td>{row.caste || ''}</td>
              <td>{handleNullDate(row.dob)}</td>
              <td>{row.business || ''}</td>
              <td>{row.literacy || ''}</td>
              <td>{row.qualification || ''}</td>
              <td>{handleNullDate(row.leavingDate)}</td>
              <td>{row.description || ''}</td>
              <td>
                {row.status !== 'Approved' && (
                  <>
                    {String(row.serialNo) === '1' && (
                      <>
                        <button 
                          onClick={() => onAdd(findFamilyMembers(index))}
                          title="Add Member"
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                        &nbsp;
                        <button 
                          className="editBtn" 
                          onClick={() => onEdit(findFamilyMembers(index))}
                          title="Edit Family"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        &nbsp;
                      </>
                    )}
                    <button 
                      onClick={() => onDelete(row.id, row.gaonCode, row.serialNo)}
                      title="Delete Record"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </>
                )}
              </td>
              <td>{row.pdfNo || ''}</td>
              <td>{row.fromPage || ''}</td>
              <td>{row.toPage || ''}</td>
              <td>
                {String(row.serialNo) === '1' && row.pdfNo && row.fromPage && row.toPage && (
                  <>
                    <button 
                      onClick={() => onViewPDF(row.pdfNo, row.fromPage, row.toPage, row.gaonCode)}
                      title="View PDF"
                    >
                      <i className="fas fa-eye"></i>
                    </button>
                    &nbsp;
                    {row.status !== 'Approved' && (
                      <button 
                        onClick={() => onApprove(row.id, row.gaonCode)}
                        title="Approve Family"
                      >
                        <i className="fas fa-check"></i>
                      </button>
                    )}
                  </>
                )}
                {String(row.serialNo) === '1' && (!row.pdfNo || !row.fromPage || !row.toPage) && (
                  <span style={{ fontSize: '0.85rem', color: '#999' }}>
                    Add pdf & page no. first!
                  </span>
                )}
              </td>
              {viewMode === 'rejected' && <td>{row.remark || ''}</td>}
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={viewMode === 'rejected' ? 21 : 20} style={{ border: 'none' }}>
              No Data Available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default RegisterTable;