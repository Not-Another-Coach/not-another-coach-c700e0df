import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MessageComposerProps {
  message: string;
  setMessage: (message: string) => void;
  clickedElements: string[];
  onClearElements: () => void;
  onRemoveElement: (index: number) => void;
}

export const MessageComposer: React.FC<MessageComposerProps> = ({
  message,
  setMessage,
  clickedElements,
  onClearElements,
  onRemoveElement
}) => {
  const { toast } = useToast();

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast({
        title: "Copied to clipboard",
        description: "Message has been copied to your clipboard",
      });
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy message to clipboard",
        variant: "destructive",
      });
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      toast({
        title: "Message ready",
        description: "Your message has been composed. You can now copy it or send it to your AI assistant.",
      });
    } else {
      toast({
        title: "Empty message",
        description: "Please add some content to your message first.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="sticky bottom-4 bg-background border-2 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <CardTitle className="text-lg">Message Composer</CardTitle>
          </div>
          {clickedElements.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearElements}
              className="h-8 px-2"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <CardDescription>
          Click on any documentation element to add it to your message. 
          Use this to ask questions about specific pages, hooks, tables, or features.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {clickedElements.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Selected Elements ({clickedElements.length})</h4>
            <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
              {clickedElements.map((element, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground transition-colors text-xs"
                  onClick={() => onRemoveElement(index)}
                >
                  {element}
                  <span className="ml-1 text-xs opacity-70">×</span>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <div>
          <Textarea
            placeholder="Type your message here... You can also click on documentation elements above to add them to your message."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="min-h-[100px] resize-none"
          />
        </div>
        
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleCopyMessage}
            disabled={!message.trim()}
            size="sm"
          >
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim()}
            size="sm"
          >
            <Send className="h-4 w-4 mr-1" />
            Ready to Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};