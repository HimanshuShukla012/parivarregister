// src/components/hq/GaonDataTable.jsx
import React from 'react';
import hqService from '../../services/hqService';

const GaonDataTable = ({ data }) => {
  const handleViewPDF = (pdfNo, fromPage, toPage, gaonCode) => {
    hqService.viewPDFPage(pdfNo, fromPage, toPage, gaonCode);
  };

  if (!data || data.length === 0) {
    return null;
  }

  return (
    <div id="gaonResultSection" className="section">
      <div className="section-header">
        <h2 className="section-title">गाँव डेटा</h2>
        <div className="section-line"></div>
      </div>
      <div className="table-container1">
        <table className="gaon-data-table">
          <thead id="gaonTableHead">
            <tr>
              <th>जिला</th>
              <th>तहसील</th>
              <th>ब्लाक</th>
              <th>गाँव सभा</th>
              <th>गाँव कोड</th>
              <th>गाँव</th>
              <th>न्याय पंचायत</th>
              <th>क्रम संख्या</th>
              <th>मकान नम्बर (अंकों में)</th>
              <th>मकान नम्बर (अक्षरों में)</th>
              <th>परिवार के प्रमुख का नाम</th>
              <th>परिवार के सदस्य का नाम</th>
              <th>पिता या पति का नाम</th>
              <th>लिंग</th>
              <th>धर्म</th>
              <th>जाति</th>
              <th>जन्म तिथि</th>
              <th>व्यवसाय</th>
              <th>साक्षरता</th>
              <th>योग्यता</th>
              <th>छोड़ने/मृत्यु दिनांक</th>
              <th>विवरण</th>
              <th>Action(s)</th>
            </tr>
          </thead>
          <tbody id="gaonTableBody">
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.zila || ''}</td>
                <td>{row.tehsil || ''}</td>
                <td>{row.block || ''}</td>
                <td>{row.sabha || ''}</td>
                <td>{row.gaonCode || ''}</td>
                <td>{row.gaon || ''}</td>
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
                <td>{row.dob || ''}</td>
                <td>{row.business || ''}</td>
                <td>{row.literacy || ''}</td>
                <td>{row.qualification || ''}</td>
                <td>{row.leavingDate || ''}</td>
                <td>{row.description || ''}</td>
                <td>
  {(row.serialNo === '1' || row.serialNo === 1) && (
    <button
      className="editBtn"
      onClick={() =>
        handleViewPDF(
          row.pdfNo,
          row.fromPage,
          row.toPage,
          row.gaonCode
        )
      }
    >
      <i className="fas fa-eye"></i> View
    </button>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GaonDataTable;