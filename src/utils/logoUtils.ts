/**
 * Utility functions for handling logo URLs that might be stored in localStorage or Firebase Storage
 */

/**
 * Resolves a logo URL, handling both Firebase Storage URLs and localStorage references
 * @param logoUrl - The logo URL which might be a Firebase URL or localStorage reference
 * @returns The actual URL or data URL to display the logo
 */
export const resolveLogo = (logoUrl: string | undefined): string | null => {
  if (!logoUrl) return null;
  
  // If it's a localStorage reference, retrieve the data URL
  if (logoUrl.startsWith('localStorage:')) {
    const key = logoUrl.replace('localStorage:', '');
    return localStorage.getItem(key) || null;
  }
  
  // If it's a regular URL (Firebase Storage or external), return as-is
  return logoUrl;
};

/**
 * Cleans up old localStorage logo entries to prevent storage bloat
 * @param firm - The firm name to clean up logos for
 * @param keepLatest - Number of latest logos to keep (default: 3)
 */
export const cleanupOldLogos = (firm: string, keepLatest: number = 3): void => {
  const logoKeys: string[] = [];
  
  // Find all logo keys for this firm
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`logo_${firm}_`)) {
      logoKeys.push(key);
    }
  }
  
  // Sort by timestamp (newest first)
  logoKeys.sort((a, b) => {
    const timestampA = parseInt(a.split('_').pop() || '0');
    const timestampB = parseInt(b.split('_').pop() || '0');
    return timestampB - timestampA;
  });
  
  // Remove old entries
  if (logoKeys.length > keepLatest) {
    const keysToRemove = logoKeys.slice(keepLatest);
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log('Cleaned up old logo:', key);
    });
  }
};

/**
 * Checks if a logo URL is valid and accessible
 * @param logoUrl - The logo URL to check
 * @returns Promise that resolves to true if the logo is accessible
 */
export const isLogoAccessible = async (logoUrl: string): Promise<boolean> => {
  try {
    const resolvedUrl = resolveLogo(logoUrl);
    if (!resolvedUrl) return false;
    
    // If it's a data URL (from localStorage), it's always accessible
    if (resolvedUrl.startsWith('data:')) return true;
    
    // For external URLs, try to fetch them
    const response = await fetch(resolvedUrl, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};