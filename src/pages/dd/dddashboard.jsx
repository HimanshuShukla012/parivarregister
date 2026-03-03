import { useEffect, useState } from "react";
import divisionService from "../../services/divisionService";
import VerifyDataEntryForm from "../../components/hq/VerifyDataEntryForm";
import GaonDataTable from "../../components/hq/GaonDataTable";
import "../../assets/styles/pages/hq.css";
import hqService from "../../services/hqService";

const DivisionHQDashboard = ({ username }) => {
  const [loading, setLoading] = useState(true);
  const [rawData, setRawData] = useState([]);
  const [districtData, setDistrictData] = useState([]);
  const [divisionSummary, setDivisionSummary] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [zilaList, setZilaList] = useState([]);
const [gaonData, setGaonData] = useState([]);
const [showGaonData, setShowGaonData] = useState(false);

  useEffect(() => {
    document.body.classList.add("hq-page");

    fetchData();

    return () => {
      document.body.classList.remove("hq-page");
    };
  }, []);

  const fetchData = async () => {
  try {
    const [divisionData, zilas] = await Promise.all([
      divisionService.getDivisionReport(username),
      hqService.getZilaList(),
    ]);

    setRawData(divisionData);
    generateDistrictData(divisionData);
    generateDivisionSummary(divisionData);

    setZilaList(zilas || []);
  } catch (err) {
    console.error(err);
    alert("Failed to load division data");
  } finally {
    setLoading(false);
  }
};

  


const handleGaonDataLoad = (data) => {
  setGaonData(data);
  setShowGaonData(true);
};

  const getBlocksForDistrict = (districtName) => {
  return rawData.filter(
    (item) => item.district_name === districtName
  );
};




  const generateDivisionSummary = (data) => {
    const summary = data.reduce(
      (acc, item) => {
        acc.totalGP += item.no_of_gps;
        acc.totalScanned += item.no_of_gps_scanned;
        acc.totalFamilies += item.no_of_families_registered;
        acc.totalVerified += item.no_of_families_record_verified;
        return acc;
      },
      {
        totalGP: 0,
        totalScanned: 0,
        totalFamilies: 0,
        totalVerified: 0,
      }
    );

    summary.verificationPercent =
      summary.totalFamilies > 0
        ? ((summary.totalVerified / summary.totalFamilies) * 100).toFixed(2)
        : 0;

    setDivisionSummary(summary);
  };

  const generateDistrictData = (data) => {
    const grouped = {};

    data.forEach((item) => {
      if (!grouped[item.district_name]) {
        grouped[item.district_name] = {
          district: item.district_name,
          totalGP: 0,
          scannedGP: 0,
          families: 0,
          verified: 0,
        };
      }

      grouped[item.district_name].totalGP += item.no_of_gps;
      grouped[item.district_name].scannedGP += item.no_of_gps_scanned;
      grouped[item.district_name].families += item.no_of_families_registered;
      grouped[item.district_name].verified +=
        item.no_of_families_record_verified;
    });

    setDistrictData(Object.values(grouped));
  };

  const handleLogout = (e) => {
    e.preventDefault();
    if (window.confirm("Are you sure you want to logout?")) {
      window.location.href = "/";
    }
  };

  if (loading) {
    return (
      <div className="hq-dashboard hq-page">
        <div className="hq-loading-screen">
          <p>Loading Division Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="hq-dashboard hq-page">
      {/* ===== TOPBAR / HEADER ===== */}
      <div className="header">
        <div className="header-content">
          <div className="logo-section">
            <img
              src="/assets/images/Department_Logo.png"
              alt="Panchayati Raj Logo"
              className="logo-img"
            />
            <div className="title-section">
              <h1>पंचायती राज मंत्रालय</h1>
              <h2>Ministry of Panchayati Raj</h2>
            </div>
          </div>

          <div className="right-section">
            <img
              src="/assets/images/Kds_logo.png"
              alt="KDS Logo"
              className="kds-logo"
            />

            <div className="user-info">
              <a href="/" className="logout" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div className="main-content">
        <h1 className="page-title">
          Division Dashboard - {username}
        </h1>

        {divisionSummary && (
          <div className="district-details-cards">
            <div className="district-detail-card">
              <div className="detail-card-value">
                {divisionSummary.totalGP}
              </div>
              <div className="detail-card-label">Total GP</div>
            </div>

            <div className="district-detail-card">
              <div className="detail-card-value">
                {divisionSummary.totalScanned}
              </div>
              <div className="detail-card-label">GP Scanned</div>
            </div>

            <div className="district-detail-card">
              <div className="detail-card-value">
                {divisionSummary.totalFamilies}
              </div>
              <div className="detail-card-label">
                Families Registered
              </div>
            </div>

            <div className="district-detail-card">
              <div className="detail-card-value">
                {divisionSummary.verificationPercent}%
              </div>
              <div className="detail-card-label">
                Verification %
              </div>
            </div>
          </div>
        )}

        {/* ============================= */}
{/* DISTRICT VIEW */}
{/* ============================= */}
{!selectedDistrict ? (
  <div className="district-cards">
    {districtData.map((district) => (
      <div
        key={district.district}
        className="district-card"
        onClick={() => setSelectedDistrict(district.district)}
      >
        <div className="district-name">
          {district.district}
        </div>

        <div className="district-metrics">
          <div className="district-metric">
            <div className="district-metric-value">
              {district.totalGP}
            </div>
            <div className="district-metric-label">
              Total GP
            </div>
          </div>

          <div className="district-metric">
            <div className="district-metric-value">
              {district.scannedGP}
            </div>
            <div className="district-metric-label">
              Scanned
            </div>
          </div>

          <div className="district-metric">
            <div className="district-metric-value">
              {district.families}
            </div>
            <div className="district-metric-label">
              Families
            </div>
          </div>

          <div className="district-metric">
            <div className="district-metric-value">
              {district.verified}
            </div>
            <div className="district-metric-label">
              Verified
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
) : (
  <>
    {/* ============================= */}
    {/* BLOCK VIEW */}
    {/* ============================= */}

    <div className="section-header">
      <h2 className="section-title">
        Blocks - {selectedDistrict}
      </h2>

      <button
        className="back-btn"
        onClick={() => setSelectedDistrict(null)}
      >
        ← Back to Districts
      </button>
    </div>

    <div className="district-cards">
      {getBlocksForDistrict(selectedDistrict).map((block) => (
        <div
          key={block.block_name}
          className="district-card"
        >
          <div className="district-name">
            {block.block_name}
          </div>

          <div className="district-metrics">
            <div className="district-metric">
              <div className="district-metric-value">
                {block.no_of_gps}
              </div>
              <div className="district-metric-label">
                Total GP
              </div>
            </div>

            <div className="district-metric">
              <div className="district-metric-value">
                {block.no_of_gps_scanned}
              </div>
              <div className="district-metric-label">
                Scanned
              </div>
            </div>

            <div className="district-metric">
              <div className="district-metric-value">
                {block.no_of_families_registered}
              </div>
              <div className="district-metric-label">
                Families
              </div>
            </div>

            <div className="district-metric">
              <div className="district-metric-value">
                {block.no_of_families_record_verified}
              </div>
              <div className="district-metric-label">
                Verified
              </div>
            </div>
          </div>
          
        </div>
      ))}

      
    </div>
  </>
)}

{/* ============================= */}
{/* VERIFY DATA ENTRY SECTION */}
{/* ============================= */}

<div className="section">
  
  <VerifyDataEntryForm
    zilaList={zilaList}
    onGaonDataLoad={handleGaonDataLoad}
  />

  {showGaonData && <GaonDataTable data={gaonData} />}
</div>
      </div>
    </div>
  );
};

export default DivisionHQDashboard;