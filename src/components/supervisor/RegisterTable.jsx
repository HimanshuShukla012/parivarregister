// src/components/supervisor/RegisterTable.jsx
import React from "react";

const RegisterTable = ({
  data,
  viewMode,
  onEdit,
  onAdd,
  onDelete,
  onApprove,
  onViewPDF,
}) => {
  const handleNullDate = (value) => {
    if (!value) return "";
    return value.split("-").reverse().join("-");
  };

  const findFamilyMembers = (index) => {
    const familyData = [data[index]];
    for (
      let i = index + 1;
      i < data.length && String(data[i].serialNo) !== "1";
      i++
    ) {
      familyData.push(data[i]);
    }
    return familyData;
  };

  return (
    
    <div
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        padding: "16px",
        overflowX: "auto",
      }}
    >
      <table
        className="main-table"
        id="gaonTable"
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
        }}
      >
        <thead>
          <tr style={{ background: "#f5f7ff" }}>
            {[
              "क्रम संख्या",
              "मकान नम्बर(अंकों में)",
              "मकान नम्बर (अक्षरों में)",
              "परिवार के प्रमुख का नाम",
              "परिवार के सदस्य का नाम",
              "पिता या पति का नाम",
              "पुरुष या महिला",
              "धर्म",
              "जाति",
              "जन्म तिथि",
              "व्यावसाय",
              "साक्षर या निरक्षर",
              "योग्यता",
              "सर्किल छोड़ देने/ मृत्यु का दिनांक",
              "विवरण",
              "Actions",
              "PDF No.",
              "From Page No.",
              "To Page No.",
              "View/Approve",
            ].map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "10px",
                  textAlign: "left",
                  color: "#333",
                  fontWeight: "600",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {h}
              </th>
            ))}
            {viewMode === "rejected" && <th>Remark</th>}
          </tr>
        </thead>

        <tbody>
          {data.length > 0 ? (
            data.map((row, index) => (
              <tr
  key={index}
  style={{
    borderBottom: "1px solid #eee",
    verticalAlign: "middle",
  }}
>
  <td style={{ padding: "10px 8px", whiteSpace: "nowrap" }}>{row.serialNo || ""}</td>
                <td>{row.houseNumberNum || ""}</td>
                <td>{row.houseNumberText || ""}</td>
                <td>{row.familyHeadName || ""}</td>
                <td>{row.memberName || ""}</td>
                <td>{row.fatherOrHusbandName || ""}</td>
                <td>{row.gender || ""}</td>
                <td>{row.religion || ""}</td>
                <td>{row.caste || ""}</td>
                <td>{handleNullDate(row.dob)}</td>
                <td>{row.business || ""}</td>
                <td>{row.literacy || ""}</td>
                <td>{row.qualification || ""}</td>
                <td>{handleNullDate(row.leavingDate)}</td>
                <td>{row.description || ""}</td>

                {/* ACTIONS */}
                <td style={{ whiteSpace: "nowrap", padding: "8px" }}>
  <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap" }}>
                  {row.status !== "Approved" && (
                    <>
                      {String(row.serialNo) === "1" && (
                        <>
                          <button
                            onClick={() => onAdd(findFamilyMembers(index))}
                            style={btnGreen}
                          >
                            + Add
                          </button>

                          <button
                            onClick={() => onEdit(findFamilyMembers(index))}
                            style={btnBlue}
                          >
                            Edit
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          onDelete(row.id, row.gaonCode, row.serialNo)
                        }
                        style={btnRed}
                      >
                        Delete <i class="fas fa-trash"></i>
                      </button>
                    </>
                  )}
                </div></td>

                <td>{row.pdfNo || ""}</td>
                <td>{row.fromPage || ""}</td>
                <td>{row.toPage || ""}</td>

                <td style={{ whiteSpace: "nowrap", padding: "8px" }}>
  <div style={{ display: "flex", gap: "6px", flexWrap: "nowrap", alignItems: "center" }}>
    {String(row.serialNo) === "1" &&
      row.pdfNo &&
      row.fromPage &&
      row.toPage && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onViewPDF(
                row.pdfNo,
                row.fromPage,
                row.toPage,
                row.gaonCode,
              );
            }}
            style={btnGreen}
          >
            View <i className="fas fa-eye"></i>
          </button>

          {row.status !== "Approved" && (
            <button
              onClick={() => onApprove(row.id, row.gaonCode)}
              style={btnPurple}
            >
              Approve
            </button>
          )}
        </>
      )}

    {String(row.serialNo) === "1" &&
      (!row.pdfNo || !row.fromPage || !row.toPage) && (
        <span style={{ fontSize: "12px", color: "#999" }}>
          Add pdf & page no. first!
        </span>
      )}
  </div>
</td>

                {viewMode === "rejected" && <td>{row.remark || ""}</td>}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={viewMode === "rejected" ? 21 : 20}
                style={{ textAlign: "center", padding: "20px" }}
              >
                No Data Available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

/* BUTTON STYLES */
const baseBtn = {
  border: "none",
  borderRadius: "20px",
  padding: "5px 12px",
  fontSize: "12px",
  cursor: "pointer",
  color: "#fff",
  whiteSpace: "nowrap",
  display: "inline-flex",
  alignItems: "center",
  gap: "4px",
};

const btnGreen = {
  ...baseBtn,
  background: "#22c55e",
};

const btnBlue = {
  ...baseBtn,
  background: "#6366f1",
};

const btnRed = {
  ...baseBtn,
  background: "#ef4444",
};

const btnPurple = {
  ...baseBtn,
  background: "#8b5cf6",
};

export default RegisterTable;
