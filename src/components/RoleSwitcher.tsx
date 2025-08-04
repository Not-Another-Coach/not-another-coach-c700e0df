import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Dumbbell, ArrowLeftRight } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export function RoleSwitcher() {
  const { profile, refetchProfile } = useProfile();
  const navigate = useNavigate();

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

  if (!profile) return null;

  const currentRole = profile.user_type;
  const alternateRole = currentRole === 'client' ? 'trainer' : 'client';

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
                </Badge>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRoleSwitch}
            className="flex items-center gap-2"
          >
            <ArrowLeftRight className="h-4 w-4" />
            Switch to {alternateRole === 'client' ? 'Client' : 'Trainer'}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          Instantly switch between client and trainer views
        </p>
      </CardContent>
    </Card>
  );
}