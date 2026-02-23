import { useEffect, useMemo, useState } from "react";
import pmService from "../../services/pmService";

const LiveDataEntriesView = () => {
  const [zilas, setZilas] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [gaons, setGaons] = useState([]);

  const [selectedZila, setSelectedZila] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [selectedGaonCode, setSelectedGaonCode] = useState("");
  const [selectedGaonName, setSelectedGaonName] = useState("");

  const [search, setSearch] = useState("");
  const [tableRows, setTableRows] = useState([]);

  const [regCount, setRegCount] = useState(0);
  const [regList, setRegList] = useState([]);
  const [selectedRegNo, setSelectedRegNo] = useState("");

  // ✅ NEW: Message when gaon not approved / data not available
  const [gaonMessage, setGaonMessage] = useState("");

  // PDF upload preview (left side)
  const [uploadedPdfUrl, setUploadedPdfUrl] = useState("");
  const [uploadedPdfName, setUploadedPdfName] = useState("");

  const columns = useMemo(
    () => [
      { label: "जनपद", key: "janpad", alts: ["zila", "district"] },
      { label: "तहसील", key: "tehsil" },
      { label: "ब्लाक", key: "block" },
      { label: "गाँव सभा", key: "gaonSabha", alts: ["sabha", "gramSabha"] },
      { label: "गाँव", key: "gaon", alts: ["village"] },
      {
        label: "गाँव कोड",
        key: "gaonCode",
        alts: ["gaon_code", "villageCode"],
      },
      { label: "न्याय पंचायत", key: "nyayPanchayat" },
      {
        label: "क्रम संख्या",
        key: "kramSankhya",
        alts: ["serialNo", "क्रम_संख्या"],
      },
      {
        label: "मकान नम्बर(अंकों में)",
        key: "houseNumberNum",
        alts: ["houseNumberNum", "house_no_num"],
      },
      {
        label: "मकान नम्बर (अक्षरों में)",
        key: "houseNumberText",
        alts: ["houseNumberText", "house_no_text"],
      },
      {
        label: "परिवार के प्रमुख का नाम",
        key: "familyHeadName",
        alts: ["familyHeadName"],
      },
      {
        label: "परिवार के सदस्य का नाम",
        key: "memberName",
        alts: ["memberName"],
      },
      {
        label: "पिता या पति का नाम",
        key: "fatherOrHusbandName",
        alts: ["fatherOrHusbandName"],
      },
      { label: "पुरुष या महिला", key: "gender", alts: ["gender"] },
      { label: "धर्म", key: "religion", alts: ["religion"] },
      { label: "जाति", key: "caste", alts: ["caste"] },
      { label: "जन्म तिथि", key: "dob", alts: ["dob"] },
      { label: "व्यावसाय", key: "business", alts: ["business", "occupation"] },
      { label: "साक्षर या निरक्षर", key: "literacy", alts: ["literacy"] },
      { label: "योग्यता", key: "qualification", alts: ["qualification"] },
      {
        label: "सर्किल छोड़ देने/ मृत्यु का दिनांक",
        key: "leavingDate",
        alts: ["leavingDate"],
      },
      { label: "विवरण", key: "desc", alts: ["desc", "details"] },
    ],
    [],
  );

  const getCell = (row, col) => {
    if (!row) return "";
    if (row[col.key] !== undefined && row[col.key] !== null)
      return row[col.key];
    if (Array.isArray(col.alts)) {
      for (const k of col.alts) {
        if (row[k] !== undefined && row[k] !== null) return row[k];
      }
    }
    return "";
  };

  const normalizeList = (res) => {
    const r = res?.data ?? res; // unwrap one level

    // backend sometimes returns { error: "..." } with 200
    if (r?.error) return [];

    if (Array.isArray(r)) return r;

    const candidates = [
      r?.data,
      r?.result,
      r?.results,
      r?.rows,
      r?.records,
      r?.familyData,
      r?.list,
    ];

    for (const c of candidates) {
      if (Array.isArray(c)) return c;
    }

    // one more unwrap if r.data is an object having list inside
    const d = r?.data;
    if (d && typeof d === "object") {
      const inner = [d?.rows, d?.records, d?.results, d?.familyData, d?.list];
      for (const c of inner) if (Array.isArray(c)) return c;
    }

    return [];
  };

  const normalizeRegInfo = (res) => {
    const r = res?.data ?? res;
    if (Array.isArray(r)) {
      const list = r
        .map((x) => Number(x))
        .filter((n) => Number.isFinite(n))
        .sort((a, b) => a - b);
      const uniq = Array.from(new Set(list));
      return { list: uniq, count: uniq.length };
    }

    const countCandidate =
      r?.count ?? r?.noOfRegisters ?? r?.noOfReg ?? r?.total ?? r?.value ?? 0;

    const count = Number(countCandidate) || 0;
    return {
      list: count ? Array.from({ length: count }, (_, i) => i + 1) : [],
      count,
    };
  };

  const regOptions = useMemo(() => {
    if (Array.isArray(regList) && regList.length) return regList;
    const n = Number(regCount) || 0;
    return Array.from({ length: n }, (_, i) => i + 1);
  }, [regList, regCount]);

  useEffect(() => {
    (async () => {
      const data = await pmService.getZilaList();
      setZilas(Array.isArray(data) ? data : []);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedZila) {
        setBlocks([]);
        setSelectedBlock("");
        return;
      }
      const data = await pmService.getBlocksByZila(selectedZila);
      setBlocks(Array.isArray(data) ? data : []);
    })();
  }, [selectedZila]);

  // ✅ IMPORTANT: Block change -> Approved Gaon list API
  useEffect(() => {
    (async () => {
      if (!selectedBlock) {
        setGaons([]);
        setSelectedGaonCode("");
        setSelectedGaonName("");
        return;
      }
      const data = await pmService.getGaonListWithCodeByBlock(selectedBlock);
      setGaons(Array.isArray(data) ? data : []);
    })();
  }, [selectedBlock]);

  // ✅ IMPORTANT: "गाँव पाएं" -> getGaonData API
  const handleFetchGaonData = async () => {
    if (!selectedGaonCode) return;

    // ✅ reset message on each fetch
    setGaonMessage("");

    // 1️⃣ Table data
    try {
      const rowsRes = await pmService.getGaonData(selectedGaonCode);
      const rows = normalizeList(rowsRes);
      setTableRows(rows);

      // ✅ show message if no data
      if (!rows || rows.length === 0) {
        setGaonMessage(
          "This village has not been approved by the Supervisor yet.",
        );
      }
    } catch (e) {
      console.error("getGaonData failed:", e);
      setTableRows([]);
      // ✅ show message on error
      setGaonMessage(
        "This village has not been approved by the Supervisor yet.",
      );
      return;
    }

    // 2️⃣ Register count API (NEW)
    try {
      const regRes = await pmService.getNoOfRegByGaonCode(selectedGaonCode);

      // ✅ API returns object like { noOfRegisters: 1 }
      const count = Number(
        regRes?.noOfRegisters ??
          regRes?.count ??
          regRes?.data?.noOfRegisters ??
          regRes,
      );

      if (count > 0) {
        const list = Array.from({ length: count }, (_, i) => i + 1);
        setRegList(list);
        setRegCount(count);
      } else {
        setRegList([]);
        setRegCount(0);
      }

      setSelectedRegNo("");
    } catch (e) {
      console.warn("noOfReg API failed:", e);
      setRegList([]);
      setRegCount(0);
    }
  };

  // "Get PDF" -> required API
  const handleGetPdf = async () => {
    if (!selectedGaonCode || !selectedRegNo) return;

    try {
      await pmService.downloadRegisterPDF({
        gaonCode: selectedGaonCode,
        registerNo: selectedRegNo,
      });
    } catch (e) {
      console.error("PDF download failed:", e);
    }
  };

  const handleChoosePdf = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (uploadedPdfUrl) {
      try {
        window.URL.revokeObjectURL(uploadedPdfUrl);
      } catch {
        // ignore
      }
    }

    const nextUrl = window.URL.createObjectURL(file);
    setUploadedPdfUrl(nextUrl);
    setUploadedPdfName(file.name || "");
  };

  const clearUploadedPdf = () => {
    if (uploadedPdfUrl) {
      try {
        window.URL.revokeObjectURL(uploadedPdfUrl);
      } catch {
        // ignore
      }
    }
    setUploadedPdfUrl("");
    setUploadedPdfName("");
  };

  useEffect(() => {
    return () => {
      if (uploadedPdfUrl) {
        try {
          window.URL.revokeObjectURL(uploadedPdfUrl);
        } catch {
          // ignore
        }
      }
    };
  }, [uploadedPdfUrl]);

  const handleRegisterSelect = (val) => {
    setSelectedRegNo(val);
  };

  const filteredRows = useMemo(() => {
    if (!search) return tableRows;
    const s = search.toLowerCase();
    return tableRows.filter((r) => JSON.stringify(r).toLowerCase().includes(s));
  }, [tableRows, search]);

  const handleView = (row) => {
    const page =
      row?.page ||
      row?.pageNo ||
      row?.fromPage ||
      row?.page_number ||
      row?.pdfPage;
    if (!page) return;

    const url = pmService.getPDFPageUrl({
      pdfNo: 1,
      gaonCode: selectedGaonCode,
      fromPage: page,
      toPage: page,
    });
    window.open(url, "_blank");
  };

  return (
    <div className="pm-liveentries-wrapper">
      <div className="pm-rawlike-titlewrap">
        <div className="pm-rawlike-title">Live Data Entries</div>
        <div className="pm-rawlike-underline"></div>
      </div>

      <div className="pm-liveentries-filterbar">
        <div className="pm-liveentries-field">
          <label>जिला *</label>
          <select
            value={selectedZila}
            onChange={(e) => setSelectedZila(e.target.value)}
          >
            <option value="">Select Zila</option>
            {zilas.map((z, i) => (
              <option
                key={i}
                value={typeof z === "string" ? z : z?.zila || z?.name || ""}
              >
                {typeof z === "string" ? z : z?.zila || z?.name || ""}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-liveentries-field">
          <label>ब्लाक *</label>
          <select
            value={selectedBlock}
            onChange={(e) => setSelectedBlock(e.target.value)}
          >
            <option value="">Select Block</option>
            {blocks.map((b, i) => (
              <option
                key={i}
                value={typeof b === "string" ? b : b?.block || b?.name || ""}
              >
                {typeof b === "string" ? b : b?.block || b?.name || ""}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-liveentries-field">
          <label>गाँव *</label>
          <select
            value={selectedGaonCode}
            onChange={(e) => {
              const code = e.target.value;
              setSelectedGaonCode(code);
              const found = gaons.find(
                (g) => String(g?.gaonCode || g?.gaon_code) === String(code),
              );
              setSelectedGaonName(found?.gaon || found?.village || "");
            }}
          >
            <option value="">Select Gaon</option>
            {gaons.map((g, i) => (
              <option key={i} value={g?.gaonCode || g?.gaon_code}>
                {g?.gaon || g?.village} ({g?.gaonCode || g?.gaon_code})
              </option>
            ))}
          </select>
        </div>

        <button
          className="pm-liveentries-btn"
          onClick={handleFetchGaonData}
          disabled={!selectedGaonCode}
        >
          गाँव पाएं
        </button>
      </div>

      <div className="pm-liveentries-search">
        <input
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="pm-liveentries-body">
        <div className="pm-liveentries-registerCard">
          <div className="pm-liveentries-cardTitle">
            परिवार रजिस्टर स्कैन की गई फाइल (पीडीएफ प्रारूप)
          </div>

          <div className="pm-liveentries-registerRow">
            <label>रजिस्टर नंबर:</label>
            <select
              value={selectedRegNo}
              onChange={(e) => handleRegisterSelect(e.target.value)}
            >
              <option value="">Select Register No.</option>
              {regOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button
              className="pm-liveentries-btn secondary"
              onClick={handleGetPdf}
              disabled={!selectedGaonCode || !selectedRegNo}
            >
              Get PDF
            </button>
          </div>

          <div className="pm-liveentries-fileRow">
            <label className="pm-liveentries-fileLabel">Choose File:</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleChoosePdf}
            />
          </div>

          {uploadedPdfUrl ? (
            <div className="pm-liveentries-pdfWrap">
              {uploadedPdfName ? (
                <div className="pm-liveentries-pdfName">{uploadedPdfName}</div>
              ) : null}
              <iframe
                className="pm-liveentries-pdfFrame"
                title="Uploaded PDF"
                src={uploadedPdfUrl}
              />
            </div>
          ) : null}
        </div>

        <div className="pm-liveentries-tableCard">
          <div className="pm-liveentries-tableScroll">
            <table className="pm-liveentries-table">
              <thead>
                <tr>
                  {columns.map((c) => (
                    <th key={c.label}>{c.label}</th>
                  ))}
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows?.length ? (
                  filteredRows.map((row, idx) => (
                    <tr key={row?.id || idx}>
                      {columns.map((c) => (
                        <td key={c.label}>{String(getCell(row, c) ?? "")}</td>
                      ))}
                      <td>
                        <button
                          className="pm-liveentries-viewBtn"
                          onClick={() => handleView(row)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length + 1}
                      className="pm-liveentries-empty"
                    >
                      {gaonMessage ? gaonMessage : "No data found"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveDataEntriesView;
