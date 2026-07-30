'use client';

import React, { useEffect, useRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { useGoogleAuth } from '@/hooks/use-google-auth';

const googleButtonVariants = cva(
  'inline-flex items-center justify-center gap-3 rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-stone-900 text-stone-100 hover:bg-stone-800 border border-stone-800 shadow-md hover:shadow-lg hover:border-stone-700',
        glass:
          'bg-stone-900/60 backdrop-blur-md text-stone-100 border border-stone-800/80 hover:bg-stone-800/80 hover:border-amber-500/30 shadow-lg',
        outline:
          'bg-transparent text-stone-200 border border-stone-700 hover:bg-stone-800/50 hover:text-stone-100',
        magenta:
          'bg-[#FB3DB5] text-white hover:bg-[#E0269D] shadow-lg shadow-[#FB3DB5]/30 hover:shadow-[#FB3DB5]/50 border border-[#FB3DB5]',
      },
      size: {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
      },
    },
    defaultVariants: {
      variant: 'glass',
      size: 'md',
    },
  }
);

interface GoogleLoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof googleButtonVariants> {
  onSuccess?: () => void;
  label?: string;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  variant,
  size,
  className,
  onSuccess,
  label = 'Sign in with Google',
  ...props
}) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const { handleCredentialResponse, isLoading, authError } = useGoogleAuth();

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    '89326112938-587ishv4nv11p6i7uf6v2efeicq0nh8s.apps.googleusercontent.com';

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) return;

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => {
          if (response.credential) {
            handleCredentialResponse(response.credential);
            onSuccess?.();
          }
        },
      });

      if (buttonRef.current) {
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          shape: 'pill',
        });
      }
    } catch (e) {
      console.warn('Google Identity Services initialization skipped or failed:', e);
    }
  }, [clientId, handleCredentialResponse, onSuccess]);

  const handleOAuthLogin = () => {
    if (typeof window === 'undefined') return;

    // Standard Google OAuth 2.0 Redirect URL Flow
    const redirectUri = `${window.location.origin}/auth/callback`;
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('response_type', 'id_token');
    url.searchParams.append('scope', 'openid email profile');
    url.searchParams.append('nonce', Math.random().toString(36).substring(2));

    window.location.href = url.toString();
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={buttonRef} className="hidden" />
      <button
        type="button"
        onClick={handleOAuthLogin}
        disabled={isLoading}
        aria-label="Sign in with Google"
        className={googleButtonVariants({ variant, size, className })}
        {...props}
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>{isLoading ? 'Connecting...' : label}</span>
      </button>

      {authError && (
        <span className="text-xs text-rose-400 mt-1" role="alert">
          {authError}
        </span>
      )}
    </div>
  );
};
