// src/services/hqService.js
import api from './api';

// FIX 3: Add in-memory cache for frequently accessed data
const cache = {
  data: new Map(),
  timestamps: new Map(),
  
  get(key, maxAge = 60000) { // Default 60 seconds
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
  }
};

const hqService = {
  // Get Zila (District) List - cache for 5 minutes
  getZilaList: async () => {
    const cacheKey = 'zilaList';
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log('✅ Using cached zila list');
      return cached;
    }
    
    try {
      const response = await api.get('/getZila/');
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching zila list:', error);
      throw error;
    }
  },

  // Get District Overview - cache for 2 minutes
  getDistrictOverview: async () => {
    const cacheKey = 'districtOverview';
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log('✅ Using cached district overview');
      return cached;
    }
    
    try {
      const response = await api.get('/district_overview_api/');
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching district overview:', error);
      throw error;
    }
  },

  // Get Block Report - cache per district for 2 minutes
  getBlockReport: async (districtName) => {
    const cacheKey = `blockReport_${districtName}`;
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log(`✅ Using cached block report for ${districtName}`);
      return cached;
    }
    
    try {
      const response = await api.get(`/block_target_report_api/?district=${encodeURIComponent(districtName)}`);
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching block report:', error);
      throw error;
    }
  },

  // Get District Details - accepts name or code - cache for 3 minutes
  getDistrictDetails: async (districtIdentifier) => {
    // If it's a district name, get the code first
    let districtCode = districtIdentifier;
    
    if (isNaN(districtIdentifier)) {
      const zilaList = await hqService.getZilaList();
      const district = zilaList.find(d => d.zila === districtIdentifier);
      if (!district) {
        throw new Error(`District not found: ${districtIdentifier}`);
      }
      districtCode = district.zilaCode;
    }
    
    const cacheKey = `districtDetails_${districtCode}`;
    const cached = cache.get(cacheKey, 180000); // 3 minutes
    if (cached) {
      console.log(`✅ Using cached district details for ${districtCode}`);
      return cached;
    }
    
    try {
      const response = await api.get(`/district/${districtCode}/details/`);
      console.log('✅ District details response:', response.data);
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching district details:', error);
      throw error;
    }
  },

  // Get District Report (Table Data) - cache for 2 minutes
  getDistrictReport: async () => {
    const cacheKey = 'districtReport';
    const cached = cache.get(cacheKey, 120000); // 2 minutes
    if (cached) {
      console.log('✅ Using cached district report');
      return cached;
    }
    
    try {
      const response = await api.get('/district_target_report_api');
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching district report:', error);
      throw error;
    }
  },

  // Get Verification Status - cache for 1 minute
  getVerificationStatus: async () => {
    const cacheKey = 'verificationStatus';
    const cached = cache.get(cacheKey, 60000); // 1 minute
    if (cached) {
      console.log('✅ Using cached verification status');
      return cached;
    }
    
    try {
      const response = await api.get('/verification_status_api');
      cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching verification status:', error);
      throw error;
    }
  },

  // Filter Records
  filterRecords: async (params) => {
    const queryParams = new URLSearchParams();
    if (params.district) queryParams.append('district', params.district);
    if (params.block) queryParams.append('block', params.block);
    if (params.gp) queryParams.append('gp', params.gp);
    if (params.village) queryParams.append('village', params.village);
    
    try {
      const response = await api.get(`/filterRecords?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error filtering records:', error);
      throw error;
    }
  },

 // Get Blocks by Zila - cache for 5 minutes per zila
  getBlocksByZila: async (zila) => {
    const cacheKey = `blocks_${zila}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log(`✅ Using cached blocks for ${zila}`);
      return cached;
    }
    
    try {
      console.log(`🔍 Fetching blocks from API for: ${zila}`);
      const response = await api.get(`/getBlockByZila/?zila=${encodeURIComponent(zila)}`);
      
      console.log('📦 Raw API response:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: response.data?.length,
        firstBlock: response.data?.[0],
        data: response.data
      });
      
      // FIX: Ensure we always return an array with proper structure
      let blocks = [];
      
      if (Array.isArray(response.data)) {
        blocks = response.data.map(block => ({
          block: block.block || block.blockCode || 'Unknown Block',
          blockCode: block.blockCode || block.block || null
        }));
      } else if (response.data && typeof response.data === 'object') {
        // Check if data is wrapped in a property
        if (Array.isArray(response.data.blocks)) {
          blocks = response.data.blocks;
        } else if (Array.isArray(response.data.data)) {
          blocks = response.data.data;
        } else if (Array.isArray(response.data.results)) {
          blocks = response.data.results;
        }
      }
      
      console.log(`✅ Processed blocks for ${zila}:`, blocks);
      console.log(`📊 Total blocks found: ${blocks.length}`);
      
      cache.set(cacheKey, blocks);
      return blocks;
    } catch (error) {
      console.error(`❌ Error fetching blocks for ${zila}:`, error);
      if (error.response?.status === 404) {
        console.warn('404 - Endpoint not found or no data');
        return [];
      }
      throw error;
    }
  },

  // Get Sabhas (GPs) by Block - cache for 5 minutes
  getSabhasByBlock: async (zila, block) => {
    const cacheKey = `sabhas_${zila}_${block}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log(`✅ Using cached sabhas for ${zila}/${block}`);
      return cached;
    }
    
    try {
      const response = await api.get(`/getSabhasByBlock/?zila=${encodeURIComponent(zila)}&block=${encodeURIComponent(block)}`);
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching sabhas:', error);
      throw error;
    }
  },

  // Get Villages by Sabha - cache for 5 minutes
  getVillagesBySabha: async (zila, block, sabha) => {
    const cacheKey = `villages_${zila}_${block}_${sabha}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log(`✅ Using cached villages for ${zila}/${block}/${sabha}`);
      return cached;
    }
    
    try {
      const response = await api.get(`/getVillagesBySabha/?zila=${encodeURIComponent(zila)}&block=${encodeURIComponent(block)}&sabha=${encodeURIComponent(sabha)}`);
      const data = Array.isArray(response.data) ? response.data : [];
      cache.set(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error fetching villages:', error);
      throw error;
    }
  },

  // Get Approved Gaon List with Code by Block - cache for 5 minutes
  getApprovedGaonListByBlock: async (block) => {
    const cacheKey = `gaonList_${block}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log(`✅ Using cached gaon list for ${block}`);
      return cached;
    }
    
    try {
      console.log(`🔍 Fetching approved gaons from API for block: ${block}`);
      const response = await api.get(`/getApprovedGaonListWithCodeByBlock/?block=${encodeURIComponent(block)}`);
      
      console.log('🏘️ Raw API response:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: response.data?.length,
        sample: response.data?.slice(0, 2)
      });
      
      // FIX: Ensure we always return an array
      let gaons = [];
      
      if (Array.isArray(response.data)) {
        gaons = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.gaons)) {
          gaons = response.data.gaons;
        } else if (Array.isArray(response.data.data)) {
          gaons = response.data.data;
        } else if (Array.isArray(response.data.results)) {
          gaons = response.data.results;
        }
      }
      
      console.log(`✅ Processed gaons for ${block}:`, gaons.length, 'villages');
      cache.set(cacheKey, gaons);
      return gaons;
    } catch (error) {
      console.error(`❌ Error fetching gaons for ${block}:`, error);
      if (error.response?.status === 404) {
        console.warn('404 - Endpoint not found or no data');
        return [];
      }
      throw error;
    }
  },

  // Get only villages where data entry has been done
  getVillagesWithDataEntry: async (block) => {
    const cacheKey = `villages_with_entry_${block}`;
    const cached = cache.get(cacheKey, 180000); // 3 minutes
    if (cached) {
      console.log(`✅ Using cached villages with entry for ${block}`);
      return cached;
    }
    
    try {
      console.log(`🔍 Fetching villages with data entry for block: ${block}`);
      
      // Get all approved gaons for this block
      const allGaons = await hqService.getApprovedGaonListByBlock(block);
      
      // Filter to only include gaons that have data (non-zero entries)
      const gaonsWithData = [];
      
      for (const gaon of allGaons) {
        try {
          // Try to fetch data for this gaon to check if table exists and has data
          const response = await api.get(`/getGaonData/?gaon_code=${gaon.gaonCode}`);
          
          // If we get data back (not empty array), include this gaon
          if (Array.isArray(response.data) && response.data.length > 0) {
            gaonsWithData.push(gaon);
          }
        } catch (error) {
          // If error (table doesn't exist or no data), skip this gaon
          console.log(`Skipping gaon ${gaon.gaonCode} - no data found`);
        }
      }
      
      console.log(`✅ Found ${gaonsWithData.length} villages with data entry`);
      cache.set(cacheKey, gaonsWithData);
      return gaonsWithData;
    } catch (error) {
      console.error(`❌ Error fetching villages with data entry for ${block}:`, error);
      // Fallback to all approved gaons if this fails
      return await hqService.getApprovedGaonListByBlock(block);
    }
  },

  // Get Villages with Data Entry Done (only villages that have entries)
  getVillagesWithEntryByBlock: async (block) => {
    const cacheKey = `gaonListEntry_${block}`;
    const cached = cache.get(cacheKey, 300000); // 5 minutes
    if (cached) {
      console.log(`✅ Using cached gaon list with entries for ${block}`);
      return cached;
    }
    
    try {
      console.log(`🔍 Fetching villages with entries from API for block: ${block}`);
      // Using the filtered endpoint that only returns villages with data entry done
      const response = await api.get(`/getApprovedGaonListWithCodeByBlock/?block=${encodeURIComponent(block)}&has_entry=true`);
      
      console.log('🏘️ Raw API response:', {
        status: response.status,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        length: response.data?.length,
        sample: response.data?.slice(0, 2)
      });
      
      // Ensure we always return an array
      let gaons = [];
      
      if (Array.isArray(response.data)) {
        gaons = response.data;
      } else if (response.data && typeof response.data === 'object') {
        if (Array.isArray(response.data.gaons)) {
          gaons = response.data.gaons;
        } else if (Array.isArray(response.data.data)) {
          gaons = response.data.data;
        } else if (Array.isArray(response.data.results)) {
          gaons = response.data.results;
        }
      }
      
      console.log(`✅ Processed gaons with entries for ${block}:`, gaons.length, 'villages');
      cache.set(cacheKey, gaons);
      return gaons;
    } catch (error) {
      console.error(`❌ Error fetching gaons with entries for ${block}:`, error);
      // Fallback to regular endpoint if has_entry filter not supported
      console.warn('⚠️ Falling back to regular gaon list endpoint');
      return await hqService.getApprovedGaonListByBlock(block);
    }
  },

  // Get Gaon Data - no cache (always fresh data)
  getGaonData: async (gaonCode) => {
    try {
      console.log(`🔍 Fetching gaon data for: ${gaonCode}`);
      const response = await api.get(`/getGaonData/?gaon_code=${gaonCode}`);
      
      // Ensure we return an array
      const data = Array.isArray(response.data) ? response.data : [];
      console.log(`✅ Gaon data fetched:`, data.length, 'records');
      return data;
    } catch (error) {
      console.error(`❌ Error fetching gaon data for ${gaonCode}:`, error);
      throw error;
    }
  },

  // Download District Report - no cache
  downloadDistrictReport: async () => {
    const response = await api.get('/download_district_report_api', {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download Filtered Records - no cache
  downloadFilteredRecords: async (params) => {
    const queryParams = new URLSearchParams();
    if (params.district) queryParams.append('district', params.district);
    if (params.block) queryParams.append('block', params.block);
    if (params.gp) queryParams.append('gp', params.gp);
    if (params.village) queryParams.append('village', params.village);
    
    const response = await api.get(`/downloadFilteredRecords?${queryParams.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download District Details - no cache
  downloadDistrictDetails: async (district) => {
    const response = await api.get(`/downloadDistrictDetails?district=${encodeURIComponent(district)}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Download Block Report - no cache
  downloadBlockReport: async (district) => {
    const response = await api.get(`/block_target_report_download/?district=${encodeURIComponent(district)}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // View PDF Page - no cache
  viewPDFPage: (pdfNo, fromPage, toPage, gaonCode) => {
  let url = `/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;  // No trailing slash!
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;
    window.open(url, '_blank');
  },

  // Clear cache manually if needed
  clearCache: (key) => {
    cache.clear(key);
    console.log(key ? `🧹 Cleared cache for: ${key}` : '🧹 Cleared all cache');
  }
};

export default hqService;