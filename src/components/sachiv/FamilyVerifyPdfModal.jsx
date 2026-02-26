import React, { useMemo } from "react";
import "../../assets/styles/pages/sachiv.css";

const FamilyVerifyPdfModal = ({ isOpen, onClose, family }) => {
  const data = useMemo(() => {
    return (
      family || {
        houseNoNum: "-",
        houseNoAlpha: "-",
        headName: "शिवशंकर",
        gaon: "Chhimauli",
        gaonCode: "154226",
        membersCount: 4,
        members: [
          {
            id: 1,
            name: "शिवशंकर",
            relation: "प्रमुख",
            fatherOrHusband: "हरछट",
            gender: "पुरुष",
            dob: "01-01-1998",
            religion: "हिन्दू",
          },
          {
            id: 2,
            name: "कुसुम देवी",
            relation: "पत्नी",
            fatherOrHusband: "शिवशंकर",
            gender: "महिला",
            dob: "10-02-2000",
            religion: "हिन्दू",
          },
          {
            id: 3,
            name: "देवांश",
            relation: "पुत्र",
            fatherOrHusband: "शिवशंकर",
            gender: "पुरुष",
            dob: "04-03-2023",
            religion: "हिन्दू",
          },
          {
            id: 4,
            name: "अनन्या",
            relation: "पुत्री",
            fatherOrHusband: "शिवशंकर",
            gender: "महिला",
            dob: "05-03-2023",
            religion: "हिन्दू",
          },
        ],
        pdf: {
          filename: "af128be5-00d6-4914-9707....pdf",
          pages: "1 / 1",
          zoom: "66%",
        },
      }
    );
  }, [family]);

  if (!isOpen) return null;

  return (
    <div className="sachiv-modal-overlay" role="dialog" aria-modal="true">
      <div className="sachiv-modal">
        {/* Header */}
        <div className="sachiv-modal-header">
          <div className="sachiv-modal-title">
            परिवार विवरण और PDF - सत्यापन
          </div>

          <button
            className="sachiv-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Top actions */}
        <div className="sachiv-modal-actions">
          <button className="sachiv-btn sachiv-btn-success" type="button">
            ✓ स्वीकृत करें
          </button>
          <button className="sachiv-btn sachiv-btn-danger" type="button">
            ⨯ अस्वीकृत करें
          </button>
          <button className="sachiv-btn sachiv-btn-primary" type="button">
            ✎ एडिट करें
          </button>
        </div>

        {/* Body split */}
        <div className="sachiv-modal-body">
          {/* Left: Family info */}
          <div className="sachiv-modal-left">
            <div className="sachiv-section-title">परिवार की जानकारी</div>
            <div className="sachiv-info-card">
              <div className="sachiv-info-row">
                <div className="sachiv-info-label">मकान नम्बर (अंकों में):</div>
                <div className="sachiv-info-value">{data.houseNoNum}</div>
              </div>
              <div className="sachiv-info-row">
                <div className="sachiv-info-label">
                  मकान नम्बर (अक्षरों में):
                </div>
                <div className="sachiv-info-value">{data.houseNoAlpha}</div>
              </div>
              <div className="sachiv-info-row">
                <div className="sachiv-info-label">परिवार के प्रमुख:</div>
                <div className="sachiv-info-value">{data.headName}</div>
              </div>
              <div className="sachiv-info-row">
                <div className="sachiv-info-label">गाँव:</div>
                <div className="sachiv-info-value">{data.gaon}</div>
              </div>
              <div className="sachiv-info-row">
                <div className="sachiv-info-label">गाँव कोड:</div>
                <div className="sachiv-info-value">{data.gaonCode}</div>
              </div>
            </div>

            <div className="sachiv-section-title" style={{ marginTop: 14 }}>
              परिवार के सदस्य ({data.membersCount})
            </div>

            <div className="sachiv-members-list">
              {data.members.map((m, idx) => (
                <div key={m.id} className="sachiv-member-card">
                  <div className="sachiv-member-header">
                    <div className="sachiv-member-index">{idx + 1}</div>
                    <div className="sachiv-member-name">{m.name}</div>
                    {m.relation === "प्रमुख" ? (
                      <span className="sachiv-chip">प्रमुख</span>
                    ) : null}
                  </div>

                  <div className="sachiv-member-grid">
                    <div className="sachiv-member-field">
                      <div className="sachiv-member-label">सदस्य का नाम:</div>
                      <div className="sachiv-member-value">{m.name}</div>
                    </div>
                    <div className="sachiv-member-field">
                      <div className="sachiv-member-label">पिता/पति:</div>
                      <div className="sachiv-member-value">
                        {m.fatherOrHusband}
                      </div>
                    </div>
                    <div className="sachiv-member-field">
                      <div className="sachiv-member-label">लिंग:</div>
                      <div className="sachiv-member-value">{m.gender}</div>
                    </div>
                    <div className="sachiv-member-field">
                      <div className="sachiv-member-label">जन्म तिथि:</div>
                      <div className="sachiv-member-value">{m.dob}</div>
                    </div>
                    <div className="sachiv-member-field">
                      <div className="sachiv-member-label">धर्म:</div>
                      <div className="sachiv-member-value">{m.religion}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: PDF panel (static placeholder) */}
          <div className="sachiv-modal-right">
            <div className="sachiv-pdf-header">PDF दस्तावेज</div>
            <div className="sachiv-pdf-toolbar">
              <span className="sachiv-pdf-file">{data.pdf.filename}</span>
              <span className="sachiv-pdf-meta">{data.pdf.pages}</span>
              <span className="sachiv-pdf-meta">{data.pdf.zoom}</span>
            </div>

            <div className="sachiv-pdf-viewer">
              {/* ✅ Static placeholder (keep design same) */}
              <div className="sachiv-pdf-placeholder">
                PDF Preview (Static)
                <br />
                <small>Live PDF embed later if needed.</small>
              </div>
            </div>
          </div>
        </div>

        {/* Footer spacing */}
        <div className="sachiv-modal-footer" />
      </div>
    </div>
  );
};

export default FamilyVerifyPdfModal;
