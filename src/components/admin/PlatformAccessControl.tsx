import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Users, UserCheck } from 'lucide-react';

export function PlatformAccessControl() {
  const [trainerAccessEnabled, setTrainerAccessEnabled] = useState(true);
  const [clientAccessEnabled, setClientAccessEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_platform_access_settings');

      if (error) throw error;

      const settings = data as { trainer_access_enabled: boolean; client_access_enabled: boolean };
      setTrainerAccessEnabled(settings.trainer_access_enabled ?? true);
      setClientAccessEnabled(settings.client_access_enabled ?? true);
    } catch (error) {
      console.error('Error fetching access settings:', error);
      toast({
        title: "Error",
        description: "Failed to load access settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (trainerEnabled: boolean, clientEnabled: boolean) => {
    setUpdating(true);
    try {
      const { error } = await supabase
        .rpc('update_platform_access_settings', {
          trainer_enabled: trainerEnabled,
          client_enabled: clientEnabled
        });

      if (error) throw error;

      toast({
        title: "Settings Updated",
        description: "Platform access settings have been updated successfully",
      });
    } catch (error) {
      console.error('Error updating access settings:', error);
      toast({
        title: "Error",
        description: "Failed to update access settings",
        variant: "destructive",
      });
      // Revert changes on error
      await fetchSettings();
    } finally {
      setUpdating(false);
    }
  };

  const handleTrainerToggle = (enabled: boolean) => {
    setTrainerAccessEnabled(enabled);
    updateSettings(enabled, clientAccessEnabled);
  };

  const handleClientToggle = (enabled: boolean) => {
    setClientAccessEnabled(enabled);
    updateSettings(trainerAccessEnabled, enabled);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          Platform Access Control
        </CardTitle>
        <CardDescription>
          Control which user types can access the platform after completing their profile setup
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="trainer-access" className="text-base font-semibold">
                Trainer Access
              </Label>
              <p className="text-sm text-muted-foreground">
                {trainerAccessEnabled 
                  ? "Trainers can access the full platform after completing their profile" 
                  : "Trainers see a holding page after completing their profile"}
              </p>
            </div>
            <Switch
              id="trainer-access"
              checked={trainerAccessEnabled}
              onCheckedChange={handleTrainerToggle}
              disabled={updating}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <Label htmlFor="client-access" className="text-base font-semibold">
                Client Access
              </Label>
              <p className="text-sm text-muted-foreground">
                {clientAccessEnabled 
                  ? "Clients can access the full platform after completing their survey" 
                  : "Clients see a holding page after completing their survey"}
              </p>
            </div>
            <Switch
              id="client-access"
              checked={clientAccessEnabled}
              onCheckedChange={handleClientToggle}
              disabled={updating}
            />
          </div>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium">Note:</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Users who completed their profiles before this feature was enabled are automatically granted access (grandfathered in). 
            This setting only affects users who complete their profile after the feature was implemented.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
