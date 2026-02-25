// src/services/completeDataService.js
import api from './api';

const completeDataService = {

  // Get Zila List (reuses same endpoint as pmService)
  getZilaList: async () => {
    try {
      const response = await api.get('/getZila/');
      return response.data;
    } catch (error) {
      console.error('completeDataService: Error fetching zila list:', error);
      throw error;
    }
  },

  // Get Block List by Zila
  getBlocksByZila: async (zila) => {
    try {
      const response = await api.get(`/getBlockByZila/?zila=${encodeURIComponent(zila)}`);
      return response.data;
    } catch (error) {
      console.error('completeDataService: Error fetching blocks:', error);
      throw error;
    }
  },

  // Get Completed/Approved Block Data
  // API: https://register.kdsgroup.co.in/getCompletedBlock/?zila=Amethi&block=Bhetua
  getCompletedBlock: async (zila, block) => {
    try {
      const response = await api.get(
        `/getCompletedBlock/?zila=${encodeURIComponent(zila)}&block=${encodeURIComponent(block)}`
      );
      return response.data;
    } catch (error) {
      console.error('completeDataService: Error fetching completed block data:', error);
      throw error;
    }
  },

  // Download Register as PDF
  // Opens in new tab — backend streams the PDF
  downloadRegisterPDF: ({ zila, block, tehsil, registerNo, gaonCode }) => {
    const params = new URLSearchParams();
    if (zila)       params.set('zila', zila);
    if (block)      params.set('block', block);
    if (tehsil)     params.set('tehsil', tehsil);
    if (registerNo) params.set('registerNo', registerNo);
    if (gaonCode)   params.set('gaonCode', gaonCode);
    window.open(`/downloadRegisterPDF/?${params.toString()}`, '_blank');
  },

  // Download Register as Excel
  downloadRegisterExcel: ({ zila, block, tehsil, registerNo, gaonCode }) => {
    const params = new URLSearchParams();
    if (zila)       params.set('zila', zila);
    if (block)      params.set('block', block);
    if (tehsil)     params.set('tehsil', tehsil);
    if (registerNo) params.set('registerNo', registerNo);
    if (gaonCode)   params.set('gaonCode', gaonCode);
    window.open(`/downloadRegisterExcel/?${params.toString()}`, '_blank');
  },

};

export default completeDataService;