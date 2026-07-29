'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';

export const UserProfileButton: React.FC = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User account menu"
        className="flex items-center gap-3 p-1.5 pr-4 rounded-full bg-stone-900/70 border border-stone-800/80 hover:border-amber-500/40 hover:bg-stone-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 cursor-pointer backdrop-blur-md"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover border border-stone-700"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 to-amber-400 text-stone-950 font-bold text-xs flex items-center justify-center border border-amber-300/40">
            {initials}
          </div>
        )}
        <span className="text-sm font-medium text-stone-200 hidden sm:inline max-w-[120px] truncate">
          {user.name}
        </span>
        <svg
          className={`w-4 h-4 text-stone-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 rounded-2xl bg-stone-900/90 border border-stone-800 shadow-2xl backdrop-blur-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <div className="px-4 py-3 border-b border-stone-800/80">
            <p className="text-sm font-semibold text-stone-100 truncate">{user.name}</p>
            <p className="text-xs text-stone-400 truncate mt-0.5">{user.email}</p>
          </div>

          <div className="py-1">
            <a
              href="#collections"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-300 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              My Collections
            </a>
            <a
              href="#integrations"
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-stone-300 hover:text-stone-100 hover:bg-stone-800/60 transition-colors"
            >
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Linked Services
            </a>
          </div>

          <div className="border-t border-stone-800/80 pt-1 mt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
