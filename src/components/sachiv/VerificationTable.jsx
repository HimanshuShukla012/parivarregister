// src/components/sachiv/VerificationTable.jsx
import React from 'react';

const VerificationTable = ({ data, onApprove, onReject, onViewPDF, onEdit, villageIndex }) => {  const handleNullDate = (value) => {
    if (!value) return '';
    return value.split("-").reverse().join("-");
  };

  // Filter only unverified records
  const unverifiedData = data.filter(row => !row.status);

  return (
    <div className="table-container">
      <table className="main-table" id="gaonTable">
        <thead id="gaonTableHeader">
          <tr>
            <th>जनपद</th>
            <th>तहसील</th>
            <th>ब्लाक</th>
            <th>गाँव सभा</th>
            <th>गाँव</th>
            <th>गाँव कोड</th>
            <th>न्याय पंचायत</th>
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
            <th>Action(s)</th>
          </tr>
        </thead>
        <tbody id="gaonTableBody">
          {unverifiedData.length > 0 ? (
            unverifiedData.map((row, index) => (
              <tr key={index}>
                <td>{row.zila || ''}</td>
                <td>{row.tehsil || ''}</td>
                <td>{row.block || ''}</td>
                <td>{row.sabha || ''}</td>
                <td>{row.gaon || ''}</td>
                <td>{row.gaonCode || ''}</td>
                <td>{row.panchayat || ''}</td>
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
                  {String(row.serialNo) === '1' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {!row.status ? (
                        // Unapproved family - show Approve/Reject buttons
                        <>
                          <button
                            style={{ backgroundColor: '#10DA00', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            onClick={() => onApprove(row.id, row.gaonCode, villageIndex)}
                          >
                            <i className="fas fa-check-circle"></i>&nbsp; Approve
                          </button>
                          <button
  style={{ backgroundColor: '#ff250e', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
  onClick={() => {
    console.log('🔴 Reject button clicked!');
    console.log('Row ID:', row.id);
    console.log('Gaon Code:', row.gaonCode);
    console.log('onReject function:', onReject);
    onReject(row.id, row.gaonCode);
  }}
>
  <i className="fas fa-times-circle"></i>&nbsp; Reject
</button>
                        </>
                      ) : (
                        // Approved family - show Edit button
                        <button
                          style={{ backgroundColor: '#667eea', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          onClick={() => {
                            // Find all family members for this family
                            const familyData = data.filter(d => 
                              d.houseNumberNum === row.houseNumberNum && 
                              d.familyHeadName === row.familyHeadName
                            );
                            // You need to pass onEdit prop from parent
                            if (window.onEditFamily) {
                              window.onEditFamily(familyData);
                            }
                          }}
                        >
                          <i className="fas fa-edit"></i>&nbsp; Edit
                        </button>
                      )}
<button
  className="editBtn"
  style={{ backgroundColor: '#f59e0b', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
  onClick={() => {
    const familyData = data.filter(d => 
      d.houseNumberNum === row.houseNumberNum && 
      d.familyHeadName === row.familyHeadName
    );
    onViewPDF(row.pdfNo, row.fromPage, row.toPage, row.gaonCode, familyData);
  }}
>
  <i className="fas fa-eye"></i>&nbsp; View PDF
</button>
                      <button
  style={{ backgroundColor: '#667eea', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
  onClick={() => {
    const familyData = data.filter(d => 
      d.houseNumberNum === row.houseNumberNum && 
      d.familyHeadName === row.familyHeadName
    );
    onEdit(familyData);
  }}
>
  <i className="fas fa-edit"></i>&nbsp; Edit
</button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="23" style={{ border: 'none' }}>No Data Available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VerificationTable;