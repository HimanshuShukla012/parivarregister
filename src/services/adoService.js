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

export default {
  fetchSabhaReport,
};
