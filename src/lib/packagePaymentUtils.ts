// Utility functions for handling flexible package payment calculations

export interface PaymentOption {
  mode: 'upfront' | 'installments';
  amount: number;
  installmentCount?: number;
  installmentAmount?: number;
  description: string;
}

export interface PackagePaymentCalculation {
  packageId: string;
  packageName: string;
  totalPrice: number;
  currency: string;
  availableOptions: PaymentOption[];
  defaultOption: PaymentOption;
}

/**
 * Calculate payment options for a training package
 * @param pkg - The training package
 * @returns Payment calculation with all available options
 */
export function calculatePackagePaymentOptions(pkg: {
  id: string;
  name: string;
  price: number;
  currency: string;
  customerPaymentModes?: ('upfront' | 'installments')[];
  installmentCount?: number;
}): PackagePaymentCalculation {
  const paymentModes = pkg.customerPaymentModes || ['upfront'];
  const availableOptions: PaymentOption[] = [];
  
  // Add upfront option if available
  if (paymentModes.includes('upfront')) {
    availableOptions.push({
      mode: 'upfront',
      amount: pkg.price,
      description: `Full payment of ${getCurrencySymbol(pkg.currency)}${pkg.price.toFixed(2)}`,
    });
  }
  
  // Add installment option if available
  if (paymentModes.includes('installments') && pkg.installmentCount && pkg.installmentCount > 1) {
    const installmentAmount = pkg.price / pkg.installmentCount;
    availableOptions.push({
      mode: 'installments',
      amount: pkg.price,
      installmentCount: pkg.installmentCount,
      installmentAmount: installmentAmount,
      description: `${pkg.installmentCount} installments of ${getCurrencySymbol(pkg.currency)}${installmentAmount.toFixed(2)}`,
    });
  }
  
  // Default to first available option
  const defaultOption = availableOptions[0];
  
  return {
    packageId: pkg.id,
    packageName: pkg.name,
    totalPrice: pkg.price,
    currency: pkg.currency,
    availableOptions,
    defaultOption,
  };
}

/**
 * Calculate the initial payment amount based on selected payment option
 * @param calculation - Package payment calculation
 * @param selectedMode - The payment mode selected by customer
 * @returns The amount to charge initially
 */
export function calculateInitialPayment(
  calculation: PackagePaymentCalculation, 
  selectedMode: 'upfront' | 'installments'
): number {
  const selectedOption = calculation.availableOptions.find(opt => opt.mode === selectedMode);
  
  if (!selectedOption) {
    throw new Error(`Payment mode ${selectedMode} is not available for this package`);
  }
  
  if (selectedMode === 'upfront') {
    return selectedOption.amount;
  } else {
    // For installments, return the first installment amount
    return selectedOption.installmentAmount || selectedOption.amount;
  }
}

/**
 * Get currency symbol for display
 */
export function getCurrencySymbol(currency: string): string {
  switch (currency.toUpperCase()) {
    case 'GBP': return '£';
    case 'USD': return '$';
    case 'EUR': return '€';
    default: return currency;
  }
}

/**
 * Validate package payment configuration
 * @param pkg - The package to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validatePackagePaymentConfig(pkg: {
  customerPaymentModes?: ('upfront' | 'installments')[];
  installmentCount?: number;
  price: number;
}): string[] {
  const errors: string[] = [];
  
  if (!pkg.customerPaymentModes || pkg.customerPaymentModes.length === 0) {
    errors.push("At least one payment option must be selected");
  }
  
  if (pkg.customerPaymentModes?.includes('installments')) {
    if (!pkg.installmentCount || pkg.installmentCount < 2) {
      errors.push("Installment count must be at least 2 when installments are enabled");
    }
    if (pkg.installmentCount && pkg.installmentCount > 12) {
      errors.push("Installment count cannot exceed 12");
    }
  }
  
  if (pkg.price <= 0) {
    errors.push("Package price must be greater than 0");
  }
  
  return errors;
}

/**
 * Format payment options for display to customers
 * @param calculation - Package payment calculation
 * @returns Formatted string describing available payment options
 */
export function formatPaymentOptionsForCustomer(calculation: PackagePaymentCalculation): string {
  const { availableOptions } = calculation;
  
  if (availableOptions.length === 1) {
    return availableOptions[0].description;
  } else {
    const descriptions = availableOptions.map(opt => opt.description);
    return `Choose: ${descriptions.join(' OR ')}`;
  }
}