// src/services/dproService.js
import api from "./api";

// In-memory cache for frequently accessed data
const cache = {
  data: new Map(),
  timestamps: new Map(),

  get(key, maxAge = 60000) {
    const timestamp = this.timestamps.get(key);
    if (!timestamp || Date.now() - timestamp > maxAge) {
      return null;
    }
    return this.data.get(key);
  },

  set(key, value) {
    this.data.set(key, value);
    this.timestamps.set(key, Date.now());
  },

  clear(key) {
    if (key) {
      this.data.delete(key);
      this.timestamps.delete(key);
    } else {
      this.data.clear();
      this.timestamps.clear();
    }
  },
};

const dproService = {
  // Get District Overview for DPRO's specific district
  getDistrictOverview: async (districtName) => {
    const cacheKey = `dpro_overview_${districtName}`;
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log("✅ Using cached DPRO district overview");
      return cached;
    }

    try {
      console.log("🔍 Fetching district overview for DPRO:", districtName);
      const response = await api.get("/district_overview_api/");
      const allDistricts = Array.isArray(response.data) ? response.data : [];

      // Filter for DPRO's specific district
      const dproDistrict = allDistricts.find(
        (d) => d.district === districtName
      );

      if (!dproDistrict) {
        console.warn(`⚠️ District not found: ${districtName}`);
        return null;
      }

      cache.set(cacheKey, dproDistrict);
      return dproDistrict;
    } catch (error) {
      console.error("Error fetching DPRO district overview:", error);
      throw error;
    }
  },

  // Get District Details for DPRO
  getDistrictDetails: async (districtName) => {
    const cacheKey = `dpro_details_${districtName}`;
    const cached = cache.get(cacheKey, 180000); // 3 minutes
    if (cached) {
      console.log("✅ Using cached DPRO district details");
      return cached;
    }

    try {
      // First get the district code
      const response = await api.get("/getZila/");
      const zilaList = Array.isArray(response.data) ? response.data : [];
      const district = zilaList.find((d) => d.zila === districtName);

      if (!district) {
        throw new Error(`District not found: ${districtName}`);
      }

      // Get detailed data
      const detailsResponse = await api.get(
        `/district/${district.zilaCode}/details/`
      );
      const details = detailsResponse.data;

      // Ensure zilaCode is present
      if (!details.zilaCode) {
        details.zilaCode = district.zilaCode;
      }

      cache.set(cacheKey, details);
      return details;
    } catch (error) {
      console.error("Error fetching DPRO district details:", error);
      throw error;
    }
  },

  // Get Block Report for DPRO's district
  getBlockReport: async (districtName) => {
    const cacheKey = `dpro_blocks_${districtName}`;
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log("✅ Using cached DPRO block report");
      return cached;
    }

    try {
      console.log("🔍 Fetching block report for DPRO district:", districtName);
      const response = await api.get(
        `/tehsil_gp_target_report_api_/?district=${encodeURIComponent(
          districtName
        )}`
      );
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching DPRO block report:", error);
      throw error;
    }
  },
  //completed GP's data
  getCompletedGPReport: async (blockName) => {
    const cacheKey = `dpro_blocks_${blockName}`;
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log("✅ Using cached DPRO block report");
      return cached;
    }

    try {
      console.log("🔍 Fetching block report for DPRO district:", blockName);
      const response = await api.get(
        `/gp_wise_detail_report_api/?block=${encodeURIComponent(blockName)}`
      );
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching DPRO block report:", error);
      throw error;
    }
  },

  //pending GP's Data
  getPendingGPReport: async (blockName) => {
    const cacheKey = `dpro_blocks_${blockName}`;
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log("✅ Using cached DPRO block report");
      return cached;
    }

    try {
      console.log("🔍 Fetching block report for DPRO district:", blockName);
      const response = await api.get(
        `/pending_gp_verification_report_api/?block=${encodeURIComponent(
          blockName
        )}`
      );
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching DPRO block report:", error);
      throw error;
    }
  },

  // Get Blocks by District
  getBlocksByDistrict: async (districtName) => {
    const cacheKey = `dpro_block_list_${districtName}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log("✅ Using cached blocks for DPRO");
      return cached;
    }

    try {
      console.log("🔍 Fetching blocks for DPRO district:", districtName);
      const response = await api.get(
        `/getBlockByZila/?zila=${encodeURIComponent(districtName)}`
      );

      let blocks = [];
      if (Array.isArray(response.data)) {
        blocks = response.data.map((block) => ({
          block: block.block || block.blockCode || "Unknown Block",
          blockCode: block.blockCode || block.block || null,
        }));
      } else if (response.data && typeof response.data === "object") {
        if (Array.isArray(response.data.blocks)) {
          blocks = response.data.blocks;
        } else if (Array.isArray(response.data.data)) {
          blocks = response.data.data;
        }
      }

      console.log(`✅ Found ${blocks.length} blocks for DPRO`);
      cache.set(cacheKey, blocks);
      return blocks;
    } catch (error) {
      console.error("Error fetching blocks for DPRO:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Get Approved Gaon List by Block
  getApprovedGaonListByBlock: async (block) => {
    const cacheKey = `dpro_gaon_${block}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log("✅ Using cached gaon list for DPRO");
      return cached;
    }

    try {
      console.log("🔍 Fetching gaons for DPRO block:", block);
      const response = await api.get(
        `/getApprovedGaonListWithCodeByBlock/?block=${encodeURIComponent(
          block
        )}`
      );

      let gaons = [];
      if (Array.isArray(response.data)) {
        gaons = response.data;
      } else if (response.data && typeof response.data === "object") {
        if (Array.isArray(response.data.gaons)) {
          gaons = response.data.gaons;
        } else if (Array.isArray(response.data.data)) {
          gaons = response.data.data;
        }
      }

      console.log(`✅ Found ${gaons.length} villages for DPRO`);
      cache.set(cacheKey, gaons);
      return gaons;
    } catch (error) {
      console.error("Error fetching gaons for DPRO:", error);
      if (error.response?.status === 404) {
        return [];
      }
      throw error;
    }
  },

  // Get Gaon Data
  getGaonData: async (gaonCode) => {
    try {
      console.log("🔍 Fetching gaon data for DPRO:", gaonCode);
      const response = await api.get(`/getGaonData/?gaon_code=${gaonCode}`);
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ Gaon data fetched:`, data.length, "records");
      return data;
    } catch (error) {
      console.error(`Error fetching gaon data for DPRO:`, error);
      throw error;
    }
  },

  // Get Verification Status for DPRO's district
  getVerificationStatus: async (districtName) => {
    const cacheKey = `dpro_verification_${districtName}`;
    const cached = cache.get(cacheKey, 60000); // 1 minute
    if (cached) {
      console.log("✅ Using cached verification status for DPRO");
      return cached;
    }

    try {
      const response = await api.get(
        `/verification_status_api/?district=${encodeURIComponent(districtName)}`
      );
      const allData = response.data;

      // Filter for DPRO's district if the API returns all districts
      // If the API already filters by district, just return the data
      cache.set(cacheKey, allData);
      return allData;
    } catch (error) {
      console.error("Error fetching verification status for DPRO:", error);
      throw error;
    }
  },

  // Get District Data by Login ID for DPRO
  getDistrictDataByLogin: async (loginId) => {
    const cacheKey = `dpro_district_data_${loginId}`;
    const cached = cache.get(cacheKey, 60000); // 1 minute
    if (cached) {
      console.log("✅ Using cached district data by login for DPRO");
      return cached;
    }

    try {
      console.log("🔍 Fetching district data by login ID for DPRO:", loginId);
      const response = await api.get(
        `/district_data_by_login/?loginId=${loginId}`
      );
      const data = response.data;

      if (!data.success) {
        throw new Error("Failed to fetch district data by login");
      }

      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error("Error fetching district data by login for DPRO:", error);
      throw error;
    }
  },

  // Download District Report for DPRO
  downloadDistrictReport: async (districtName) => {
    try {
      const response = await api.get(
        `/download_district_report_api/?district=${encodeURIComponent(
          districtName
        )}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error downloading district report for DPRO:", error);
      throw error;
    }
  },

  // Download Block Report for DPRO
  downloadBlockReport: async (districtName) => {
    try {
      const response = await api.get(
        `/block_target_report_download/?district=${encodeURIComponent(
          districtName
        )}`,
        {
          responseType: "blob",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error downloading block report for DPRO:", error);
      throw error;
    }
  },

  // Download metric data for DPRO's district
  downloadMetricData: async (districtName, metric) => {
    try {
      const url = `/district_download_api/?district=${encodeURIComponent(
        districtName
      )}&metric=${encodeURIComponent(metric)}`;
      const response = await api.get(url, {
        responseType: "blob",
      });
      return response.data;
    } catch (error) {
      console.error("Error downloading metric data for DPRO:", error);
      throw error;
    }
  },

  // View PDF Page
  viewPDFPage: (pdfNo, fromPage, toPage, gaonCode) => {
    let url = `/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;
    window.open(url, "_blank");
  },

  // Clear cache
  clearCache: (key) => {
    cache.clear(key);
    console.log(key ? `🧹 Cleared cache for: ${key}` : "🧹 Cleared all cache");
  },
};

export default dproService;
