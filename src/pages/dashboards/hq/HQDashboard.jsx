// src/pages/dashboards/hq/HQDashboard.jsx
import { useState, useEffect } from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import hqService from "../../../services/hqService";
import DistrictOverviewCards from "../../../components/hq/DistrictOverviewCards";
import DistrictDetailsView from "../../../components/hq/DistrictDetailsView";
import DistrictReportTable from "../../../components/hq/DistrictReportTable";
import VerificationStatusCards from "../../../components/hq/VerificationStatusCards";
import VerifyDataEntryForm from "../../../components/hq/VerifyDataEntryForm";
import GaonDataTable from "../../../components/hq/GaonDataTable";
import BlockReportView from "../../../components/hq/BlockReportView";
import "../../../assets/styles/pages/hq.css";

const HQDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [zilaList, setZilaList] = useState([]);
  const [districtOverview, setDistrictOverview] = useState([]);
  const [districtReport, setDistrictReport] = useState([]);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [districtDetails, setDistrictDetails] = useState(null);
  const [gaonData, setGaonData] = useState([]);
  const [showGaonData, setShowGaonData] = useState(false);
  const [selectedDistrictForBlocks, setSelectedDistrictForBlocks] =
    useState(null);
  const [blockData, setBlockData] = useState([]);
  const [showBlockReport, setShowBlockReport] = useState(false);

  useEffect(() => {
    initDashboard();
  }, []);

  useEffect(() => {
    // Add class to body for HQ-specific styles
    document.body.classList.add("hq-page");

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("hq-page");
    };
  }, []);

  const initDashboard = async () => {
    setLoading(true);
    try {
      const [zilas, overview, report, verification] = await Promise.all([
        hqService.getZilaList(),
        hqService.getDistrictOverview(),
        hqService.getDistrictReport(),
        hqService.getVerificationStatus(),
      ]);

      setZilaList(zilas);

      // FIX 1: Merge district report data into overview for accurate data_entry_done
      const reportMap = new Map(report.map((r) => [r.district, r]));
      const mergedOverview = overview.map((district) => ({
        ...district,
        data_entry_done:
          reportMap.get(district.district)?.families_data_entry_done || 0,
        sachiv_verified: reportMap.get(district.district)?.sachiv_verified || 0,
      }));

      setDistrictOverview(mergedOverview);
      setDistrictReport(report);
      setVerificationStatus(verification);
    } catch (error) {
      console.error("Error initializing dashboard:", error);
      alert("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleDistrictClick = async (districtIdentifier) => {
    try {
      console.log("🔍 Fetching details for district:", districtIdentifier);

      // Get district details from API
      const details = await hqService.getDistrictDetails(districtIdentifier);

      console.log("✅ Received district details:", details);

      // Ensure zilaCode is present - fallback to overview data if needed
      if (!details.zilaCode) {
        const overviewDistrict = districtOverview.find(
          (d) =>
            d.district === districtIdentifier ||
            d.zilaCode === districtIdentifier
        );

        if (overviewDistrict && overviewDistrict.zilaCode) {
          details.zilaCode = overviewDistrict.zilaCode;
          console.log("✅ Added zilaCode from overview:", details.zilaCode);
        } else {
          details.zilaCode = districtIdentifier;
          console.warn("⚠️ Using identifier as zilaCode:", districtIdentifier);
        }
      }

      setDistrictDetails(details);
      setSelectedDistrict(districtIdentifier);
    } catch (error) {
      console.error("❌ Error loading district details:", error);
      alert("Failed to load district details. Please try again.");
    }
  };

  const handleBackToOverview = () => {
    setSelectedDistrict(null);
    setDistrictDetails(null);
  };

  const handleGaonDataLoad = (data) => {
    setGaonData(data);
    setShowGaonData(true);
  };

  const handleDistrictClickForBlocks = async (districtName) => {
    try {
      const blocks = await hqService.getBlockReport(districtName);
      setBlockData(blocks);
      setSelectedDistrictForBlocks(districtName);
      setShowBlockReport(true);
    } catch (error) {
      console.error("Error loading block data:", error);
      alert("Failed to load block data");
    }
  };

  const handleCloseBlockView = () => {
    setSelectedDistrictForBlocks(null);
    setBlockData([]);
    setShowBlockReport(false);
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
          <div className="text-center">
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-blue-500 rounded-full animate-spin"></div>
              <div
                className="absolute inset-2 border-4 border-transparent border-b-cyan-400 border-l-cyan-400 rounded-full animate-spin"
                style={{ animationDirection: "reverse" }}
              ></div>
            </div>

            <h2 className="text-xl font-semibold text-white mb-2">
              Loading Dashboard
            </h2>
            <p className="text-slate-400 text-sm">Preparing your data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hq-dashboard hq-page">
      {/* Header */}
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

      {/* Main Content */}
      <div className="main-content">
        <h1 className="page-title">Parivar Register Digitization System</h1>

        {showBlockReport ? (
          <BlockReportView
            districtName={selectedDistrictForBlocks}
            blockData={blockData}
            onClose={handleCloseBlockView}
          />
        ) : (
          <>
            {!selectedDistrict ? (
              <DistrictOverviewCards
                districts={districtOverview}
                onDistrictClick={handleDistrictClick}
              />
            ) : (
              <DistrictDetailsView
                district={districtDetails}
                onBack={handleBackToOverview}
              />
            )}

            <DistrictReportTable
              data={districtReport}
              onDistrictClick={handleDistrictClickForBlocks}
            />

            <VerificationStatusCards status={verificationStatus} />

            <VerifyDataEntryForm
              zilaList={zilaList}
              onGaonDataLoad={handleGaonDataLoad}
            />

            {showGaonData && <GaonDataTable data={gaonData} />}
          </>
        )}
      </div>
    </div>
  );
};

export default HQDashboard;
