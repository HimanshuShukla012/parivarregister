// src/services/bulkUploadService.js
import api from './api';

// ─── Configuration ───────────────────────────────────────────────────────────
// Chunk size: 5MB per chunk. Adjust as needed.
const CHUNK_SIZE = 5 * 1024 * 1024;

const bulkUploadService = {
  /**
   * Uploads a single PDF file to /uploadChunkBulk/ using chunked transfer.
   *
   * @param {File}     file         - The PDF File object to upload
   * @param {Function} onProgress   - Callback (percent: number) => void
   * @returns {Promise<{ success: boolean, message: string }>}
   *
   * How it works:
   *   1. Splits the file into chunks of CHUNK_SIZE bytes.
   *   2. Sends each chunk sequentially with:
   *        - fileName    (Text)  → file.name
   *        - chunkIndex  (Text)  → 0-based index of the current chunk
   *        - totalChunks (Text)  → total number of chunks for this file
   *        - chunk       (File)  → the binary blob for this chunk
   *   3. Updates onProgress after each chunk completes.
   *   4. Returns the server response from the final chunk.
   */
  uploadPdfInChunks: async (file, onProgress) => {
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    let lastResponse = null;

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end   = Math.min(start + CHUNK_SIZE, file.size);

      // Slice the file into the current chunk blob
      const chunkBlob = file.slice(start, end);

      // Build multipart/form-data payload matching the API spec
      const formData = new FormData();
      formData.append('fileName',    file.name);
      formData.append('chunkIndex',  String(chunkIndex));
      formData.append('totalChunks', String(totalChunks));
      formData.append('chunk',       chunkBlob, file.name);

      try {
        const response = await api.post('/uploadChunkBulk/', formData, {
          withCredentials: true,
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        lastResponse = response.data;
      } catch (error) {
        console.error(
          `Error uploading chunk ${chunkIndex + 1}/${totalChunks} for "${file.name}":`,
          error
        );
        throw new Error(
          error?.response?.data?.message ||
          error?.message ||
          `Failed on chunk ${chunkIndex + 1}`
        );
      }

      // Report progress: each completed chunk moves the bar proportionally
      const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
      if (typeof onProgress === 'function') {
        onProgress(percent);
      }
    }

    return lastResponse ?? { success: true, message: 'Uploaded successfully' };
  },
};

export default bulkUploadService;