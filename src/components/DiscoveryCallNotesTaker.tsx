import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Save, Check, StickyNote, ChevronDown, ChevronUp } from 'lucide-react';
import { useDiscoveryCallNotes } from '@/hooks/useDiscoveryCallNotes';
import { useProfile } from '@/hooks/useProfile';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface DiscoveryCallNotesTakerProps {
  clientId: string;
  clientName?: string;
  className?: string;
  compact?: boolean;
}

export function DiscoveryCallNotesTaker({ 
  clientId, 
  clientName, 
  className = "",
  compact = false 
}: DiscoveryCallNotesTakerProps) {
  const { profile } = useProfile();
  const { note, loading, saving, saveNote } = useDiscoveryCallNotes(clientId);
  const [content, setContent] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note?.note_content) {
      setContent(note.note_content);
      // If there's existing content, don't auto-expand
      setIsExpanded(false);
    }
  }, [note]);

  const handleContentChange = (value: string) => {
    setContent(value);
    setHasUnsavedChanges(value !== note?.note_content);
    
    // Clear existing timeout
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Set new auto-save timeout for 2 seconds
    const timeout = setTimeout(() => {
      if (value !== note?.note_content) {
        saveNote(value).then(() => {
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        });
      }
    }, 2000);

    setAutoSaveTimeout(timeout);
  };

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 30) {
      return 'Just now';
    } else if (diffInSeconds < 60) {
      return 'Less than a minute ago';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const hasContent = content.trim().length > 0;
  const shouldShowSaved = lastSaved && !saving && !hasUnsavedChanges;

  // Only show for trainers
  if (profile?.user_type !== 'trainer') {
    return null;
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="ml-2 text-sm text-muted-foreground">Loading notes...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CardHeader className={compact ? "pb-3" : ""}>
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="p-0 h-auto justify-start">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4" />
                  <span className={compact ? "text-base" : "text-lg"}>
                    Notes
                    {clientName && (
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        for {clientName}
                      </span>
                    )}
                  </span>
                  {hasContent && !isExpanded && (
                    <Badge variant="outline" className="text-xs ml-2">
                      {content.trim().length > 50 ? `${content.trim().substring(0, 50)}...` : content.trim()}
                    </Badge>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </div>
              </Button>
            </CollapsibleTrigger>
            
            <div className="flex items-center gap-2">
              {saving && (
                <Badge variant="secondary" className="text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Saving...
                </Badge>
              )}
              {shouldShowSaved && (
                <Badge variant="outline" className="text-xs">
                  <Check className="h-3 w-3 mr-1" />
                  Saved {formatLastSaved(lastSaved)}
                </Badge>
              )}
              {hasUnsavedChanges && !saving && (
                <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                  Unsaved changes
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CollapsibleContent>
          <CardContent className={compact ? "pt-0" : ""}>
            <Textarea
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder="Add your private notes about this client's goals, preferences, concerns, or any observations from your conversation..."
              className={`resize-none ${compact ? 'min-h-[120px]' : 'min-h-[200px]'}`}
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground mt-2">
              These notes are private and only visible to you. Auto-saves after 2 seconds of inactivity.
            </p>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}