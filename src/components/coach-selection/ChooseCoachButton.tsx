import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Clock, CheckCircle } from 'lucide-react';
import { ChooseCoachModal } from './ChooseCoachModal';
import { PaymentForm } from '@/components/payment/PaymentForm';
import { useCoachSelection } from '@/hooks/useCoachSelection';
import { useProfile } from '@/hooks/useProfile';
import { useEngagementStage, EngagementStage } from '@/hooks/useEngagementStage';

interface ChooseCoachButtonProps {
  trainer: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    profilePhotoUrl?: string;
    package_options?: any[];
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
  const { profile } = useProfile();
  const { getSelectionRequest } = useCoachSelection();
  const { updateEngagementStage } = useEngagementStage(trainer.id);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectionRequest, setSelectionRequest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const isClient = profile?.user_type === 'client';
  // Show button when there's 2-way chat (matched), discovery call stages, or discovery in progress (for trainers who don't offer discovery calls)
  const canChooseCoach = isClient && (stage === 'matched' || stage === 'discovery_call_booked' || stage === 'discovery_completed' || stage === 'discovery_in_progress' || stage === 'waitlist');

  useEffect(() => {
    const fetchSelectionRequest = async () => {
      if (!isClient || !canChooseCoach) return;
      
      setLoading(true);
      const result = await getSelectionRequest(trainer.id);
      if (result.data) {
        setSelectionRequest(result.data);
      }
      setLoading(false);
    };

    fetchSelectionRequest();
  }, [trainer.id, isClient, canChooseCoach, getSelectionRequest]);

  if (!isClient || !canChooseCoach) {
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

  // Show status if there's an existing request
  if (selectionRequest) {
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
        description: 'Coach suggested different package',
        color: 'bg-blue-500'
      }
    };

    const config = statusConfig[selectionRequest.status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <div className={className}>
        <div className="space-y-3">
          <Badge variant="secondary" className={`${config.color} text-white`}>
            <Icon className="w-3 h-3 mr-1" />
            {config.label}
          </Badge>
          <p className="text-sm text-muted-foreground">{config.description}</p>
          
          {(selectionRequest.status === 'accepted' || selectionRequest.status === 'awaiting_payment') && (
            <Button 
              className="w-full"
              onClick={() => setShowPaymentForm(true)}
            >
              Proceed to Payment
            </Button>
          )}
          
          {(selectionRequest.status === 'declined' || selectionRequest.status === 'alternative_suggested') && (
            <Button 
              variant="outline" 
              onClick={() => setShowModal(true)}
              className="w-full"
            >
              Send New Request
            </Button>
          )}
          
          {selectionRequest.status === 'alternative_suggested' && selectionRequest.suggested_alternative_package_name && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-900">Suggested Package:</p>
              <p className="text-sm text-blue-800">{selectionRequest.suggested_alternative_package_name}</p>
              {selectionRequest.suggested_alternative_package_price && (
                <p className="text-sm text-blue-800">${selectionRequest.suggested_alternative_package_price}</p>
              )}
              {selectionRequest.trainer_response && (
                <p className="text-sm text-blue-700 mt-2">{selectionRequest.trainer_response}</p>
              )}
            </div>
          )}
        </div>

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
        />
      </div>
    );
  }

  return (
    <div className={className}>
      <Button
        onClick={() => setShowModal(true)}
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
      
      <PaymentForm
        open={showPaymentForm}
        onOpenChange={setShowPaymentForm}
        packageName={selectionRequest?.package_name || ''}
        packagePrice={selectionRequest?.package_price || 0}
        packageDuration={selectionRequest?.package_duration || ''}
        trainerName={trainer.name || `${trainer.firstName || ''} ${trainer.lastName || ''}`.trim()}
        trainerId={trainer.id}
        onPaymentSuccess={handleSuccess}
      />
    </div>
  );
};