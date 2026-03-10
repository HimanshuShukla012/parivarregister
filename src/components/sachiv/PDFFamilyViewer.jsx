import React, { useState, useEffect } from "react";
import { X, Check, XCircle, Edit2, Save } from "lucide-react";

const InfoRow = React.memo(
  ({
    label,
    value,
    highlight,
    editable,
    field,
    memberIndex,
    isEditing,
    editedData,
    setEditedData,
  }) => {
    if (isEditing && editable) {
      return (
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ minWidth: "100px", fontSize: "0.85rem" }}>
            {label}:
          </span>

          <input
            type={field === "dob" || field === "leavingDate" ? "date" : "text"}
            value={editedData?.[memberIndex]?.[field] || ""}
            onChange={(e) => {
              setEditedData((prev) => {
                const copy = [...prev];
                copy[memberIndex] = {
                  ...copy[memberIndex],
                  [field]: e.target.value,
                };
                return copy;
              });
            }}
            style={{
              flex: 1,
              padding: "4px 8px",
              border: "1px solid #d1d5db",
              borderRadius: "4px",
              fontSize: "0.85rem",
            }}
          />
        </div>
      );
    }

    return (
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ minWidth: "100px", fontSize: "0.85rem" }}>{label}:</span>
        <span style={{ color: highlight ? "#dc2626" : "#1f2937" }}>
          {value || "-"}
        </span>
      </div>
    );
  }
);

const PDFFamilyViewer = ({
  isOpen,
  onClose,
  pdfUrl,
  familyData,
  onApprove,
  onReject,
  onEdit,
  isApproved = false,
  familyId,
  villageIndex,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");

  useEffect(() => {
    // Cleanup blob URL when component unmounts or URL changes
    return () => {
      if (pdfUrl && pdfUrl.startsWith("blob:")) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  if (!isOpen) return null;

  const handleNullDate = (value) => {
    if (!value) return "";
    return value.split("-").reverse().join("-");
  };

  const handleEditClick = () => {
    setEditedData(JSON.parse(JSON.stringify(familyData)));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (onEdit && editedData) {
      onEdit(editedData, familyId, villageIndex);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedData(null);
    setIsEditing(false);
  };

  const handleApprove = () => {
    if (window.confirm("क्या आप इस परिवार को स्वीकृत करना चाहते हैं?")) {
      if (onApprove && familyData && familyData.length > 0) {
        onApprove(familyData[0].id, familyData[0].gaonCode);
      }
    }
  };

  const handleRejectConfirm = () => {
    if (!rejectRemark.trim()) {
      alert("कृपया रिमार्क दर्ज करें");
      return;
    }
    if (onReject && familyData && familyData.length > 0) {
      onReject(familyData[0].id, familyData[0].gaonCode, rejectRemark);
      setShowRejectModal(false);
      setRejectRemark("");
    }
  };

  const displayData = isEditing ? editedData : familyData;

  // const InfoRow = React.memo(
  //   ({
  //     label,
  //     value,
  //     highlight,
  //     editable,
  //     field,
  //     memberIndex,
  //     isEditing,
  //     editedData,
  //     setEditedData,
  //   }) => {
  //     if (isEditing && editable) {
  //       return (
  //         <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
  //           <span style={{ minWidth: "100px", fontSize: "0.85rem" }}>
  //             {label}:
  //           </span>

  //           <input
  //             type={
  //               field === "dob" || field === "leavingDate" ? "date" : "text"
  //             }
  //             value={editedData?.[memberIndex]?.[field] || ""}
  //             onChange={(e) => {
  //               setEditedData((prev) => {
  //                 const copy = [...prev];
  //                 copy[memberIndex] = {
  //                   ...copy[memberIndex],
  //                   [field]: e.target.value,
  //                 };
  //                 return copy;
  //               });
  //             }}
  //             style={{
  //               flex: 1,
  //               padding: "4px 8px",
  //               border: "1px solid #d1d5db",
  //               borderRadius: "4px",
  //               fontSize: "0.85rem",
  //             }}
  //           />
  //         </div>
  //       );
  //     }

  //     return (
  //       <div style={{ display: "flex", justifyContent: "space-between" }}>
  //         <span style={{ minWidth: "100px", fontSize: "0.85rem" }}>
  //           {label}:
  //         </span>
  //         <span style={{ color: highlight ? "#dc2626" : "#1f2937" }}>
  //           {value || "-"}
  //         </span>
  //       </div>
  //     );
  //   }
  // );

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "95%",
          height: "90vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "2px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#667eea",
            color: "white",
            borderRadius: "12px 12px 0 0",
          }}
        >
          <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "600" }}>
            परिवार विवरण और PDF - सत्यापन
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "white",
              color: "#667eea",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              fontSize: "20px",
              fontWeight: "bold",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Buttons Bar */}
        {!isApproved && (
          <div
            style={{
              padding: "16px 24px",
              borderBottom: "1px solid #e5e7eb",
              display: "flex",
              gap: "12px",
              alignItems: "center",
              backgroundColor: "#f9fafb",
            }}
          >
            {!isEditing ? (
              <>
                <button
                  onClick={handleApprove}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#059669")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#10b981")
                  }
                >
                  <Check size={18} />
                  स्वीकृत करें
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#dc2626")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#ef4444")
                  }
                >
                  <XCircle size={18} />
                  अस्वीकृत करें
                </button>
                <button
                  onClick={handleEditClick}
                  style={{
                    backgroundColor: "#667eea",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#5568d3")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "#667eea")
                  }
                >
                  <Edit2 size={18} />
                  एडिट करें
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSaveEdit}
                  style={{
                    backgroundColor: "#10b981",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "0.95rem",
                  }}
                >
                  <Save size={18} />
                  सेव करें
                </button>
                <button
                  onClick={handleCancelEdit}
                  style={{
                    backgroundColor: "#6b7280",
                    color: "white",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                  }}
                >
                  कैंसिल
                </button>
                <span
                  style={{
                    marginLeft: "auto",
                    color: "#f59e0b",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  📝 एडिटिंग मोड
                </span>
              </>
            )}
          </div>
        )}

        {/* Content Area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
          }}
        >
          {/* Family Details Panel */}
          <div
            style={{
              width: "35%",
              padding: "24px",
              overflowY: "auto",
              borderRight: "2px solid #e5e7eb",
              backgroundColor: "#f9fafb",
            }}
          >
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "20px",
                color: "#1f2937",
                borderBottom: "2px solid #667eea",
                paddingBottom: "10px",
              }}
            >
              परिवार की जानकारी
            </h3>

            {displayData && displayData.length > 0 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {/* Family Header Info */}
                <div
                  style={{
                    backgroundColor: "white",
                    padding: "16px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <div style={{ display: "grid", gap: "12px" }}>
                    <InfoRow
                      label="मकान नम्बर (अंकों में"
                      value={displayData[0].houseNumberNum}
                      editable={true}
                      field="houseNumberNum"
                      memberIndex={0}
                      isEditing={isEditing}
                      editedData={editedData}
                      setEditedData={setEditedData}
                    />
                    <InfoRow
                      label="मकान नम्बर (अक्षरों में)"
                      value={displayData[0].houseNumberText}
                      editable={true}
                      field="houseNumberText"
                      memberIndex={0}
                      isEditing={isEditing}
                      editedData={editedData}
                      setEditedData={setEditedData}
                    />
                    <InfoRow
                      label="परिवार के प्रमुख"
                      value={displayData[0].familyHeadName}
                      editable={true}
                      field="familyHeadName"
                      memberIndex={0}
                      isEditing={isEditing}
                      editedData={editedData}
                      setEditedData={setEditedData}
                    />
                    <InfoRow
                      label="गाँव"
                      value={displayData[0].gaon}
                      isEditing={isEditing}
                      editedData={editedData}
                      setEditedData={setEditedData}
                    />
                    <InfoRow
                      label="गाँव कोड"
                      value={displayData[0].gaonCode}
                      isEditing={isEditing}
                      editedData={editedData}
                      setEditedData={setEditedData}
                    />
                  </div>
                </div>

                {/* Family Members */}
                <div>
                  <h4
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      marginBottom: "12px",
                      color: "#374151",
                    }}
                  >
                    परिवार के सदस्य ({displayData.length})
                  </h4>

                  {displayData.map((member, index) => (
                    <div
                      key={member.id || member.serialNo}
                      style={{
                        backgroundColor: "white",
                        padding: "16px",
                        borderRadius: "8px",
                        marginBottom: "12px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        border:
                          index === 0
                            ? "2px solid #667eea"
                            : "1px solid #e5e7eb",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "12px",
                          paddingBottom: "8px",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <span
                          style={{
                            backgroundColor: "#667eea",
                            color: "white",
                            borderRadius: "50%",
                            width: "28px",
                            height: "28px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.9rem",
                            fontWeight: "600",
                            marginRight: "10px",
                          }}
                        >
                          {member.serialNo}
                        </span>
                        <span
                          style={{
                            fontSize: "1.05rem",
                            fontWeight: "600",
                            color: "#1f2937",
                          }}
                        >
                          {member.memberName}
                        </span>
                        {index === 0 && (
                          <span
                            style={{
                              marginLeft: "auto",
                              backgroundColor: "#fef3c7",
                              color: "#92400e",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                              fontWeight: "600",
                            }}
                          >
                            प्रमुख
                          </span>
                        )}
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gap: "8px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <InfoRow
                          label="सदस्य का नाम"
                          value={member.memberName}
                          editable={true}
                          field="memberName"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="पिता/पति"
                          value={member.fatherOrHusbandName}
                          editable={true}
                          field="fatherOrHusbandName"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="लिंग"
                          value={member.gender}
                          editable={true}
                          field="gender"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="जन्म तिथि"
                          value={
                            isEditing ? member.dob : handleNullDate(member.dob)
                          }
                          editable={true}
                          field="dob"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="धर्म"
                          value={member.religion}
                          editable={true}
                          field="religion"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="जाति"
                          value={member.caste}
                          editable={true}
                          field="caste"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="व्यवसाय"
                          value={member.business}
                          editable={true}
                          field="business"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        <InfoRow
                          label="शिक्षा"
                          value={member.literacy}
                          editable={true}
                          field="literacy"
                          memberIndex={index}
                          isEditing={isEditing}
                          editedData={editedData}
                          setEditedData={setEditedData}
                        />
                        {member.qualification && (
                          <InfoRow
                            label="योग्यता"
                            value={member.qualification}
                            editable={true}
                            field="qualification"
                            memberIndex={index}
                            isEditing={isEditing}
                            editedData={editedData}
                            setEditedData={setEditedData}
                          />
                        )}
                        {member.description && (
                          <InfoRow
                            label="विवरण"
                            value={member.description}
                            highlight
                            editable={true}
                            field="description"
                            memberIndex={index}
                            isEditing={isEditing}
                            editedData={editedData}
                            setEditedData={setEditedData}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "40px",
                  color: "#6b7280",
                }}
              >
                परिवार की जानकारी उपलब्ध नहीं है
              </div>
            )}
          </div>

          {/* PDF Viewer Panel */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#1f2937",
            }}
          >
            <div
              style={{
                padding: "16px",
                backgroundColor: "#374151",
                borderBottom: "1px solid #4b5563",
              }}
            >
              <h3
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  color: "white",
                  margin: 0,
                }}
              >
                PDF दस्तावेज़
              </h3>
            </div>

            <div style={{ flex: 1, position: "relative" }}>
              {pdfUrl ? (
                <iframe
  src={pdfUrl}
  title="PDF Preview"
  style={{
    width: "100%",
    height: "100%",
    border: "none",
  }}
/>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    color: "#9ca3af",
                  }}
                >
                  PDF लोड हो रहा है...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
            }}
          >
            <h3
              style={{
                margin: "0 0 16px 0",
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
              }}
            >
              परिवार को अस्वीकृत करें
            </h3>
            <p
              style={{
                margin: "0 0 16px 0",
                color: "#6b7280",
                fontSize: "0.95rem",
              }}
            >
              कृपया अस्वीकृति का कारण बताएं:
            </p>
            <textarea
              value={rejectRemark}
              onChange={(e) => setRejectRemark(e.target.value)}
              placeholder="रिमार्क यहाँ लिखें..."
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                resize: "vertical",
              }}
            />
            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "20px",
                justifyContent: "flex-end",
              }}
            >
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectRemark("");
                }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                कैंसिल
              </button>
              <button
                onClick={handleRejectConfirm}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                अस्वीकृत करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFFamilyViewer;
