'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { UserProfile, authApi } from '@/api/auth-api';
import { storageKeys } from '@/constants/storage-keys';

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKeys.local.sessionToken);
    }
    setUser(null);
  }, []);

  const loadUser = useCallback(async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem(storageKeys.local.sessionToken);
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const profile = await authApi.getCurrentUser();
      setUser(profile);
    } catch {
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const loginWithGoogle = async (idToken: string) => {
    setIsLoading(true);
    try {
      const response = await authApi.loginWithGoogle(idToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem(storageKeys.local.sessionToken, response.token);
      }
      setUser(response.user);
    } catch (error) {
      logout();
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
