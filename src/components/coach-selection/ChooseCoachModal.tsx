import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useCoachSelection } from '@/hooks/useCoachSelection';
import { useProfile } from '@/hooks/useProfile';
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
    package_options?: Package[];
  };
  onSuccess?: () => void;
}

export const ChooseCoachModal = ({ 
  open, 
  onOpenChange, 
  trainer, 
  onSuccess 
}: ChooseCoachModalProps) => {
  const { profile } = useProfile();
  const { createSelectionRequest, loading } = useCoachSelection();
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [clientMessage, setClientMessage] = useState('');
  const [step, setStep] = useState<'select' | 'confirm'>('select');

  const trainerName = trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim();
  const packages = trainer.package_options || [];

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
    console.log('🚨🚨🚨 SUBMIT BUTTON CLICKED - CACHE BUST v4');
    toast.info('Submit button clicked - starting debug...');
    
    console.log('Selected package:', selectedPackage);
    console.log('createSelectionRequest function exists:', !!createSelectionRequest);
    console.log('createSelectionRequest type:', typeof createSelectionRequest);
    
    if (!selectedPackage) {
      console.log('No package selected, returning');
      toast.error('No package selected');
      return;
    }

    toast.info('About to call createSelectionRequest...');
    console.log('About to call createSelectionRequest...');
    console.log('Parameters:', {
      trainerId: trainer.id,
      packageId: selectedPackage.id,
      packageName: selectedPackage.name,
      packagePrice: selectedPackage.price,
      packageDuration: selectedPackage.duration,
      clientMessage: clientMessage.trim() || undefined
    });
    
    try {
      const result = await createSelectionRequest(
        trainer.id,
        selectedPackage.id,
        selectedPackage.name,
        selectedPackage.price,
        selectedPackage.duration,
        clientMessage.trim() || undefined
      );

      console.log('Result:', result);
      toast.info('Function call completed, result: ' + JSON.stringify(result));
      
      if (result.success) {
        console.log('Success - closing modal');
        toast.success('Selection request sent successfully!');
        onOpenChange(false);
        onSuccess?.();
      } else {
        console.log('Failed - result:', result);
        toast.error('Request failed: ' + JSON.stringify(result));
      }
    } catch (error) {
      console.error('Exception in handleSubmit:', error);
      toast.error('Exception: ' + error.message);
    }
  };

  const isClient = profile?.user_type === 'client';

  if (!isClient) {
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
                              {pkg.price}
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
                    <span className="text-lg font-bold">${selectedPackage.price}</span>
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