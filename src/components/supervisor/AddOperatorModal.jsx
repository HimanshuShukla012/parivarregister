// src/components/supervisor/AddOperatorModal.jsx
import React, { useState } from "react";
import supervisorService from "../../services/supervisorService";

const AddOperatorModal = ({ supervisorID, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
    confirmPassword: "",
    document: null,
  });
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      e.target.value = "";
      return;
    }

    if (file.size > 1048576) {
      alert("File size exceeds 1MB. Please upload a smaller PDF.");
      e.target.value = "";
      return;
    }

    setFormData((prev) => ({ ...prev, document: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Confirm password is not same as the new password!");
      return;
    }

    if (!formData.document) {
      setError("Please upload a document (PDF only, max 1MB)");
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("underSupervisor", supervisorID);
      data.append("password", formData.password);
      data.append("document", formData.document);

      const result = await supervisorService.insertNewOperator(data);

      if (result.success) {
        alert("Saved Successfully!");
        onSuccess();
      } else {
        setError("Error: " + result.error);
      }
    } catch (error) {
      console.error("Error adding operator:", error);
      setError("Failed to add operator. Please try again.");
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 999,
        }}
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "450px",
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
          zIndex: 1000,
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
            padding: "15px 20px",
            color: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h2 style={{ margin: 0 }}>Add Operator</h2>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.3)",
              border: "none",
              color: "#fff",
              fontSize: "18px",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              padding: "10px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                padding: "10px",
                marginBottom: "15px",
                backgroundColor: "#fee",
                border: "1px solid #fcc",
                borderRadius: "8px",
                color: "#c00",
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "12px" }}>
              <label>Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, name: e.target.value }))
                }
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, password: e.target.value }))
                }
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label>Upload Document (PDF, max 1MB) *</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                required
                style={inputStyle}
              />
            </div>
            <div
              style={{
                textAlign: "center",
              }}
            >
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "25px",
                  border: "none",
                  background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  marginTop: "10px",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ddd",
  marginTop: "5px",
};

export default AddOperatorModal;
