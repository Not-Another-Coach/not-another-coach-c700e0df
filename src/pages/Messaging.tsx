import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useProfileByType } from '@/hooks/useProfileByType';
import { useRealTrainers } from '@/hooks/useRealTrainers';

export const Messaging = () => {
  const navigate = useNavigate();
  const { trainerId } = useParams<{ trainerId?: string }>();
  const { user } = useAuth();
  const { profile } = useProfileByType();
  const { trainers } = useRealTrainers();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);

  const trainer = trainerId ? trainers.find(t => t.id === trainerId) : null;

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    // For now, just add to local state - in a real app this would go to the database
    const newMessage = {
      id: Date.now(),
      content: message,
      sender: profile?.user_type === 'client' ? 'client' : 'trainer',
      timestamp: new Date().toISOString(),
      senderName: `${profile?.first_name} ${profile?.last_name}` || 'User'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
  };

  if (!trainerId || !trainer) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>

        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">No Conversation Selected</h2>
              <p className="text-muted-foreground">
                Select a trainer to start messaging.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium">
              {trainer.firstName?.[0]}{trainer.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{trainer.name}</h1>
            <p className="text-sm text-muted-foreground">Personal Trainer</p>
          </div>
        </div>

        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Online
        </Badge>
      </div>

      {/* Messages Container */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Conversation with {trainer.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 min-h-[300px] max-h-[400px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'client' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === 'client'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};