//EXISTING

// src/services/pmService.js
import api from './api';


const BASE_URL = "https://parivarregister.kdsgroup.co.in";


const pmService = {
  // Project Monitoring Cards
  getProjectMonitoringCards: async () => {
    try {
      const response = await api.get('/adminProjectMonitoringCards/');
      return response.data;
    } catch (error) {
      console.error('Error fetching PM cards:', error);
      throw error;
    }
  },

  // Project Monitoring Tables
  getProjectMonitoringTables: async () => {
    try {
      const response = await api.get('/adminProjectMonitoringTbls/');
      return response.data;
    } catch (error) {
      console.error('Error fetching PM tables:', error);
      throw error;
    }
  },

  // Operator Monitoring Cards
  getOperatorMonitoringCards: async () => {
    try {
      const response = await api.get('/adminOpMonitoringCards/');
      return response.data;
    } catch (error) {
      console.error('Error fetching operator cards:', error);
      throw error;
    }
  },

  // Operator Family Counts - Monthly
  getOperatorFamilyCountsMonthly: async (zila, monthYear) => {
    try {
      let url = `/get_operator_family_counts_monthly/?zila=${zila}`;
      if (monthYear) {
        const [year, month] = monthYear.split('-');
        url += `&month=${month}&year=${year}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching operator monthly counts:', error);
      throw error;
    }
  },

  // Operator Family Counts - Daily
  getOperatorFamilyCountsToday: async (zila) => {
    try {
      const response = await api.get(`/get_operator_family_counts_today/?zila=${zila}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching operator daily counts:', error);
      throw error;
    }
  },

  // Get Operators by Zila
  getOperatorsByZila: async (zila) => {
    try {
      const response = await api.get(`/getOperatorsByZila/?zila=${zila}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching operators by zila:', error);
      throw error;
    }
  },

  // Operator Monthly Entries Summary
  getOperatorMonthlyEntries: async (operator, startDate, endDate) => {
    try {
      const response = await api.get(
        `/get_operator_monthly_entries_summary/?operator=${operator}&start=${startDate}&end=${endDate}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching operator monthly entries:', error);
      throw error;
    }
  },

  // Data Monitoring Cards
  getDataMonitoringCards: async () => {
    try {
      const response = await api.get('/adminDataMonitoringCards/');
      return response.data;
    } catch (error) {
      console.error('Error fetching data monitoring cards:', error);
      throw error;
    }
  },

  // ✅ Get Zila List (API: /getZila/)
getZilaList: async () => {
  try {
    const response = await api.get("/getZila/");
    return response.data;
  } catch (error) {
    console.error("Error fetching zila list:", error);
    throw error;
  }
},

  // Get Blocks by Zila
  getBlocksByZila: async (zila) => {
  try {
    const response = await api.get(`/getBlockByZila/?zila=${encodeURIComponent(zila)}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching blocks:', error);
      throw error;
    }
  },

  // ✅ Gaon list by block
getApprovedGaonsByBlock: async (blockName) => {
  try {
    const response = await api.get(
      `/getApprovedGaonListWithCodeByBlock/?block=${encodeURIComponent(blockName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching gaon list:", error);
    throw error;
  }
},

// ✅ Gaon Data by gaon_code
getGaonDataByCode: async (gaonCode) => {
  try {
    const response = await api.get(
      `/getGaonData/?gaon_code=${encodeURIComponent(gaonCode)}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching gaon data:", error);
    throw error;
  }
},

  // PDF Overview Table
  getPDFOverviewTable: async (zila, block = '') => {
    try {
      const response = await api.get(`/pDFOverviewTbl/?zila=${zila}&block=${block}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching PDF overview:', error);
      throw error;
    }
  },

  // Block Family Count
  getBlockFamilyCount: async (zila) => {
    try {
      const response = await api.get(`/blockFamilyCount/?zila=${zila}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching block family count:', error);
      throw error;
    }
  },

  // Village Family Count
  getVillageFamilyCount: async (zila, block) => {
    try {
const response = await api.get(`/vilFamilyCount/?zila=${zila}&block=${block}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching village family count:', error);
      throw error;
    }
  },

  // Supervisor Family Counts
  getSupervisorFamilyCounts: async () => {
    try {
      const response = await api.get('/get_supervisor_family_counts_today/');
      return response.data;
    } catch (error) {
      console.error('Error fetching supervisor counts:', error);
      throw error;
    }
  },

  // Get Supervisors by Zila
  getSupervisorsByZila: async (zila) => {
    try {
      const response = await api.get(`/getSupsByZila/?zila=${zila}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching supervisors by zila:', error);
      throw error;
    }
  },

  // Supervisor Monthly Entries
  getSupervisorMonthlyEntries: async (supervisor, monthYear) => {
    try {
      let url = `/get_supervisor_monthly_entries_summary/?supervisor=${supervisor}`;
      if (monthYear) {
        const [year, month] = monthYear.split('-');
        url += `&month=${month}&year=${year}`;
      }
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching supervisor monthly entries:', error);
      throw error;
    }
  },

  // Download Functions
  downloadDistrictReport: () => {
    window.location.href = '/downloadDistrictReport';
  },

  downloadBlockReport: (zila) => {
    window.location.href = `/downloadBlockReport?zila=${zila}`;
  },

  downloadPDFZip: (zila, block, gaon) => {
    window.location.href = `/downloadPDFZipNew?zila=${zila}&block=${block}&gaon=${gaon}`;
  },

  downloadOperatorMonthly: (zila, monthYear) => {
    let url = `/download_operator_family_counts_monthly/?zila=${zila}`;
    if (monthYear) {
      const [year, month] = monthYear.split('-');
      url += `&month=${month}&year=${year}`;
    }
    window.location.href = url;
  },

  downloadOperatorDaily: (zila) => {
    window.location.href = `/download_operator_family_counts_today/?zila=${zila}`;
  },

  downloadOperatorEntries: (operator, startDate, endDate) => {
    window.location.href = 
      `/download_operator_monthly_entries_summary/?operator=${operator}&start=${startDate}&end=${endDate}`;
  },

  downloadDistrictFamilyCount: () => {
    window.location.href = '/downloadDistFamilyCount';
  },

  downloadBlockFamilyCount: (zila) => {
    window.location.href = `/downloadBlockFamilyCount?zila=${zila}`;
  },

  downloadVillageFamilyCount: (zila, block) => {
    window.location.href = `/downloadVilFamilyCount?zila=${zila}&block=${block}`;
  },

  downloadSupervisorFamilyCounts: () => {
    window.location.href = '/download_supervisor_family_counts_today';
  },

  downloadSupervisorMonthlyEntries: (supervisor, monthYear) => {
    let url = `/download_supervisor_monthly_entries_summary/?supervisor=${supervisor}`;
    if (monthYear) {
      const [year, month] = monthYear.split('-');
      url += `&month=${month}&year=${year}`;
    }
    window.location.href = url;
  },

  downloadSupervisorExcelReport: () => {
    window.location.href = '/download_supervisor_excel_report';
  },

  downloadDigitisationStatus: (zila) => {
    window.location.href = `/downloadDigitisationStatusTblByZila?zila=${zila}`;
  },

  downloadGaonFamilyCounts: () => {
    window.location.href = '/get_gaon_family_counts';
  },
  

  getPDFPageUrl: ({ pdfNo = 1, gaonCode, fromPage, toPage }) => {
  return `/getPDFPage/?pdfNo=${pdfNo}&gaonCode=${gaonCode}&fromPage=${fromPage}&toPage=${toPage}`;
},

  // Alias used by LiveDataEntriesView
  getGaonListWithCodeByBlock: async (blockName) => {
    try {
      const response = await api.get(
        `/getApprovedGaonListWithCodeByBlock/?block=${encodeURIComponent(blockName)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching gaon list:', error);
      throw error;
    }
  },

  // Alias used by some views
  getGaonData: async (gaonCode) => {
    try {
      const response = await api.get(
        `/getGaonData/?gaon_code=${encodeURIComponent(gaonCode)}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching gaon data:', error);
      throw error;
    }
  },

  getNoOfRegByGaonCode: async (gaonCode) => {
    const res = await api.get(
      `/noOfReg/?gaonCode=${encodeURIComponent(gaonCode)}`
    );
    return res?.data ?? res;
  },

  getApprovedGaonListWithCodeByBlock: async (block) => {
  const res = await api.get(
    `/getApprovedGaonListWithCodeByBlock/?block=${encodeURIComponent(block)}`,
  );
  return res?.data || [];
},

getGaonApprovalStatusByZilaBlock: async (zila, block) => {
  try {
    const response = await api.get(
      `/getGaon/?zila=${encodeURIComponent(zila)}&block=${encodeURIComponent(block)}&_=${Date.now()}`,
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching approval status gaon list:", error);
    throw error;
  }
},

  downloadRegisterPDF: async ({ gaonCode, registerNo }) => {
  const response = await api.get(
    `/getRegisterPDF/?gaonCode=${gaonCode}&registerNo=${registerNo}`,
    { responseType: "blob" }
  );

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `register_${gaonCode}_${registerNo}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
  return true;
},

getRegisterPDFUrl: ({ gaonCode, registerNo }) => {
  return `${BASE_URL}/app/getRegisterPDF/?gaonCode=${gaonCode}&registerNo=${registerNo}`;
},



};

export default pmService;