import React, { useState, useEffect } from "react";
// import api from "../../services/api";

const PDFViewer = ({ gaonCode, registerOptions = [] }) => {
  const [registerNo, setRegisterNo] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [localPdfUrl, setLocalPdfUrl] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch register count whenever gaonCode changes
  useEffect(() => {
    if (!gaonCode) {
      setRegisterNo("");
      setPdfUrl("");
      return;
    }

    if (registerOptions.length > 0) {
      setRegisterNo(String(registerOptions[0]));
    } else {
      setRegisterNo("");
    }
  }, [gaonCode, registerOptions]);

  const handleGetPDF = async (e) => {
    e.preventDefault();
    if (!gaonCode || !registerNo) {
      alert("कृपया गाँव कोड और रजिस्टर नंबर दर्ज करें");
      return;
    }

    const url = `https://parivarregister.kdsgroup.co.in/app/getRegisterPDF/?gaonCode=${encodeURIComponent(
      gaonCode,
    )}&registerNo=${encodeURIComponent(registerNo)}`;

    setPdfUrl(url);
    setLocalPdfUrl(""); // Clear local PDF when loading server PDF
  };

  const handleLocalPDFUpload = () => {
    const fileInput = document.getElementById("pdfInput");
    const file = fileInput?.files?.[0];

    if (!file) {
      setUploadMessage("कृपया एक PDF फ़ाइल चुनें।");
      return;
    }

    if (file.type !== "application/pdf") {
      setUploadMessage("केवल PDF फ़ाइलें अनुमत हैं।");
      return;
    }

    const blobURL = URL.createObjectURL(file);
    setLocalPdfUrl(blobURL);
    setPdfUrl(""); // Clear server PDF
    setUploadMessage("PDF प्रीव्यू लोड हुआ।");
  };

  useEffect(() => {
    return () => {
      if (localPdfUrl) {
        URL.revokeObjectURL(localPdfUrl);
      }
    };
  }, [localPdfUrl]);

  const displayUrl = localPdfUrl || pdfUrl;

  return (
    <div className="subContainer">
      <h4>परिवार रजिस्टर स्कैन की गई फ़ाइल (पीडीएफ प्रारूप)</h4>

      {/* Show current gaonCode */}
      {gaonCode && (
        <div
          style={{
            marginBottom: "10px",
            padding: "10px",
            background: "#f0f0f0",
            borderRadius: "4px",
          }}
        >
          <strong>गाँव कोड:</strong> {gaonCode}
        </div>
      )}

      <form id="pdfForm" onSubmit={handleGetPDF}>
        <label htmlFor="registerNo">रजिस्टर नंबर</label>
        <select
          id="registerNo"
          name="registerNo"
          style={{ width: "75%", margin: "0 10px 10px 10px" }}
          value={registerNo || ""}
          onChange={(e) => setRegisterNo(e.target.value)}
          required
          disabled={loading || registerOptions.length === 0 || !gaonCode}
        >
          <option value="" disabled>
            {loading
              ? "लोड हो रहा है..."
              : !gaonCode
                ? "पहले गाँव कोड दर्ज करें"
                : registerOptions.length === 0
                  ? "कोई रजिस्टर उपलब्ध नहीं"
                  : "Select Register No."}
          </option>
          {registerOptions.map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>

        <button type="submit" disabled={loading || !registerNo || !gaonCode}>
          Get PDF
        </button>

        {/* Local PDF Upload */}
        <div className="file-upload-wrapper">
          <div className="file-actions">
            <input type="file" id="pdfInput" accept="application/pdf" />
            <button
              type="button"
              id="localPdfUploadBtn"
              onClick={handleLocalPDFUpload}
            >
              Upload PDF
            </button>
          </div>
          <span id="uploadMsg">{uploadMessage}</span>
        </div>
      </form>

      {displayUrl && (
        <iframe
          id="pdfViewer"
          className="pdf-viewer"
          src={displayUrl}
          frameBorder="0"
          height="600px"
          width="100%"
          style={{ display: "block" }}
        />
      )}
    </div>
  );
};

export default PDFViewer;
