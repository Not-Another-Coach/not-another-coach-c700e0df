import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Instagram, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface InstagramConnection {
  id: string;
  instagram_username: string;
  account_type: string;
  is_active: boolean;
  reveal_handle_post_discovery: boolean;
}

export const InstagramRevealSettings = () => {
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('instagram_connections')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      
      setConnection(data);
      
    } catch (err: any) {
      console.error('Error fetching Instagram connection:', err);
      setError(err.message || 'Failed to fetch Instagram connection');
    } finally {
      setLoading(false);
    }
  };

  const updateRevealSetting = async (enabled: boolean) => {
    if (!connection) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('instagram_connections')
        .update({ reveal_handle_post_discovery: enabled })
        .eq('id', connection.id);

      if (error) throw error;
      
      setConnection(prev => prev ? { ...prev, reveal_handle_post_discovery: enabled } : null);
      
      toast({
        title: 'Settings Updated',
        description: enabled 
          ? 'Your Instagram handle will be revealed after discovery calls'
          : 'Your Instagram handle will remain private during discovery calls',
      });
      
    } catch (err: any) {
      console.error('Error updating reveal setting:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchConnection();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Handle Reveal Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !connection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Handle Reveal Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground py-4">
            <AlertCircle className="h-5 w-5" />
            <span>
              {error || 'No Instagram connection found. Connect your account first.'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5" />
          Instagram Handle Reveal Settings
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Connected as @{connection.instagram_username}</span>
          <Badge variant="secondary">{connection.account_type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="reveal-setting" className="text-base font-medium">
                  Reveal Instagram Handle After Discovery Calls
                </Label>
                {connection.reveal_handle_post_discovery ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                When enabled, your Instagram handle (@{connection.instagram_username}) will be revealed to clients 
                after completing a discovery call with them. This helps build trust and allows clients 
                to see more of your work and personality.
              </p>
            </div>
            <Switch
              id="reveal-setting"
              checked={connection.reveal_handle_post_discovery}
              onCheckedChange={updateRevealSetting}
              disabled={saving}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <h4 className="font-medium text-sm">How it works:</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Clients can see your selected Instagram posts during browsing and discovery calls</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Your actual Instagram handle (@{connection.instagram_username}) remains hidden initially</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>After a successful discovery call, your handle is revealed to that specific client</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                <span>Clients can then follow you and see your full Instagram content</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${connection.reveal_handle_post_discovery ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              Current Status: {connection.reveal_handle_post_discovery ? 'Enabled' : 'Disabled'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {connection.reveal_handle_post_discovery 
              ? 'Your Instagram handle will be revealed to clients after discovery calls'
              : 'Your Instagram handle will remain private during all client interactions'
            }
          </p>
        </div>
        
        {saving && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Updating settings...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};