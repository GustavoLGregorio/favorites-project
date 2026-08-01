'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { Search, Sparkles, Plus, Star, X, Loader2, Film, BookOpen, Tv, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { GoogleLoginButton } from '@/components/auth/google-login-button';
import { UserProfileButton } from '@/components/auth/user-profile-button';
import { useDebounce } from '@/hooks/use-debounce';
import { mediaApi } from '@/api/media-api';

export function Navbar() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(searchTerm, 350);

  const { data: searchResults = [], isFetching, isError } = useQuery({
    queryKey: ['media', 'search', debouncedQuery],
    queryFn: () => mediaApi.searchMedia(debouncedQuery),
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 30 * 1000,
  });

  // Open dropdown when query is >= 2 chars
  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [debouncedQuery]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
  };

  const getMediaIcon = (type: string) => {
    switch ((type || '').toLowerCase()) {
      case 'anime':
        return <Film className="h-3.5 w-3.5 text-[#FB3DB5]" />;
      case 'manga':
      case 'book':
        return <BookOpen className="h-3.5 w-3.5 text-[#38BDF8]" />;
      case 'game':
        return <Gamepad2 className="h-3.5 w-3.5 text-[#4ADE80]" />;
      default:
        return <Tv className="h-3.5 w-3.5 text-[#F59E0B]" />;
    }
  };

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

        {/* Global Live Search Input with Debounce & TanStack Query */}
        <div ref={dropdownRef} className="hidden sm:flex items-center flex-1 max-w-md mx-4 relative">
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (debouncedQuery.trim().length >= 2) setIsOpen(true);
              }}
              placeholder="Search anime, manga, movies, series..."
              className="w-full h-10 pl-10 pr-9 bg-[#121622] text-sm text-white placeholder-[#94A3B8] rounded-2xl border border-[#263044] focus:outline-none focus:border-[#FB3DB5] focus:ring-1 focus:ring-[#FB3DB5] transition-all"
            />
            {isFetching ? (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#FB3DB5] animate-spin" />
            ) : searchTerm ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {/* Floating Glassmorphic Search Results Dropdown */}
          {isOpen && (
            <div className="absolute top-12 left-0 right-0 bg-[#121622]/95 backdrop-blur-xl border border-[#263044] rounded-2xl shadow-2xl overflow-hidden max-h-[450px] overflow-y-auto z-50 divide-y divide-[#263044]/50 animate-fade-in">
              <div className="p-2.5 bg-[#0B0E14]/60 text-xs font-semibold text-[#94A3B8] flex items-center justify-between">
                <span>API Aggregated Search Results</span>
                {isFetching && <span className="text-[#FB3DB5]">Fetching external APIs...</span>}
              </div>

              {isFetching && searchResults.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-sm text-[#94A3B8] gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FB3DB5]" />
                  <span>Searching across external APIs...</span>
                </div>
              ) : isError ? (
                <div className="p-4 text-center text-sm text-rose-400">
                  Failed to fetch search results from external API.
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center text-sm text-[#94A3B8]">
                  No media found for &quot;<span className="text-white font-medium">{debouncedQuery}</span>&quot;
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={`${item.provider}-${item.external_id}`}
                    className="p-3 hover:bg-[#1C2333] transition-colors flex items-center gap-3.5 group cursor-pointer"
                    onClick={() => {
                      setIsOpen(false);
                    }}
                  >
                    {/* Media Cover Thumbnail */}
                    <div className="h-14 w-10 shrink-0 relative rounded-lg overflow-hidden bg-[#0B0E14] border border-[#263044]">
                      {item.cover_image_url ? (
                        <Image
                          src={item.cover_image_url}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="40px"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#94A3B8]">
                          {getMediaIcon(item.media_type)}
                        </div>
                      )}
                    </div>

                    {/* Media Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#263044]/60 text-[10px] font-bold text-white uppercase tracking-wider">
                          {getMediaIcon(item.media_type)}
                          <span>{item.media_type}</span>
                        </span>
                        {item.release_year && (
                          <span className="text-xs text-[#94A3B8]">{item.release_year}</span>
                        )}
                        <span className="ml-auto text-[10px] font-semibold text-[#FB3DB5] bg-[#FB3DB5]/10 px-1.5 py-0.5 rounded border border-[#FB3DB5]/20 uppercase">
                          {item.provider}
                        </span>
                      </div>

                      <h4 className="text-sm font-bold text-white truncate group-hover:text-[#FB3DB5] transition-colors">
                        {item.title}
                      </h4>

                      {item.native_title && item.native_title !== item.title && (
                        <p className="text-xs text-[#94A3B8] truncate">{item.native_title}</p>
                      )}

                      {item.genres && item.genres.length > 0 && (
                        <p className="text-[11px] text-[#64748B] truncate mt-0.5">
                          {item.genres.slice(0, 3).join(' • ')}
                        </p>
                      )}
                    </div>

                    {/* Rating Badge */}
                    {item.average_score && (
                      <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-xl bg-[#0B0E14] border border-[#263044] text-xs font-bold text-amber-400">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span>{item.average_score}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Controls & Authentication State */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <Button variant="magenta" size="sm" className="hidden sm:flex">
              <Plus className="h-4 w-4" />
              <span>Add Entry</span>
            </Button>
          )}

          {authLoading ? (
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
