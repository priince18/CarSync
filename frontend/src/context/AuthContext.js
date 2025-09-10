// AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLoggedIn = !!user && !!token;

  // Load user data on mount and token change
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await api.get('/user');
        setUser(response.data.user);
      } catch (error) {
        console.error('Failed to load user:', error);
        setError('Failed to load user data');
        
        // Clear invalid token
        if (error.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.post('/login', { email, password });
      const { access_token, ...userData } = response.data;

      // Store token
      localStorage.setItem('token', access_token);
      setToken(access_token);
      setUser(userData);

      return { success: true, user: userData };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      console.log("🔐 AuthContext: Starting signup process");
      setLoading(true);
      setError(null);

      console.log("📤 AuthContext: Sending signup request to API");
      const response = await api.post('/signup', userData);
      console.log("📥 AuthContext: Signup response received:", response.data);
      
      return { success: true, message: response.data.message };
    } catch (error) {
      console.log("❌ AuthContext: Signup error:", error);
      console.log("❌ AuthContext: Error response:", error.response?.data);
      
      const errorMessage = error.response?.data?.message || 'Signup failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.put(`/user/${user.userId}`, profileData);
      
      // Update local user state
      setUser(prev => ({ ...prev, ...profileData }));
      
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile update failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const uploadProfilePic = async (file) => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('profilePic', file);

      const response = await api.post(`/user/${user.userId}/upload-profile-pic`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update local user state
      setUser(prev => ({ 
        ...prev, 
        userProfilePic: response.data.profilePicUrl 
      }));

      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Profile picture upload failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    isLoggedIn,
    loading,
    error,
    // Expose setter so components (e.g., Dashboard) can update user after fetching
    setUser,
    login,
    signup,
    logout,
    updateProfile,
    uploadProfilePic,
    clearError,
    api, // Export api instance for other components
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext };