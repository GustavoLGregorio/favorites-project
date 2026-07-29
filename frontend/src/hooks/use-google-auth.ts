'use client';

import { useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
          renderButton: (
            parent: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export const useGoogleAuth = () => {
  const { loginWithGoogle, logout, user, isAuthenticated, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);

  const handleCredentialResponse = useCallback(
    async (credential: string) => {
      setAuthError(null);
      try {
        await loginWithGoogle(credential);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Google authentication failed';
        setAuthError(message);
      }
    },
    [loginWithGoogle]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    authError,
    handleCredentialResponse,
    logout,
  };
};
