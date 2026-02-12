// src/components/supervisor/AddRecordModal.jsx
import React, { useState, useEffect } from "react";
import supervisorService from "../../services/supervisorService";

const AddRecordModal = ({ familyData, viewMode, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    common: {
      houseNumberNum: "",
      houseNumberText: "",
      familyHeadName: "",
    },
    newMember: {},
  });

  const today = new Date();
  const maxDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    if (familyData && familyData.length > 0) {
      setFormData({
        common: {
          houseNumberNum: familyData[0].houseNumberNum || "",
          houseNumberText: familyData[0].houseNumberText || "",
          familyHeadName: familyData[0].familyHeadName || "",
        },
        newMember: {
          ...familyData[0],
          serialNo: "",
          memberName: "",
          fatherOrHusbandName: "",
          gender: "",
          religion: "",
          caste: "",
          dob: "",
          business: "",
          literacy: "",
          qualification: "",
          leavingDate: "",
          description: "",
        },
      });
    }
  }, [familyData]);

  const handleMemberChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      newMember: {
        ...prev.newMember,
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const updatedMember = {
        ...formData.newMember,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName,
      };

      const payload = {
        familyData: [{}, updatedMember],
        gaonCode: updatedMember.gaonCode,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName,
      };

      const result =
        viewMode === "rejected"
          ? await supervisorService.addRejectedRecordAfter(payload)
          : await supervisorService.addRecordAfter(payload);

      if (result.success) {
        alert("Saved Successfully!");
        onSave();
      } else {
        alert("Error: " + (result.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Error adding record:", error);
      alert("Error while saving data!");
    }
  };

  const fieldConfig = {
    memberName: {
      label: "परिवार के सदस्य का नाम *",
      type: "text",
      required: true,
    },
    fatherOrHusbandName: { label: "पिता या पति का नाम", type: "text" },
    gender: {
      label: "पुरुष / महिला *",
      type: "select",
      required: true,
      options: ["पुरुष", "महिला", "अन्य"],
    },
    religion: {
      label: "धर्म *",
      type: "select",
      required: true,
      options: ["हिन्दू", "मुस्लिम", "ईसाई", "सिख", "बौद्ध", "जैन", "अन्य"],
    },
    caste: { label: "जाति", type: "text" },
    dob: {
      label: "जन्म तिथि",
      type: "date",
      attributes: { min: "1900-01-01", max: maxDate },
    },
    business: { label: "व्यावसाय", type: "text" },
    literacy: {
      label: "साक्षर या निरक्षर",
      type: "select",
      options: ["साक्षर", "निरक्षर"],
    },
    qualification: {
      label: "योग्यता",
      type: "select",
      options: [
        "<5",
        "5 से 9",
        "10",
        "11",
        "12",
        "ग्रेजुएशन",
        "डिप्लोमा",
        "पोस्ट ग्रेजुएशन",
        "पीएचडी",
      ],
    },
    leavingDate: {
      label: "सर्किल छोड़ देने/ मृत्यु का दिनांक",
      type: "date",
      attributes: { min: "1900-01-01", max: maxDate },
    },
    description: { label: "विवरण", type: "text" },
  };

  return (
    <div
      className="formModal isVisible"
      onClick={(e) => {
        if (e.target.className.includes("formModal")) onClose();
      }}
    >
      <div className="popupModal" style={{ maxWidth: "1000px" }}>
        <button className="close-button" onClick={onClose}>
          X
        </button>

        <h1 style={{ textAlign: "center", marginBottom: "20px" }}>
          परिवार रजिस्टर डाटा एंट्री एडिट फॉर्म
        </h1>

        <form onSubmit={handleSubmit}>
          {/* FAMILY INFO */}
          <div style={familyBox}>
            <h3 style={sectionTitle}>परिवार की सामान्य जानकारी</h3>
            <div className="formGrid">
              <div>
                <label style={labelStyle}>मकान नम्बर (अंकों में) *</label>
                <input
                  type="number"
                  value={formData.common.houseNumberNum}
                  disabled
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>मकान नम्बर (अक्षरों में)</label>
                <input
                  type="text"
                  value={formData.common.houseNumberText}
                  disabled
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>परिवार के प्रमुख का नाम *</label>
                <input
                  type="text"
                  value={formData.common.familyHeadName}
                  disabled
                  style={inputStyle}
                />
              </div>
            </div>
          </div>

          {/* MEMBER HEADER */}
          <div style={memberHeader}>सदस्य #1</div>

          {/* MEMBER FORM */}
          <div style={memberBox}>
            <div className="formGrid">
              {Object.keys(fieldConfig).map((field) => (
                <div key={field}>
                  <label style={labelStyle}>{fieldConfig[field].label}</label>

                  {fieldConfig[field].type === "select" ? (
                    <select
                      value={formData.newMember[field] || ""}
                      onChange={(e) =>
                        handleMemberChange(field, e.target.value)
                      }
                      required={fieldConfig[field].required}
                      style={inputStyle}
                    >
                      <option value="">{fieldConfig[field].label}</option>
                      {fieldConfig[field].options.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={fieldConfig[field].type}
                      value={formData.newMember[field] || ""}
                      onChange={(e) =>
                        handleMemberChange(field, e.target.value)
                      }
                      required={fieldConfig[field].required}
                      {...(fieldConfig[field].attributes || {})}
                      style={inputStyle}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <button type="submit" style={saveBtn}>
            जोड़ें
          </button>
        </form>
      </div>
    </div>
  );
};

/* STYLES */
const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid rgb(221, 221, 221)",
  marginTop: "5px",
};

const labelStyle = {
  display: "block",
  textAlign: "justify",
  fontSize: "14px",
  marginBottom: "2px",
};

const familyBox = {
  padding: "24px",
  borderRadius: "14px",
  background: "#f3f6fb",
  border: "2px solid #cbd5e1",
  marginBottom: "24px",
};

const sectionTitle = {
  textAlign: "center",
  marginBottom: "20px",
  fontWeight: "700",
};

const memberHeader = {
  background: "linear-gradient(90deg,#6a7eea,#7b4bb2)",
  color: "#fff",
  padding: "14px",
  borderRadius: "10px",
  textAlign: "center",
  fontWeight: "700",
  marginBottom: "15px",
};

const memberBox = {
  padding: "24px",
  borderRadius: "14px",
  border: "2px solid #e2e8f0",
  marginBottom: "20px",
};

const saveBtn = {
  display: "block",
  margin: "20px auto",
  padding: "12px 40px",
  background: "linear-gradient(135deg,#667eea,#764ba2)",
  color: "white",
  border: "none",
  borderRadius: "10px",
  fontSize: "1rem",
  fontWeight: "600",
  cursor: "pointer",
};

export default AddRecordModal;
