// src/services/sachivService.js
import api from './api';

const PMValidation = {
  // Get list of rejected villages
  getRejectedGaonList: async () => {
    try {
      const response = await api.get('/getRejectedGaonList/');
      return response.data;
    } catch (error) {
      console.error('Error fetching rejected gaon list:', error);
      throw error;
    }
  },

  // Get rejected families by gaon code
  getRejectedByGaonCode: async (gaonCode) => {
    try {
      const response = await api.get(`/getRejectedByGaonCode/?gaon_code=${gaonCode}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rejected families by gaon code:', error);
      throw error;
    }
  },

  // Get supervisors list
  getSupervisorsDesu: async () => {
    try {
      const response = await api.get('/get_supervisors_desu/');
      return response.data;
    } catch (error) {
      console.error('Error fetching supervisors:', error);
      throw error;
    }
  },

  // Assign supervisor to rejected families
  assignSupervisorToRejectedFamilies: async (gaonCode, supervisorId) => {
    try {
      const response = await api.post('/assignSupervisorToRejectedFamilies/', {
        gaon_code: gaonCode,
        supervisor_id: supervisorId
      });
      return response.data;
    } catch (error) {
      console.error('Error assigning supervisor:', error);
      throw error;
    }
  },

  // Get assigned rejected data by supervisor
  getAssignedRejectedDataBySupervisor: async (supervisorId) => {
    try {
      const response = await api.get(`/getAssignedRejectedDataBySupervisor/?supervisor_id=${supervisorId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching assigned rejected data:', error);
      throw error;
    }
  },

  // Get updated rejected families
  getUpdatedRejectedFamilies: async () => {
    try {
      const response = await api.get('/get_updated_rejected_families/');
      return response.data;
    } catch (error) {
      console.error('Error fetching updated rejected families:', error);
      throw error;
    }
  },

  // Approve updated family
  approveUpdatedFamily: async (familyId) => {
    try {
      const response = await api.post('/approve_updated_family/', {
        family_id: familyId
      });
      return response.data;
    } catch (error) {
      console.error('Error approving updated family:', error);
      throw error;
    }
  }
};

export default PMValidation;