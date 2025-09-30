/**
 * Messaging Types
 */

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: string;
  metadata?: any;
  created_at: string;
  read_at?: string | null;
}

export interface Conversation {
  id: string;
  client_id: string;
  trainer_id: string;
  last_message_at?: string | null;
  client_last_read_at?: string | null;
  trainer_last_read_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface SendMessageRequest {
  recipient_id: string;
  content: string;
  conversation_id?: string;
}

export interface ConversationParticipant {
  id: string;
  first_name: string;
  last_name: string;
  profile_photo_url?: string;
  user_type: 'client' | 'trainer';
}

export interface ConversationWithParticipants extends Conversation {
  client?: ConversationParticipant;
  trainer?: ConversationParticipant;
}

export interface MessageListParams {
  conversation_id: string;
  limit?: number;
  before?: string; // Message ID for pagination
}

export interface ConversationListParams {
  user_id: string;
  limit?: number;
  offset?: number;
}
