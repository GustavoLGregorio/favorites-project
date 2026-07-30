'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles, Film, Gamepad2, BookOpen, Tv, ArrowRight, ShieldCheck, Layers, ExternalLink } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-20 pb-20 pt-6">
      {/* Hero Section */}
      <section className="relative text-center max-w-4xl mx-auto space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FB3DB5]/15 text-[#FB3DB5] text-xs sm:text-sm font-semibold border border-[#FB3DB5]/30 backdrop-blur-md shadow-lg shadow-[#FB3DB5]/10 animate-fade-in">
          <Sparkles className="h-4 w-4" />
          <span>Unified Media Aggregator Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
          All Your <span className="text-[#FB3DB5]">Favorites.</span>
          <br />
          One Central Library.
        </h1>

        <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Track anime, movies, series, books, and games in one place. Connect your external accounts or use Favorites as your clean, unified hub.
        </p>

        {/* CTA Area */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          {isAuthenticated ? (
            <Link href="/home">
              <Button variant="magenta" size="lg" className="rounded-2xl px-8 py-3.5 text-base font-bold">
                <span>Access Dashboard</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </Button>
            </Link>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <GoogleLoginButton
                variant="magenta"
                size="lg"
                label="Continuar com o Google"
                className="rounded-2xl px-8 py-3.5 text-base font-bold shadow-xl shadow-[#FB3DB5]/25"
              />
              <span className="text-xs text-[#94A3B8]">Fast & secure OAuth 2.0 authentication. No password needed.</span>
            </div>
          )}
        </div>
      </section>

      {/* Media Type Cards Showcase */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-[#121622]/80 border border-[#263044] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 hover:border-[#FB3DB5]/50 transition-all duration-300 group shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-[#FB3DB5]/15 text-[#FB3DB5] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Film className="h-6 w-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Anime</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">MyAnimeList, AniList & Kitsu sync.</p>
        </div>

        <div className="bg-[#121622]/80 border border-[#263044] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 hover:border-[#FB3DB5]/50 transition-all duration-300 group shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-[#FB3DB5]/15 text-[#FB3DB5] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Tv className="h-6 w-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Movies & Series</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">TMDB & Trakt integration.</p>
        </div>

        <div className="bg-[#121622]/80 border border-[#263044] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 hover:border-[#FB3DB5]/50 transition-all duration-300 group shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-[#FB3DB5]/15 text-[#FB3DB5] flex items-center justify-center group-hover:scale-110 transition-transform">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Games</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">IGDB & Steam backlog tracking.</p>
        </div>

        <div className="bg-[#121622]/80 border border-[#263044] rounded-3xl p-6 flex flex-col items-center text-center space-y-3 hover:border-[#FB3DB5]/50 transition-all duration-300 group shadow-lg">
          <div className="h-12 w-12 rounded-2xl bg-[#FB3DB5]/15 text-[#FB3DB5] flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white">Books & Manga</h3>
          <p className="text-xs sm:text-sm text-[#94A3B8]">OpenLibrary & MangaDex progress.</p>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="bg-[#121622] border border-[#263044] rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Built as an API Aggregator</h2>
          <p className="text-sm text-[#94A3B8]">
            We do not store proprietary media metadata. We aggregate public APIs cleanly and link your accounts conveniently.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
          <div className="space-y-3 p-4 rounded-2xl bg-[#0B0E14]/50 border border-[#263044]/60">
            <ShieldCheck className="h-7 w-7 text-[#FB3DB5]" />
            <h4 className="text-base font-bold text-white">Google OAuth 2.0 Auth</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              One-click secure login powered by Google Identity Services. Your profile data is stored safely in PostgreSQL.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-[#0B0E14]/50 border border-[#263044]/60">
            <Layers className="h-7 w-7 text-[#FB3DB5]" />
            <h4 className="text-base font-bold text-white">API Centralization</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Connect external services or use Favorites as a central hub for all your entertainment libraries.
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-2xl bg-[#0B0E14]/50 border border-[#263044]/60">
            <ExternalLink className="h-7 w-7 text-[#FB3DB5]" />
            <h4 className="text-base font-bold text-white">Personal & Public Shelves</h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Curate custom lists, rate entries, and share your favorite collections with the community.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
