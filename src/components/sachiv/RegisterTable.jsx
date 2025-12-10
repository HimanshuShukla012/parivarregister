// src/components/sachiv/RegisterTable.jsx
import React, { useState, useEffect } from 'react';

const RegisterTable = ({ data, status, onEdit, searchTerm = '' }) => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    if (data && data.length > 0) {
      // Sort data by family groups
      const sortedData = [...data].sort((a, b) => {
        const keyA = (a.houseNumberNum || '') + (a.houseNumberText || '') + (a.familyHeadName || '');
        const keyB = (b.houseNumberNum || '') + (b.houseNumberText || '') + (b.familyHeadName || '');
        
        if (keyA === keyB) {
          return parseInt(a.serialNo) - parseInt(b.serialNo);
        }
        return keyA.localeCompare(keyB);
      });

      setTableData(sortedData);
    } else {
      setTableData([]);
    }
  }, [data]);

  const handleNullDate = (value) => {
    if (!value) return '';
    return value.split("-").reverse().join("-");
  };

  const checkErrors = (row, index) => {
    const excludedFields = ['panchayat', 'qualification', 'houseNumberText', 'caste', 'remark', 'pdfNo', 'fromPage', 'toPage', 'description'];
    const errors = [];

    Object.keys(row).forEach(key => {
      if (!excludedFields.includes(key)) {
        // Special handling for leavingDate - only required if description is not blank
        if (key === 'leavingDate') {
          if (row.description && row.description.toString().trim() !== '') {
            if (!row[key] || row[key].toString().trim() === '') {
              errors.push(key);
            } else {
              const sp = row[key].split('-');
              if (sp[1] === '01' && sp[2] === '01') {
                errors.push(`${key}-date`);
              }
            }
          }
        } else {
          // Normal validation for other fields
          if (!row[key] || row[key].toString().trim() === '') {
            errors.push(key);
          } else if (key === 'dob') {
            const sp = row[key].split('-');
            if (sp[1] === '01' && sp[2] === '01') {
              errors.push(`${key}-date`);
            }
          }
        }
      }
    });

    return errors;
  };

  const getCellStyle = (row, field, index) => {
    const errors = checkErrors(row, index);
    
    if (errors.includes(field)) {
      return { backgroundColor: 'red', color: 'white' };
    }
    if (errors.includes(`${field}-date`)) {
      return { backgroundColor: 'yellow', color: 'black' };
    }
    return {};
  };

  // Identify conflicting house numbers
  const getHouseConflicts = () => {
    const houseMap = new Map();
    const conflicts = new Set();

    tableData.forEach(row => {
      if (row.status) {
        const houseKey = (row.houseNumberNum || '') + (row.houseNumberText || '');
        const familyHead = row.familyHeadName || '';

        if (houseMap.has(houseKey)) {
          if (houseMap.get(houseKey) !== familyHead) {
            conflicts.add(houseKey);
          }
        } else {
          houseMap.set(houseKey, familyHead);
        }
      }
    });

    return conflicts;
  };

  const houseConflicts = getHouseConflicts();

  const getRowStyle = (row) => {
    const houseKey = (row.houseNumberNum || '') + (row.houseNumberText || '');
    if (houseConflicts.has(houseKey)) {
      return { color: 'cornflowerblue' };
    }
    return {};
  };

  const filteredData = tableData.filter(row => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return Object.values(row).some(val => 
      val && val.toString().toLowerCase().includes(searchLower)
    );
  });

  const handleEditClick = (index) => {
    // Find the current row in filteredData
    const currentRow = filteredData[index];
    
    // Find this row in the original tableData
    const fullIndex = tableData.findIndex(r => 
      r.id === currentRow.id && 
      r.gaonCode === currentRow.gaonCode && 
      r.houseNumberNum === currentRow.houseNumberNum &&
      r.familyHeadName === currentRow.familyHeadName &&
      String(r.serialNo) === String(currentRow.serialNo)
    );
    
    if (fullIndex === -1) return;
    
    // Find all family members starting from this index
    const familyData = [tableData[fullIndex]];
    for (let i = fullIndex + 1; i < tableData.length && String(tableData[i].serialNo) !== '1'; i++) {
      familyData.push(tableData[i]);
    }
    onEdit(familyData);
  };

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
            {status !== 'completed' && <th id="editCol">Action(s)</th>}
          </tr>
        </thead>
        <tbody id="gaonTableBody">
          {filteredData.length > 0 ? (
            (() => {
              console.log('=== RegisterTable Debug ===');
              console.log('Total filteredData rows:', filteredData.length);
              console.log('Rows with status:', filteredData.filter(r => r.status).length);
              console.log('Rows with serialNo=1:', filteredData.filter(r => String(r.serialNo) === '1').length);
              console.log('Rows with BOTH status AND serialNo=1:', filteredData.filter(r => r.status && String(r.serialNo) === '1').length);
              
              // Show first few rows
              filteredData.slice(0, 5).forEach((r, i) => {
                console.log(`Row ${i}:`, {
                  serialNo: r.serialNo,
                  status: r.status,
                  familyHead: r.familyHeadName
                });
              });
              
              return null;
            })(),
            filteredData.map((row, index) => {
              if (!row.status) return null;
              
              // Debug: Log when serialNo is 1
              if (String(row.serialNo) === '1') {
                console.log('Family Head Row:', {
                  serialNo: row.serialNo,
                  status: row.status,
                  statusType: typeof row.status,
                  statusValue: JSON.stringify(row.status),
                  familyHead: row.familyHeadName,
                  houseNum: row.houseNumberNum
                });
              }
              
              return (
                <tr key={index} style={getRowStyle(row)}>
                  <td style={getCellStyle(row, 'zila', index)}>{row.zila || ''}</td>
                  <td style={getCellStyle(row, 'tehsil', index)}>{row.tehsil || ''}</td>
                  <td style={getCellStyle(row, 'block', index)}>{row.block || ''}</td>
                  <td style={getCellStyle(row, 'sabha', index)}>{row.sabha || ''}</td>
                  <td style={getCellStyle(row, 'gaon', index)}>{row.gaon || ''}</td>
                  <td style={getCellStyle(row, 'gaonCode', index)}>{row.gaonCode || ''}</td>
                  <td>{row.panchayat || ''}</td>
                  <td style={getCellStyle(row, 'serialNo', index)}>{row.serialNo || ''}</td>
                  <td style={getCellStyle(row, 'houseNumberNum', index)}>{row.houseNumberNum || ''}</td>
                  <td>{row.houseNumberText || ''}</td>
                  <td style={getCellStyle(row, 'familyHeadName', index)}>{row.familyHeadName || ''}</td>
                  <td style={getCellStyle(row, 'memberName', index)}>{row.memberName || ''}</td>
                  <td style={getCellStyle(row, 'fatherOrHusbandName', index)}>{row.fatherOrHusbandName || ''}</td>
                  <td style={getCellStyle(row, 'gender', index)}>{row.gender || ''}</td>
                  <td style={getCellStyle(row, 'religion', index)}>{row.religion || ''}</td>
                  <td>{row.caste || ''}</td>
                  <td style={getCellStyle(row, 'dob', index)}>{handleNullDate(row.dob)}</td>
                  <td style={getCellStyle(row, 'business', index)}>{row.business || ''}</td>
                  <td style={getCellStyle(row, 'literacy', index)}>{row.literacy || ''}</td>
                  <td>{row.qualification || ''}</td>
                  <td style={getCellStyle(row, 'leavingDate', index)}>{handleNullDate(row.leavingDate)}</td>
                  <td style={getCellStyle(row, 'description', index)}>{row.description || ''}</td>
                  {status !== 'completed' && (
                    <td>
                      {String(row.serialNo) === '1' && (
                        <>
                          {(row.status === 'Approved' || row.status === 'approved') && (
                            <button 
                              className="editBtn" 
                              onClick={() => handleEditClick(index)}
                              style={{
                                backgroundColor: '#667eea',
                                color: 'white',
                                padding: '8px 16px',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                              }}
                            >
                              <i className="fas fa-edit"></i> एडिट
                            </button>
                          )}
                          {(row.status === 'Rejected' || row.status === 'rejected') && (
                            <span style={{ color: '#dc2626', fontWeight: '600', fontSize: '0.875rem' }}>
                              Rejected! (Returned to supervisor)
                            </span>
                          )}
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })
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

export default RegisterTable;