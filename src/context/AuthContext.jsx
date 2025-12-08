import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    
    if (data.success) {
      localStorage.setItem('loginID', credentials.username);
      setUser({ loginID: credentials.username });
      return {
        success: true,
        redirectTo: authService.getDashboardRoute(credentials.username)
      };
    } else {
      return {
        success: false,
        error: data.error,
        showForceLogout: data.showForceLogout,
        loginID: credentials.username
      };
    }
  };

  const forceLogout = async (loginID) => {
    await authService.forceLogout(loginID);
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, forceLogout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};