// src/utils/cacheManager.js
export const cacheManager = {
  // Clear all browser caches
  clearAllCaches: async () => {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear Service Worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      console.log('✅ All caches cleared');
      return true;
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
      return false;
    }
  },

  // Disable browser back/forward cache
  disableBFCache: () => {
    window.addEventListener('pageshow', (event) => {
      if (event.persisted) {
        window.location.reload();
      }
    });
  },

  // Add no-cache headers to fetch requests
  addNoCacheHeaders: (headers = {}) => {
    return {
      ...headers,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };
  }
};