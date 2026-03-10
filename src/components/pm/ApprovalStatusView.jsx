import { useMemo, useState } from "react";
import pmService from "../../services/pmService";
import * as XLSX from "xlsx";

const ApprovalStatusView = ({ zilaList = [] }) => {
  const [selectedZila, setSelectedZila] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [selectedBlock, setSelectedBlock] = useState("");

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [tableRows, setTableRows] = useState([]);

  const pick = (obj, keys, fallback = "") => {
    for (const k of keys) {
      const v = obj?.[k];
      if (v !== undefined && v !== null && v !== "") return v;
    }
    return fallback;
  };

  const toYesNo = (v) => {
    if (v === true || v === 1) return "Y";
    const s = String(v ?? "")
      .toLowerCase()
      .trim();
    if (["y", "yes", "true", "verified", "सत्यापित", "approved"].includes(s))
      return "Y";
    return "N";
  };

  const isVerified = (v) => toYesNo(v) === "Y";

  const handleZilaChange = async (zilaName) => {
    setSelectedZila(zilaName);
    setSelectedBlock("");
    setBlocks([]);
    setTableRows([]);

    if (!zilaName) return;

    setLoading(true);
    try {
      const blocksRes = await pmService.getBlocksByZila(zilaName);

      const list = Array.isArray(blocksRes)
        ? blocksRes
            .map((b) => (typeof b === "string" ? b : b?.block || b?.name))
            .filter(Boolean)
        : [];

      setBlocks(list);
    } catch (e) {
      console.error("❌ ApprovalStatusView getBlocksByZila failed:", e);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDataPayen = async () => {
    if (!selectedZila) return alert("कृपया जिला चुनें");
    if (!selectedBlock) return alert("कृपया ब्लाक चुनें");

    setLoading(true);
    try {
      const res = await pmService.getGaonApprovalStatusByZilaBlock(
        selectedZila,
        selectedBlock,
      );

      let data = res;

      // 🔹 Agar API string JSON return kare to parse karo
      if (typeof data === "string") {
        try {
          data = JSON.parse(data);
        } catch (err) {
          console.error("JSON parse error:", err);
        }
      }

      // 🔹 Different possible response formats handle karo
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.results)
            ? data.results
            : Array.isArray(data?.result)
              ? data.result
              : Array.isArray(data?.rows)
                ? data.rows
                : [];

      console.log("✅ Final Extracted List:", list); // debug ke liye

      setTableRows(list);
    } catch (e) {
      console.error("❌ ApprovalStatusView getGaon failed:", e);
      alert("डेटा लाने में समस्या आई। कृपया दुबारा प्रयास करें।");
      setTableRows([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return tableRows;

    return tableRows.filter((row) => {
      const values = Object.values(row || {})
        .map((v) => String(v ?? "").toLowerCase())
        .join(" ");
      return values.includes(q);
    });
  }, [tableRows, search]);

  const handleDownloadExcel = () => {
    if (!selectedZila || !selectedBlock) {
      alert("कृपया जिला और ब्लाक चुनें");
      return;
    }
    if (!filteredRows.length) {
      alert("डाउनलोड के लिए कोई डेटा नहीं है");
      return;
    }

    // Sample Excel columns (same as your gaonApprovalStatus.xlsx header row)
    const header = [
      "जनपद",
      "तहसील",
      "ब्लाक",
      "गाँव सभा",
      "गाँव",
      "गाँव कोड",
      "Supervisor Approval?",
      "सचिव द्वारा सत्यापित",
      "ADO द्वारा सत्यापित",
    ];

    const rows = filteredRows.map((r) => {
      const zila = pick(r, ["zila", "district", "जनपद"], selectedZila);

      const tehsil = pick(r, ["tehsil", "tahsil", "तहसील"]);

      const block = pick(r, ["block", "ब्लाक"], selectedBlock);
      const gaonSabha = pick(r, ["sabha", "gaonSabha", "villageSabha", "गाँव सभा"]);

      // In some APIs gaon & gaonCode swapped, handle both
      const gaonName = pick(r, ["gaon", "village", "गाँव"]);
      const gaonCode = pick(r, [
        "gaonCode",
        "gaon_code",
        "villageCode",
        "गाँव कोड",
      ]);

      const sup = pick(r, [
  "approvedBySupervisor",   // 👈 added — matches table logic
  "supervisorApproved",
  "supervisor",
  "Supervisor Approval?",
]);


const sachiv = pick(r, [
  "approvedBySachiv",       // 👈 added — matches table logic
  "sachivVerified",
  "sachiv",
  "सचिव द्वारा सत्यापित",
]);


const ado = pick(r, [
  "approvedByADO",          // 👈 added — matches table logic
  "adoVerified",
  "ado",
  "ADO द्वारा सत्यापित",
]);

      return [
        zila,
        tehsil,
        block,
        gaonSabha,
        gaonName,
        gaonCode,
        toYesNo(sup),
        toYesNo(sachiv),
        toYesNo(ado),
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ApprovalStatus");

    const safeZila = String(selectedZila).replace(/\s+/g, "_");
    const safeBlock = String(selectedBlock).replace(/\s+/g, "_");
    XLSX.writeFile(wb, `gaon_approval_status_${safeZila}_${safeBlock}.xlsx`);
  };

  return (
    <div className="pm-rawdata-wrapper pm-approval-wrapper">
      {/* Top bar: Download button right */}
      <div className="pm-approval-topbar">
        <h1>Approval Status</h1>

        <button
          type="button"
          className="pm-approval-download-btn"
          onClick={handleDownloadExcel}
          disabled={loading || !filteredRows.length}
          title="डाउनलोड रिपोर्ट"
        >
          ⬇️ डाउनलोड रिपोर्ट
        </button>
      </div>

      {/* Filter Bar */}
      <div className="pm-rawdata-filterbar">
        <div className="pm-rawdata-field">
          <label>जिला *</label>
          <select
            value={selectedZila}
            onChange={(e) => handleZilaChange(e.target.value)}
          >
            <option value="">Select Zila</option>

            {Array.isArray(zilaList) &&
              zilaList.map((item, idx) => {
                const zilaName = typeof item === "string" ? item : item?.zila;
                if (!zilaName) return null;

                return (
                  <option key={zilaName || idx} value={zilaName}>
                    {zilaName}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="pm-rawdata-field">
          <label>ब्लाक</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
            disabled={!selectedZila}
          >
            <option value="">
              {selectedZila ? "Select Block" : "Select Zila First"}
            </option>
            {blocks.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        <button
          className="pm-rawdata-goanbtn"
          type="button"
          onClick={handleDataPayen}
          disabled={loading}
        >
          डाटा पाएं
        </button>
      </div>

      {/* Search */}
      <div className="pm-rawdata-search pm-approval-searchrow">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* <div className="pm-approval-legend">
          <span className="pm-approval-legend-title">कुंजी</span>
          <span className="pm-approval-chip verified">
            <span className="box" /> सत्यापित
          </span>
          <span className="pm-approval-chip pending">
            <span className="box" /> पेंडिंग
          </span>
        </div> */}
      </div>

      {/* Table */}
      <div className="pm-approval-tablewrap">
        <table className="pm-approval-table">
          <thead>
            <tr>
              <th>जिला</th>
              <th>तहसील</th>
              <th>ब्लाक</th>
              <th>गाँव सभा</th>
              <th>गाँव</th>
              <th>गाँव कोड</th>
              <th>स्टेटस</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "18px" }}
                >
                  Loading...
                </td>
              </tr>
            ) : filteredRows.length ? (
              filteredRows.map((r, idx) => {
                const zila = pick(
                  r,
                  ["zila", "district", "जनपद"],
                  selectedZila,
                );
                const tehsil = pick(r, ["tehsil", "tahsil", "तहसील"]);
                const block = pick(r, ["block", "ब्लाक"], selectedBlock);
                const gaonSabha = pick(r, [
  "sabha",
  "gaonSabha",
  "villageSabha",
  "गाँव सभा",
]);
                const gaon = pick(r, ["gaon", "village", "गाँव"]);
                const gaonCode = pick(r, [
                  "gaonCode",
                  "gaon_code",
                  "villageCode",
                  "गाँव कोड",
                ]);

                const sachivVal = pick(r, ["approvedBySachiv", "sachivVerified", "sachiv", "सचिव"]);
const adoVal = pick(r, ["approvedByADO", "adoVerified", "ado", "ADO"]);
const supVal = pick(r, [
  "approvedBySupervisor",
  "supervisorApproved",
  "supervisor",
  "Supervisor",
]);

                return (
                  <tr key={idx}>
                    <td>{zila}</td>
                    <td>{tehsil}</td>
                    <td>{block}</td>
                    <td>{gaonSabha}</td>
                    <td>{gaon}</td>
                    <td>{gaonCode}</td>
                    <td>
                      <div className="pm-approval-statuscell">
  <span
    className={
      "pm-approval-badge " +
      (isVerified(supVal) ? "verified" : "pending")
    }
  >
    Supervisor
  </span>
  <span
    className={
      "pm-approval-badge " +
      (isVerified(sachivVal) ? "verified" : "pending")
    }
  >
    सचिव
  </span>
  <span
    className={
      "pm-approval-badge " +
      (isVerified(adoVal) ? "verified" : "pending")
    }
  >
    ADO
  </span>
</div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  style={{ textAlign: "center", padding: "18px" }}
                >
                  कोई डेटा नहीं मिला
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ApprovalStatusView;
