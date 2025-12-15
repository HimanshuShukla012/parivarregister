// src/services/sachivService.js
import api from './api';

const sachivService = {
  // Get villages by sabha (uses session authentication)
  getGaonBySabha: async () => {
    const response = await api.get('/getGaonBySabha/');
    return response.data;
  },

  // Get village data by gaon code
  getGaonData: async (gaonCode) => {
    const response = await api.get(`/getGaonData/?gaon_code=${gaonCode}`);
    return response.data;
  },

  // Approve register (Sachiv verification)
  sachivApprove: async (tableName) => {
    const response = await api.get(`/sachivApprove/?tableName=${tableName}`);
    return response.data;
  },

  // Update and insert family data
  updateAndInsert: async (formData) => {
    const response = await api.post('/update-and-insert/', formData);
    return response.data;
  },

  // Approve family (verification table)
  approveFamilySachiv: async (id, gaonCode) => {
    const response = await api.get(`/approveFamilySachiv?id=${id}&gaonCode=${gaonCode}`);
    return response.data;
  },

  // Reject family with remark
  rejectFamilySachiv: async (id, gaonCode, remark) => {
    const response = await api.get(
      `/rejectFamilySachiv?id=${id}&gaonCode=${gaonCode}&remark=${encodeURIComponent(remark)}`
    );
    return response.data;
  },

  // View PDF page - FIXED to use absolute URL
  viewPDFPage: (pdfNo, fromPage, toPage, gaonCode) => {
    // Use absolute URL to PDF server instead of relative path
    const baseUrl = 'https://parivarregister.kdsgroup.co.in';
    let url = `${baseUrl}/getPDFPage?pdfNo=${pdfNo}&gaonCode=${gaonCode}`;
    if (fromPage) url += `&fromPage=${fromPage}`;
    if (toPage) url += `&toPage=${toPage}`;
    
    console.log('🔍 Opening PDF URL:', url);
    
    // Note: This opens in a new tab. The PDF server needs to accept 
    // requests from your Netlify domain. If you get CORS errors,
    // you'll need to either:
    // 1. Add your domain to PDF server's CORS whitelist
    // 2. Or proxy through your API
    window.open(url, '_blank');
  },

  // Download gaon register
  downloadGaonSachiv: async (gaonCode) => {
    const response = await api.get(`/downloadGaonSachiv/?gaonCode=${gaonCode}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Reset password
  resetPassword: async (loginID, password) => {
    const formData = new FormData();
    formData.append('loginID', loginID);
    formData.append('password', password);
    
    const response = await api.post('/resetPassword/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Ajax logout (for unload event)
  ajaxLogout: async () => {
    try {
      await api.get('/ajax_logout/');
    } catch (error) {
      console.error('Ajax logout error:', error);
    }
  }
};

export default sachivService;