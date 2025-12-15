// src/utils/downloadHelper.js
// Universal download utility for all Excel/file downloads

import api from '../services/api';

export const downloadFile = async (url, filename, options = {}) => {
  try {
    console.log('🔽 Starting download:', { url, filename });

    // ✅ USE AXIOS INSTANCE - This ensures auth headers are included
    const response = await api.get(url, {
      responseType: 'blob',
      ...options
    });

    console.log('📡 Response status:', response.status);
    console.log('📦 Content-Type:', response.headers['content-type']);

    // Get the blob
    const blob = response.data;
    console.log('📦 Blob size:', blob.size, 'bytes');
    console.log('📦 Blob type:', blob.type);

    // Validate blob
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    // Check if we got HTML instead of a file
    const contentType = response.headers['content-type'] || blob.type;
    if (contentType && contentType.includes('text/html')) {
      const text = await blob.text();
      console.error('⚠️ Received HTML instead of file. First 500 chars:', text.substring(0, 500));
      
      if (text.includes('/@vite/client') || text.includes('type="module"')) {
        throw new Error(
          'API request not reaching Django backend. Please check:\n' +
          '1. Django server is running (usually port 8000)\n' +
          '2. vite.config.js has proxy configuration\n' +
          '3. The API endpoint exists in Django'
        );
      }
      
      throw new Error('Server returned an error page. Please check if the district data exists and try again.');
    }

    // For Excel files, verify it's the correct type
    if (filename.endsWith('.xlsx')) {
      const expectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (blob.type && !blob.type.includes(expectedType) && !blob.type.includes('application/octet-stream')) {
        console.warn('⚠️ Unexpected blob type:', blob.type);
      }
    }

    // Create blob URL and trigger download
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.style.display = 'none';
    link.href = blobUrl;
    link.download = filename;
    
    document.body.appendChild(link);
    link.click();
    
    console.log('✅ Download triggered successfully');

    // Cleanup
    setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 100);

    return true;

  } catch (error) {
    console.error('💥 Download error:', error);
    
    // Better error messages
    if (error.response) {
      const status = error.response.status;
      
      if (status === 401) {
        throw new Error('Session expired. Please refresh the page and log in again.');
      } else if (status === 403) {
        throw new Error('You do not have permission to download this file.');
      } else if (status === 404) {
        throw new Error('File not found. Please check if the data exists.');
      } else if (status === 500) {
        throw new Error('Server error. Please try again later.');
      }
    }
    
    throw error;
  }
};

// Helper function to create safe filenames
export const createSafeFilename = (name, extension = '.xlsx') => {
  const safeName = name
    .replace(/[^a-zA-Z0-9\s-]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
  
  // Ensure extension starts with a dot
  const ext = extension.startsWith('.') ? extension : `.${extension}`;
  return `${safeName}${ext}`;
};