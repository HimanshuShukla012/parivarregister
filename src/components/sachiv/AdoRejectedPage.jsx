// src/components/sachiv/AdoRejectedPage.jsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import RegisterSidebar from "./RegisterSidebar";
import RegisterTable from "./RegisterTable";

import "../../assets/styles/pages/sachiv.css"

const STATIC_USER = {
  loginID: "SA4000",
  zila: "Hamirpur",
  tehsil: "Maudaha",
  block: "Maudaha",
  sabha: "Chhimauli",
};

const STATIC_VILLAGES = [
  {
    gaon: "Chhimauli",
    gaonCode: "154226",
    zila: "Hamirpur",
    tehsil: "Maudaha",
    block: "Maudaha",
    sabha: "Chhimauli",
    aDORemark: "मकान नम्बर में त्रुटि / डुप्लिकेट एंट्री",
  },
];

const STATIC_GAON_DATA_BY_CODE = {
  154226: [
    {
      janpad: "Hamirpur",
      tehsil: "Maudaha",
      block: "Maudaha",
      gramSabha: "Chhimauli",
      gaon: "Chhimauli",
      gaonCode: "154226",
      nyayPanchayat: "",
      serialNo: 1,
      houseNoNum: 100,
      houseNoAlpha: "",
      status: "Rejected",
    },
    {
      janpad: "Hamirpur",
      tehsil: "Maudaha",
      block: "Maudaha",
      gramSabha: "Chhimauli",
      gaon: "Chhimauli",
      gaonCode: "154226",
      nyayPanchayat: "",
      serialNo: 2,
      houseNoNum: 100,
      houseNoAlpha: "",
      status: "Rejected",
    },
    {
      janpad: "Hamirpur",
      tehsil: "Maudaha",
      block: "Maudaha",
      gramSabha: "Chhimauli",
      gaon: "Chhimauli",
      gaonCode: "154226",
      nyayPanchayat: "",
      serialNo: 1,
      houseNoNum: 101,
      houseNoAlpha: "",
      status: "Approved",
    },
  ],
};

const AdoRejectedPage = () => {
  const navigate = useNavigate();

  // ✅ STATIC STATES
  const [user] = useState(STATIC_USER);
  const [villages] = useState(STATIC_VILLAGES);

  // ✅ default: first village (or first rejected)
  const [selectedVillage, setSelectedVillage] = useState(() => {
    const firstRejected = STATIC_VILLAGES.find((v) => v.aDORemark);
    return firstRejected || STATIC_VILLAGES[0] || null;
  });

  // ✅ load initial gaon data statically
  const [gaonData, setGaonData] = useState(() => {
    const code =
      (STATIC_VILLAGES.find((v) => v.aDORemark) || STATIC_VILLAGES[0] || {})
        .gaonCode || "";
    return STATIC_GAON_DATA_BY_CODE[code] || [];
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [tab, setTab] = useState("rejected");

  const handleLogout = () => {
    navigate("/");
  };

  const handleVillageClick = (village) => {
    setSelectedVillage(village);
    const code = village?.gaonCode;
    setGaonData(STATIC_GAON_DATA_BY_CODE[code] || []);
  };

  const stats = useMemo(() => {
    if (!gaonData || gaonData.length === 0) {
      return {
        totalFamilies: 0,
        totalMembers: 0,
        approvedFamilies: 0,
        approvedMembers: 0,
      };
    }

    // Families: serialNo == 1
    const totalFamilies = gaonData.filter(
      (row) => String(row.serialNo) === "1",
    ).length;

    const totalMembers = gaonData.length;

    const approvedFamilies = gaonData.filter(
      (row) => String(row.serialNo) === "1" && row.status === "Approved",
    ).length;

    const approvedMembers = gaonData.filter(
      (row) => row.status === "Approved",
    ).length;

    return { totalFamilies, totalMembers, approvedFamilies, approvedMembers };
  }, [gaonData]);

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
        <div className="sachiv-main-content">
          <div className="sachiv-header">
            <span className="sachiv-title" id="registerTitle">
              {selectedVillage
                ? `${selectedVillage.gaon} रजिस्टर (ADO द्वारा अस्वीकृत)`
                : "ADO द्वारा अस्वीकृत रजिस्टर"}
            </span>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "15px",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: "10px",
              }}
            ></div>

            <div className="sachiv-button-group">
              <button className="sachiv-download-btn">
                <i className="fas fa-download" style={{ marginRight: 10 }} />
                डाउनलोड रजिस्टर
              </button>
            </div>
          </div>
        </div>

        {/* ✅ Show remark if exists */}
        {selectedVillage?.aDORemark && (
          <div className="sachiv-remark sachiv-main-content">
            <h4>ADO's Remark: </h4>
            <span>{selectedVillage.aDORemark}</span>
          </div>
        )}

        {/* ✅ Stats */}
        {selectedVillage && (
          <div className="sachiv-stats-container">
            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon">
                <i className="fas fa-home"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">कुल परिवार</div>
                <div className="sachiv-stat-value">{stats.totalFamilies}</div>
              </div>
            </div>

            <div className="sachiv-stat-card">
              <div className="sachiv-stat-icon sachiv-stat-icon-members">
                <i className="fas fa-users"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">कुल सदस्य</div>
                <div className="sachiv-stat-value">{stats.totalMembers}</div>
              </div>
            </div>

            <div className="sachiv-stat-card">
              <div
                className="sachiv-stat-icon"
                style={{ backgroundColor: "#10b981" }}
              >
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">सत्यापित परिवार</div>
                <div className="sachiv-stat-value">
                  {stats.approvedFamilies}
                </div>
              </div>
            </div>

            <div className="sachiv-stat-card">
              <div
                className="sachiv-stat-icon sachiv-stat-icon-members"
                style={{ backgroundColor: "#10b981" }}
              >
                <i className="fas fa-user-check"></i>
              </div>
              <div className="sachiv-stat-content">
                <div className="sachiv-stat-label">सत्यापित सदस्य</div>
                <div className="sachiv-stat-value">{stats.approvedMembers}</div>
              </div>
            </div>
          </div>
        )}

        {/* ✅ Search only */}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            margin: "0 0 12px 0",
          }}
        >
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="खोजें......"
            style={{
              width: "280px",
              padding: "10px 12px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              outline: "none",
            }}
          />
        </div>

        <div className="sachiv-container">
          <RegisterTable
            data={gaonData}
            status={tab === "rejected" ? "rejected" : "approved"}
            searchTerm={searchTerm}
          />
        </div>
      </div>
    </div>
  );
};

export default AdoRejectedPage;
