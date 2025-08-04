import React, { useState, useEffect } from 'react';
import { MessageCircle, X, Send, Users, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { useTrainerList } from '@/hooks/useTrainerList';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';

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
}

export const MessagingPopup = ({ isOpen, onClose }: MessagingPopupProps) => {
  const [selectedTrainerId, setSelectedTrainerId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [view, setView] = useState<'list' | 'chat'>('list');
  
  const { profile } = useProfile();
  const { savedTrainers, savedTrainerIds } = useSavedTrainers();
  const { trainers } = useTrainerList();

  const isTrainer = profile?.user_type === 'trainer';
  
  // Get contacts based on user type
  const contacts = isTrainer 
    ? [] // For now, trainers see empty list - in real app would show clients who messaged them
    : trainers.filter(trainer => savedTrainerIds.includes(trainer.id)); // Clients see shortlisted trainers

  const selectedContact = selectedTrainerId 
    ? trainers.find(t => t.id === selectedTrainerId)
    : null;

  const handleSelectTrainer = (trainerId: string) => {
    setSelectedTrainerId(trainerId);
    setView('chat');
    // Load existing messages for this trainer (in real app, from database)
    setMessages([]);
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedTrainerId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: message.trim(),
      sender: 'user',
      timestamp: new Date(),
      trainerId: selectedTrainerId
    };

    setMessages(prev => [...prev, newMessage]);
    setMessage('');

    // In a real app, this would save to database and send to trainer
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
                {messages.length === 0 ? (
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

              <div className="p-3 border-t">
                <div className="flex gap-2">
                  <Input
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};