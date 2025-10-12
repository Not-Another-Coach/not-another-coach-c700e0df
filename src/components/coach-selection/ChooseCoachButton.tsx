import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, CheckCircle } from 'lucide-react';
import { ChooseCoachModal } from './ChooseCoachModal';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { useCoachSelection } from '@/hooks/useCoachSelection';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { useEngagementStage, EngagementStage } from '@/hooks/useEngagementStage';
import { useMessageExchange } from '@/hooks/useMessageExchange';

interface ChooseCoachButtonProps {
  trainer: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
    packageOptions?: any[];
  };
  stage: EngagementStage;
  onSuccess?: () => void;
  className?: string;
}

export const ChooseCoachButton = ({ 
  trainer, 
  stage, 
  onSuccess,
  className 
}: ChooseCoachButtonProps) => {
  const { isClient } = useUserTypeChecks();
  const { getSelectionRequest, acceptAlternativePackage } = useCoachSelection();
  const { updateEngagementStage } = useEngagementStage(trainer.id);
  const { hasExchangedMessages } = useMessageExchange(trainer.id);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectionRequest, setSelectionRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Show button when client can proceed with coach selection: 
  // - Later stages (agreed, getting_to_know_your_coach, discovery_completed, discovery_in_progress)
  // - OR shortlisted with message exchange (meaningful interaction has occurred)
  const canChooseCoach = isClient() && (
    stage === 'agreed' || 
    stage === 'getting_to_know_your_coach' ||
    stage === 'discovery_completed' || 
    stage === 'discovery_in_progress'
  );

  const lastTrainerIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchSelectionRequest = async () => {
      if (!isClient() || !canChooseCoach) {
        console.log('🔍 ChooseCoachButton: Not fetching - isClient:', isClient(), 'canChooseCoach:', canChooseCoach);
        setLoading(false);
        return;
      }

      // Prevent repeated fetches for the same trainer id
      if (lastTrainerIdRef.current === trainer.id) {
        return;
      }
      lastTrainerIdRef.current = trainer.id;
      
      console.log('🔍 ChooseCoachButton: Fetching selection request for trainer:', trainer.id);
      setLoading(true);
      try {
        const result = await getSelectionRequest(trainer.id);
        console.log('🔍 ChooseCoachButton: Selection request result:', result);
        if (result.data) {
          setSelectionRequest(result.data);
        }
      } catch (error) {
        console.error('Error fetching selection request:', error);
      } finally {
        setLoading(false);
        console.log('🔍 ChooseCoachButton: Loading set to false');
      }
    };

    fetchSelectionRequest();
  }, [trainer.id, isClient, canChooseCoach, getSelectionRequest]);

  if (!isClient() || !canChooseCoach) {
    return null;
  }

  const handleSuccess = () => {
    onSuccess?.();
    // Refresh the selection request
    getSelectionRequest(trainer.id).then(result => {
      if (result.data) {
        setSelectionRequest(result.data);
      }
    });
  };

  const handleAcceptAlternative = async () => {
    if (!selectionRequest?.suggested_alternative_package_id) return;
    
    const result = await acceptAlternativePackage(
      selectionRequest.id,
      selectionRequest.suggested_alternative_package_id,
      selectionRequest.suggested_alternative_package_name,
      selectionRequest.suggested_alternative_package_price
    );
    
    if (result.success) {
      handleSuccess();
    }
  };

  // Show status if there's an existing request
  if (selectionRequest) {
    // Find the selected package from trainer's package options to get enhanced payment data
    const selectedPackage = trainer.packageOptions?.find(pkg => 
      pkg.name === selectionRequest?.package_name || 
      pkg.id === selectionRequest?.package_id
    );

    const enhancedPackageData = selectedPackage ? {
      packageId: selectedPackage.id,
      customerPaymentModes: selectedPackage.customerPaymentModes || 
        (selectedPackage.customerPaymentMode ? [selectedPackage.customerPaymentMode] : ['upfront']),
      installmentCount: selectedPackage.installmentCount || 2,
      currency: selectedPackage.currency || 'GBP'
    } : {};

    const statusConfig = {
      pending: {
        icon: Clock,
        label: 'Waiting for PT Approval',
        description: 'Coach is reviewing your request',
        color: 'bg-yellow-500'
      },
      accepted: {
        icon: CheckCircle,
        label: 'Coach Approved',
        description: 'Client now awaiting payment',
        color: 'bg-green-500'
      },
      awaiting_payment: {
        icon: Clock,
        label: 'Awaiting Payment',
        description: 'Complete payment to secure your coach',
        color: 'bg-orange-500'
      },
      declined: {
        icon: Heart,
        label: 'Request Declined',
        description: 'You can send a new request',
        color: 'bg-red-500'
      },
      alternative_suggested: {
        icon: Heart,
        label: 'Alternative Suggested',
        description: 'Coach suggested an alternative package',
        color: 'bg-blue-500'
      },
      completed: {
        icon: CheckCircle,
        label: 'Payment Completed',
        description: 'You are now working with this coach',
        color: 'bg-green-600'
      }
    };

    const config = statusConfig[selectionRequest.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <div className={className}>
        {(selectionRequest.status === 'accepted' || selectionRequest.status === 'awaiting_payment') && (
          <Button 
            className="w-full"
            onClick={() => setShowPaymentForm(true)}
          >
            Proceed to Payment
          </Button>
        )}
        
        {(selectionRequest.status === 'declined') && (
          <Button 
            variant="outline" 
            onClick={() => setShowModal(true)}
            className="w-full"
          >
            Send New Request
          </Button>
        )}
        
        {selectionRequest.status === 'alternative_suggested' && selectionRequest.suggested_alternative_package_name && (
          <div className="space-y-3">
            <Badge variant="secondary" className={`${config.color} text-white`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <div className="p-3 bg-blue-50 rounded-lg space-y-3">
              <div>
                <p className="text-sm font-medium text-blue-900">Suggested Package:</p>
                <p className="text-sm text-blue-800">{selectionRequest.suggested_alternative_package_name}</p>
                {selectionRequest.suggested_alternative_package_price && (
                  <p className="text-sm text-blue-800 font-semibold">${selectionRequest.suggested_alternative_package_price}</p>
                )}
                {selectionRequest.trainer_response && (
                  <p className="text-sm text-blue-700 mt-2">{selectionRequest.trainer_response}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm"
                  onClick={handleAcceptAlternative}
                  disabled={loading}
                  className="flex-1"
                >
                  Accept Alternative Package
                </Button>
                <Button 
                  size="sm"
                  variant="outline" 
                  onClick={() => setShowModal(true)}
                  className="flex-1"
                >
                  Send New Request
                </Button>
              </div>
            </div>
          </div>
        )}
        
        {(selectionRequest.status === 'pending' || selectionRequest.status === 'completed') && (
          <div className="space-y-3">
            <Badge variant="secondary" className={`${config.color} text-white`}>
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        )}

        <ChooseCoachModal
          open={showModal}
          onOpenChange={setShowModal}
          trainer={trainer}
          onSuccess={handleSuccess}
        />
        
        <PaymentForm
          open={showPaymentForm}
          onOpenChange={setShowPaymentForm}
          packageName={selectionRequest?.package_name || ''}
          packagePrice={selectionRequest?.package_price || 0}
          packageDuration={selectionRequest?.package_duration || ''}
          trainerName={trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim()}
          trainerId={trainer.id}
          onPaymentSuccess={handleSuccess}
          {...enhancedPackageData}
        />
      </div>
    );
  }

  console.log('🔍 ChooseCoachButton render:', { 
    trainerId: trainer.id, 
    loading, 
    canChooseCoach, 
    hasRequest: !!selectionRequest,
    packageCount: trainer.packageOptions?.length || 0
  });

  return (
    <div className={className}>
      <Button
        onClick={() => {
          console.log('🔍 ChooseCoachButton: Opening modal with packages:', trainer.packageOptions);
          setShowModal(true);
        }}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        <Heart className="w-4 h-4 mr-2" />
        {loading ? 'Loading...' : 'Choose This Coach'}
      </Button>

      <ChooseCoachModal
        open={showModal}
        onOpenChange={setShowModal}
        trainer={trainer}
        onSuccess={handleSuccess}
      />
    </div>
  );
};