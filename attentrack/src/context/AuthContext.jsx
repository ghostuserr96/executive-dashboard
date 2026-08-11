import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('attentrack_token'));
  const [loading, setLoading] = useState(true);

  // Restore session from the JWT stored in localStorage (backend-driven auth)
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('attentrack_token');
      const storedUser = localStorage.getItem('attentrack_user');
      if (!storedToken) {
        setUser(null);
        setToken(null);
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        if (response?.success && response?.data) {
          setToken(storedToken);
          setUser(response.data);
          localStorage.setItem('attentrack_user', JSON.stringify(response.data));
        } else {
          clearSession();
        }
      } catch (error) {
        console.warn('Session API verification failed:', error.message);
        // Only clear the session if the token is actively rejected (401 Unauthorized)
        // If it's a network error (e.g. backend restarting) or 500 error, preserve the session!
        if (error.status === 401 || error.status === 403) {
          clearSession();
        } else if (storedUser) {
          // If network failed but we have a stored user, gracefully fallback to it so they don't get booted out
          try {
            setUser(JSON.parse(storedUser));
            setToken(storedToken);
          } catch(e) {
            clearSession();
          }
        }
      } finally {
        setLoading(false);
      }
    };

    const clearSession = () => {
        localStorage.removeItem('attentrack_token');
        localStorage.removeItem('attentrack_active_role');
        localStorage.removeItem('attentrack_user');
        setToken(null);
        setUser(null);
    };

    restoreSession();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    if (response?.data?.token) {
      const { token: authToken, user: userProfile } = response.data;
      localStorage.setItem('attentrack_token', authToken);
      localStorage.setItem('attentrack_user', JSON.stringify(userProfile));
      setToken(authToken);
      setUser(userProfile);
    }
    return response;
  };

  const signup = async (userData) => {
    const response = await authService.signup(userData);
    if (response?.data?.token) {
      const { token: authToken, user: userProfile } = response.data;
      localStorage.setItem('attentrack_token', authToken);
      localStorage.setItem('attentrack_user', JSON.stringify(userProfile));
      setToken(authToken);
      setUser(userProfile);
    }
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.warn('Logout failed:', error.message);
    } finally {
      localStorage.removeItem('attentrack_token');
      localStorage.removeItem('attentrack_active_role');
      localStorage.removeItem('attentrack_user');
      setToken(null);
      setUser(null);
    }
  };

  // Strictly determined by account role in database:
  // If user is logged in as employee -> isHRAdmin = false
  // If user is logged in as HR Manager or Admin (or demo mode) -> isHRAdmin = true
  const isHRAdmin = !user || !(String(user.role).toLowerCase() === 'employee');

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!user,
      loading,
      isHRAdmin,
      login,
      signup,
      logout,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
