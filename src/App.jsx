import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './router';
import axios from 'axios';

function App() {
  useEffect(() => {
    // Fetch CSRF token on app load
    const fetchCsrf = async () => {
      try {
        await axios.get(`${import.meta.env.VITE_API_BASE_URL}/csrf/`, {
          withCredentials: true
        });
      } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
      }
    };
    
    fetchCsrf();
  }, []);

  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;