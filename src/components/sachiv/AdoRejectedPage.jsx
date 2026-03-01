// src/components/sachiv/AdoRejectedPage.jsx
import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import RegisterSidebar from "./RegisterSidebar";
import sachivService from "../../services/sachivService";

import "../../assets/styles/pages/sachiv.css"



const AdoRejectedPage = () => {
  const navigate = useNavigate();

  const [user] = useState(() => {
    const stored = localStorage.getItem("userData");
    const userData = stored ? JSON.parse(stored) : {};
    return {
      loginID: JSON.parse(localStorage.getItem("loginID") || '""'),
      name: userData.name || "",
      sabha: userData.sabha || "",
      zila: userData.zila || "",
      tehsil: userData.tehsil || "",
      block: userData.block || "",
    };
  });

  const [villages, setVillages] = useState([]);
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [gaonData, setGaonData] = useState([]);
  const [sabhaStats, setSabhaStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null); // { id, gaonCode } or { gaonCode, all: true }
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user.sabha) loadSabhaData(user.sabha);
  }, [user.sabha]);

  const loadSabhaData = async (sabhaName) => {
    setLoading(true);
    try {
      const res = await sachivService.getRejectedSabhaData(sabhaName);
      if (res.success && res.data) {
        const d = res.data;
        setSabhaStats({
          totalVillages: d.totalVillages,
          totalRejectedMembers: d.totalRejectedMembers,
          totalRejectedFamilies: d.totalRejectedFamilies,
        });
        const villageList = (d.villages || []).map((v) => ({
          gaon: v.gaon,
          gaonCode: String(v.gaonCode),
          totalRejectedMembers: v.totalRejectedMembers,
          totalRejectedFamilies: v.totalRejectedFamilies,
          _data: v.data || [],
        }));
        setVillages(villageList);
        if (villageList.length > 0) {
          setSelectedVillage(villageList[0]);
          setGaonData(villageList[0]._data);
        }
      }
    } catch (e) {
      console.error("Error loading rejected sabha data:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  const handleVillageClick = (village) => {
    setSelectedVillage(village);
    setGaonData(village._data || []);
  };

  const handleApproveFamily = async (id, gaonCode) => {
    if (!window.confirm("Do you want to approve this family?")) return;
    try {
      await sachivService.approveFamilySachiv(id, gaonCode);
      await loadSabhaData(user.sabha);
    } catch (e) {
      console.error("Approve error:", e);
    }
  };

  const handleApproveAll = async () => {
    if (!selectedVillage) return;
    if (!window.confirm("Approve ALL families in this village?")) return;
    try {
      await sachivService.approveAllFamiliesSachiv(selectedVillage.gaonCode);
      await loadSabhaData(user.sabha);
    } catch (e) {
      console.error("Approve all error:", e);
    }
  };

  const openRejectModal = (target) => {
    setRejectTarget(target);
    setRejectRemark("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectRemark.trim()) {
      alert("Please enter a remark before rejecting.");
      return;
    }
    try {
      if (rejectTarget.all) {
        await sachivService.rejectAllFamiliesSachiv(rejectTarget.gaonCode, rejectRemark);
      } else {
        await sachivService.rejectFamilySachiv(rejectTarget.id, rejectTarget.gaonCode, rejectRemark);
      }
      setShowRejectModal(false);
      await loadSabhaData(user.sabha);
    } catch (e) {
      console.error("Reject error:", e);
    }
  };

  const handleViewPDF = (pdfNo, fromPage, toPage, gaonCode) => {
    sachivService.viewPDFPage(pdfNo, fromPage, toPage, gaonCode);
  };

  const stats = useMemo(() => {
    const totalFamilies = selectedVillage?.totalRejectedFamilies ?? 0;
    const totalMembers = selectedVillage?.totalRejectedMembers ?? 0;
    return { totalFamilies, totalMembers };
  }, [selectedVillage]);

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return gaonData;
    const s = searchTerm.toLowerCase();
    return gaonData.filter((row) =>
      Object.values(row).some((v) =>
        String(v ?? "").toLowerCase().includes(s)
      )
    );
  }, [gaonData, searchTerm]);


  return (
    <div className="sachiv-dashboard-wrapper">
      <RegisterSidebar
        user={user}
        villages={villages}
        selectedVillage={selectedVillage}
        onVillageClick={handleVillageClick}
        onChangePassword={() => {}}
        onLogout={handleLogout}
      />

      <div className="sachiv-content" id="content">
        {/* Header */}
        <div className="sachiv-main-content">
          <div className="sachiv-header">
            <span className="sachiv-title" id="registerTitle">
              {selectedVillage
                ? `${selectedVillage.gaon} रजिस्टर (ADO द्वारा अस्वीकृत)`
                : "ADO द्वारा अस्वीकृत रजिस्टर"}
            </span>
          </div>
          <div className="sachiv-button-group" style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
            <button
              className="sachiv-download-btn"
              style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
              onClick={handleApproveAll}
              disabled={!selectedVillage || loading}
            >
              <i className="fas fa-check-double" style={{ marginRight: 8 }} />
              Approve All
            </button>
            <button
              className="sachiv-download-btn"
              style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}
              onClick={() => openRejectModal({ gaonCode: selectedVillage?.gaonCode, all: true })}
              disabled={!selectedVillage || loading}
            >
              <i className="fas fa-times-circle" style={{ marginRight: 8 }} />
              Reject All
            </button>
          </div>
        </div>

        {/* Stats */}
        {selectedVillage && (
          <div className="sachiv-stats-container">
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">अस्वीकृत परिवार</div>
                <div className="sachiv-stat-value">{stats.totalFamilies}</div>
              </div>
            </div>
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon sachiv-stat-icon-members">
                <i className="fas fa-users"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">अस्वीकृत सदस्य</div>
                <div className="sachiv-stat-value">{stats.totalMembers}</div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <div style={{ display: "flex", justifyContent: "flex-end", margin: "0 0 12px 0" }}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="खोजें......"
            style={{ width: "280px", padding: "10px 12px", border: "1px solid #d1d5db", borderRadius: "8px", outline: "none" }}
          />
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 32 }}>Loading...</div>
        ) : (
          <div className="sachiv-container">
            <div className="table-container">
              <table className="main-table">
                <thead>
                  <tr>
                    <th>क्रम संख्या</th>
                    <th>मकान नं.</th>
                    <th>परिवार प्रमुख</th>
                    <th>सदस्य नाम</th>
                    <th>पिता/पति</th>
                    <th>लिंग</th>
                    <th>जन्म तिथि</th>
                    <th>जाति</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? filteredData.map((row, idx) => (
                    <tr key={row.id || idx}>
                      <td>{row.serialNo}</td>
                      <td>{row.houseNumberNum ?? ""}{row.houseNumberText ? ` ${row.houseNumberText}` : ""}</td>
                      <td>{row.familyHeadName}</td>
                      <td>{row.memberName}</td>
                      <td>{row.fatherOrHusbandName}</td>
                      <td>{row.gender}</td>
                      <td>{row.dob ? row.dob.split("T")[0] : ""}</td>
                      <td>{row.caste}</td>
                      <td>
                        {String(row.serialNo) === "1" && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                            <button
                              style={{ backgroundColor: "#10b981", color: "white", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                              onClick={() => handleApproveFamily(row.id, row.gaonCode)}
                            >
                              <i className="fas fa-check-circle" /> Approve
                            </button>
                            <button
                              style={{ backgroundColor: "#ef4444", color: "white", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                              onClick={() => openRejectModal({ id: row.id, gaonCode: row.gaonCode, all: false })}
                            >
                              <i className="fas fa-times-circle" /> Reject
                            </button>
                            <button
                              style={{ backgroundColor: "#f59e0b", color: "white", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}
                              onClick={() => handleViewPDF(row.pdfNo, row.fromPage, row.toPage, row.gaonCode)}
                            >
                              <i className="fas fa-eye" /> View PDF
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={9} style={{ textAlign: "center", padding: 16 }}>No data found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Reject Remark Modal */}
        {showRejectModal && (
          <div
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={() => setShowRejectModal(false)}
          >
            <div
              style={{ background: "#fff", borderRadius: 12, padding: 24, width: "min(400px, 95vw)" }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ marginBottom: 12 }}>Reject Remark</h3>
              <textarea
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="Enter remark..."
                rows={4}
                style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #d1d5db", outline: "none", resize: "vertical" }}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 14, justifyContent: "flex-end" }}>
                <button
                  style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #d1d5db", cursor: "pointer" }}
                  onClick={() => setShowRejectModal(false)}
                >Cancel</button>
                <button
                  style={{ padding: "8px 16px", borderRadius: 8, background: "#ef4444", color: "white", border: "none", cursor: "pointer" }}
                  onClick={handleRejectConfirm}
                >Confirm Reject</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdoRejectedPage;