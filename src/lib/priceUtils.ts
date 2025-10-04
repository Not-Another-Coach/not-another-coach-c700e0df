/**
 * Utility functions for handling package pricing
 */

interface PackageOption {
  id: string;
  name: string;
  sessions?: number;
  price: number;
  currency: string;
  description: string;
  isPromotion?: boolean;
  promotionStartDate?: Date;
  promotionEndDate?: Date;
}

/**
 * Calculates the price range from an array of package options
 * @param packages - Array of package options
 * @returns Object with min and max price, or null if no packages
 */
export function calculatePriceRange(packages: PackageOption[] | null | undefined): {
  min: number;
  max: number;
  currency: string;
} | null {
  console.log('📊 calculatePriceRange - Input:', {
    packages,
    packagesType: typeof packages,
    isArray: Array.isArray(packages),
    length: packages?.length
  });

  if (!packages || packages.length === 0) {
    console.log('⚠️ calculatePriceRange - No packages found, returning null');
    return null;
  }

  const prices = packages.map(pkg => pkg.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  // Use the currency from the first package (assuming all packages use same currency)
  const currency = packages[0].currency || 'GBP';

  const result = {
    min: minPrice,
    max: maxPrice,
    currency
  };

  console.log('✅ calculatePriceRange - Result:', result);
  return result;
}

/**
 * Formats a price range for display
 * @param priceRange - Price range object from calculatePriceRange
 * @returns Formatted price string
 */
export function formatPriceRange(priceRange: { min: number; max: number; currency: string } | null): string {
  console.log('💵 formatPriceRange - Input:', priceRange);

  if (!priceRange) {
    console.log('⚠️ formatPriceRange - No price range, returning "Contact for pricing"');
    return 'Contact for pricing';
  }

  const { min, max, currency } = priceRange;
  const currencySymbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';

  let formatted: string;
  if (min === max) {
    formatted = `${currencySymbol}${min}`;
  } else {
    formatted = `${currencySymbol}${min} - ${currencySymbol}${max}`;
  }

  console.log('✅ formatPriceRange - Result:', formatted);
  return formatted;
}

/**
 * Gets the display price for a trainer based on their packages
 * @param trainer - Trainer object with package_options
 * @returns Formatted price string
 */
export function getTrainerDisplayPrice(trainer: any): string {
  const priceRange = calculatePriceRange(trainer.package_options);
  return formatPriceRange(priceRange);
}

/**
 * Gets the display price based on visibility state
 * @param trainer - Trainer object with package_options
 * @param visibilityState - Current visibility state for pricing
 * @returns Formatted price string or "TBC" for restricted access
 */
export function getVisibilityAwarePrice(trainer: any, visibilityState: 'visible' | 'blurred' | 'hidden'): string {
  console.log('🎯 getVisibilityAwarePrice - Called with:', {
    trainerId: trainer?.id,
    trainerName: trainer?.name,
    package_options: trainer?.package_options,
    package_options_type: typeof trainer?.package_options,
    visibilityState
  });

  if (visibilityState === 'blurred' || visibilityState === 'hidden') {
    console.log('🔒 getVisibilityAwarePrice - Visibility restricted, returning TBC');
    return 'TBC';
  }
  
  const priceRange = calculatePriceRange(trainer.package_options);
  const result = formatPriceRange(priceRange);
  console.log('✅ getVisibilityAwarePrice - Final result:', result);
  return result;
}

/**
 * Checks if a promotional package is currently active
 * @param pkg - Package with promotional dates
 * @returns Boolean indicating if promotion is active
 */
export function isPromotionActive(pkg: PackageOption): boolean {
  if (!pkg.isPromotion || !pkg.promotionStartDate || !pkg.promotionEndDate) {
    return false;
  }
  
  const now = new Date();
  const startDate = new Date(pkg.promotionStartDate);
  const endDate = new Date(pkg.promotionEndDate);
  
  // Set time to start/end of day for proper comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return now >= startDate && now <= endDate;
}

/**
 * Filters packages to only show active promotions and regular packages
 * @param packages - Array of packages
 * @returns Filtered packages that are either not promotions or active promotions
 */
export function getVisiblePackages(packages: PackageOption[] | null | undefined): PackageOption[] {
  if (!packages) return [];
  
  return packages.filter(pkg => {
    // Show non-promotional packages
    if (!pkg.isPromotion) return true;
    
    // Show promotional packages only if they're active
    return isPromotionActive(pkg);
  });
}