import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  MessageCircle, 
  Send, 
  Calendar, 
  Phone, 
  Video, 
  Paperclip, 
  Star,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search
} from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useShortlistedTrainers } from "@/hooks/useShortlistedTrainers";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface MessagesSectionProps {
  profile: any;
}

const messagePrompts = [
  "Hi! I'm interested in learning more about your training approach.",
  "Could you tell me about your packages and pricing?",
  "What does a typical training session look like with you?",
  "Do you offer nutritional guidance alongside training?",
  "I'm new to fitness - do you work with beginners?"
];

export function MessagesSection({ profile }: MessagesSectionProps) {
  const { user } = useAuth();
  const { conversations, loading, sendMessage, markAsRead, getUnreadCount } = useConversations();
  const { shortlistedTrainers, bookDiscoveryCall } = useShortlistedTrainers();
  
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = conversations.filter(conv =>
    conv.otherUser?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.otherUser?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    const result = await sendMessage(selectedConversation, newMessage);
    if (!result.error) {
      setNewMessage("");
    }
  };

  const handleScheduleCall = async (trainerId: string) => {
    const result = await bookDiscoveryCall(trainerId);
    if (!result.error) {
      // Call was scheduled successfully
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    markAsRead(conversationId);
  };

  // Auto-select first conversation if none selected
  useEffect(() => {
    if (!selectedConversation && conversations.length > 0) {
      setSelectedConversation(conversations[0].id);
    }
  }, [conversations, selectedConversation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Messages & Communication</h1>
        <p className="text-muted-foreground">
          Connect with trainers, schedule discovery calls, and manage your conversations
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5" />
                  Messages
                </CardTitle>
                <Badge variant="outline">
                  {filteredConversations.length} chats
                </Badge>
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 space-y-0">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation, index) => (
                  <div key={conversation.id}>
                    <div
                      className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        selectedConversation === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => handleSelectConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.otherUser?.profile_photo_url} />
                            <AvatarFallback>
                              {conversation.otherUser ? 
                                `${conversation.otherUser.first_name?.[0] || ''}${conversation.otherUser.last_name?.[0] || ''}` : 
                                'UN'
                              }
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">
                              {conversation.otherUser ? 
                                `${conversation.otherUser.first_name || ''} ${conversation.otherUser.last_name || ''}`.trim() : 
                                'Unknown User'
                              }
                            </h3>
                            <div className="flex items-center gap-1">
                              {getUnreadCount(conversation) > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  {getUnreadCount(conversation)}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.messages.length > 0 
                              ? conversation.messages[conversation.messages.length - 1].content
                              : 'No messages yet'
                            }
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {conversation.last_message_at ? 
                                format(new Date(conversation.last_message_at), 'MMM d, h:mm a') : 
                                format(new Date(conversation.created_at), 'MMM d, h:mm a')
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {index < filteredConversations.length - 1 && <Separator />}
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No conversations yet</h3>
                  <p className="text-muted-foreground text-sm">
                    Start connecting with trainers to begin conversations
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <Card className="h-full flex flex-col">
              {/* Chat Header */}
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConv.otherUser?.profile_photo_url} />
                      <AvatarFallback>
                        {selectedConv.otherUser ? 
                          `${selectedConv.otherUser.first_name?.[0] || ''}${selectedConv.otherUser.last_name?.[0] || ''}` : 
                          'UN'
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedConv.otherUser ? 
                          `${selectedConv.otherUser.first_name || ''} ${selectedConv.otherUser.last_name || ''}`.trim() : 
                          'Unknown User'
                        }
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        Usually replies within a few hours
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {/* Check if this trainer is shortlisted and has discovery call enabled */}
                    {(() => {
                      const isTrainer = selectedConv.trainer_id !== user?.id;
                      const shortlistedTrainer = shortlistedTrainers.find(st => 
                        st.trainer_id === (isTrainer ? selectedConv.trainer_id : selectedConv.client_id)
                      );
                      return shortlistedTrainer?.discovery_call_enabled && !shortlistedTrainer?.discovery_call_booked_at && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleScheduleCall(isTrainer ? selectedConv.trainer_id : selectedConv.client_id)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Call
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              </CardHeader>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConv.messages.length > 0 ? (
                    selectedConv.messages.map((message) => (
                      <div key={message.id} className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`rounded-lg p-3 max-w-[80%] ${
                          message.sender_id === user?.id 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-muted'
                        }`}>
                          <p className="text-sm">{message.content}</p>
                          <span className={`text-xs mt-1 block ${
                            message.sender_id === user?.id ? 'opacity-70' : 'text-muted-foreground'
                          }`}>
                            {message.sender_id === user?.id ? 'You' : selectedConv.otherUser ? 
                              `${selectedConv.otherUser.first_name || ''} ${selectedConv.otherUser.last_name || ''}`.trim() : 
                              'Unknown'
                            } • {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Message Prompts */}
              <div className="p-4 border-t space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Quick prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {messagePrompts.map((prompt, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setNewMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="h-full">
              <CardContent className="h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                    <p className="text-muted-foreground">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">Discovery Calls</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Book free 15-minute consultations
            </p>
            <Button size="sm" variant="outline">Schedule Call</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">Rate & Review</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Share your experience with trainers
            </p>
            <Button size="sm" variant="outline">Leave Review</Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">Follow Up</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Reminder to contact interested trainers
            </p>
            <Button size="sm" variant="outline">View Reminders</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}