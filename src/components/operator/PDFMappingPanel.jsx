import React, { useMemo, useState } from "react";
import api from "../../services/api";
import DataTablePanel from "./DataTablePanel";

const readUnderSupervisor = (userIdProp) => {
  const clean = (v) => {
    if (v === null || v === undefined) return "";

    if (typeof v === "object") {
      const fromObj = v?.loginID || v?.operatorID || v?.operatorId || v?.id;
      if (fromObj) return clean(fromObj);
      return "";
    }

    let s = String(v).trim();
    if (!s) return "";

    try {
      const parsed = JSON.parse(s);
      if (typeof parsed === "string") return parsed.trim();
      if (parsed && typeof parsed === "object") {
        const inner =
          parsed?.loginID ||
          parsed?.operatorID ||
          parsed?.operatorId ||
          parsed?.id;
        if (inner) return String(inner).trim();
      }
    } catch (e) {}

    return s
      .replace(/^"+|"+$/g, "")
      .replace(/^'+|'+$/g, "")
      .trim();
  };

  const fromProp = clean(userIdProp);
  if (fromProp) return fromProp;

  const raw = localStorage.getItem("loginID");
  return clean(raw);
};

const PDFMappingPanel = ({ userId, onSuccess, onError, setLoading }) => {
  const [gaonCode, setGaonCode] = useState("");
  const [registerNo, setRegisterNo] = useState("");
  const [registerOptions, setRegisterOptions] = useState([]);

  const [gaonDetails, setGaonDetails] = useState(null);
  const [supervisorID, setSupervisorID] = useState("");
  const [tableData, setTableData] = useState([]);

  const [pdfUrl, setPdfUrl] = useState("");
  const [localPdfUrl, setLocalPdfUrl] = useState("");
  const [uploadMessage, setUploadMessage] = useState("");

  const [showPDF, setShowPDF] = useState(true);

  // ✅ OPERATOR ID (OP159)
  const underSupervisor = useMemo(() => readUnderSupervisor(userId), [userId]);

  const handleGetVillageData = async (e) => {
    e.preventDefault();

    if (!gaonCode) {
      alert("कृपया गाँव कोड डालें!");
      return;
    }

    setLoading(true);
    try {
      // ✅ REQUIRED API
      const villageResponse = await api.get(
        `/gaon/?gaonCode=${encodeURIComponent(
          gaonCode,
        )}&operatorID=${encodeURIComponent(underSupervisor)}`,
      );

      const data = villageResponse.data;
setGaonDetails(data);
setSupervisorID(data?.supervisorID || "");

      const n = parseInt(data?.noOfRegisters || 0, 10);
      const options = Array.from({ length: n }, (_, i) => i + 1);
      setRegisterOptions(options);

      setRegisterNo((prev) => {
        const prevNum = Number(prev);
        return prev && options.includes(prevNum) ? String(prevNum) : "";
      });

      

      // ✅ Pending API (same id pass)
      try {
        if (!data?.supervisorID) {
  console.warn("SupervisorID missing from gaon API");
  setTableData([]);
  return;
}

const pendingResponse = await api.get(
  `/getPendingVilOperator/?gaonCode=${encodeURIComponent(
    gaonCode,
  )}&underSupervisor=${encodeURIComponent(data.supervisorID)}`,
);

        setTableData(
          Array.isArray(pendingResponse.data) ? pendingResponse.data : [],
        );
      } catch (err) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          err?.message ||
          "Unknown error";

        console.error("Pending API error:", msg);
        setTableData([]);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("कृपया सही गाँव का चयन करें!");
    } finally {
      setLoading(false);
    }
  };

  const handleGetPDF = (e) => {
    e.preventDefault();

    if (!gaonCode || !registerNo) {
      alert("कृपया गाँव कोड और रजिस्टर नंबर दर्ज करें");
      return;
    }

    const url = `/getRegisterPDF/?gaonCode=${encodeURIComponent(
      gaonCode,
    )}&registerNo=${encodeURIComponent(registerNo)}`;

    setPdfUrl(url);
    setLocalPdfUrl("");
  };

  const handleLocalPDFUpload = () => {
    const fileInput = document.getElementById("pdfInput1");
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
    setPdfUrl("");
    setUploadMessage("PDF प्रीव्यू लोड हुआ।");
  };

  const handleViewPdfFromRow = ({ pdfNo, fromPage, toPage }) => {
    const p = String(pdfNo || "").trim();
    const fp = String(fromPage || "").trim();
    const tp = String(toPage || "").trim();

    if (!gaonCode || !p || !fp || !tp) {
      alert("कृपया पहले गाँव कोड चुनें और सही PDF/Pages चुनें।");
      return;
    }

    // ✅ required api
    const url = `/getPDFPage/?pdfNo=${encodeURIComponent(
      p,
    )}&gaonCode=${encodeURIComponent(gaonCode)}&fromPage=${encodeURIComponent(
      fp,
    )}&toPage=${encodeURIComponent(tp)}`;

    // ✅ open in new tab
    window.open(url, "_blank", "noopener,noreferrer");
  };
  const displayUrl = localPdfUrl || pdfUrl;

  return (
    <div className="panel-wrapper" style={{ display: "flex" }}>
      {/* LEFT PDF SECTION */}
      <div
        className={`subContainer ${!showPDF ? "hidden" : ""}`}
        style={{ borderRight: "none" }}
      >
        <h3>परिवार रजिस्टर स्कैन की गई फ़ाइल (पीडीएफ प्रारूप)</h3>

        <form id="pdfForm1" onSubmit={handleGetPDF}>
          <label htmlFor="registerNo1">रजिस्टर नंबर: &nbsp;</label>

          <select
            id="registerNo1"
            value={registerNo}
            onChange={(e) => setRegisterNo(e.target.value)}
            style={{ width: "40%" }}
            required
          >
            <option value="">Select Register No.</option>
            {registerOptions.map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>

          <button type="submit">Get PDF</button>

          <div className="file-upload-wrapper">
            <div className="file-actions">
              <input type="file" id="pdfInput1" accept="application/pdf" />
              <button
                type="button"
                id="localPdfUploadBtn1"
                onClick={handleLocalPDFUpload}
              >
                Upload PDF
              </button>
            </div>
            <span id="uploadMsg1">{uploadMessage}</span>
          </div>
        </form>

        {displayUrl && (
          <iframe
            id="pdfViewer1"
            className="pdf-viewer"
            src={displayUrl}
            frameBorder="0"
            height="600px"
            width="100%"
            style={{ display: "block" }}
            title="PDF Viewer"
          />
        )}
      </div>

      {/* TOGGLE BUTTON */}
      <button
        id="togglePDFSection"
        onClick={() => setShowPDF(!showPDF)}
        style={{ paddingInline: "1px", marginTop: 0 }}
        type="button"
      >
        <i
          className={`fa fa-arrow-alt-circle-${showPDF ? "left" : "right"}`}
        ></i>
      </button>

      {/* RIGHT TABLE + DETAILS */}
      <DataTablePanel
        onViewPdf={handleViewPdfFromRow}
        gaonCode={gaonCode}
        setGaonCode={setGaonCode}
        onGetVillageData={handleGetVillageData}
        tableData={tableData}
        setTableData={setTableData}
        onSuccess={onSuccess}
        onError={onError}
        setLoading={setLoading}
        showPDF={showPDF}
        gaonDetails={gaonDetails}
      />
    </div>
  );
};

export default PDFMappingPanel;
