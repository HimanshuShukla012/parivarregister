// src/components/sachiv/EditFamilyModal.jsx
import React, { useState, useEffect } from "react";
import sachivService from "../../services/sachivService";

const EditFamilyModal = ({ familyData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    common: {
      houseNumberNum: "",
      houseNumberText: "",
      familyHeadName: "",
    },
    members: [],
  });

  useEffect(() => {
    if (familyData && familyData.length > 0) {
      setFormData({
        common: {
          houseNumberNum: familyData[0].houseNumberNum || "",
          houseNumberText: familyData[0].houseNumberText || "",
          familyHeadName: familyData[0].familyHeadName || "",
        },
        members: familyData.map((member) => ({ ...member })),
      });
    }
  }, [familyData]);

  const handleCommonChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      common: {
        ...prev.common,
        [field]: value,
      },
    }));
  };

  const handleMemberChange = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      members: prev.members.map((member, i) =>
        i === index ? { ...member, [field]: value } : member,
      ),
    }));
  };

  const handleSubmit = async () => {
    try {
      const updatedFamilyData = formData.members.map((member) => ({
        ...member,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName,
      }));

      const payload = {
        familyData: [{}, ...updatedFamilyData],
        gaonCode: updatedFamilyData[0].gaonCode,
        houseNumberNum: formData.common.houseNumberNum,
        houseNumberText: formData.common.houseNumberText,
        familyHeadName: formData.common.familyHeadName,
      };

      const result = await sachivService.updateAndInsert(payload);

      if (result) {
        alert("Saved Successfully!");
        onSave();
      } else {
        alert("Error while saving data!");
      }
    } catch (error) {
      console.error("Error saving family data:", error);
      alert("Error while saving data!");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "1200px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "24px 32px",
            borderRadius: "16px 16px 0 0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              color: "white",
              margin: 0,
              fontSize: "1.5rem",
              fontWeight: "700",
            }}
          >
            परिवार रजिस्टर डाटा एंट्री एडिट फॉर्म
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "1.25rem",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) =>
              (e.target.style.background = "rgba(255, 255, 255, 0.3)")
            }
            onMouseLeave={(e) =>
              (e.target.style.background = "rgba(255, 255, 255, 0.2)")
            }
          >
            ×
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          style={{
            padding: "32px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {/* Common Fields Section */}
          <div
            style={{
              marginBottom: "32px",
              padding: "24px",
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
              borderRadius: "12px",
              border: "2px solid #cbd5e1",
            }}
          >
            <h3
              style={{
                margin: "0 0 20px 0",
                color: "#1e293b",
                fontSize: "1.1rem",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  width: "32px",
                  height: "32px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "1rem",
                }}
              >
                🏠
              </span>
              परिवार की सामान्य जानकारी
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "20px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  मकान नम्बर (अंकों में){" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="number"
                  value={formData.common.houseNumberNum}
                  onChange={(e) =>
                    handleCommonChange("houseNumberNum", e.target.value)
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  मकान नम्बर (अक्षरों में)
                </label>
                <input
                  type="text"
                  value={formData.common.houseNumberText}
                  onChange={(e) =>
                    handleCommonChange("houseNumberText", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    color: "#475569",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  परिवार के प्रमुख का नाम{" "}
                  <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <input
                  type="text"
                  value={formData.common.familyHeadName}
                  onChange={(e) =>
                    handleCommonChange("familyHeadName", e.target.value)
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    border: "2px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    transition: "all 0.3s ease",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                  onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                />
              </div>
            </div>
          </div>

          {/* Members Section */}
          {formData.members.map((member, index) => (
            <div
              key={index}
              style={{
                marginBottom: "24px",
                padding: "24px",
                background: "white",
                borderRadius: "12px",
                border: "2px solid #e2e8f0",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <h4
                style={{
                  margin: "0 0 20px 0",
                  color: "white",
                  fontSize: "1rem",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "28px",
                    height: "28px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  {index + 1}
                </span>
                सदस्य #{index + 1}
              </h4>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                <div>
                  <label style={labelStyle}>
                    परिवार के सदस्य का नाम{" "}
                    <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <input
                    type="text"
                    value={member.memberName || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "memberName", e.target.value)
                    }
                    required
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>पिता या पति का नाम</label>
                  <input
                    type="text"
                    value={member.fatherOrHusbandName || ""}
                    onChange={(e) =>
                      handleMemberChange(
                        index,
                        "fatherOrHusbandName",
                        e.target.value,
                      )
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    पुरुष / महिला <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={member.gender || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "gender", e.target.value)
                    }
                    required
                    style={selectStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  >
                    <option value="">कृपया लिंग का चयन करें</option>
                    <option value="पुरुष">पुरुष</option>
                    <option value="महिला">महिला</option>
                    <option value="अन्य">अन्य</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    धर्म <span style={{ color: "#ef4444" }}>*</span>
                  </label>
                  <select
                    value={member.religion || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "religion", e.target.value)
                    }
                    required
                    style={selectStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  >
                    <option value="">कृपया धर्म का चयन करें</option>
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
                  <label style={labelStyle}>जाति</label>
                  <input
                    type="text"
                    value={member.caste || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "caste", e.target.value)
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>जन्म तिथि</label>
                  <input
                    type="date"
                    value={member.dob || "1900-01-01"}
                    onChange={(e) =>
                      handleMemberChange(index, "dob", e.target.value)
                    }
                    min="1900-01-01"
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>व्यावसाय</label>
                  <input
                    type="text"
                    value={member.business || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "business", e.target.value)
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>साक्षर या निरक्षर</label>
                  <select
                    value={member.literacy || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "literacy", e.target.value)
                    }
                    style={selectStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  >
                    <option value="">
                      कृपया साक्षर या निरक्षर का चयन करें
                    </option>
                    <option value="साक्षर">साक्षर</option>
                    <option value="निरक्षर">निरक्षर</option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    सर्किल छोड़ देने/ मृत्यु का दिनांक
                  </label>
                  <input
                    type="date"
                    value={member.leavingDate || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "leavingDate", e.target.value)
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>

                <div>
                  <label style={labelStyle}>विवरण</label>
                  <input
                    type="text"
                    value={member.description || ""}
                    onChange={(e) =>
                      handleMemberChange(index, "description", e.target.value)
                    }
                    style={inputStyle}
                    onFocus={(e) => (e.target.style.borderColor = "#667eea")}
                    onBlur={(e) => (e.target.style.borderColor = "#e2e8f0")}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer with Submit Button */}
        <div
          style={{
            padding: "20px 32px",
            borderTop: "2px solid #e2e8f0",
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            flexShrink: 0,
            background: "#f8fafc",
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: "12px 28px",
              border: "2px solid #e2e8f0",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
              background: "white",
              color: "#64748b",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = "#cbd5e1";
              e.target.style.background = "#f1f5f9";
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = "#e2e8f0";
              e.target.style.background = "white";
            }}
          >
            रद्द करें
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "12px 28px",
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "1rem",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.3)";
            }}
          >
            सुरक्षित करें
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable styles
const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#475569",
  fontWeight: "600",
  fontSize: "0.9rem",
};

const inputStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "0.95rem",
  transition: "all 0.3s ease",
  outline: "none",
};

const selectStyle = {
  width: "100%",
  padding: "12px 16px",
  border: "2px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "0.95rem",
  transition: "all 0.3s ease",
  outline: "none",
  cursor: "pointer",
  backgroundColor: "white",
};

export default EditFamilyModal;
