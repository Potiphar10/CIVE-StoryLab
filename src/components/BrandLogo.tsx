/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

/**
 * BRAND LOGO CONFIGURATION:
 * If you want to use your own local image file (e.g., PNG, JPG, or SVG):
 * 1. Place your image in the `public/` directory (e.g., `public/logo.png`)
 * 2. Set `CUSTOM_LOGO_SRC` below to your file path (e.g., "/logo.png")
 * If set to null or empty string, it renders the vector logo.
 */
export const CUSTOM_LOGO_SRC: string | null = null; // e.g. "/logo.png"

interface BrandLogoProps {
  variant?: 'light' | 'dark'; // light: for dark backgrounds (white text), dark: for light backgrounds (deep blue text)
  showText?: boolean;
  className?: string;
  iconSize?: string;
  imageSrc?: string;
}

export function BrandIcon({ 
  className = "w-10 h-10 shadow-md",
  imageSrc = CUSTOM_LOGO_SRC || undefined
}: { 
  className?: string;
  imageSrc?: string;
}) {
  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt="Brand Logo"
        className={`${className} object-contain rounded-lg shrink-0`}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <svg 
      viewBox="0 0 100 100" 
      className={`${className} select-none shrink-0`} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      id="brand_icon_svg"
    >
      {/* Brand deep blue (#011f7b) squircle background */}
      <rect width="100" height="100" rx="28" fill="#011f7b" />
      
      {/* Brand stylized white 'C' */}
      <path
        d="M 72 30 
           A 28 28 0 1 0 72 70 
           L 59 59 
           A 13 13 0 1 1 59 41 
           Z"
        fill="#ffffff"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      
      {/* Brand warm yellow (#FFBA09) play triangle in the opening of the 'C' */}
      <path
        d="M 45 37 L 64 50 L 45 63 Z"
        fill="#FFBA09"
      />
    </svg>
  );
}

export default function BrandLogo({ 
  variant = 'dark', 
  showText = true, 
  className = "flex items-center space-x-3", 
  iconSize = "w-10 h-10",
  imageSrc
}: BrandLogoProps) {
  
  const textTitleColor = variant === 'light' ? 'text-white' : 'text-[#011f7b] dark:text-white';
  const textSubColor = variant === 'light' ? 'text-[#FFBA09]' : 'text-slate-600 dark:text-[#FFBA09]';

  return (
    <div id="brand_logo_container" className={className}>
      <BrandIcon className={iconSize} imageSrc={imageSrc} />
      {showText && (
        <div className="flex flex-col select-none leading-none">
          <span className={`text-base font-extrabold tracking-tight ${textTitleColor} font-display`}>
            CIVE Film
          </span>
          <span className={`text-[10px] font-medium tracking-widest uppercase ${textSubColor} mt-0.5`}>
            Entertainment
          </span>
        </div>
      )}
    </div>
  );
}
