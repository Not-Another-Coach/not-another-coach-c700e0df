import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, DollarSign, Clock, CheckCircle, Send, Eye, CreditCard, Rocket } from 'lucide-react';
import { useCoachSelection } from '@/hooks/useCoachSelection';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Package {
  id: string;
  name: string;
  price: number;
  currency: string;
  durationWeeks?: number;
  description?: string;
  sessions?: number;
  includes?: string[];
  inclusions?: string[];
  isPromotion?: boolean;
  promotionEndDate?: string;
  customerPaymentModes?: string[];
}

interface ChooseCoachModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trainer: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
    packageOptions?: Package[];
  };
  onSuccess?: () => void;
}

export const ChooseCoachModal = ({ 
  open, 
  onOpenChange, 
  trainer, 
  onSuccess 
}: ChooseCoachModalProps) => {
  const { isClient } = useUserTypeChecks();
  const { createSelectionRequest, loading } = useCoachSelection();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [clientMessage, setClientMessage] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');
  
  // Helper to get payment terms label
  const getPaymentTermsLabel = (pkg: Package) => {
    const modes = pkg.customerPaymentModes || [];
    if (modes.includes('installments') && modes.includes('upfront')) {
      return 'Installments option';
    } else if (modes.includes('installments')) {
      return 'Installments';
    }
    return 'Pay in full';
  };

  const trainerName = trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim();
  
  // Sort packages: promotions first, then by price
  const packages = (trainer.packageOptions || []).sort((a, b) => {
    if (a.isPromotion && !b.isPromotion) return -1;
    if (!a.isPromotion && b.isPromotion) return 1;
    return (a.price || 0) - (b.price || 0);
  });

  console.log('🔍 ChooseCoachModal: Packages available:', packages.length, packages);

  // Format duration display from durationWeeks
  const formatDuration = (pkg: Package) => {
    if (pkg.durationWeeks) {
      return pkg.durationWeeks === 1 ? '1 week' : `${pkg.durationWeeks} weeks`;
    }
    return 'Contact for details';
  };

  useEffect(() => {
    if (open) {
      setSelectedPackage(null);
      setClientMessage('');
      setStep('select');
    }
  }, [open]);

  const handlePackageSelect = (pkg: Package) => {
    setSelectedPackage(pkg);
    setStep('confirm');
  };

  const handleSubmit = async () => {
    if (!selectedPackage) {
      return;
    }

    const result = await createSelectionRequest(
      trainer.id,
      selectedPackage.id,
      selectedPackage.name,
      selectedPackage.price,
      formatDuration(selectedPackage),
      clientMessage.trim() || undefined
    );
    
    if (result.success) {
      onOpenChange(false);
      onSuccess?.();
    }
  };

  if (!isClient()) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary" />
            {step === 'select' ? 'Choose Your Package' : 'Confirm Your Choice'}
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between px-2 py-4 border-b">
          <button
            onClick={() => step === 'confirm' && setStep('select')}
            className={cn(
              "flex items-center gap-2 transition-all",
              step === 'select' ? 'text-primary' : 'text-muted-foreground',
              step === 'confirm' && 'cursor-pointer hover:text-primary'
            )}
            disabled={step === 'select'}
          >
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all", step === 'select' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground/20')}>
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Select Package</span>
          </button>
          <div className="h-px flex-1 mx-2 bg-border" />
          <div className={cn("flex items-center gap-2 transition-all", step === 'confirm' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all", step === 'confirm' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground/20')}>
              <CheckCircle className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Confirm</span>
          </div>
          <div className="h-px flex-1 mx-2 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-muted border-muted-foreground/20">
              <CreditCard className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Pay</span>
          </div>
          <div className="h-px flex-1 mx-2 bg-border" />
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="w-8 h-8 rounded-full flex items-center justify-center border-2 bg-muted border-muted-foreground/20">
              <Rocket className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Start</span>
          </div>
        </div>

        <div className="space-y-6 animate-fade-in">
          {/* Trainer Info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            {trainer.profilePhotoUrl && (
              <img 
                src={trainer.profilePhotoUrl} 
                alt={trainerName}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="font-semibold">{trainerName}</h3>
              <p className="text-sm text-muted-foreground">Personal Trainer</p>
            </div>
          </div>

          {step === 'select' && (
            <div className="space-y-4">
              <h4 className="font-medium">Select a training package:</h4>
              
              {packages.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">
                      No packages available. Please contact the trainer directly.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {packages.map((pkg) => {
                    const includes = pkg.includes || pkg.inclusions || [];
                    const isPromotion = pkg.isPromotion;
                    const promotionEndDate = pkg.promotionEndDate ? new Date(pkg.promotionEndDate).toLocaleDateString() : null;
                    
                    return (
                      <Card 
                        key={pkg.id}
                        className={cn(
                          "cursor-pointer transition-all hover:shadow-lg hover-scale relative overflow-hidden group",
                          isPromotion && "border-2 border-primary/50 bg-primary/5"
                        )}
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {isPromotion && (
                          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-bl-lg">
                            PROMOTION
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1 pr-4">
                              <CardTitle className="text-lg">{pkg.name}</CardTitle>
                              {isPromotion && promotionEndDate && (
                                <p className="text-xs text-primary font-medium mt-1">
                                  Ends {promotionEndDate}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">
                                {pkg.currency} {pkg.price}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDuration(pkg)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {pkg.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {pkg.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {pkg.sessions && (
                              <Badge variant="secondary">
                                {pkg.sessions} sessions
                              </Badge>
                            )}
                            <Badge variant="outline" className="border-primary/30 text-primary">
                              <DollarSign className="w-3 h-3 mr-1" />
                              {getPaymentTermsLabel(pkg)}
                            </Badge>
                          </div>
                          {includes.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Includes:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {includes.map((item: string, index: number) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                                    {item}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                        <div className="absolute inset-0 border-2 border-primary rounded-lg opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && selectedPackage && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-600 animate-scale-in">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Package Selected</span>
              </div>
              
              <Card className={cn(
                "border-emerald-200 bg-emerald-50/30 relative overflow-hidden",
                selectedPackage.isPromotion && "border-primary/50"
              )}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-50" />
                {selectedPackage.isPromotion && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold rounded-full z-10">
                    PROMOTION
                  </div>
                )}
                <CardHeader className="pb-3 relative">
                  <div className="flex items-start gap-3">
                    {trainer.profilePhotoUrl && (
                      <img 
                        src={trainer.profilePhotoUrl} 
                        alt={trainerName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-emerald-200"
                      />
                    )}
                    <div className="flex-1">
                      <CardTitle className="text-lg">{selectedPackage.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">with {trainerName}</p>
                      {selectedPackage.isPromotion && selectedPackage.promotionEndDate && (
                        <p className="text-xs text-primary font-medium mt-1">
                          Promotion ends {new Date(selectedPackage.promotionEndDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-lg font-bold">
                        {selectedPackage.currency} {selectedPackage.price}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatDuration(selectedPackage)}</span>
                  </div>
                  {selectedPackage.description && (
                    <p className="text-sm text-muted-foreground">
                      {selectedPackage.description}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Share your goals or questions to help {trainerName} understand your needs
                </label>
                <Textarea
                  placeholder={`e.g., "I'm looking to build strength and improve my overall fitness. I can commit to 3 sessions per week..."`}
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  rows={4}
                  maxLength={500}
                  className="resize-none"
                />
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">
                    💡 Tip: Mention your goals, experience level, or any specific needs
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {clientMessage.length}/500
                  </span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-5 rounded-lg border border-primary/20">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Rocket className="w-5 h-5 text-primary" />
                  What happens next?
                </h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Send className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Your request is sent directly to {trainerName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">They'll receive a notification right away</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Eye className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">They'll review your package choice and confirm availability</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Usually responds within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CreditCard className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Once confirmed, you'll receive a secure payment link</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Easy and safe checkout process</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Rocket className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">After payment, you're officially onboarded and ready to begin! 🎉</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Your fitness journey starts here</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('select')}
                  className="flex-1"
                >
                  Back to Packages
                </Button>
                <Button 
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Sending Request...' : 'Send Request'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};