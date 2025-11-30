import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserTypeChecks } from '@/hooks/useUserType';
import { queryConfig } from '@/lib/queryConfig';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  created_at: string;
  read_at: string | null;
  metadata: any;
}

export interface Conversation {
  id: string;
  client_id: string;
  trainer_id: string;
  created_at: string;
  updated_at: string;
  last_message_at: string | null;
  client_last_read_at: string | null;
  trainer_last_read_at: string | null;
  messages: Message[];
  otherUser?: {
    id: string;
    first_name: string;
    last_name: string;
    profile_photo_url?: string;
  };
}

/**
 * Pure data hook for fetching conversations using React Query
 * Only fetches data - no mutations or business logic
 */
export function useConversationsData() {
  const { user } = useAuth();
  const { isClient } = useUserTypeChecks();
  const queryClient = useQueryClient();

  const { data: conversations = [], isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Fetch conversations with messages
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select(`
          *,
          messages:messages(*)
        `)
        .order('updated_at', { ascending: false });

      if (conversationsError) throw conversationsError;

      // Fetch profile data for all users involved
      const userIds = new Set<string>();
      conversationsData?.forEach(conv => {
        userIds.add(conv.client_id);
        userIds.add(conv.trainer_id);
      });

      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, profile_photo_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Map conversations with profile data
      const conversationsWithProfiles = conversationsData?.map(conv => {
        const otherUserId = conv.client_id === user.id ? conv.trainer_id : conv.client_id;
        const otherUser = profiles?.find(p => p.id === otherUserId);
        
        return {
          ...conv,
          otherUser,
          messages: conv.messages?.sort((a: Message, b: Message) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          ) || []
        };
      }) || [];

      // Filter out conversations with declined trainers (for clients only)
      if (isClient()) {
        // Read from React Query cache instead of making a fresh API call
        const cachedEngagements = queryClient.getQueryData<any[]>(['client-engagements', user.id]);
        
        if (cachedEngagements) {
          const declinedTrainerIds = new Set(
            cachedEngagements
              .filter(e => e.stage === 'declined')
              .map(e => e.trainerId)
          );
          
          return conversationsWithProfiles.filter(conv => {
            const trainerId = conv.client_id === user.id ? conv.trainer_id : conv.client_id;
            return !declinedTrainerIds.has(trainerId);
          });
        }
      }

      return conversationsWithProfiles as Conversation[];
    },
    enabled: !!user?.id,
    staleTime: queryConfig.lists.staleTime,
    gcTime: queryConfig.lists.gcTime,
  });

  return {
    conversations,
    loading: isLoading,
    refetch,
  };
}
