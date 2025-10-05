import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Users, Heart, Lock, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useRealTrainers } from '@/hooks/useRealTrainers';
import { useConversations } from '@/hooks/useConversations';
import { useProfileByType } from '@/hooks/useProfileByType';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { ProfileAvatar } from '@/components/ui/profile-avatar';
import { useEngagementStage } from '@/hooks/useEngagementStage';
import { useContentVisibility } from '@/hooks/useContentVisibility';
import { VisibilityAwareName } from '@/components/ui/VisibilityAwareName';

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
  preSelectedTrainerId?: string | null; // New prop for pre-selecting a trainer
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

// Helper component to display trainer name with progressive visibility
const TrainerContactName = ({ contact }: { contact: any }) => {
  const { stage, isGuest } = useEngagementStage(contact.id);
  const { getVisibility } = useContentVisibility({
    engagementStage: stage || 'browsing',
    isGuest
  });

  const basicInfoVisibility = getVisibility('basic_information');
  const showLocation = basicInfoVisibility === 'visible';

  return (
    <>
      <VisibilityAwareName
        trainer={{
          id: contact.id,
          first_name: contact.firstName,
          last_name: contact.lastName,
          name: contact.name
        }}
        visibilityState={basicInfoVisibility}
        engagementStage={stage || 'browsing'}
        fallbackName={contact.name}
        className="font-medium text-sm"
      />
      {showLocation && contact.location && (
        <p className="text-xs text-muted-foreground">{contact.location}</p>
      )}
      {!showLocation && (
        <p className="text-xs text-muted-foreground">Available for chat</p>
      )}
    </>
  );
};

// Helper component for message prompt with visibility-aware name
const MessagePromptName = ({ contact }: { contact: any }) => {
  const { stage, isGuest } = useEngagementStage(contact.id);
  const { getVisibility } = useContentVisibility({
    engagementStage: stage || 'browsing',
    isGuest
  });

  const basicInfoVisibility = getVisibility('basic_information');

  return (
    <VisibilityAwareName
      trainer={{
        id: contact.id,
        first_name: contact.firstName,
        last_name: contact.lastName,
        name: contact.name
      }}
      visibilityState={basicInfoVisibility}
      engagementStage={stage || 'browsing'}
      fallbackName={contact.name}
      className="inline"
    />
  );
};

export const MessagingPopup = ({ isOpen, onClose, preSelectedTrainerId, selectedClient }: MessagingPopupProps) => {
  const { profile } = useProfileByType();
  const isTrainer = profile?.user_type === 'trainer';
  
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  // Clients can always message trainers, trainers need to wait for client first message
  const [canMessage, setCanMessage] = useState(!isTrainer);
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [unreadCounts, setUnreadCounts] = useState<{ [key: string]: number }>({});
  
  const { savedTrainers, savedTrainerIds } = useSavedTrainers();
  const { trainers } = useRealTrainers();
  const { conversations } = useConversations();
  
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
        setCanMessage(true);
        loadMessages(selectedClient.user_id);
      }
    } else if (preSelectedTrainerId && !isTrainer) {
      // For clients with a pre-selected trainer, go directly to chat
      setSelectedTrainerId(preSelectedTrainerId);
      setView('chat');
      setCanMessage(true); // Clients can always message trainers
      loadMessages(preSelectedTrainerId);
    }
  }, [selectedClient, preSelectedTrainerId, isTrainer]);

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

  // Auto-refresh messages when popup opens or trainer is selected
  useEffect(() => {
    if (selectedTrainerId && profile?.id) {
      loadMessages(selectedTrainerId);
    }
  }, [selectedTrainerId, profile?.id]);

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
          .from('v_clients')
          .select('id, first_name, last_name, training_location_preference, profile_photo_url')
          .in('id', clientIds);

        // Combine conversation data with profile data
        const contacts = conversations.map(conv => {
          const clientProfile = clientProfiles?.find(profile => profile.id === conv.client_id);
          
          // Better fallback name handling
          const clientName = (() => {
            if (clientProfile?.first_name && clientProfile?.last_name) {
              return `${clientProfile.first_name} ${clientProfile.last_name}`;
            }
            if (clientProfile?.first_name) {
              return clientProfile.first_name;
            }
            return 'Client (Name Not Set)';
          })();
          
          return {
            id: conv.client_id,
            name: clientName,
            firstName: clientProfile?.first_name,
            lastName: clientProfile?.last_name,
            location: clientProfile?.training_location_preference || 'Location not specified',
            profilePhotoUrl: clientProfile?.profile_photo_url,
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
    : (() => {
        // For clients, show conversations + pre-selected trainer if not in conversations
        const conversationContacts = conversations
          .filter(conv => conv.client_id === profile?.id)
          .map(conv => {
            // Better fallback name handling for trainers
            const trainerName = (() => {
              if (conv.otherUser?.first_name && conv.otherUser?.last_name) {
                return `${conv.otherUser.first_name} ${conv.otherUser.last_name}`;
              }
              if (conv.otherUser?.first_name) {
                return conv.otherUser.first_name;
              }
              return 'Trainer (Name Not Set)';
            })();
            
            return {
              id: conv.trainer_id,
              name: trainerName,
              firstName: conv.otherUser?.first_name,
              lastName: conv.otherUser?.last_name,
              location: 'Available for chat',
              profilePhotoUrl: conv.otherUser?.profile_photo_url,
              lastMessageAt: conv.last_message_at
            };
          });

        // If there's a pre-selected trainer not in conversations, add them
        if (preSelectedTrainerId && !conversationContacts.find(c => c.id === preSelectedTrainerId)) {
          const preSelectedTrainer = trainers.find(t => t.id === preSelectedTrainerId);
          if (preSelectedTrainer) {
            conversationContacts.unshift({
              id: preSelectedTrainer.id,
              name: preSelectedTrainer.name || `Trainer ${preSelectedTrainer.id.slice(0, 8)}`,
              firstName: preSelectedTrainer.firstName,
              lastName: preSelectedTrainer.lastName,
              location: 'Start new conversation',
              profilePhotoUrl: preSelectedTrainer.profilePhotoUrl,
              lastMessageAt: null
            });
          }
        }

        return conversationContacts;
      })();

  // Filter contacts based on search
  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    (contact.location && contact.location.toLowerCase().includes(searchFilter.toLowerCase()))
  );

  // Load unread counts for all contacts
  const loadUnreadCounts = async () => {
    if (!profile?.id) return;
    
    const counts: { [key: string]: number } = {};
    
    for (const contact of contacts) {
      try {
        const { data: conversation } = await supabase
          .from('conversations')
          .select('id')
          .eq(isTrainer ? 'trainer_id' : 'client_id', profile.id)
          .eq(isTrainer ? 'client_id' : 'trainer_id', contact.id)
          .maybeSingle();

        if (conversation) {
          // Get unread messages count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .neq('sender_id', profile.id)
            .is('read_at', null);
          
          counts[contact.id] = count || 0;
        } else {
          counts[contact.id] = 0;
        }
      } catch (error) {
        console.error('Error loading unread count for contact:', contact.id, error);
        counts[contact.id] = 0;
      }
    }
    
    setUnreadCounts(counts);
  };

  // Mark messages as read when viewing conversation
  const markMessagesAsRead = async (contactId: string) => {
    if (!profile?.id) return;
    
    try {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('id')
        .eq(isTrainer ? 'trainer_id' : 'client_id', profile.id)
        .eq(isTrainer ? 'client_id' : 'trainer_id', contactId)
        .maybeSingle();

      if (conversation) {
        // Mark messages as read
        await supabase
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .eq('conversation_id', conversation.id)
          .neq('sender_id', profile.id)
          .is('read_at', null);

        // Update conversation read timestamp
        await supabase
          .from('conversations')
          .update({
            [isTrainer ? 'trainer_last_read_at' : 'client_last_read_at']: new Date().toISOString()
          })
          .eq('id', conversation.id);

        // Update local unread counts
        setUnreadCounts(prev => ({ ...prev, [contactId]: 0 }));
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  // Load unread counts when contacts change
  useEffect(() => {
    if (profile?.id && contacts.length > 0) {
      loadUnreadCounts();
    }
  }, [profile?.id, contacts.length]);

  // Mark messages as read when viewing a conversation
  useEffect(() => {
    if (selectedTrainerId && profile?.id && view === 'chat') {
      markMessagesAsRead(selectedTrainerId);
    }
  }, [selectedTrainerId, profile?.id, view]);

  // Handle the selected contact - either from trainer list or selectedClient
  const selectedContact = selectedClient 
    ? (() => {
        // Better fallback name for selected client
        const clientName = (() => {
          const profile = selectedClient.client_profile;
          if (profile?.first_name && profile?.last_name) {
            return `${profile.first_name} ${profile.last_name}`;
          }
          if (profile?.first_name) {
            return profile.first_name;
          }
          return 'Client (Name Not Set)';
        })();
        
        return {
          id: selectedClient.user_id,
          name: clientName,
          firstName: selectedClient.client_profile?.first_name,
          lastName: selectedClient.client_profile?.last_name,
          location: selectedClient.client_profile?.training_location_preference || 'Location not specified'
        };
      })()
    : selectedTrainerId 
      ? (isTrainer 
          ? trainerContacts.find(c => c.id === selectedTrainerId)
          : trainers.find(t => t.id === selectedTrainerId)
        )
      : null;

  const handleSelectTrainer = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setView('chat');
    // Clients can always message, trainers need to check if client messaged first
    if (!isTrainer) {
      setCanMessage(true);
    } else {
      checkIfClientMessagedFirst(trainerId);
    }
    loadMessages(trainerId);
  };

  // Load messages for the selected conversation
  const loadMessages = async (clientId: string) => {
    if (!profile?.id) return;
    
    try {
      console.log('🔍 Loading messages for:', clientId, 'as', isTrainer ? 'trainer' : 'client');
      
      // Get the conversation
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .select('id')
        .eq(isTrainer ? 'trainer_id' : 'client_id', profile.id)
        .eq(isTrainer ? 'client_id' : 'trainer_id', clientId)
        .maybeSingle();

      if (convError) {
        console.error('Error loading conversation:', convError);
        setMessages([]);
        return;
      }

      if (!conversation) {
        console.log('📝 No conversation found between users');
        setMessages([]);
        return;
      }

      console.log('✅ Found conversation:', conversation.id);

      // Get messages for this conversation
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (msgError) {
        console.error('Error loading messages:', msgError);
        setMessages([]);
        return;
      }

      if (messagesData) {
        console.log('📨 Loaded messages:', messagesData.length);
        const formattedMessages: Message[] = messagesData.map(msg => ({
          id: msg.id,
          content: msg.content,
          sender: msg.sender_id === profile.id ? 'user' : 'trainer',
          timestamp: new Date(msg.created_at),
          trainerId: clientId
        }));
        setMessages(formattedMessages);
      } else {
        setMessages([]);
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
        console.error('Message error details:', messageError?.message, messageError?.details);
        alert(`Failed to send message: ${messageError?.message || 'Unknown error'}`);
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
      
      console.log('✅ Message sent successfully:', savedMessage.content);

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
    // Reset canMessage for next selection
    if (!isTrainer) {
      setCanMessage(true);
    }
  };

  if (!isOpen) return null;

  console.log('[MessagingPopup] Render state:', { 
    isTrainer, 
    canMessage, 
    view, 
    selectedTrainerId,
    hasProfile: !!profile,
    profileUserType: profile?.user_type
  });


  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <Card className="w-80 h-96 shadow-2xl border-2 border-primary/20 bg-background">
        <CardHeader className="pb-3 bg-primary text-primary-foreground">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Messages
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

        <CardContent className="p-0 h-[320px] md:h-[400px] flex flex-col">
          {view === 'list' ? (
            // Trainer List View
            <div className="flex-1 flex flex-col min-h-0">
              <div className="p-4 border-b bg-muted/30 space-y-3 flex-shrink-0">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {isTrainer ? (
                    <>
                      <Users className="w-4 h-4" />
                      <span>Your Clients & Prospects</span>
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      <span>Active Conversations</span>
                    </>
                  )}
                  <Badge variant="secondary" className="ml-auto">
                    {contacts.length}
                  </Badge>
                </div>
                
                {/* Search Filter */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search contacts..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1 min-h-0">
                {filteredContacts.length > 0 ? (
                  <div className="p-2">
                    {filteredContacts.map((contact) => (
                      <Button
                        key={contact.id}
                        variant="ghost"
                        className="w-full justify-start h-auto p-3 mb-2 hover:bg-muted/50"
                        onClick={() => handleSelectTrainer(contact.id)}
                      >
                         <div className="flex items-center gap-3 w-full">
                           <ProfileAvatar
                             profilePhotoUrl={contact.profilePhotoUrl}
                             firstName={contact.firstName}
                             lastName={contact.lastName}
                             size="md"
                           />
                          <div className="flex-1 text-left">
                            {!isTrainer && contact.id && !selectedClient ? (
                              <TrainerContactName contact={contact} />
                            ) : (
                              <>
                                <p className="font-medium text-sm">{contact.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {contact.location || 'Available for chat'}
                                </p>
                              </>
                            )}
                          </div>
                           <div className="flex-shrink-0 flex items-center gap-2">
                             {unreadCounts[contact.id] > 0 && (
                               <Badge variant="destructive" className="text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full">
                                 {unreadCounts[contact.id]}
                               </Badge>
                             )}
                             <Badge variant="outline" className="text-xs">
                               Message
                             </Badge>
                           </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full p-8">
                    <div className="text-center text-muted-foreground">
                      {searchFilter ? (
                        <>
                          <Search className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">No contacts found matching "{searchFilter}"</p>
                        </>
                      ) : (
                        <>
                          <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p className="text-sm">
                            {isTrainer ? 'No clients or prospects yet' : 'No conversations yet'}
                          </p>
                          <p className="text-xs mt-1">
                            {isTrainer
                              ? 'Start receiving client inquiries to begin conversations'
                              : 'Save trainers and start messaging them'}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </ScrollArea>
            </div>
          ) : (
            // Chat View - Mobile optimized
            <div className="flex-1 flex flex-col min-h-0">
              {selectedContact && (
                  <div className="p-3 border-b bg-muted/30 flex-shrink-0">
                   <div className="flex items-center gap-2">
                     <ProfileAvatar
                       profilePhotoUrl={selectedContact.profilePhotoUrl}
                       firstName={selectedContact.firstName}
                       lastName={selectedContact.lastName}
                       size="sm"
                     />
                     <div className="flex-1">
                       {!isTrainer && selectedContact && (selectedContact as any).id && !selectedClient ? (
                         <TrainerContactName contact={selectedContact} />
                       ) : (
                         <>
                           <p className="font-medium text-sm">{selectedContact.name}</p>
                           <p className="text-xs text-muted-foreground">{selectedContact.location}</p>
                         </>
                       )}
                     </div>
                  </div>
                </div>
              )}

              <ScrollArea className="flex-1 p-3 min-h-0">
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
                    {!isTrainer && selectedContact && (selectedContact as any).id ? (
                      <div className="text-xs mt-1">
                        Send a message to <MessagePromptName contact={selectedContact} />
                      </div>
                    ) : (
                      <p className="text-xs mt-1">Send a message to {selectedContact?.name}</p>
                    )}
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

              {/* Message Input - Clients can always message, trainers need client first message */}
              {(!isTrainer || canMessage) && (
                <div className="p-3 border-t bg-background flex-shrink-0">
                  <div className="flex gap-2 items-end">
                    <Input
                      placeholder="Type your message..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      className="flex-1 text-sm min-h-[40px]"
                      autoComplete="off"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sending}
                      className="h-[40px] px-3 flex-shrink-0"
                      type="button"
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