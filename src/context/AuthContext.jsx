import React, { createContext, useState, useContext, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔍 AuthProvider mounted - checking current user');
    
    // ✅ Clear stale cache on mount
    sessionStorage.clear();
    
    const currentUser = authService.getCurrentUser();
    console.log('👤 Current user from storage:', currentUser);
    
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      console.log('🔐 AuthContext: Starting login for', credentials.username);
      
      // ✅ CRITICAL: Clear state and storage BEFORE API call
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 AuthContext: Cleared all state and storage');
      
      // ✅ Now call authService.login (which also clears storage internally)
      const data = await authService.login(credentials);
      
      if (data.success) {
        console.log('✅ AuthContext: Login successful for', data.user.loginID);
        
        // ✅ Set fresh user data
        const newUser = { loginID: data.user.loginID };
        setUser(newUser);
        console.log('💾 AuthContext: Set new user state:', newUser);
        
        return {
          success: true,
          redirectTo: authService.getDashboardRoute(data.user.loginID)
        };
      } else {
        console.log('❌ AuthContext: Login failed -', data.error);
        return {
          success: false,
          error: data.error,
          showForceLogout: data.showForceLogout,
          loginID: data.loginID || credentials.username
        };
      }
    } catch (error) {
      console.error('❌ AuthContext: Login error:', error);
      
      // ✅ On error, ensure everything is cleared
      setUser(null);
      localStorage.clear();
      sessionStorage.clear();
      
      return {
        success: false,
        error: error.message || 'Login failed. Please try again.'
      };
    }
  };

  const forceLogout = async (loginID) => {
    try {
      console.log('🔄 AuthContext: Starting force logout for', loginID);
      
      // ✅ CRITICAL: Clear state immediately
      setUser(null);
      console.log('🧹 AuthContext: Cleared user state');
      
      // ✅ Call authService (which will clear storage)
      const result = await authService.forceLogout(loginID);
      
      console.log('✅ AuthContext: Force logout completed:', result);
      return result;
    } catch (error) {
      console.error('❌ AuthContext: Force logout error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 AuthContext: Starting logout');
      
      // ✅ Clear storage first
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 AuthContext: Cleared all storage');
      
      // ✅ Call authService (which will also clear storage)
      await authService.logout();
      
      console.log('✅ AuthContext: Logout completed');
    } catch (error) {
      console.error('❌ AuthContext: Logout error:', error);
    } finally {
      // ✅ CRITICAL: Always clear state, even if API fails
      setUser(null);
      console.log('🧹 AuthContext: User state cleared');
    }
  };

  const value = {
    user,
    login,
    logout,
    forceLogout,
    loading
  };

  console.log('🔍 AuthContext render - state:', { user, loading });

  return (
    <AuthContext.Provider value={value}>
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