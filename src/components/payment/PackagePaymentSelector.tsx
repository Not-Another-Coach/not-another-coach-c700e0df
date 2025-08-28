import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, Check } from "lucide-react";
import { 
  calculatePackagePaymentOptions, 
  calculateInitialPayment, 
  formatPaymentOptionsForCustomer,
  type PackagePaymentCalculation 
} from "@/lib/packagePaymentUtils";

interface PackagePaymentSelectorProps {
  package: {
    id: string;
    name: string;
    price: number;
    currency: string;
    customerPaymentModes?: ('upfront' | 'installments')[];
    installmentCount?: number;
  };
  onPaymentSelection: (paymentMode: 'upfront' | 'installments', amount: number) => void;
  loading?: boolean;
}

export function PackagePaymentSelector({ 
  package: pkg, 
  onPaymentSelection, 
  loading = false 
}: PackagePaymentSelectorProps) {
  const calculation = calculatePackagePaymentOptions(pkg);
  const [selectedMode, setSelectedMode] = useState<'upfront' | 'installments'>(
    calculation.defaultOption.mode
  );

  const handlePayment = () => {
    const initialAmount = calculateInitialPayment(calculation, selectedMode);
    onPaymentSelection(selectedMode, initialAmount);
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency.toUpperCase()) {
      case 'GBP': return '£';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return currency;
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
          <div className="p-4 border rounded-lg bg-muted/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{option.description}</p>
                {option.mode === 'installments' && option.installmentCount && (
                  <p className="text-sm text-muted-foreground mt-1">
                    First payment: {getCurrencySymbol(pkg.currency)}{option.installmentAmount?.toFixed(2)}
                  </p>
                )}
              </div>
              <Badge variant="default">
                {option.mode === 'upfront' ? 'Full Payment' : 'Installments'}
              </Badge>
            </div>
          </div>
          
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : `Pay ${getCurrencySymbol(pkg.currency)}${calculateInitialPayment(calculation, option.mode).toFixed(2)}`}
          </Button>
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

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">
              {selectedMode === 'upfront' ? 'Total Amount:' : 'First Payment:'}
            </span>
            <span className="text-lg font-semibold">
              {getCurrencySymbol(pkg.currency)}{calculateInitialPayment(calculation, selectedMode).toFixed(2)}
            </span>
          </div>
          
          <Button 
            onClick={handlePayment} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? 'Processing...' : `Continue to Payment`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}