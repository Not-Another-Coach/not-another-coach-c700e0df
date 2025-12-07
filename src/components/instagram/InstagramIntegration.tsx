import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthService } from '@/services';
import { Instagram, ExternalLink, Settings, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { getSupabaseEdgeFunctionUrl } from '@/config/environment';
import { Separator } from '@/components/ui/separator';
import { InstagramRevealSettings } from './InstagramRevealSettings';
import { InstagramMediaPicker } from '../trainer-setup/InstagramMediaPicker';

interface InstagramConnection {
  id: string;
  instagram_username: string;
  account_type: string;
  is_active: boolean;
  reveal_handle_post_discovery: boolean;
  access_token: string;
  created_at: string;
}

export const InstagramIntegration = () => {
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userResponse = await AuthService.getCurrentUser();
      if (!userResponse.success || !userResponse.data) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('instagram_connections')
        .select('*')
        .eq('trainer_id', userResponse.data.id)
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

  const handleConnect = async () => {
    try {
      setConnecting(true);
      
      // Call the Instagram OAuth edge function to get auth URL
      const { data, error } = await supabase.functions.invoke('instagram-oauth', {
        body: { action: 'get_auth_url' }
      });

      if (error) throw error;
      
      if (data?.auth_url) {
        // Open Instagram OAuth in new window
        const popup = window.open(data.auth_url, 'instagram-oauth', 'width=600,height=600');
        
        // Listen for OAuth completion message from popup
        const handleMessage = async (event: MessageEvent) => {
          if (event.data.type === 'INSTAGRAM_AUTH_SUCCESS' && event.data.code) {
            // Clean up listener
            window.removeEventListener('message', handleMessage);
            
            // Exchange code for access token - use dynamic Supabase URL
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const { error: exchangeError } = await supabase.functions.invoke('instagram-oauth', {
              body: { 
                code: event.data.code,
                redirect_uri: `${supabaseUrl}/functions/v1/instagram-oauth`
              }
            });

            if (exchangeError) {
              throw exchangeError;
            }

            // Refresh connection data
            await fetchConnection();
            
            toast({
              title: 'Instagram Connected!',
              description: 'Your Instagram account has been successfully connected.',
            });
          }
        };

        window.addEventListener('message', handleMessage);

        // Clean up if popup is closed manually
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            setConnecting(false);
          }
        }, 1000);
      }
      
    } catch (err: any) {
      console.error('Error connecting Instagram:', err);
      toast({
        title: 'Connection Failed',
        description: err.message || 'Failed to connect Instagram account',
        variant: 'destructive',
      });
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!connection) return;
    
    try {
      const { error } = await supabase
        .from('instagram_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;
      
      setConnection(null);
      
      toast({
        title: 'Instagram Disconnected',
        description: 'Your Instagram account has been disconnected.',
      });
      
    } catch (err: any) {
      console.error('Error disconnecting Instagram:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to disconnect Instagram account',
        variant: 'destructive',
      });
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
            Instagram Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading Instagram settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!connection) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Connect your Instagram account to showcase your work and build trust with clients
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-3">
              <h4 className="font-medium">Benefits of connecting Instagram:</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Showcase your transformation results and training style</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Build trust with potential clients through visual proof</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Control when your handle is revealed to maintain privacy</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-green-600" />
                  <span>Select which posts to display on your trainer profile</span>
                </div>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center gap-2"
              >
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Instagram className="h-4 w-4" />
                )}
                {connecting ? 'Connecting...' : 'Connect Instagram Account'}
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => window.open('https://help.instagram.com/1533933820244654', '_blank')}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Instagram Business Account Help
              </Button>
            </div>
            
            <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
              <strong>Note:</strong> You'll need an Instagram Business or Creator account to connect. 
              Personal accounts are not supported by Instagram's API.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Integration
          </CardTitle>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-medium">Connected as @{connection.instagram_username}</span>
              <Badge variant="secondary">{connection.account_type}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Connected on {new Date(connection.created_at).toLocaleDateString()}
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDisconnect}
            >
              Disconnect Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Handle Reveal Settings */}
      <InstagramRevealSettings />

      {/* Media Selection */}
      <InstagramMediaPicker />
    </div>
  );
};