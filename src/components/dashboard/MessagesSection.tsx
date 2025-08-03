import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";

interface MessagesSectionProps {
  profile: any;
}

// Mock message data
const mockConversations = [
  {
    id: "1",
    trainer: {
      id: "1",
      name: "Sarah Johnson",
      image: trainerSarah,
      specialties: ["Weight Loss", "Strength Training"],
      status: "online"
    },
    lastMessage: "I'd love to discuss your goals in more detail. When would be a good time for a discovery call?",
    timestamp: "2 hours ago",
    unread: 2,
    hasDiscoveryCall: true,
    callScheduled: true,
    callDate: "Tomorrow at 2:00 PM"
  },
  {
    id: "2",
    trainer: {
      id: "2",
      name: "Mike Rodriguez",
      image: trainerMike,
      specialties: ["Muscle Building", "Powerlifting"],
      status: "away",
      lastSeen: "Usually replies within 4 hours"
    },
    lastMessage: "Thanks for your interest! I have some great programs that would suit your goals.",
    timestamp: "1 day ago",
    unread: 0,
    hasDiscoveryCall: false,
    callScheduled: false
  }
];

const messagePrompts = [
  "Hi! I'm interested in learning more about your training approach.",
  "Could you tell me about your packages and pricing?",
  "What does a typical training session look like with you?",
  "Do you offer nutritional guidance alongside training?",
  "I'm new to fitness - do you work with beginners?"
];

export function MessagesSection({ profile }: MessagesSectionProps) {
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredConversations = mockConversations.filter(conv =>
    conv.trainer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConv = mockConversations.find(conv => conv.id === selectedConversation);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    console.log("Sending message:", newMessage);
    setNewMessage("");
  };

  const handleScheduleCall = (trainerId: string) => {
    console.log("Scheduling call with trainer:", trainerId);
  };

  const handleRateDiscoveryCall = (trainerId: string) => {
    console.log("Rating discovery call with trainer:", trainerId);
  };

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
                      onClick={() => setSelectedConversation(conversation.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={conversation.trainer.image} />
                            <AvatarFallback>
                              {conversation.trainer.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.trainer.status === 'online' && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="font-medium truncate">{conversation.trainer.name}</h3>
                            <div className="flex items-center gap-1">
                              {conversation.unread > 0 && (
                                <Badge className="bg-primary text-primary-foreground text-xs">
                                  {conversation.unread}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {conversation.lastMessage}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {conversation.timestamp}
                            </span>
                            {conversation.callScheduled && (
                              <Badge variant="outline" className="text-xs">
                                Call scheduled
                              </Badge>
                            )}
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
                      <AvatarImage src={selectedConv.trainer.image} />
                      <AvatarFallback>
                        {selectedConv.trainer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">{selectedConv.trainer.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${
                          selectedConv.trainer.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                        }`} />
                        {selectedConv.trainer.status === 'online' ? 'Online' : selectedConv.trainer.lastSeen}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {selectedConv.hasDiscoveryCall && !selectedConv.callScheduled && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleScheduleCall(selectedConv.trainer.id)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Call
                      </Button>
                    )}
                    {selectedConv.callScheduled && (
                      <Button variant="outline" size="sm">
                        <Video className="h-4 w-4 mr-2" />
                        Join Call
                      </Button>
                    )}
                  </div>
                </div>

                {/* Discovery Call Status */}
                {selectedConv.callScheduled && (
                  <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 mt-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-medium text-primary">Discovery Call Scheduled</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {selectedConv.callDate}
                    </p>
                  </div>
                )}
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 p-4 space-y-4 overflow-y-auto">
                {/* Example messages */}
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">Hi! I'm interested in learning more about your training approach for weight loss.</p>
                      <span className="text-xs opacity-70 mt-1 block">You • 2 hours ago</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                      <p className="text-sm">{selectedConv.lastMessage}</p>
                      <span className="text-xs text-muted-foreground mt-1 block">{selectedConv.trainer.name} • {selectedConv.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Message Prompts */}
                <div className="space-y-2">
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
              </CardContent>

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