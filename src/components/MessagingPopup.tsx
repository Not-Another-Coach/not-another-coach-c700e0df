import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Users, Heart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useTrainerList } from '@/hooks/useTrainerList';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'trainer';
  timestamp: Date;
  trainerId?: string;
}

interface MessagingPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedClient?: {
    id: string;
    user_id: string;
    client_profile?: {
      first_name?: string;
      last_name?: string;
      primary_goals?: string[];
      training_location_preference?: string;
    };
  } | null;
}

export const MessagingPopup = ({ isOpen, onClose, selectedClient }: MessagingPopupProps) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [canMessage, setCanMessage] = useState(true);
  const [sending, setSending] = useState(false);
  
  const { profile } = useProfile();
  const { savedTrainers, savedTrainerIds } = useSavedTrainers();
  const { trainers } = useTrainerList();

  const isTrainer = profile?.user_type === 'trainer';
  
  // If trainer provided a selectedClient, start directly in chat mode
  const initialView = selectedClient ? 'chat' : 'list';
  const [view, setView] = useState<'list' | 'chat'>(initialView);
  
  // Set the selected trainer/client based on provided data
  useEffect(() => {
    if (selectedClient) {
      setSelectedTrainerId(selectedClient.user_id);
      setView('chat');
      // For trainers messaging clients, check if client has messaged first and load messages
      if (isTrainer) {
        checkIfClientMessagedFirst(selectedClient.user_id);
        loadMessages(selectedClient.user_id);
      } else {
        loadMessages(selectedClient.user_id);
      }
    }
  }, [selectedClient, isTrainer]);

  // Check if client has sent the first message (for trainer-client conversations)
  const checkIfClientMessagedFirst = async (clientId: string) => {
    if (!profile?.id || !isTrainer) return;
    
    try {
      // Check if there's a conversation between trainer and client
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq('trainer_id', profile.id)
        .eq('client_id', clientId)
        .single();

      if (!conversation) {
        setCanMessage(false);
        return;
      }

      // Check if client has sent any messages in this conversation
      const { data: clientMessages } = await supabase
        .from('messages')
        .select('id')
        .eq('conversation_id', conversation.id)
        .eq('sender_id', clientId)
        .limit(1);

      setCanMessage(clientMessages && clientMessages.length > 0);
    } catch (error) {
      console.error('Error checking conversation:', error);
      setCanMessage(false);
    }
  };
  
  // Get contacts based on user type
  const [trainerContacts, setTrainerContacts] = useState<any[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  // Load conversations for trainers
  useEffect(() => {
    if (isTrainer && profile?.id && !selectedClient) {
      loadTrainerConversations();
    }
  }, [isTrainer, profile?.id, selectedClient]);

  const loadTrainerConversations = async () => {
    if (!profile?.id) return;
    setLoadingContacts(true);
    
    try {
      // Get conversations where trainer is involved and client has sent messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id, client_id, last_message_at')
        .eq('trainer_id', profile.id)
        .not('last_message_at', 'is', null)
        .order('last_message_at', { ascending: false });

      if (conversations && conversations.length > 0) {
        // Get client profiles separately
        const clientIds = conversations.map(conv => conv.client_id);
        const { data: clientProfiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, training_location_preference')
          .in('id', clientIds);

        // Combine conversation data with profile data
        const contacts = conversations.map(conv => {
          const clientProfile = clientProfiles?.find(profile => profile.id === conv.client_id);
          return {
            id: conv.client_id,
            name: clientProfile?.first_name && clientProfile?.last_name
              ? `${clientProfile.first_name} ${clientProfile.last_name}`
              : `Client ${conv.client_id.slice(0, 8)}`,
            firstName: clientProfile?.first_name,
            lastName: clientProfile?.last_name,
            location: clientProfile?.training_location_preference || 'Location not specified',
            lastMessageAt: conv.last_message_at
          };
        });
        setTrainerContacts(contacts);
      }
    } catch (error) {
      console.error('Error loading trainer conversations:', error);
    } finally {
      setLoadingContacts(false);
    }
  };

  const contacts = isTrainer 
    ? trainerContacts
    : trainers.filter(trainer => savedTrainerIds.includes(trainer.id)); // Clients see shortlisted trainers

  // Handle the selected contact - either from trainer list or selectedClient
  const selectedContact = selectedClient 
    ? {
        id: selectedClient.user_id,
        name: selectedClient.client_profile?.first_name && selectedClient.client_profile?.last_name 
          ? `${selectedClient.client_profile.first_name} ${selectedClient.client_profile.last_name}`
          : `Client ${selectedClient.user_id.slice(0, 8)}`,
        firstName: selectedClient.client_profile?.first_name,
        lastName: selectedClient.client_profile?.last_name,
        location: selectedClient.client_profile?.training_location_preference || 'Location not specified'
      }
    : selectedTrainerId 
      ? (isTrainer 
          ? trainerContacts.find(c => c.id === selectedTrainerId)
          : trainers.find(t => t.id === selectedTrainerId)
        )
      : null;

  const handleSelectTrainer = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setView('chat');
    loadMessages(trainerId);
  };

  // Load messages for the selected conversation
  const loadMessages = async (clientId: string) => {
    if (!profile?.id) return;
    
    try {
      // Get the conversation
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq(isTrainer ? 'trainer_id' : 'client_id', profile.id)
        .eq(isTrainer ? 'client_id' : 'trainer_id', clientId)
        .maybeSingle();

      if (!conversation) {
        setMessages([]);
        return;
      }

      // Get messages for this conversation
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (messagesData) {
        const formattedMessages: Message[] = messagesData.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender_id === profile.id ? 'user' : 'trainer',
          timestamp: new Date(msg.created_at),
          trainerId: clientId
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTrainerId || !profile?.id || sending) return;

    setSending(true);
    const currentMessage = message.trim();
    
    try {
      // Find or create conversation
      let conversationId: string;
      
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .eq(isTrainer ? 'trainer_id' : 'client_id', profile.id)
        .eq(isTrainer ? 'client_id' : 'trainer_id', selectedTrainerId)
        .maybeSingle();

      if (existingConversation) {
        conversationId = existingConversation.id;
      } else {
        // Create new conversation
        const { data: newConversation, error } = await supabase
          .from('conversations')
          .insert({
            client_id: isTrainer ? selectedTrainerId : profile.id,
            trainer_id: isTrainer ? profile.id : selectedTrainerId
          })
          .select('id')
          .single();

        if (error || !newConversation) {
          console.error('Error creating conversation:', error);
          alert('Failed to create conversation. Make sure you have shortlisted this trainer.');
          return;
        }
        conversationId = newConversation.id;
      }

      // Save message to database
      const { data: savedMessage, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: profile.id,
          content: message.trim(),
          message_type: 'text'
        })
        .select('*')
        .single();

      if (messageError || !savedMessage) {
        console.error('Error saving message:', messageError);
        return;
      }

      // Add message to local state
      const newMessage: Message = {
        id: savedMessage.id,
        content: savedMessage.content,
        sender: 'user',
        timestamp: new Date(savedMessage.created_at),
        trainerId: selectedTrainerId
      };

      setMessages(prev => [...prev, newMessage]);
      setMessage('');

      // If this is the first message from client to trainer, refresh trainer's contact list
      if (!isTrainer && !existingConversation) {
        // This will help trainers see the new conversation
      }

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleBackToList = () => {
    setView('list');
    setSelectedTrainerId(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 h-96 shadow-2xl border-2 border-primary/20 bg-background">
        <CardHeader className="pb-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {view === 'chat' && selectedContact ? selectedContact.name : 'Messages'}
            </CardTitle>
            <div className="flex items-center gap-2">
              {view === 'chat' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToList}
                  className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
                >
                  ←
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-primary-foreground hover:bg-primary-foreground/20 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 h-[320px] flex flex-col">
          {view === 'list' ? (
            // Trainer List View
            <div className="flex-1">
              <div className="p-4 border-b bg-muted/30">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isTrainer ? (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Your Clients & Prospects</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Your Shortlisted Trainers</span>
                    </>
                  )}
                  <Badge variant="secondary" className="ml-auto">
                    {contacts.length}
                  </Badge>
                </div>
              </div>

              <ScrollArea className="flex-1">
                {contacts.length > 0 ? (
                  <div className="p-2">
                    {contacts.map((contact) => (
                      <Button
                        key={contact.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 mb-2 hover:bg-muted/50"
                        onClick={() => handleSelectTrainer(contact.id)}
                      >
                        <div className="flex items-center gap-3 w-full">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium">
                              {contact.firstName?.[0]}{contact.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 text-left">
                            <p className="font-medium text-sm">{contact.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {contact.location || 'Available for chat'}
                            </p>
                          </div>
                          <div className="flex-shrink-0">
                            <Badge variant="outline" className="text-xs">
                              Message
                            </Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <Users className="w-12 h-12 text-muted-foreground/50 mb-2" />
                    <p className="text-sm font-medium text-muted-foreground">
                      {isTrainer ? 'No client conversations' : 'No shortlisted trainers'}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isTrainer 
                        ? 'When clients message you, they\'ll appear here'
                        : 'Like trainers to add them to your shortlist and start messaging'
                      }
                    </p>
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            // Chat View
            <div className="flex-1 flex flex-col">
              {selectedContact && (
                <div className="p-3 border-b bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-medium">
                        {selectedContact.firstName?.[0]}{selectedContact.lastName?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{selectedContact.name}</p>
                      <p className="text-xs text-muted-foreground">{selectedContact.location}</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Online
                    </Badge>
                  </div>
                </div>
              )}

              <ScrollArea className="flex-1 p-3">
                {!canMessage && isTrainer ? (
                  <div className="text-center text-muted-foreground py-8">
                    <Lock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Client must message first</p>
                    <p className="text-xs mt-1">
                      This client needs to initiate the conversation before you can reply
                    </p>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start the conversation!</p>
                    <p className="text-xs mt-1">Send a message to {selectedContact?.name}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender === 'user' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-2 text-sm",
                            msg.sender === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {canMessage && (
                <div className="p-3 border-t">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 text-sm"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sending}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};