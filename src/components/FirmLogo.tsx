import React, { useState, useEffect } from 'react';
import { getFirmBranding } from '../config/firmBranding';
import { resolveLogo } from '../utils/logoUtils';
import type { FirmType, FirmTheme } from '../types';

interface FirmLogoProps {
  firm: FirmType;
  className?: string;
  customTheme?: FirmTheme;
  fallbackToDefault?: boolean;
}

export default function FirmLogo({ 
  firm, 
  className = "h-8 w-8", 
  customTheme,
  fallbackToDefault = true 
}: FirmLogoProps) {
  const [customLogoUrl, setCustomLogoUrl] = useState<string | null>(null);
  const [logoError, setLogoError] = useState(false);
  
  const firmBranding = getFirmBranding(firm);
  const DefaultLogo = firmBranding.logo;
  
  useEffect(() => {
    // Check if there's a custom logo URL in the theme
    if (customTheme?.logoUrl) {
      const resolvedUrl = resolveLogo(customTheme.logoUrl);
      setCustomLogoUrl(resolvedUrl);
      setLogoError(false);
    } else {
      setCustomLogoUrl(null);
      setLogoError(false);
    }
  }, [customTheme?.logoUrl]);
  
  const handleImageError = () => {
    setLogoError(true);
    if (fallbackToDefault) {
      setCustomLogoUrl(null);
    }
  };
  
  // If we have a custom logo and it hasn't errored, show it
  if (customLogoUrl && !logoError) {
    return (
      <img 
        src={customLogoUrl} 
        alt={`${firmBranding.displayName} logo`}
        className={`${className} object-contain`}
        onError={handleImageError}
      />
    );
  }
  
  // Otherwise, show the default SVG logo
  return <DefaultLogo className={className} />;
}