import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface InstagramConnection {
  id: string;
  instagram_username: string;
  account_type: string;
  is_active: boolean;
  reveal_handle_post_discovery: boolean;
}

export const useInstagramConnection = () => {
  const [connection, setConnection] = useState<InstagramConnection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchConnection();
  }, []);

  return { 
    connection, 
    loading, 
    error, 
    refetch: fetchConnection,
    isConnected: !!connection 
  };
};