'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Sparkles } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processCallback = async () => {
      try {
        let idToken: string | null = null;

        // Parse hash fragment (#id_token=...)
        if (typeof window !== 'undefined' && window.location.hash) {
          const params = new URLSearchParams(window.location.hash.substring(1));
          idToken = params.get('id_token');
        }

        // Parse search query (?id_token=...)
        if (!idToken && typeof window !== 'undefined' && window.location.search) {
          const params = new URLSearchParams(window.location.search);
          idToken = params.get('id_token');
        }

        if (!idToken) {
          setError('No ID token found in Google OAuth response.');
          return;
        }

        await loginWithGoogle(idToken);
        router.push('/home');
      } catch (err: any) {
        console.error('Google OAuth callback error:', err);
        setError(err?.response?.data?.message || err?.message || 'Authentication failed.');
      }
    };

    processCallback();
  }, [loginWithGoogle, router]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      {error ? (
        <div className="bg-stone-900/80 border border-rose-500/40 rounded-3xl p-8 max-w-md w-full shadow-2xl">
          <div className="h-12 w-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-4">
            <span className="text-xl font-bold">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-sm text-stone-400 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full py-2.5 px-4 bg-[#FB3DB5] text-white font-medium rounded-xl hover:bg-[#E0269D] transition-colors"
          >
            Return to Landing Page
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-[#FB3DB5] flex items-center justify-center text-white font-bold text-xl glow-magenta animate-bounce">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">Authenticating with Google...</h2>
          <p className="text-sm text-stone-400">Verifying your identity and setting up your media library.</p>
          <div className="h-6 w-6 rounded-full border-2 border-[#FB3DB5] border-t-transparent animate-spin mt-2" />
        </div>
      )}
    </div>
  );
}
