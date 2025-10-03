import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, DollarSign, Clock, CheckCircle, Send, Eye, CreditCard, Rocket, Zap, Star, TrendingUp } from 'lucide-react';
import { useCoachSelection } from '@/hooks/useCoachSelection';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwarePricing } from '@/components/ui/VisibilityAwarePricing';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Package {
  id: string;
  name: string;
  price: number;
  duration: string;
  description?: string;
  sessions?: number;
  includes?: string[];
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
  
  const { getVisibility } = useContentVisibility({
    engagementStage: 'browsing'
  });

  const trainerName = trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim();
  const packages = trainer.packageOptions || [];

  console.log('🔍 ChooseCoachModal: Packages available:', packages.length, packages);

  // Determine package benefits based on package characteristics (null-safe)
  const getPackageBenefit = (pkg: Package, index: number) => {
    const safeSessions = typeof pkg.sessions === 'number' && pkg.sessions > 0 ? pkg.sessions : 0;
    const perSession = safeSessions > 0 && typeof pkg.price === 'number' ? pkg.price / safeSessions : Infinity;

    const sortedBySessions = [...packages].sort((a, b) => (b.sessions || 0) - (a.sessions || 0));

    if (sortedBySessions[0]?.id === pkg.id && safeSessions > 1) {
      return { label: 'Best Value', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    }
    if (packages.length >= 3 && index === Math.floor(packages.length / 2)) {
      return { label: 'Most Popular', icon: Star, color: 'text-amber-600 bg-amber-50 border-amber-200' };
    }
    const durationStr = `${pkg.duration ?? ''}`.toLowerCase();
    if (durationStr.includes('week') || safeSessions <= 4) {
      return { label: 'Great for Consistency', icon: Zap, color: 'text-blue-600 bg-blue-50 border-blue-200' };
    }
    return null;
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
      selectedPackage.duration,
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
          <div className={cn("flex items-center gap-2 transition-all", step === 'select' ? 'text-primary' : 'text-muted-foreground')}>
            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all", step === 'select' ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted border-muted-foreground/20')}>
              <Heart className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Select Package</span>
          </div>
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
                  {packages.map((pkg, index) => {
                    const benefit = getPackageBenefit(pkg, index);
                    const BenefitIcon = benefit?.icon;
                    
                    return (
                      <Card 
                        key={pkg.id}
                        className="cursor-pointer transition-all hover:shadow-lg hover-scale relative overflow-hidden group"
                        onClick={() => handlePackageSelect(pkg)}
                      >
                        {benefit && (
                          <div className={cn("absolute top-3 right-3 px-2 py-1 rounded-full border text-xs font-medium flex items-center gap-1", benefit.color)}>
                            {BenefitIcon && <BenefitIcon className="w-3 h-3" />}
                            {benefit.label}
                          </div>
                        )}
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg pr-24">{pkg.name}</CardTitle>
                            <div className="text-right">
                              <div className="flex items-center gap-1 text-lg font-bold">
                              <DollarSign className="w-4 h-4" />
                              <VisibilityAwarePricing
                                pricing={(pkg.price ?? 0).toString()}
                                visibilityState={getVisibility('pricing_discovery_call')}
                              />
                              </div>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {pkg.duration}
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
                          {pkg.sessions && (
                            <Badge variant="secondary" className="mr-2">
                              {pkg.sessions} sessions
                            </Badge>
                          )}
                          {pkg.includes && pkg.includes.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium mb-2">Includes:</p>
                              <ul className="text-sm text-muted-foreground space-y-1">
                                {pkg.includes.map((item, index) => (
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
              
              <Card className="border-emerald-200 bg-emerald-50/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full -mr-16 -mt-16 opacity-50" />
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
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="flex justify-between items-center mb-3">
                    <VisibilityAwarePricing
                      pricing={selectedPackage.price != null ? `$${selectedPackage.price}` : 'Contact'}
                      visibilityState={getVisibility('pricing_discovery_call')}
                      className="text-lg font-bold"
                    />
                    <span className="text-sm text-muted-foreground">{selectedPackage.duration}</span>
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