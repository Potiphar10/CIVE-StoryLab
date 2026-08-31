/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.js';

interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'header-dark' | 'header-light';
  className?: string;
  showLabel?: boolean;
}

export default function ThemeToggle({
  variant = 'compact',
  className = '',
  showLabel = false
}: ThemeToggleProps) {
  const { theme, toggleTheme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  if (variant === 'segmented') {
    return (
      <div 
        id="theme_segmented_toggle"
        className={`inline-flex items-center p-1 rounded-lg border transition-all ${
          isDark 
            ? 'bg-[#1e293b] border-[#334155]' 
            : 'bg-slate-100 border-slate-200'
        } ${className}`}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            !isDark
              ? 'bg-white text-[#011f7b] shadow-sm font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
            isDark
              ? 'bg-[#011f7b] text-[#FFBA09] shadow-sm font-bold'
              : 'text-slate-500 hover:text-slate-700'
          }`}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5 text-[#FFBA09]" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  if (variant === 'header-dark') {
    return (
      <button
        id="btn_theme_toggle_header_dark"
        type="button"
        onClick={toggleTheme}
        className={`flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/15 transition-all text-xs font-medium ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-[#FFBA09] shrink-0 animate-spin-slow" />
            {showLabel && <span className="text-xs">Light Mode</span>}
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-slate-200 shrink-0" />
            {showLabel && <span className="text-xs">Dark Mode</span>}
          </>
        )}
      </button>
    );
  }

  if (variant === 'header-light') {
    return (
      <button
        id="btn_theme_toggle_header_light"
        type="button"
        onClick={toggleTheme}
        className={`flex items-center space-x-2 p-2 rounded-lg border transition-all ${
          isDark
            ? 'bg-[#1e293b] border-[#334155] text-[#FFBA09] hover:bg-[#283548]'
            : 'bg-slate-100/80 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-[#011f7b]'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-[#FFBA09] shrink-0" />
            {showLabel && <span className="text-xs font-semibold">Light</span>}
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-slate-700 shrink-0" />
            {showLabel && <span className="text-xs font-semibold">Dark</span>}
          </>
        )}
      </button>
    );
  }

  // Default compact toggle button
  return (
    <button
      id="btn_theme_toggle_default"
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-lg border transition-all flex items-center justify-center ${
        isDark
          ? 'bg-[#1e293b] border-[#334155] text-[#FFBA09] hover:bg-[#283548]'
          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#011f7b]'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-[#FFBA09]" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700" />
      )}
      {showLabel && (
        <span className="ml-2 text-xs font-semibold">
          {isDark ? 'Light' : 'Dark'}
        </span>
      )}
    </button>
  );
}
