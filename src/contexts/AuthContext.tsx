import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI, User } from '../lib/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    if (token) {
      try {
        // First try to get user info from localStorage (more reliable)
        if (userInfo) {
          const user = JSON.parse(userInfo);
          setUser(user);
        } else {
          // Fallback to decoding JWT token
          const payload = JSON.parse(atob(token.split('.')[1]));
          
          // Check if token is expired
          const currentTime = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < currentTime) {
            console.warn('Token expired');
            localStorage.removeItem('token');
            setUser(null);
          } else {
            const user: User = {
              id: payload.user_id,
              email: payload.email || '',
              name: payload.name || payload.email?.split('@')[0] || 'User'
            };
            // Store the decoded user info for next time
            localStorage.setItem('userInfo', JSON.stringify(user));
            setUser(user);
          }
        }
      } catch (error) {
        console.error('Failed to decode token:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      localStorage.setItem('token', response.data.access_token);
      
      // Decode JWT token to get user information
      const token = response.data.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.user_id,
        email: email,
        name: payload.name || email.split('@')[0]
      };
      
      // Store user info in localStorage for persistence
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ name, email, password });
      localStorage.setItem('token', response.data.access_token);
      
      // Decode JWT token to get user information
      const token = response.data.access_token;
      const payload = JSON.parse(atob(token.split('.')[1]));
      const user: User = {
        id: payload.user_id,
        email: email,
        name: name
      };
      
      // Store user info in localStorage for persistence
      localStorage.setItem('userInfo', JSON.stringify(user));
      
      setUser(user);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
