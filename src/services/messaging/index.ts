/**
 * Messaging Service
 * 
 * Handles messaging and communication between trainers and clients.
 */

import { supabase } from '@/integrations/supabase/client';
import { ServiceResponseHelper } from '../base/ServiceResponse';
import { ServiceError } from '../base/ServiceError';
import { BaseService } from '../base/BaseService';
import type { ServiceResponse } from '../types';
import type {
  Message,
  Conversation,
  ConversationWithParticipants,
  SendMessageRequest,
  MessageListParams,
  ConversationListParams,
} from './types';

class MessagingServiceClass extends BaseService {
  /**
   * Get all conversations for a user
   */
  static async getConversations(params: ConversationListParams): Promise<ServiceResponse<Conversation[]>> {
    return this.executeListQuery(async () => {
      const { user_id, limit = 50, offset = 0 } = params;

      // Get user type to determine which field to query
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', user_id)
        .single();

      const isTrainer = profile?.user_type === 'trainer';

      // Query conversations based on user type - simplified without joins
      let query = supabase
        .from('conversations')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false })
        .range(offset, offset + limit - 1);

      if (isTrainer) {
        query = query.eq('trainer_id', user_id);
      } else {
        query = query.eq('client_id', user_id);
      }

      return query;
    });
  }

  /**
   * Get messages for a conversation
   */
  static async getMessages(params: MessageListParams): Promise<ServiceResponse<Message[]>> {
    return this.executeListQuery(async () => {
      const { conversation_id, limit = 100, before } = params;

      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_at', { ascending: true });

      if (limit) {
        query = query.limit(limit);
      }

      if (before) {
        query = query.lt('created_at', before);
      }

      return query;
    });
  }

  /**
   * Send a message
   */
  static async sendMessage(request: SendMessageRequest): Promise<ServiceResponse<Message>> {
    return this.executeMutation(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      const { recipient_id, content, conversation_id } = request;
      let convId = conversation_id;

      // If no conversation_id provided, find or create conversation
      if (!convId) {
        // Get user type to determine conversation structure
        const { data: profile } = await supabase
          .from('profiles')
          .select('user_type')
          .eq('id', currentUserId.data)
          .single();

        const isTrainer = profile?.user_type === 'trainer';

        // Try to find existing conversation
        const { data: existingConv } = await supabase
          .from('conversations')
          .select('id')
          .eq(isTrainer ? 'trainer_id' : 'client_id', currentUserId.data)
          .eq(isTrainer ? 'client_id' : 'trainer_id', recipient_id)
          .maybeSingle();

        if (existingConv) {
          convId = existingConv.id;
        } else {
          // Create new conversation
          const { data: newConv, error: convError } = await supabase
            .from('conversations')
            .insert({
              client_id: isTrainer ? recipient_id : currentUserId.data,
              trainer_id: isTrainer ? currentUserId.data : recipient_id,
            })
            .select('id')
            .single();

          if (convError) throw convError;
          convId = newConv.id;
        }
      }

      // Insert message
      return supabase
        .from('messages')
        .insert({
          conversation_id: convId,
          sender_id: currentUserId.data,
          content,
          message_type: 'text',
        })
        .select('*')
        .single();
    });
  }

  /**
   * Mark messages as read in a conversation
   */
  static async markConversationAsRead(conversationId: string): Promise<ServiceResponse<void>> {
    return this.executeMutation(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      const userId = currentUserId.data;

      // Get user type
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type')
        .eq('id', userId)
        .single();

      const isTrainer = profile?.user_type === 'trainer';

      // Mark all unread messages as read
      await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .neq('sender_id', userId)
        .is('read_at', null);

      // Update conversation last read timestamp
      await supabase
        .from('conversations')
        .update({
          [isTrainer ? 'trainer_last_read_at' : 'client_last_read_at']: new Date().toISOString(),
        })
        .eq('id', conversationId);

      return { data: null, error: null };
    });
  }

  /**
   * Get unread message count for a conversation
   */
  static async getUnreadCount(conversationId: string): Promise<ServiceResponse<number>> {
    return this.executeQuery(async () => {
      const currentUserId = await this.getCurrentUserId();
      if (!currentUserId.success || !currentUserId.data) {
        throw ServiceError.unauthorized('User not authenticated');
      }

      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUserId.data)
        .is('read_at', null);

      return { data: count || 0, error: null };
    });
  }

  /**
   * Get discovery calls summary for a client
   */
  static async getDiscoveryCallsSummary(clientId: string): Promise<ServiceResponse<{
    scheduled: number;
    completed: number;
    cancelled: number;
    total: number;
  }>> {
    return this.executeQuery(async () => {
      const { data, error } = await supabase
        .from('discovery_calls')
        .select('id, status')
        .eq('client_id', clientId);

      if (error) throw error;

      const scheduled = data?.filter(call => call.status === 'scheduled').length || 0;
      const completed = data?.filter(call => call.status === 'completed').length || 0;
      const cancelled = data?.filter(call => call.status === 'cancelled').length || 0;

      return {
        data: {
          scheduled,
          completed,
          cancelled,
          total: data?.length || 0,
        },
        error: null,
      };
    });
  }
}

export const MessagingService = MessagingServiceClass;
export { MessagingServiceClass };
