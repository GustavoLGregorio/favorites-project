'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { UserProfileButton } from '@/components/auth/user-profile-button';

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0B0E14]/90 backdrop-blur-md border-b border-[#263044]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-2xl bg-[#FB3DB5] flex items-center justify-center text-white font-bold text-lg glow-magenta transition-transform group-hover:scale-105">
            <Sparkles className="h-5 w-5 fill-white text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-white">
            FAVORITES<span className="text-[#FB3DB5]">.</span>
          </span>
        </Link>

        {/* Global Search Input */}
        <div className="hidden sm:flex items-center flex-1 max-w-md mx-4 relative">
          <Search className="absolute left-3.5 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search anime, books, games, movies..."
            className="w-full h-10 pl-10 pr-4 bg-[#121622] text-sm text-white placeholder-[#94A3B8] rounded-2xl border border-[#263044] focus:outline-none focus:border-[#FB3DB5] focus:ring-1 focus:ring-[#FB3DB5] transition-all"
          />
        </div>

        {/* Action Controls & Authentication State */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Button variant="magenta" size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </Button>
          )}

          {isLoading ? (
            <div className="h-9 w-24 bg-stone-900 animate-pulse rounded-xl" />
          ) : isAuthenticated ? (
            <UserProfileButton />
          ) : (
            <GoogleLoginButton size="sm" variant="glass" />
          )}
        </div>
      </div>
    </header>
  );
}
