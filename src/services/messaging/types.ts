/**
 * Messaging Types
 */

export type MessageStatus = 'sent' | 'delivered' | 'read';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  status: MessageStatus;
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: string;
  client_id: string;
  trainer_id: string;
  last_message?: Message;
  last_message_at?: string;
  unread_count: number;
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
  client: ConversationParticipant;
  trainer: ConversationParticipant;
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
