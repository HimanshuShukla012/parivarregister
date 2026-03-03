// src/services/adoService.js
import api from "./api";

const CANDIDATE_ENDPOINTS = [
  "/sabha_reaport_api/",
  "/sabha_reaport_api",
  "/sabha_report_api/",
  "/sabha_report_api",
];

function isNotFound(err) {
  const status = err?.response?.status;
  return status === 404;
}

/**
 * Fetch Sabha report for a block.
 * @param {string} blockName
 * @returns {Promise<any>}
 */
export async function fetchSabhaReport(blockName) {
  const block = (blockName || "").trim();
  if (!block) {
    throw new Error("Block name missing. Pass it in URL like ?block=Katehari.");
  }

  const params = { block, _ts: Date.now() };

  let lastErr = null;
  for (const url of CANDIDATE_ENDPOINTS) {
    try {
      const res = await api.get(url, { params });
      return res?.data;
    } catch (err) {
      lastErr = err;
      if (!isNotFound(err)) break;
    }
  }

  const status = lastErr?.response?.status;
  const hitUrl = lastErr?.config?.url;
  const baseURL = lastErr?.config?.baseURL;

  throw new Error(
    `API failed (${status || "Network"}). Tried: ${CANDIDATE_ENDPOINTS.join(
      ", ",
    )}. baseURL=${baseURL || "(empty)"}, lastUrl=${hitUrl || "(unknown)"}`,
  );
}

/**
 * Fetch villages with approved data entry for a given sabha.
 * @param {string} sabhaName
 * @returns {Promise<any>}
 */
export async function fetchApprovedVillagesBySabha(sabhaName) {
  const res = await api.get("/get_approved_gaon_codes", {
    params: { sabhaName },
  });
  return res?.data;
}

/**
 * Fetch gaon/family data for a specific gaon code.
 * @param {string} gaonCode
 * @returns {Promise<any>}
 */
export async function fetchGaonData(gaonCode) {
  const res = await api.get("/getGaonData/", { params: { gaon_code: gaonCode } });
  return res?.data;
}

/**
 * Approve a Sabha.
 * @param {string} sabhaName
 * @returns {Promise<any>}
 */
export async function approveSabha(sabhaName) {
  const res = await api.post("/approve_sabha_data/", { sabhaName });
  return res?.data;
}

/**
 * Reject a Sabha with a remark.
 * @param {string} sabhaName
 * @param {string} remark
 * @returns {Promise<any>}
 */
export async function rejectSabha(sabhaName, remark) {
  const res = await api.post("/reject_sabha_data/", { sabhaName, remark });
  return res?.data;
}

export default {
  fetchSabhaReport,
  fetchApprovedVillagesBySabha,
  fetchGaonData,
  approveSabha,
  rejectSabha,
};

export const fetchRejectedBlocks = async (blockName) => {
  const response = await api.get(
    `/drpo_rejected_data_report/?blockName=${encodeURIComponent(blockName)}`
  );
  return response.data;
};