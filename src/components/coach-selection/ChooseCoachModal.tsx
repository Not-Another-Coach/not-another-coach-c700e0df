import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useCoachSelection } from '@/hooks/useCoachSelection';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwarePricing } from '@/components/ui/VisibilityAwarePricing';
import { toast } from 'sonner';

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

        <div className="space-y-6">
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
                  {packages.map((pkg) => (
                    <Card 
                      key={pkg.id}
                      className="cursor-pointer transition-all hover:shadow-md"
                      onClick={() => handlePackageSelect(pkg)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{pkg.name}</CardTitle>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-lg font-bold">
                              <DollarSign className="w-4 h-4" />
                              <VisibilityAwarePricing
                                pricing={pkg.price.toString()}
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
                                  <CheckCircle className="w-3 h-3 text-green-500" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && selectedPackage && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Package Selected</span>
              </div>
              
              <Card className="border-green-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{selectedPackage.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-3">
                    <VisibilityAwarePricing
                      pricing={`$${selectedPackage.price}`}
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
                  Add a message for {trainerName} (optional)
                </label>
                <Textarea
                  placeholder="Tell them why you'd like to work together, your goals, or any questions..."
                  value={clientMessage}
                  onChange={(e) => setClientMessage(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What happens next?</h4>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Your request will be sent to {trainerName}</li>
                  <li>2. They'll review and approve your selected package</li>
                  <li>3. Once approved, payment form will be enabled</li>
                  <li>4. After payment, your onboarding begins!</li>
                </ol>
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