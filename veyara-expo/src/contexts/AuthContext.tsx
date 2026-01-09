import React, { createContext, useContext, useReducer, useState, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/indexSimple';
import { loginStart, loginSuccess, loginFailure, logout } from '../store/slices/authSlice';
import { api } from '../services/api';

interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logoutUser: () => void;
  isLoading: boolean;
  error: string | null;
  user: any;
  verificationStatus: 'pending' | 'approved' | 'rejected' | 'needs_review';
  updateVerificationStatus: (status: 'pending' | 'approved' | 'rejected' | 'needs_review') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, token, isLoading, error, user } = useSelector((state: RootState) => state.auth);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'approved' | 'rejected' | 'needs_review'>('pending');

  const updateVerificationStatus = (status: 'pending' | 'approved' | 'rejected' | 'needs_review') => {
    setVerificationStatus(status);
  };

  const login = async (email: string, password: string) => {
    try {
      dispatch(loginStart());
      const response = await api.post('/auth/login', { email, password });
      const { user, token } = response.data.data;
      
      // Store token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch(loginSuccess({ user, token }));
    } catch (error: any) {
      dispatch(loginFailure(error.response?.data?.error || 'Login failed'));
    }
  };

  const register = async (userData: any) => {
    try {
      dispatch(loginStart());
      const response = await api.post('/auth/register', userData);
      const { user, token } = response.data.data;
      
      // Store token in API headers
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      dispatch(loginSuccess({ user, token }));
    } catch (error: any) {
      dispatch(loginFailure(error.response?.data?.error || 'Registration failed'));
    }
  };

  const logoutUser = () => {
    // Remove token from API headers
    delete api.defaults.headers.common['Authorization'];
    dispatch(logout());
  };

  const value: AuthContextType = {
    login,
    register,
    logoutUser,
    isLoading,
    error,
    user,
    verificationStatus,
    updateVerificationStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
