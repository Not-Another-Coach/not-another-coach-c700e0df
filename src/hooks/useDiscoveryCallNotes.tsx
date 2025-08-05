import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface DiscoveryCallNote {
  id: string;
  trainer_id: string;
  client_id: string;
  note_content: string | null;
  discovery_call_id: string | null;
  created_at: string;
  updated_at: string;
}

export function useDiscoveryCallNotes(clientId: string) {
  const { user } = useAuth();
  const [note, setNote] = useState<DiscoveryCallNote | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchNote = useCallback(async () => {
    if (!user || !clientId) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discovery_call_notes')
        .select('*')
        .eq('trainer_id', user.id)
        .eq('client_id', clientId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching note:', error);
      } else {
        setNote(data);
      }
    } catch (error) {
      console.error('Error in fetchNote:', error);
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  const saveNote = useCallback(async (content: string) => {
    if (!user || !clientId) return;

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('discovery_call_notes')
        .upsert({
          trainer_id: user.id,
          client_id: clientId,
          note_content: content || null,
        }, {
          onConflict: 'trainer_id,client_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving note:', error);
      } else {
        setNote(data);
      }
    } catch (error) {
      console.error('Error in saveNote:', error);
    } finally {
      setSaving(false);
    }
  }, [user, clientId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  return {
    note,
    loading,
    saving,
    saveNote,
    refetch: fetchNote
  };
}