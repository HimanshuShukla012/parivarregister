// src/pages/dashboards/supervisor/SupervisorDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import supervisorService from "../../../services/supervisorService";
import SupervisorSidebar from "../../../components/supervisor/SupervisorSidebar";
import RegisterTable from "../../../components/supervisor/RegisterTable";
import EditFamilyModal from "../../../components/supervisor/EditFamilyModal";
import AddRecordModal from "../../../components/supervisor/AddRecordModal";
import ChangePasswordModal from "../../../components/supervisor/ChangePasswordModal";
import ManageOperatorModal from "../../../components/supervisor/ManageOperatorModal";
import AddOperatorModal from "../../../components/supervisor/AddOperatorModal";
import OperatorMonitoring from "../../../components/supervisor/OperatorMonitoring";
import DataMonitoring from "../../../components/supervisor/DataMonitoring";
import MessageModal from "../../../components/supervisor/MessageModal";
import "../../../assets/styles/pages/supervisor-scoped.css";

const SupervisorDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState({
    loginID: JSON.parse(localStorage.getItem("loginID")),
    name: "",
    districts: [],
  });
  const [assignedBlocksState, setAssignedBlocksState] = useState([]);

  console.log(user);

  const [viewMode, setViewMode] = useState("pending"); // pending, completed, rejected, dashboard, operators, vilNotStarted

  const setViewModeWithURL = (mode) => {
    setViewMode(mode);
    window.history.pushState({}, "", `/supervisor-de/${mode}`);
  };
  const [gaonData, setGaonData] = useState([]);
  const [selectedGaon, setSelectedGaon] = useState(null);
  const [rejectedHasFlicker, setRejectedHasFlicker] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showManageOperators, setShowManageOperators] = useState(false);
  const [showAddOperator, setShowAddOperator] = useState(false);
  const [messageModal, setMessageModal] = useState({
    show: false,
    message: "",
    color: "",
  });

  const [editFamilyData, setEditFamilyData] = useState(null);
  const [addRecordFamilyData, setAddRecordFamilyData] = useState(null);

  // ✅ split view pdf
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  // Form states
  const [pendingForm, setPendingForm] = useState({
    block: "",
    gaonCode: "",
    status: "1",
  });
  console.log("pendingForm>>", pendingForm);

  const [completedForm, setCompletedForm] = useState({ block: "" });
  const [rejectedForm, setRejectedForm] = useState({ gaonCode: "" });

  // Assigned (PM Assigned) - villages + rows
  const [assignedForm, setAssignedForm] = useState({ gaonCode: "" });
  const [assignedVillages, setAssignedVillages] = useState([]);
  const [assignedAllRows, setAssignedAllRows] = useState([]);

  // Assigned (PM Assigned) - Edit modal
  const [showAssignedEditModal, setShowAssignedEditModal] = useState(false);
  const [assignedEditData, setAssignedEditData] = useState(null);

  // Villages lists
  const [villages, setVillages] = useState([]);
  const [rejectedVillages, setRejectedVillages] = useState([]);

  // Get loginID from localStorage IMMEDIATELY - don't wait for state
  const storedLoginID = localStorage.getItem("loginID") || "";
  const loginID = user.loginID || storedLoginID;
  const assignedBlocks = assignedBlocksState;
  const assignedDistrict = user.districts[0] || "";

  useEffect(() => {
    initDashboard();

    const handleUnload = () => {
      supervisorService.ajaxLogout();
    };

    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, []);

  const initDashboard = async () => {
    const loginID = JSON.parse(localStorage.getItem("loginID"));
    if (!loginID) {
      navigate("/");
      return;
    }

    // Set user data from localStorage
    const stored = localStorage.getItem("userData");
    const userData = stored ? JSON.parse(stored) : {};
    setUser({
      loginID,
      name: userData.name || loginID,
      districts: Array.isArray(userData.districts) ? userData.districts : [],
    });

    // Fetch assigned blocks dynamically from API
    let blocks = [];
    try {
      const res = await fetch(
        `https://prtest1.kdsgroup.co.in:8000/getSupervisorBlocks/?loginID=${loginID}`,
      );
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.blocks)) {
        blocks = json.data.blocks.map((b) => b.block);
      }
    } catch (error) {
      console.error("Error fetching supervisor blocks:", error);
    }
    setAssignedBlocksState(blocks);

    // Fetch rejected villages using the fetched blocks
    if (blocks.length > 0) {
      try {
        const rejectedList = await supervisorService.getRejectedGaonList(
          blocks.join(","),
        );
        const villageArray = Array.isArray(rejectedList) ? rejectedList : [];
        setRejectedVillages(villageArray);
        setRejectedHasFlicker(villageArray.length > 0);
      } catch (error) {
        console.error("Error fetching rejected villages:", error);
        setRejectedVillages([]);
      }
    }
  };

  const handlePendingRegisterClick = () => {
    setViewModeWithURL("pending");
    setGaonData([]);
    setVillages([]);
    setPendingForm({ block: "", gaonCode: "", status: "1" });
  };

  const handleCompletedRegisterClick = () => {
    setViewModeWithURL("completed");
    setGaonData([]);
    setCompletedForm({ block: "" });
  };

  const handleRejectedFamiliesClick = async () => {
    setViewModeWithURL("rejected");
    setGaonData([]);
    setRejectedForm({ gaonCode: "" });

    setLoading(true);
    try {
      const rejectedList = await supervisorService.getRejectedGaonList(
        assignedBlocks.join(","),
      );

      setRejectedVillages(Array.isArray(rejectedList) ? rejectedList : []);
    } catch (error) {
      console.error("Error fetching rejected villages:", error);
      setRejectedVillages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignedFamiliesClick = () => {
    setViewModeWithURL("assigned");
    setGaonData([]);
    setSelectedPdfUrl(null);
    setSelectedGaon(null);
    setAssignedForm({ gaonCode: "" });
    setAssignedVillages([]);
    setAssignedAllRows([]);

    (async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://prtest1.kdsgroup.co.in:8000/getAssignedRejectedDataBySupervisor/?supervisorId=${loginID}`,
        );
        const json = await res.json();

        if (!json.success) {
          throw new Error("API returned failure");
        }

        // json.data.data is an object keyed by gaonCode
        const rawData = json.data?.data || {};

        // Build village list from keys, skip entries with errors
        const villages = [];
        const allRows = [];

        Object.entries(rawData).forEach(([gaonCode, families]) => {
          if (!Array.isArray(families)) return;

          families.forEach((family) => {
            const familyInfo = family.familyInfo || {};
            const members = Array.isArray(family.members) ? family.members : [];

            members.forEach((m) => {
              allRows.push({
                gaonCode,
                ...familyInfo, // houseNumber, familyHeadName, pdfNo, pages
                ...m, // actual member data (Hindi fields)
              });
            });
          });

          const firstFamily = families[0];
          const firstMember = firstFamily?.members?.[0] || {};

          villages.push({
            gaonCode,
            gaon: firstMember.gaon || firstMember.sabha || gaonCode,
          });
        });

        setAssignedAllRows(allRows);
        setAssignedVillages(villages);
      } catch (error) {
        console.error("Error fetching assigned families:", error);
        setAssignedAllRows([]);
        setAssignedVillages([]);
      } finally {
        setLoading(false);
      }
    })();
  };

  const handleVilPendingClick = async () => {
    setViewModeWithURL("vilNotStarted");
    setLoading(true);
    try {
      const currentDistrict = user.districts[0] || assignedDistrict;
      const currentBlocks =
        assignedBlocksState.length > 0 ? assignedBlocksState : assignedBlocks;
      console.log(
        "vilNotStarted params:",
        currentDistrict,
        currentBlocks.join(","),
      );
      const data = await supervisorService.vilNotStartedTblDESU(
        currentDistrict,
        currentBlocks.join(","),
      );
      setGaonData(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching villages pending for entry:", error);
      setGaonData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDashboardClick = () => {
    setViewModeWithURL("dashboard");
    setGaonData([]);
  };

  const handleManageOperatorsClick = () => {
    setViewModeWithURL("operators");
    setGaonData([]);
  };

  const handlePendingFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await supervisorService.getPendingVilSupervisor(
        pendingForm.gaonCode,
        loginID,
        pendingForm.status,
      );
      setGaonData(data);
      setSelectedGaon(pendingForm.gaonCode);
    } catch (error) {
      console.error("Error fetching pending register:", error);
      alert("Failed to load village data");
    } finally {
      setLoading(false);
    }
  };

  const handleCompletedFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await supervisorService.getCompletedVilSupervisor(
        loginID,
        assignedDistrict,
        completedForm.block,
      );
      setGaonData(data);
    } catch (error) {
      console.error("Error fetching completed registers:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Remove invisible unicode chars/spaces and keep only digits for gaonCode
  const normalizeGaonCode = (v) => String(v ?? "").replace(/[^\d]/g, "");

  // ✅ Build PDF URL for split preview
  const buildPdfUrl = (row) => {
    const pdfNo = row?.pdfNo || 1;
    let gaonCode = normalizeGaonCode(row?.gaonCode);
    let fromPage = row?.fromPage;
    let toPage = row?.toPage;

    if (Number(gaonCode) < 1000 && Number(fromPage) > 100000) {
      const tmp = gaonCode;
      gaonCode = normalizeGaonCode(fromPage);
      fromPage = tmp;
    }

    let url = `https://prds.kdsgroup.co.in/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;
    return url;
  };

  const handleRejectedFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const gaonCode = normalizeGaonCode(rejectedForm.gaonCode);
      const data = await supervisorService.getRejectedFamilies(gaonCode);
      // Ensure data is an array
      const familyArray = Array.isArray(data) ? data : [];
      // Sort data by family groups (same as original)
      familyArray.sort((a, b) => {
        const keyA =
          (a.houseNumberNum || "") +
          (a.houseNumberText || "") +
          (a.familyHeadName || "");
        const keyB =
          (b.houseNumberNum || "") +
          (b.houseNumberText || "") +
          (b.familyHeadName || "");
        if (keyA === keyB) {
          return parseInt(a.serialNo) - parseInt(b.serialNo);
        }
        return keyA.localeCompare(keyB);
      });
      setGaonData(familyArray);
      setSelectedGaon(gaonCode);
    } catch (error) {
      console.error("Error fetching rejected families:", error);
      setGaonData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignedFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSelectedPdfUrl(null);

    try {
      if (!assignedForm.gaonCode) {
        setGaonData([]);
        showMessage("Please select a village", "red");
        return;
      }

      const rows = Array.isArray(assignedAllRows) ? assignedAllRows : [];
      const filtered = rows.filter((r) => r?.gaonCode == assignedForm.gaonCode);

      filtered.sort((a, b) => {
        const keyA =
          (a.houseNumberNum || "") +
          (a.houseNumberText || "") +
          (a.familyHeadName || "");
        const keyB =
          (b.houseNumberNum || "") +
          (b.houseNumberText || "") +
          (b.familyHeadName || "");
        if (keyA === keyB) return parseInt(a.serialNo) - parseInt(b.serialNo);
        return keyA.localeCompare(keyB);
      });

      setGaonData(filtered);
      setSelectedGaon(assignedForm.gaonCode);
    } catch (error) {
      console.error("Error fetching assigned families:", error);
      setGaonData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignedEditClick = (row) => {
    setAssignedEditData({ ...(row || {}) });
    setShowAssignedEditModal(true);
  };

  const handleAssignedEditChange = (key, value) => {
    setAssignedEditData((prev) => ({ ...(prev || {}), [key]: value }));
  };

  const buildSupervisorUpdateRow = (row) => {
    const r = row || {};
    const toNum = (v) =>
      v === "" || v === null || v === undefined ? null : Number(v);
    return {
      id: toNum(r.id),
      zilaCode: r.zilaCode ?? "",
      zila: r.zila ?? "",
      tehsilCode: r.tehsilCode ?? "",
      tehsil: r.tehsil ?? "",
      blockCode: r.blockCode ?? "",
      block: r.block ?? "",
      sabhaCode: r.sabhaCode ?? "",
      sabha: r.sabha ?? "",
      panchayat: r.panchayat ?? "",
      gaon: r.gaon ?? "",
      gaonCode: r.gaonCode ?? "",
      serialNo: toNum(r.serialNo),
      houseNumberNum: toNum(r.houseNumberNum),
      houseNumberText: r.houseNumberText ?? "",
      familyHeadName: r.familyHeadName ?? "",
      memberName: r.memberName ?? "",
      fatherOrHusbandName: r.fatherOrHusbandName ?? "",
      gender: r.gender ?? "",
      religion: r.religion ?? "",
      caste: r.caste ?? "",
      dob: r.dob ?? "",
      business: r.business ?? "",
      literacy: r.literacy ?? "",
      qualification: r.qualification ?? "",
      leavingDate: r.leavingDate === "" ? null : (r.leavingDate ?? null),
      description: r.description ?? "",
      byOperator: r.byOperator ?? "",
      entryDate: r.entryDate ?? "",
      pdfNo: toNum(r.pdfNo),
      fromPage: toNum(r.fromPage),
      toPage: toNum(r.toPage),
      status: r.status ?? "",
      remark: r.remark ?? "",
    };
  };

  const handleAssignedEditSave = async () => {
    if (!assignedEditData) return;
    try {
      const original =
        (Array.isArray(gaonData) ? gaonData : []).find(
          (r) => String(r?.id) === String(assignedEditData?.id),
        ) || {};
      const mergedRow = { ...original, ...assignedEditData };
      const cleanGaonCode = normalizeGaonCode(
        mergedRow.gaonCode || assignedForm.gaonCode || "",
      );
      const payload = {
        supervisorId: loginID,
        gaonCode: cleanGaonCode,
        updates: [
          buildSupervisorUpdateRow({
            ...mergedRow,
            gaonCode: cleanGaonCode,
            status: loginID,
          }),
        ],
      };
      await supervisorService.supervisoRejectedUpdate(payload);
      showMessage("Updated Successfully ✅", "green");
      setShowAssignedEditModal(false);
      if (viewMode === "assigned" && assignedForm.gaonCode) {
        handleAssignedFormSubmit({ preventDefault: () => {} });
      }
    } catch (error) {
      console.error("Update Error:", error);
      showMessage("Update Failed ❌", "red");
    }
  };

  const handleEditFamily = (familyData) => {
    setEditFamilyData(familyData);
    setShowEditModal(true);
  };

  const handleAddRecord = (familyData) => {
    setAddRecordFamilyData(familyData);
    setShowAddRecordModal(true);
  };

  const handleDeleteRecord = async (id, gaonCode, serialNo) => {
    const text =
      serialNo === 1
        ? "Do you want to delete this whole family record?"
        : "Do you want to delete this record?";

    if (!window.confirm(text)) return;

    try {
      const result =
        viewMode === "rejected"
          ? await supervisorService.deleteRejectedRecord(id, gaonCode)
          : await supervisorService.deleteRecord(id, gaonCode);

      if (result.success) {
        showMessage("Record deleted successfully!", "green");
        // Refresh data
        if (viewMode === "pending") {
          handlePendingFormSubmit({ preventDefault: () => {} });
        } else if (viewMode === "rejected") {
          handleRejectedFormSubmit({ preventDefault: () => {} });
        }
      } else {
        showMessage("Error: " + result.error, "red");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      showMessage("An unexpected error occurred. Please try again.", "red");
    }
  };

  const handleApproveFamily = async (id, gaonCode) => {
    if (!window.confirm("Do you want to approve this Family?")) return;

    try {
      const result =
        viewMode === "rejected"
          ? await supervisorService.approveRejectedFamilySup(id, gaonCode)
          : await supervisorService.approveFamilySup(id, gaonCode);

      if (result.success) {
        showMessage("Family approved successfully!", "green");
        // Refresh data
        if (viewMode === "pending") {
          handlePendingFormSubmit({ preventDefault: () => {} });
        } else if (viewMode === "rejected") {
          handleRejectedFormSubmit({ preventDefault: () => {} });
        }
      } else {
        showMessage(result.error || "Failed to approve family", "red");
      }
    } catch (error) {
      console.error("Error approving family:", error);
      showMessage("Failed to approve family", "red");
    }
  };

  const handleVerifyRegister = async () => {
    const tableName = "g" + selectedGaon;
    try {
      const result = await supervisorService.supervisorApprove(tableName);
      if (result.status === "success") {
        showMessage("सत्यापित हो गया !", "green");
        setTimeout(() => window.location.reload(), 2000);
      } else {
        showMessage(`Error: ${result.error}!`, "red");
      }
    } catch (error) {
      console.error("Error verifying register:", error);
      showMessage("Failed to verify register", "red");
    }
  };

  const handleDeleteDuplicates = async () => {
    if (!selectedGaon) return;

    try {
      const result = await supervisorService.deleteDuplicate(selectedGaon);
      if (result.error) {
        showMessage(`Error: ${result.error}!`, "red");
      } else {
        showMessage(
          `${result.deleted_count} Duplicate Entries Found & Deleted!`,
          "green",
        );
        handlePendingFormSubmit({ preventDefault: () => {} });
      }
    } catch (error) {
      console.error("Error deleting duplicates:", error);
      showMessage("Failed to delete duplicates", "red");
    }
  };

  const handleDownloadRegister = () => {
    if (!selectedGaon) return;
    supervisorService.downloadPendingGaonExcel(selectedGaon);
  };

  const handleDownloadCompleted = (gaonCode) => {
    supervisorService.downloadGaonSupervisor(gaonCode);
  };

  const showMessage = (message, color) => {
    setMessageModal({ show: true, message, color });
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("loginID");
      navigate("/");
    }
  };

  if (loading && !gaonData.length) {
    return (
      <div className="supervisor-page">
        <div id="loading-screen" style={{ display: "flex" }}>
          <div className="spinner"></div>
          <h2>&nbsp;&nbsp;&nbsp;Loading, please wait...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="supervisor-page">
      <SupervisorSidebar
        user={user}
        onPendingRegisterClick={handlePendingRegisterClick}
        onCompletedRegisterClick={handleCompletedRegisterClick}
        onRejectedFamiliesClick={handleRejectedFamiliesClick}
        onAssignedFamiliesClick={handleAssignedFamiliesClick}
        onVilPendingClick={handleVilPendingClick}
        onDashboardClick={handleDashboardClick}
        onManageOperatorsClick={handleManageOperatorsClick}
        onChangePassword={() => setShowPasswordModal(true)}
        onLogout={handleLogout}
        rejectedHasFlicker={rejectedHasFlicker}
      />

      <div className="content" id="content">
        <div
          style={{
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "#fff",
            borderRadius: "0",
            margin: "0",
            boxShadow: "0 1px 3px #0000001a",
            borderBottom: "2px solid #e2e8f0",
          }}
        >
          <div className="header" style={{ width: "66%" }}>
            <span className="title" id="registerTitle">
              {viewMode === "pending" && "Pending Register"}
              {viewMode === "completed" && "Completed Registers"}
              {viewMode === "rejected" && "Rejected Families"}
              {viewMode === "assigned" && "Assigned Families"}
              {viewMode === "vilNotStarted" && "Villages Pending for Entry"}
              {viewMode === "dashboard" && "Dashboard"}
              {viewMode === "operators" && "Manage Operator"}
            </span>
          </div>

          <div className="button">
            {viewMode === "pending" && selectedGaon && (
              <>
                <button
                  className="download-btn"
                  onClick={handleDownloadRegister}
                >
                  <i
                    className="fas fa-download"
                    style={{ marginRight: "10px" }}
                  ></i>
                  डाउनलोड रजिस्टर
                </button>
                <button className="delete-btn" onClick={handleDeleteDuplicates}>
                  <i
                    className="fas fa-trash"
                    style={{ marginRight: "10px" }}
                  ></i>
                  डुप्लीकेट हटाये
                </button>
                <button
                  className="verified-btn"
                  onClick={handleVerifyRegister}
                  disabled={gaonData.some((row) => row.status !== "Approved")}
                >
                  <i
                    className="fas fa-check"
                    style={{ marginRight: "10px" }}
                  ></i>
                  सत्यापित करें
                </button>
              </>
            )}
            {viewMode === "vilNotStarted" && gaonData.length > 0 && (
              <button
                className="download-btn"
                onClick={() =>
                  supervisorService.downloadVilNotStartedTblDESU(
                    assignedDistrict,
                    assignedBlocks.join(","),
                  )
                }
              >
                <i
                  className="fas fa-download"
                  style={{ marginRight: "10px" }}
                ></i>
                Download
              </button>
            )}
          </div>
        </div>

        {/* Forms Section */}
        <div className="container main-container">
          {/* ================= PENDING ================= */}
          {viewMode === "pending" && (
            <form
              onSubmit={handlePendingFormSubmit}
              id="getPendingRegForm"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                width: "100%",
                background: "#fff",
                padding: "20px",
                borderRadius: "16px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                marginTop: "10px",
              }}
            >
              {/* Block */}
              <div>
                <label>
                  ब्लाक <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={pendingForm.block}
                  onChange={async (e) => {
                    setPendingForm({ ...pendingForm, block: e.target.value });
                    try {
                      const villages =
                        await supervisorService.getGaonListWithCodeByBlock(
                          e.target.value,
                        );
                      setVillages(villages);
                    } catch (error) {
                      console.error("Error fetching villages:", error);
                    }
                  }}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#eef4ff",
                    outline: "none",
                    marginTop: "10px",
                  }}
                >
                  <option value="">Select Block</option>
                  {assignedBlocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>

              {/* Gaon */}
              <div>
                <label>
                  गांव <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={pendingForm.gaonCode}
                  onChange={(e) =>
                    setPendingForm({ ...pendingForm, gaonCode: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#eef4ff",
                    outline: "none",
                    marginTop: "10px",
                  }}
                >
                  <option value="">Select Gaon</option>
                  {Array.isArray(villages) &&
                    villages.map((v) => (
                      <option key={v.gaonCode} value={v.gaonCode}>
                        {v.gaonCode} - {v.gaon}
                      </option>
                    ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label>
                  Approval status <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={pendingForm.status}
                  onChange={(e) =>
                    setPendingForm({ ...pendingForm, status: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#eef4ff",
                    outline: "none",
                    marginTop: "10px",
                  }}
                >
                  <option value="1">All</option>
                  <option value="3">Remaining for approval</option>
                  <option value="2">Approved</option>
                </select>
              </div>

              {/* Button Center */}
              <div
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "10px",
                  marginTop: "10px",
                }}
              >
                <div
                  style={{
                    textAlign: "center",
                  }}
                >
                  <button
                    type="submit"
                    style={{
                      width: "100%",
                      padding: "10px 20px",
                      borderRadius: "25px",
                      border: "none",
                      background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                      color: "#fff",
                      fontSize: "16px",
                      cursor: "pointer",
                      // marginTop: "10px",
                      textAlign: "center",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    गांव का डाटा पाएं
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ================= COMPLETED ================= */}
          {viewMode === "completed" && (
            <form
              onSubmit={handleCompletedFormSubmit}
              id="getCompletedRegForm"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                background: "#fff",
                padding: "20px",
                borderRadius: "16px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
                width: "100%",
                marginTop: "10px",
              }}
            >
              <div>
                <label>ब्लाक</label>
                <select
                  value={completedForm.block}
                  onChange={(e) => setCompletedForm({ block: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#eef4ff",
                    outline: "none",
                    marginTop: "10px",
                  }}
                >
                  <option value="">Select Block</option>
                  {assignedBlocks.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  textAlign: "center",
                }}
              >
                <button
                  type="submit"
                  style={{
                    width: "200px",
                    padding: "10px 20px",
                    borderRadius: "25px",
                    border: "none",
                    background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                    color: "#fff",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginTop: "25px",
                    marginLeft: "10px",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  गांव का डाटा पाएं
                </button>
              </div>
            </form>
          )}

          {/* ================= REJECTED ================= */}
          {viewMode === "rejected" && (
            <form
              onSubmit={handleRejectedFormSubmit}
              id="getRejectedFamForm"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: "12px",
                background: "#fff",
                padding: "20px",
                borderRadius: "16px",
                width: "100%",
                marginTop: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
            >
              <div>
                <label>
                  गांव <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={rejectedForm.gaonCode}
                  onChange={(e) =>
                    setRejectedForm({ gaonCode: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#eef4ff",
                    outline: "none",
                    marginTop: "10px",
                  }}
                >
                  <option value="">Select Gaon</option>
                  {rejectedVillages.map((v) => (
                    <option key={v.gaonCode} value={v.gaonCode}>
                      {v.gaonCode} - {v.gaon}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  textAlign: "center",
                }}
              >
                <button
                  type="submit"
                  style={{
                    width: "200px",
                    padding: "10px 20px",
                    borderRadius: "25px",
                    border: "none",
                    background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                    color: "#fff",
                    fontSize: "16px",
                    cursor: "pointer",
                    marginTop: "25px",
                    marginLeft: "10px",
                    textAlign: "center",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  गांव का डाटा पाएं
                </button>
              </div>
            </form>
          )}

          {/* ================= ASSIGNED ================= */}
          {viewMode === "assigned" && (
            <form
              onSubmit={handleAssignedFormSubmit}
              id="getAssignedFamForm"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: "12px",
                alignItems: "end",
                background: "#fff",
                padding: "20px",
                borderRadius: "16px",
                width: "100%",
                marginTop: "10px",
                boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
              }}
            >
              <div>
                <label>
                  गांव <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  value={assignedForm.gaonCode}
                  onChange={(e) =>
                    setAssignedForm({ gaonCode: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "10px",
                    border: "none",
                    background: "#eef4ff",
                    outline: "none",
                    marginTop: "10px",
                  }}
                >
                  <option value="">Select Gaon</option>
                  {assignedVillages.map((v) => (
                    <option key={v.gaonCode} value={v.gaonCode}>
                      {v.gaonCode} - {v.gaon}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                style={{
                  width: "200px",
                  padding: "10px 20px",
                  borderRadius: "25px",
                  border: "none",
                  background: "linear-gradient(90deg,#6a75f0,#8a5fd3)",
                  color: "#fff",
                  fontSize: "16px",
                  cursor: "pointer",
                  textAlign: "center",
                  display: "flex",
                  justifyContent: "center",
                }}
              >
                गांव का डाटा पाएं
              </button>
            </form>
          )}

          {/* ✅ ASSIGNED SPLIT VIEW (TABLE LEFT, PDF RIGHT) */}
          {viewMode === "assigned" && gaonData.length > 0 && (
            <div style={{ display: "flex", gap: "12px", width: "100%" }}>
              <div style={{ width: selectedPdfUrl ? "50%" : "100%" }}>
                <div className="table-container">
                  <table className="main-table">
                    <thead>
                      <tr>
                        <th>गाँव</th>
                        <th>गाँव कोड</th>
                        <th>परिवार प्रमुख</th>
                        <th>मकान नं.</th>
                        <th>सदस्य क्रमांक</th>
                        <th>सदस्य नाम</th>
                        <th>पिता/पति</th>
                        <th>लिंग</th>
                        <th>DOB</th>
                        <th>Remark</th>
                        <th>PDF</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaonData.map((row, idx) => (
                        <tr key={row.id || idx}>
                          <td>{row.gaon || row.sabha || row.gaonCode}</td>
                          <td>{row.gaonCode}</td>
                          <td>{row.familyHeadName}</td>
                          <td>
                            {row.houseNumberNum ?? ""}
                            {row.houseNumberText
                              ? ` ${row.houseNumberText}`
                              : ""}
                          </td>
                          <td>{row.serialNo}</td>
                          <td>{row.memberName}</td>
                          <td>{row.fatherOrHusbandName}</td>
                          <td>{row.gender}</td>
                          <td>{row.dob ? row.dob.split("T")[0] : ""}</td>
                          <td>{row.remark}</td>
                          <td>
                            {row.pdfNo
                              ? `${row.pdfNo} (${row.fromPage}-${row.toPage})`
                              : ""}
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                type="button"
                                className="download-btn"
                                onClick={() =>
                                  setSelectedPdfUrl(buildPdfUrl(row))
                                }
                                disabled={!row.gaonCode}
                                style={{ padding: "6px 10px" }}
                              >
                                View
                              </button>
                              <button
                                type="button"
                                className="download-btn"
                                onClick={() => handleAssignedEditClick(row)}
                                style={{ padding: "6px 10px" }}
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPdfUrl && (
                <div
                  style={{
                    width: "50%",
                    background: "#fff",
                    borderRadius: "12px",
                    boxShadow: "0 8px 25px rgba(0,0,0,0.12)",
                    padding: "12px",
                    height: "calc(100vh - 260px)",
                    position: "sticky",
                    top: "110px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <b>PDF Preview</b>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button
                        type="button"
                        className="download-btn"
                        onClick={() => window.open(selectedPdfUrl, "_blank")}
                        style={{ padding: "6px 10px" }}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="download-btn"
                        onClick={() => setSelectedPdfUrl(null)}
                        style={{ padding: "6px 10px" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                  <iframe
                    src={selectedPdfUrl}
                    title="PDF Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid #e5e7eb",
                      borderRadius: "10px",
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        {viewMode === "operators" && (
          <ManageOperatorModal
            loginID={loginID}
            inline={true}
            onClose={() => setViewModeWithURL("pending")}
            onAddOperator={() => setShowAddOperator(true)}
          />
        )}
        {viewMode === "dashboard" && (
          <>
            <OperatorMonitoring
              loginID={loginID}
              assignedDistrict={assignedDistrict}
              assignedBlocks={assignedBlocks}
            />
            <DataMonitoring
              assignedDistrict={assignedDistrict}
              assignedBlocks={assignedBlocks}
            />
          </>
        )}

        {(viewMode === "pending" || viewMode === "rejected") &&
          gaonData.length > 0 && (
            <div className="table-container">
              <RegisterTable
                data={gaonData}
                viewMode={viewMode}
                onEdit={handleEditFamily}
                onAdd={handleAddRecord}
                onDelete={handleDeleteRecord}
                onApprove={handleApproveFamily}
                onViewPDF={(pdfNo, fromPage, toPage, gaonCode) => {
                  const url = `https://parivarregister.kdsgroup.co.in/app/getPDFPage/?pdfNo=${pdfNo}&fromPage=${fromPage}&toPage=${toPage}&gaonCode=${gaonCode}`;
                  window.open(url, "_blank");
                }}
              />
            </div>
          )}

        {viewMode === "completed" && gaonData.length > 0 && (
          <div className="table-container">
            <table className="main-table" id="gaonTable">
              <thead>
                <tr>
                  <th>जनपद</th>
                  <th>तहसील</th>
                  <th>ब्लाक</th>
                  <th>गाँव सभा</th>
                  <th>गाँव</th>
                  <th>गाँव कोड</th>
                  <th>डाउनलोड रजिस्टर</th>
                </tr>
              </thead>
              <tbody>
                {gaonData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.zila}</td>
                    <td>{row.tehsil}</td>
                    <td>{row.block}</td>
                    <td>{row.sabha}</td>
                    <td>{row.gaon}</td>
                    <td>{row.gaonCode}</td>
                    <td>
                      <button
                        className="download-btn "
                        onClick={() => handleDownloadCompleted(row.gaonCode)}
                      >
                        डाउनलोड रजिस्टर
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {viewMode === "vilNotStarted" && gaonData.length > 0 && (
          <div className="table-container">
            <table className="main-table">
              <thead>
                <tr>
                  <th>जनपद</th>
                  <th>ब्लाक</th>
                  <th>गाँव</th>
                  <th>गाँव कोड</th>
                </tr>
              </thead>
              <tbody>
                {gaonData.map((row, idx) => (
                  <tr key={idx}>
                    <td>{row.district}</td>
                    <td>{row.block}</td>
                    <td>{row.village}</td>
                    <td>{row.villageCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditFamilyModal
          familyData={editFamilyData}
          viewMode={viewMode}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            if (viewMode === "pending") {
              handlePendingFormSubmit({ preventDefault: () => {} });
            } else if (viewMode === "rejected") {
              handleRejectedFormSubmit({ preventDefault: () => {} });
            }
          }}
        />
      )}

      {showAddRecordModal && (
        <AddRecordModal
          familyData={addRecordFamilyData}
          viewMode={viewMode}
          onClose={() => setShowAddRecordModal(false)}
          onSave={() => {
            setShowAddRecordModal(false);
            if (viewMode === "pending") {
              handlePendingFormSubmit({ preventDefault: () => {} });
            } else if (viewMode === "rejected") {
              handleRejectedFormSubmit({ preventDefault: () => {} });
            }
          }}
        />
      )}

      {showPasswordModal && (
        <ChangePasswordModal
          loginID={loginID}
          onClose={() => setShowPasswordModal(false)}
        />
      )}

      {showAddOperator && (
        <AddOperatorModal
          supervisorID={loginID}
          onClose={() => setShowAddOperator(false)}
          onSuccess={() => {
            setShowAddOperator(false);
          }}
        />
      )}

      {showAddOperator && (
        <AddOperatorModal
          supervisorID={loginID}
          onClose={() => setShowAddOperator(false)}
          onSuccess={() => {
            setShowAddOperator(false);
            setShowManageOperators(true);
          }}
        />
      )}

      {showAssignedEditModal && assignedEditData && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
          onClick={() => setShowAssignedEditModal(false)}
        >
          <div
            style={{
              width: "min(950px, 98vw)",
              maxHeight: "85vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: "16px",
              padding: "18px",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                marginBottom: "12px",
              }}
            >
              <h3 style={{ margin: 0 }}>
                Edit Assigned Family (Gaon: {assignedEditData.gaon || ""} -
                {assignedEditData.gaonCode || ""})
              </h3>
              <button
                type="button"
                className="download-btn"
                onClick={() => setShowAssignedEditModal(false)}
              >
                Close
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
              }}
            >
              {Object.keys(assignedEditData).map((key) => {
                const value = assignedEditData[key];
                const readOnlyKeys = ["id", "gaonCode"];
                const isReadOnly = readOnlyKeys.includes(key);
                const isLongText = ["description", "remark"].includes(key);
                const isNumber =
                  typeof value === "number" ||
                  [
                    "serialNo",
                    "houseNumberNum",
                    "pdfNo",
                    "fromPage",
                    "toPage",
                  ].includes(key);
                const isDate = ["dob", "entryDate", "leavingDate"].includes(
                  key,
                );

                return (
                  <div key={key}>
                    <label style={{ fontSize: "12px", color: "#333" }}>
                      {key}
                    </label>
                    {isLongText ? (
                      <textarea
                        value={value ?? ""}
                        readOnly={isReadOnly}
                        onChange={(e) =>
                          handleAssignedEditChange(key, e.target.value)
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          marginTop: "6px",
                          minHeight: "70px",
                        }}
                      />
                    ) : (
                      <input
                        type={isDate ? "date" : isNumber ? "number" : "text"}
                        value={value ?? ""}
                        readOnly={isReadOnly}
                        onChange={(e) =>
                          handleAssignedEditChange(
                            key,
                            isNumber ? Number(e.target.value) : e.target.value,
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "10px",
                          border: "1px solid #e5e7eb",
                          marginTop: "6px",
                        }}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                marginTop: "14px",
              }}
            >
              <button
                type="button"
                className="download-btn"
                onClick={() => setShowAssignedEditModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="download-btn"
                onClick={handleAssignedEditSave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {messageModal.show && (
        <MessageModal
          message={messageModal.message}
          color={messageModal.color}
          onClose={() =>
            setMessageModal({ show: false, message: "", color: "" })
          }
        />
      )}
    </div>
  );
};

export default SupervisorDashboard;
