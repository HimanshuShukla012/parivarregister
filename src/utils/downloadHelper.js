// src/utils/downloadHelper.js
// Universal download utility for all Excel/file downloads

export const downloadFile = async (url, filename, options = {}) => {
  try {
    console.log('🔽 Starting download:', { url, filename });

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      ...options
    });

    console.log('📡 Response status:', response.status);
    console.log('📄 Content-Type:', response.headers.get('Content-Type'));

    // Check if response is OK
    if (!response.ok) {
      const contentType = response.headers.get('Content-Type');
      
      // If error response is JSON
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      
      // If error response is text
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    // Check content type
    const contentType = response.headers.get('Content-Type');
    console.log('📦 Content-Type:', contentType);

    // Check if we got HTML instead of a file (proxy not configured)
    if (contentType && contentType.includes('text/html')) {
      const text = await response.text();
      console.error('⚠️ Received HTML instead of file. First 500 chars:', text.substring(0, 500));
      
      // Check if it's the Vite dev server HTML
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

    // If response is JSON (error case)
    if (contentType && contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Server returned an error');
    }

    // Get the blob
    const blob = await response.blob();
    console.log('📦 Blob size:', blob.size, 'bytes');
    console.log('📦 Blob type:', blob.type);

    // Validate blob
    if (blob.size === 0) {
      throw new Error('Downloaded file is empty');
    }

    // Additional check for HTML in blob type
    if (blob.type && blob.type.includes('text/html')) {
      console.error('⚠️ Blob type is HTML:', blob.type);
      throw new Error('Server returned an HTML page instead of the expected file');
    }

    // For Excel files, verify it's the correct type
    if (filename.endsWith('.xlsx')) {
      const expectedType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      if (blob.type && !blob.type.includes(expectedType) && !blob.type.includes('application/octet-stream')) {
        console.warn('⚠️ Unexpected blob type:', blob.type);
        // Continue anyway - some servers send generic types
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
    throw error;
  }
};

// Helper function to create safe filenames
export const createSafeFilename = (name, extension = '.xlsx') => {
  const safeName = name
    .replace(/[^a-zA-Z0-9\s-]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_');
  
  return `${safeName}${extension}`;
};