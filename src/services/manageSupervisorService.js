// src/services/manageSupervisorService.js
import api from './api';

const manageSupervisorService = {

  /**
   * GET /get_zila_blocks/
   * Returns all zilas with their blocks.
   * Response: { data: [{ zilaName, zilaCode, blocks: [{ blockName, blockCode }] }] }
   */
  getZilaBlocks: async () => {
    try {
      const response = await api.get('/get_zila_blocks/');
      return response.data?.data || [];
    } catch (error) {
      console.error('Error fetching zila blocks:', error);
      throw error;
    }
  },

  /**
   * POST /insertNewSupervisor/
   * Adds a new supervisor.
   * Body (form-data):
   *   - name           (Text)
   *   - role           (Text)
   *   - aadharNo       (Text)
   *   - assignedLocation (Text) → zilaCode (numeric code, NOT name)
   *   - assignedBlock  (Text)  → blockName (first/primary block)
   *   - document       (File)  → PDF file
   *
   * @param {Object} payload
   * @param {string} payload.name
   * @param {string} payload.role
   * @param {string} payload.aadharNo
* @param {string} payload.assignedLocation  - zilaName
   * @param {string} payload.assignedBlock     - blockName (primary)
   * @param {File|null} payload.document
   */
  insertNewSupervisor: async ({ name, role, aadharNo, assignedLocation, assignedBlock, document }) => {
    try {
      const formData = new FormData();
      formData.append('name',             name);
      formData.append('role',             role);
      formData.append('aadharNo',         aadharNo);
      formData.append('assignedLocation', String(assignedLocation)); // zilaName
      formData.append('assignedBlock',    assignedBlock);            // blockName
      if (document) {
        formData.append('document', document);
      }

      const response = await api.post('/insertNewSupervisor/', formData, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      console.error('Error inserting supervisor:', error);
      throw error;
    }
  },

  /**
   * POST /add_block_to_supervisor/?supervisorId=<id>
   * Assigns an additional block to an existing supervisor.
   * Query param: supervisorId
   * Body (form-data):
   *   - supervisorId   (Text)
   *   - assignedBlock  (Text) → blockName
   *
   * Called once per extra block when multiple blocks are selected.
   *
   * @param {string|number} supervisorId
      * @param {string} blockName

   */
addBlockToSupervisor: async (supervisorId, blockNames) => {
    try {
      const blocksArray = Array.isArray(blockNames)
        ? blockNames
        : blockNames.split(",").map((b) => b.trim()).filter(Boolean);

      const response = await api.post(
        `/add_block_to_supervisor/?supervisorId=${supervisorId}`,
        {
          supervisorId: String(supervisorId),
          assignedBlocks: blocksArray,
        },
        {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding blocks to supervisor ${supervisorId}:`, error);
      throw error;
    }
  },

  /**
   * GET /getSupervisor/
   * Returns all supervisors with their details.
   */
  deleteSupervisor: async (loginID) => {
    try {
      const formData = new FormData();
formData.append('loginID', loginID);
const response = await api.post('/deleteSupervisor/', formData, {
  withCredentials: true,
  headers: { 'Content-Type': 'multipart/form-data' },
});
      return response.data;
    } catch (error) {
      console.error('Error deleting supervisor:', error);
      throw error;
    }
  },

  getSupervisors: async () => {
    try {
      const response = await api.get('/getSupervisor/');
      console.log("✅ getSupervisors raw response:", response.data);
      const raw = Array.isArray(response.data) ? response.data : response.data?.data || [];
      console.log("✅ parsed raw length:", raw.length, "first:", raw[0]);
      return raw.map((r) => ({
        ...r,
        loginId: r.loginID || r.loginId || "—",
        role:    r.loginID?.startsWith("SCSU") ? "SC" : r.loginID?.startsWith("DESU") ? "DE" : "—",
      }));
    } catch (error) {
      console.error('❌ getSupervisors error status:', error?.response?.status);
      console.error('❌ getSupervisors error data:', error?.response?.data);
      console.error('❌ getSupervisors full error:', error);
      throw error;
    }
  },

  /**
   * Helper: Insert supervisor then assign all extra selected blocks.
   * Use this from the component instead of calling the two methods separately.
   *
   * @param {Object} payload  - same as insertNewSupervisor payload
   * @param {string[]} extraBlocks - blockNames beyond the first one
   */
  insertSupervisorWithBlocks: async (payload, extraBlocks = []) => {
    // Step 1: create the supervisor (first block goes in insertNewSupervisor)
    const insertResponse = await manageSupervisorService.insertNewSupervisor(payload);

    // Step 2: if server returns the new supervisor's id, assign remaining blocks
    const newId = insertResponse?.id || insertResponse?.supervisorId || insertResponse?.data?.id;

    if (newId && extraBlocks.length > 0) {
      await Promise.all(
        extraBlocks.map((blockName) =>
          manageSupervisorService.addBlockToSupervisor(newId, blockName)
        )
      );
    }

    return insertResponse;
  },
};

export default manageSupervisorService;