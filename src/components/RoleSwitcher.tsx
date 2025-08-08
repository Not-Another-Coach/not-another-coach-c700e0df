import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Dumbbell, ArrowLeftRight, ChevronDown } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useRealTrainers } from '@/hooks/useRealTrainers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function RoleSwitcher() {
  const { profile, refetchProfile, isAdmin } = useProfile();
  const { trainers, loading: trainersLoading } = useRealTrainers();
  const navigate = useNavigate();
  const [selectedTrainerId, setSelectedTrainerId] = useState<string>('');
  const [showTrainerSelection, setShowTrainerSelection] = useState(false);

  const handleRoleSwitch = async () => {
    if (!profile) return;

    const newRole = profile.user_type === 'client' ? 'trainer' : 'client';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: newRole })
        .eq('id', profile.id);

      if (error) {
        toast.error('Failed to switch role');
        return;
      }

      await refetchProfile();
      toast.success(`Switched to ${newRole} role`);
      
      // Navigate to appropriate dashboard
      if (newRole === 'trainer') {
        navigate('/trainer/dashboard');
      } else {
        navigate('/client/dashboard');
      }
    } catch (error) {
      toast.error('Failed to switch role');
    }
  };

  const handleTrainerView = async () => {
    if (!selectedTrainerId || !profile) return;

    try {
      // Store original user details for later restoration
      sessionStorage.setItem('originalUserId', profile.id);
      sessionStorage.setItem('originalUserType', profile.user_type);
      
      // Switch to the selected trainer temporarily
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: 'trainer' })
        .eq('id', profile.id);

      if (error) {
        toast.error('Failed to switch to trainer view');
        return;
      }

      // Store which trainer we're viewing
      sessionStorage.setItem('viewingTrainerId', selectedTrainerId);
      
      await refetchProfile();
      toast.success('Viewing trainer dashboard');
      navigate('/trainer/dashboard');
    } catch (error) {
      toast.error('Failed to switch to trainer view');
    }
  };

  const restoreOriginalView = async () => {
    const originalUserType = sessionStorage.getItem('originalUserType');
    if (!originalUserType || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ user_type: originalUserType as any })
        .eq('id', profile.id);

      if (error) {
        toast.error('Failed to restore original view');
        return;
      }

      // Clear session storage
      sessionStorage.removeItem('originalUserId');
      sessionStorage.removeItem('originalUserType');
      sessionStorage.removeItem('viewingTrainerId');
      
      await refetchProfile();
      toast.success('Restored to original view');
      
      if (originalUserType === 'client') {
        navigate('/client/dashboard');
      }
    } catch (error) {
      toast.error('Failed to restore original view');
    }
  };

  if (!profile) return null;

  const currentRole = profile.user_type;
  const alternateRole = currentRole === 'client' ? 'trainer' : 'client';
  const isViewingAsTrainer = sessionStorage.getItem('viewingTrainerId');
  
  // Show admin-enhanced version (for now, show to everyone, later restrict to admins)
  const showEnhancedVersion = true; // Later: isAdmin();

  return (
    <Card className="w-full max-w-md">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {currentRole === 'client' ? (
                <Users className="h-5 w-5 text-blue-600" />
              ) : (
                <Dumbbell className="h-5 w-5 text-orange-600" />
              )}
              <div>
                <p className="font-medium">Current Role</p>
                <Badge variant="secondary" className="text-xs">
                  {currentRole === 'client' ? 'Client' : 'Trainer'}
                  {isViewingAsTrainer && ' (Preview)'}
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isViewingAsTrainer ? (
              <Button
                variant="outline"
                size="sm"
                onClick={restoreOriginalView}
                className="flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Exit Preview
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRoleSwitch}
                className="flex items-center gap-2"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Switch to {alternateRole === 'client' ? 'Client' : 'Trainer'}
              </Button>
            )}
          </div>
        </div>
        
        {/* Enhanced Trainer Selection - Show to admins and for development */}
        {showEnhancedVersion && currentRole === 'client' && !isViewingAsTrainer && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">View Specific Trainer Dashboard</p>
                <Badge variant="outline" className="text-xs">Admin Preview</Badge>
              </div>
              
              <div className="flex gap-2">
                <Select 
                  value={selectedTrainerId} 
                  onValueChange={setSelectedTrainerId}
                  disabled={trainersLoading}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder={trainersLoading ? "Loading trainers..." : "Select a trainer"} />
                  </SelectTrigger>
                  <SelectContent>
                    {trainers.map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{trainer.name}</span>
                          {trainer.location && (
                            <span className="text-xs text-muted-foreground">{trainer.location}</span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  size="sm"
                  onClick={handleTrainerView}
                  disabled={!selectedTrainerId || trainersLoading}
                  className="shrink-0"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-xs text-muted-foreground mt-2">
          {isViewingAsTrainer 
            ? "You're previewing a trainer's dashboard. Click 'Exit Preview' to return."
            : "Instantly switch between client and trainer views"
          }
        </p>
      </CardContent>
    </Card>
  );
}