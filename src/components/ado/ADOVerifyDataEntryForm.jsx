// src/components/ado/ADOVerifyDataEntryForm.jsx
import React, { useState } from "react";
import { fetchGaonData } from "../../services/adoService";

/**
 * ADOVerifyDataEntryForm
 * Props:
 *   sabhaList      – array from sabha_reaport_api (already has villages[])
 *   onGaonDataLoad – callback(data[]) called when family data is fetched
 */
const ADOVerifyDataEntryForm = ({ sabhaList = [], onGaonDataLoad }) => {
  const [selectedSabhaCode, setSelectedSabhaCode] = useState("");
  const [selectedGaonCode, setSelectedGaonCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Derive villages directly from the selected sabha in sabhaList
  const selectedSabhaObj = sabhaList.find(
    (s) => String(s.sabha_code) === selectedSabhaCode
  );
  const villages = selectedSabhaObj?.villages || [];

  const handleSabhaChange = (e) => {
    setSelectedSabhaCode(e.target.value);
    setSelectedGaonCode("");
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSabhaCode || !selectedGaonCode) {
      setError("Please select both Sabha and Village.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await fetchGaonData(selectedGaonCode);
      if (!data || (Array.isArray(data) && data.length === 0)) {
        setError("No data found for the selected village.");
        return;
      }
      onGaonDataLoad(Array.isArray(data) ? data : [data]);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch village data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Verify Data Entry</h2>
        <div className="section-line"></div>
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            margin: "10px 0",
            backgroundColor: "#fee2e2",
            border: "1px solid #ef4444",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "14px",
          }}
        >
          <i
            className="fas fa-exclamation-triangle"
            style={{ marginRight: "8px" }}
          ></i>
          {error}
        </div>
      )}

      <div id="formContainer" className="filter-section">
        <form onSubmit={handleSubmit}>
          <div className="formSubContainer">
            {/* Sabha selector */}
            <div>
              <label htmlFor="adoSabha">
                ग्राम सभा <span className="required">*</span>
              </label>
              <select
                id="adoSabha"
                value={selectedSabhaCode}
                onChange={handleSabhaChange}
                required
              >
                <option value="" disabled>
                  Select Sabha
                </option>
  {sabhaList.map((s) => (
                  <option key={s.sabha_code} value={String(s.sabha_code)}>
                    {s.sabha_name}
                  </option>
                ))}
              </select>
              
            </div>

            {/* Village selector */}
            <div>
              <label htmlFor="adoGaon">
                गाँव <span className="required">*</span>
              </label>
              <select
                id="adoGaon"
                value={selectedGaonCode}
                onChange={(e) => { setSelectedGaonCode(e.target.value); setError(""); }}
                disabled={!selectedSabhaCode || loading}
                required
              >
                <option value="" disabled>Select Village</option>
                {villages.map((v) => (
                  <option key={v.gaon_code} value={String(v.gaon_code)}>
                    {v.gaon_name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || !selectedSabhaCode || !selectedGaonCode}
              style={{
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Loading…
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i> डेटा प्राप्त करें
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ADOVerifyDataEntryForm;