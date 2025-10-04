import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Check, Lock, Shield } from "lucide-react";
import { 
  calculatePackagePaymentOptions, 
  calculateInitialPayment, 
  formatPaymentOptionsForCustomer,
  getCurrencySymbol,
  type PackagePaymentCalculation 
} from "@/lib/packagePaymentUtils";
import { useManualPayment, type PaymentRecord } from "@/hooks/useManualPayment";

interface PackagePaymentSelectorProps {
  package: {
    id: string;
    name: string;
    price: number;
    currency: string;
    customerPaymentModes?: ('upfront' | 'installments')[];
    installmentCount?: number;
  };
  onPaymentSelection: (paymentRecord: PaymentRecord) => void;
  loading?: boolean;
  packageDuration?: string;
}

export function PackagePaymentSelector({ 
  package: pkg, 
  onPaymentSelection, 
  loading = false,
  packageDuration
}: PackagePaymentSelectorProps) {
  const calculation = calculatePackagePaymentOptions(pkg);
  const { processPayment, processing } = useManualPayment();
  const [selectedMode, setSelectedMode] = useState<'upfront' | 'installments'>(
    calculation.defaultOption.mode
  );

  const handlePayment = async () => {
    try {
      const paymentRecord = await processPayment(pkg, selectedMode);
      onPaymentSelection(paymentRecord);
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  // If only one option is available, show simplified UI
  if (calculation.availableOptions.length === 1) {
    const option = calculation.availableOptions[0];
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment for {pkg.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Package Details Breakdown */}
          <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
            <h4 className="font-medium text-sm">Package Details</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Package:</span>
                <span className="font-medium">{pkg.name}</span>
              </div>
              {packageDuration && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{packageDuration}</span>
                </div>
              )}
              <div className="flex justify-between pt-1 border-t">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">{getCurrencySymbol(pkg.currency)}{pkg.price.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {option.mode === 'installments' && option.installmentCount && (
            <div className="p-3 border rounded-lg bg-accent/50">
              <p className="text-sm text-muted-foreground">
                First payment: {getCurrencySymbol(pkg.currency)}{option.installmentAmount?.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Remaining payments will be processed automatically
              </p>
            </div>
          )}
          
          <Button 
            onClick={handlePayment} 
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Processing Payment...' : `Secure My Spot – ${getCurrencySymbol(pkg.currency)}${calculateInitialPayment(calculation, option.mode).toFixed(2)}`}
          </Button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Payment protected</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime before your first session for a full refund
          </p>
        </CardContent>
      </Card>
    );
  }

  // Multiple options available - show selection UI
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Choose Payment Option for {pkg.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Select your preferred payment method
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Package Details Breakdown */}
        <div className="p-4 border rounded-lg bg-muted/50 space-y-2">
          <h4 className="font-medium text-sm">Package Details</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Package:</span>
              <span className="font-medium">{pkg.name}</span>
            </div>
            {packageDuration && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{packageDuration}</span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{getCurrencySymbol(pkg.currency)}{pkg.price.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <RadioGroup value={selectedMode} onValueChange={(value) => setSelectedMode(value as 'upfront' | 'installments')}>
          {calculation.availableOptions.map((option) => (
            <div key={option.mode} className="space-y-2">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={option.mode} id={option.mode} />
                <Label htmlFor={option.mode} className="flex-1 cursor-pointer">
                  <Card className={`transition-all ${selectedMode === option.mode ? 'ring-2 ring-primary' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {option.mode === 'upfront' ? (
                              <CreditCard className="h-4 w-4" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                            <span className="font-medium">
                              {option.mode === 'upfront' ? 'Full Payment' : 'Pay in Installments'}
                            </span>
                            {selectedMode === option.mode && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                          {option.mode === 'installments' && (
                            <p className="text-xs text-muted-foreground">
                              First payment: {getCurrencySymbol(pkg.currency)}{option.installmentAmount?.toFixed(2)}
                              <br />
                              Remaining payments will be processed automatically
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold">
                            {getCurrencySymbol(pkg.currency)}{
                              option.mode === 'upfront' 
                                ? option.amount.toFixed(2)
                                : option.installmentAmount?.toFixed(2)
                            }
                          </p>
                          {option.mode === 'installments' && (
                            <p className="text-xs text-muted-foreground">
                              per payment
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            </div>
          ))}
        </RadioGroup>

        <div className="border-t pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {selectedMode === 'upfront' ? 'Total Amount:' : 'First Payment:'}
            </span>
            <span className="text-lg font-semibold">
              {getCurrencySymbol(pkg.currency)}{calculateInitialPayment(calculation, selectedMode).toFixed(2)}
            </span>
          </div>
          
          <Button 
            onClick={handlePayment} 
            disabled={processing}
            className="w-full"
            size="lg"
          >
            {processing ? 'Processing Payment...' : `Pay Securely – ${getCurrencySymbol(pkg.currency)}${calculateInitialPayment(calculation, selectedMode).toFixed(2)}`}
          </Button>

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-3 w-3" />
              <span>Payment protected</span>
            </div>
          </div>

          {/* Cancellation Policy */}
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime before your first session for a full refund
          </p>
        </div>
      </CardContent>
    </Card>
  );
}