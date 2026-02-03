// src/services/supervisorService.js
import api from "./api";

const supervisorService = {
  // Get pending villages for supervisor
  getPendingVilSupervisor: async (gaonCode, loginID, status) => {
    const response = await api.get(
      `/getPendingVilSupervisor/?gaonCode=${gaonCode}&loginID=${loginID}&status=${status}`,
    );
    return response.data;
  },

  getDistrictWiseReport: async () => {
    const response = await api.get(`/district_overview_excel_api`);
    return response.data;
  },

  // Get completed villages for supervisor
  getCompletedVilSupervisor: async (loginID, zila, block) => {
    const response = await api.get(
      `/getCompletedVilSupervisor/?loginID=${loginID}&zila=${zila}&block=${block}`,
    );
    return response.data;
  },

  // Get rejected families
  getRejectedFamilies: async (gaonCode) => {
    const response = await api.get(
      `/getRejectedFamilies/?gaonCode=${gaonCode}`,
    );
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  // Get rejected gaon list
  getRejectedGaonList: async (blocks) => {
    const response = await api.get(`/getRejectedGaonList/?blocks=${blocks}`);
    // Ensure we always return an array
    return Array.isArray(response.data) ? response.data : [];
  },

  // Update family data (supervisor)
  supervisorUpdate: async (formData) => {
    const response = await api.post("/supervisorUpdate/", formData);
    return response.data;
  },

  supervisorRejectedUpdate: async (formData) => {
    const response = await api.post("/supervisorRejectedUpdate/", formData);
    return response.data;
  },

  // Approve register
  supervisorApprove: async (tableName) => {
    const response = await api.get(
      `/supervisorApprove/?tableName=${tableName}`,
    );
    return response.data;
  },

  approveFamilySup: async (id, gaonCode) => {
    const response = await api.get(
      `/approveFamilySup/?id=${id}&gaonCode=${gaonCode}`,
    );
    return response.data;
  },

  // Approve rejected family
  approveRejectedFamilySup: async (id, gaonCode) => {
    const response = await api.get(
      `/approveRejectedFamilySup/?id=${id}&gaonCode=${gaonCode}`,
    );
    return response.data;
  },

  // Delete record
  deleteRecord: async (id, gaonCode) => {
    const response = await api.get(
      `/deleteRecord/?id=${id}&gaonCode=${gaonCode}`,
    );
    return response.data;
  },

  // Delete rejected record
  deleteRejectedRecord: async (id, gaonCode) => {
    const response = await api.get(
      `/deleteRejectedRecord/?id=${id}&gaonCode=${gaonCode}`,
    );
    return response.data;
  },

  // Add record after existing family member
  addRecordAfter: async (formData) => {
    const response = await api.post("/addRecordAfter/", formData);
    return response.data;
  },

  // Add rejected record after
  addRejectedRecordAfter: async (formData) => {
    const response = await api.post("/addRejectedRecordAfter/", formData);
    return response.data;
  },

  // Delete duplicate entries
  deleteDuplicate: async (gaonCode) => {
    const response = await api.get(`/deleteDuplicate/?gaonCode=${gaonCode}`);
    return response.data;
  },

  // Download pending gaon excel
  downloadPendingGaonExcel: (gaonCode) => {
    window.location.href = `/downloadPendingGaonExcel/?gaonCode=${gaonCode}`;
  },

  // Download gaon (supervisor)
  downloadGaonSupervisor: (gaonCode) => {
    window.location.href = `/downloadGaonSupervisor/?gaonCode=${gaonCode}`;
  },

  // Get gaon info
  getGaon: async (gaonCode, underSupervisor) => {
    const response = await api.get(
      `/gaon?gaonCode=${gaonCode}&underSupervisor=${underSupervisor}`,
    );
    return response.data;
  },

  // Get register PDF
  getRegisterPDF: async (gaonCode, registerNo) => {
    const response = await api.get(
      `/getRegisterPDF/?gaonCode=${gaonCode}&registerNo=${registerNo}`,
      { responseType: "blob" },
    );
    return response.data;
  },

  // View PDF Page
  viewPDFPage: (pdfNo, fromPage, toPage, gaonCode) => {
    let url = `/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;
    window.open(url, "_blank");
  },

  // Get operators
  getOperators: async (underSupervisor) => {
    const response = await api.get(
      `/getOperators/?underSupervisor=${underSupervisor}`,
    );
    return response.data;
  },

  // Insert new operator
  insertNewOperator: async (formData) => {
    const response = await api.post("/insertNewOperator/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  // Delete operator
  deleteOperator: async (loginID) => {
    const formData = new URLSearchParams();
    formData.append("loginID", loginID);
    const response = await api.post("/deleteOperator/", formData);
    return response.data;
  },

  // Reset password
  resetPassword: async (loginID, password) => {
    const formData = new FormData();
    formData.append("loginID", loginID);
    formData.append("password", password);
    const response = await api.post("/resetPassword/", formData);
    return response.data;
  },

  // Get block by zila
  getBlockByZila: async (zila) => {
    const response = await api.get(`/getBlockByZila/?zila=${zila}`);
    return response.data;
  },

  // Get gaon list with code by block
  getGaonListWithCodeByBlock: async (block) => {
    const response = await api.get(
      `/getGaonListWithCodeByBlock/?block=${block}`,
    );
    return response.data;
  },

  // Operator Monitoring
  adminOpMonitoringCards: async (loginID) => {
    const response = await api.get(
      `/adminOpMonitoringCards/?loginID=${loginID}`,
    );
    return response.data;
  },

  getOperatorFamilyCountsMonthly: async (zila, loginID, month, year) => {
    let url = `/get_operator_family_counts_monthly/?zila=${zila}&loginID=${loginID}`;
    if (month && year) url += `&month=${month}&year=${year}`;
    const response = await api.get(url);
    return response.data;
  },

  getOperatorFamilyCountsToday: async (zila, loginID) => {
    const response = await api.get(
      `/get_operator_family_counts_today/?zila=${zila}&loginID=${loginID}`,
    );
    return response.data;
  },

  getOperatorsByZila: async (zila, loginID) => {
    const response = await api.get(
      `/getOperatorsByZila/?zila=${zila}&loginID=${loginID}`,
    );
    return response.data;
  },

  getOperatorMonthlyEntriesSummary: async (operator, start, end) => {
    const response = await api.get(
      `/get_operator_monthly_entries_summary/?operator=${operator}&start=${start}&end=${end}`,
    );
    return response.data;
  },

  // Data Monitoring
  adminDataMonitoringCards: async () => {
    const response = await api.get("/adminDataMonitoringCards/");
    return response.data;
  },

  blockFamilyCount: async (zila) => {
    const response = await api.get(`/blockFamilyCount/?zila=${zila}`);
    return response.data;
  },

  vilFamilyCount: async (zila, block) => {
    const response = await api.get(
      `/vilFamilyCount/?zila=${zila}&block=${block}`,
    );
    return response.data;
  },

  // Village not started table
  vilNotStartedTblDESU: async (zila, blocks) => {
    const response = await api.get(
      `/vilNotStartedTblDESU/?zila=${zila}&blocks=${blocks}`,
    );
    return response.data;
  },

  // Downloads
  downloadOperatorFamilyCountsMonthly: (zila, loginID, month, year) => {
    let url = `/download_operator_family_counts_monthly/?zila=${zila}&loginID=${loginID}`;
    if (month && year) url += `&month=${month}&year=${year}`;
    window.location.href = url;
  },

  downloadOperatorFamilyCountsToday: (zila, loginID) => {
    window.location.href = `/download_operator_family_counts_today/?zila=${zila}&loginID=${loginID}`;
  },

  downloadOperatorMonthlyEntriesSummary: (operator, start, end) => {
    window.location.href = `/download_operator_monthly_entries_summary/?operator=${operator}&start=${start}&end=${end}`;
  },

  downloadBlockFamilyCount: (zila) => {
    window.location.href = `/downloadBlockFamilyCount/?zila=${zila}`;
  },

  downloadVilFamilyCount: (zila, block) => {
    window.location.href = `/downloadVilFamilyCount/?zila=${zila}&block=${block}`;
  },

  downloadVilNotStartedTblDESU: (zila, blocks) => {
    window.location.href = `/downloadVilNotStartedTblDESU/?zila=${zila}&blocks=${blocks}`;
  },

  // Ajax logout
  ajaxLogout: async () => {
    try {
      await api.get("/ajax_logout/");
    } catch (error) {
      console.error("Ajax logout error:", error);
    }
  },
};

export default supervisorService;
