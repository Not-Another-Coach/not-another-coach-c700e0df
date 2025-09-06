import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle, XCircle, Clock, Target } from 'lucide-react';
import { useCustomSpecialtyRequests, useTrainerCustomSpecialtyRequests } from '@/hooks/useSpecialties';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AdminSpecialtyAlertsProps {
  onNavigateToRequests?: () => void;
}

export const AdminSpecialtyAlerts: React.FC<AdminSpecialtyAlertsProps> = ({ onNavigateToRequests }) => {
  const { requests } = useCustomSpecialtyRequests();
  const pendingRequests = requests.filter(r => r.status === 'pending');
  const [lastKnownCount, setLastKnownCount] = useState(0);

  useEffect(() => {
    if (pendingRequests && pendingRequests.length > lastKnownCount && lastKnownCount > 0) {
      toast.info(`New custom specialty request submitted!`, {
        description: 'Click to review pending requests',
        duration: 5000,
        action: onNavigateToRequests ? {
          label: 'Review',
          onClick: onNavigateToRequests
        } : undefined
      });
    }
    if (pendingRequests) {
      setLastKnownCount(pendingRequests.length);
    }
  }, [pendingRequests?.length, lastKnownCount, onNavigateToRequests]);

  if (!pendingRequests || pendingRequests.length === 0) return null;

  return (
    <Alert className="border-orange-200 bg-orange-50">
      <Bell className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          <span className="font-medium">
            {pendingRequests.length} custom specialty request{pendingRequests.length > 1 ? 's' : ''} pending review
          </span>
          <Badge variant="outline" className="ml-2">
            {pendingRequests.length}
          </Badge>
        </div>
        {onNavigateToRequests && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onNavigateToRequests}
            className="ml-4"
          >
            <Target className="w-4 h-4 mr-2" />
            Review
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};

interface TrainerSpecialtyAlertsProps {
  onNavigateToProfile?: () => void;
}

export const TrainerSpecialtyAlerts: React.FC<TrainerSpecialtyAlertsProps> = ({ onNavigateToProfile }) => {
  const { requests: customRequests } = useTrainerCustomSpecialtyRequests();
  const [processedRequests, setProcessedRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!customRequests) return;

    customRequests.forEach(request => {
      if (!processedRequests.has(request.id)) {
        if (request.status === 'approved') {
          toast.success(`Specialty "${request.requested_name}" approved!`, {
            description: 'Your custom specialty has been approved by admin',
            duration: 6000
          });
        } else if (request.status === 'rejected') {
          toast.error(`Specialty "${request.requested_name}" was not approved`, {
            description: request.admin_notes || 'Please contact support if you have questions',
            duration: 6000
          });
        }
        setProcessedRequests(prev => new Set([...prev, request.id]));
      }
    });
  }, [customRequests, processedRequests]);

  if (!customRequests) return null;

  const recentRequests = customRequests.filter(request => {
    const requestDate = new Date(request.updated_at || request.created_at);
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    return requestDate > threeDaysAgo && request.status !== 'pending';
  });

  if (recentRequests.length === 0) return null;

  return (
    <div className="space-y-2">
      {recentRequests.map(request => (
        <Alert 
          key={request.id} 
          className={`${
            request.status === 'approved' 
              ? 'border-green-200 bg-green-50' 
              : 'border-red-200 bg-red-50'
          }`}
        >
          {request.status === 'approved' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <XCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className="flex items-center justify-between w-full">
            <div>
              <div className="font-medium">
                Specialty "{request.requested_name}" {request.status === 'approved' ? 'approved' : 'rejected'}
              </div>
              {request.admin_notes && (
                <div className="text-sm text-muted-foreground mt-1">
                  Admin notes: {request.admin_notes}
                </div>
              )}
            </div>
            {onNavigateToProfile && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onNavigateToProfile}
                className="ml-4"
              >
                View Profile
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
};

export const SpecialtyRequestWidget: React.FC = () => {
  const { user } = useAuth();
  const { requests: allRequests } = useCustomSpecialtyRequests();
  const { requests: trainerRequests } = useTrainerCustomSpecialtyRequests();

  if (!user) return null;

  const pendingCount = allRequests?.filter(r => r.status === 'pending').length || 0;
  const trainerPendingCount = trainerRequests?.filter(r => r.status === 'pending').length || 0;
  const trainerRecentUpdates = trainerRequests?.filter(r => {
    const requestDate = new Date(r.updated_at || r.created_at);
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);
    return requestDate > oneDayAgo && r.status !== 'pending';
  }).length || 0;

  if (pendingCount === 0 && trainerPendingCount === 0 && trainerRecentUpdates === 0) return null;

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Target className="w-4 h-4 text-orange-600" />
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm">Specialty Requests</div>
            <div className="text-xs text-muted-foreground">
              {pendingCount > 0 && `${pendingCount} admin review${pendingCount > 1 ? 's' : ''} needed`}
              {trainerPendingCount > 0 && `${trainerPendingCount} pending`}
              {trainerRecentUpdates > 0 && `${trainerRecentUpdates} recent update${trainerRecentUpdates > 1 ? 's' : ''}`}
            </div>
          </div>
          {(pendingCount > 0 || trainerPendingCount > 0 || trainerRecentUpdates > 0) && (
            <Badge variant="secondary" className="text-xs">
              {pendingCount + trainerPendingCount + trainerRecentUpdates}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};