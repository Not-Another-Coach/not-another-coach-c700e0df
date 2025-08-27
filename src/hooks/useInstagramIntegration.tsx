import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface InstagramConnection {
  id: string;
  instagram_username: string;
  account_type: string;
  is_active: boolean;
  reveal_handle_post_discovery: boolean;
}

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

interface SelectedMedia {
  id: string;
  instagram_media_id: string;
  media_url: string;
  thumbnail_url?: string;
  media_type: string;
  caption?: string;
  permalink: string;
  display_order: number;
  is_active: boolean;
}

export function useInstagramIntegration() {
  const { user } = useAuth();
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Instagram connection
  const fetchConnection = async () => {
    if (!user) return;
    
    try {
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
      setError(err.message);
    }
  };

  // Fetch selected media for trainer
  const fetchSelectedMedia = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('instagram_selected_media')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      setSelectedMedia(data || []);
    } catch (err: any) {
      console.error('Error fetching selected media:', err);
    }
  };

  // Generate Instagram OAuth URL
  const getInstagramAuthUrl = (redirectUri: string) => {
    const appId = '745397898360709'; // Your Instagram App ID
    const scope = 'user_profile,user_media';
    
    const params = new URLSearchParams({
      client_id: appId,
      redirect_uri: redirectUri,
      scope: scope,
      response_type: 'code'
    });
    
    return `https://api.instagram.com/oauth/authorize?${params.toString()}`;
  };

  // Handle OAuth callback
  const handleOAuthCallback = async (code: string, redirectUri: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('instagram-oauth', {
        body: { code, redirect_uri: redirectUri }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchConnection();
      return data.connection;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to connect Instagram account');
    }
  };

  // Fetch media from Instagram
  const fetchInstagramMedia = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('instagram-media');
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      return data.media || [];
    } catch (err: any) {
      throw new Error(err.message || 'Failed to fetch Instagram media');
    }
  };

  // Refresh Instagram access token
  const refreshAccessToken = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('instagram-refresh-token');
      
      if (error) throw error;
      if (data.error) throw new Error(data.error);

      await fetchConnection();
      return true;
    } catch (err: any) {
      throw new Error(err.message || 'Failed to refresh Instagram token');
    }
  };

  // Disconnect Instagram account
  const disconnectInstagram = async () => {
    if (!connection) return;
    
    try {
      const { error } = await supabase
        .from('instagram_connections')
        .update({ is_active: false })
        .eq('id', connection.id);

      if (error) throw error;

      // Also deactivate selected media
      await supabase
        .from('instagram_selected_media')
        .update({ is_active: false })
        .eq('trainer_id', user?.id);

      setConnection(null);
      setSelectedMedia([]);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to disconnect Instagram account');
    }
  };

  // Check if handle is revealed to specific client
  const checkHandleRevealed = async (clientId: string) => {
    if (!user) return false;
    
    try {
      const { data, error } = await supabase
        .from('instagram_handle_revelations')
        .select('id')
        .eq('trainer_id', user.id)
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (err: any) {
      console.error('Error checking handle revelation:', err);
      return false;
    }
  };

  // Get revealed handles for current user
  const getRevealedHandles = async () => {
    if (!user) return [];
    
    try {
      const { data, error } = await supabase
        .from('instagram_handle_revelations')
        .select(`
          id,
          trainer_id,
          client_id,
          discovery_call_id,
          revealed_at,
          connection:instagram_connections(
            instagram_username,
            account_type
          ),
          trainer_profile:profiles!trainer_id(
            first_name,
            last_name
          )
        `)
        .or(`client_id.eq.${user.id},trainer_id.eq.${user.id}`)
        .order('revealed_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error('Error fetching revealed handles:', err);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        await Promise.all([fetchConnection(), fetchSelectedMedia()]);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  return {
    // State
    connection,
    selectedMedia,
    loading,
    error,
    
    // Connection methods
    getInstagramAuthUrl,
    handleOAuthCallback,
    disconnectInstagram,
    refreshAccessToken,
    
    // Media methods
    fetchInstagramMedia,
    fetchSelectedMedia,
    
    // Revelation methods
    checkHandleRevealed,
    getRevealedHandles,
    
    // Refresh methods
    refetch: () => {
      fetchConnection();
      fetchSelectedMedia();
    }
  };
}