import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Save, Check, StickyNote } from 'lucide-react';
import { useDiscoveryCallNotes } from '@/hooks/useDiscoveryCallNotes';
import { useUserTypeChecks } from '@/hooks/useUserType';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

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
  const { isTrainer } = useUserTypeChecks();
  const { note, loading, saving, saveNote } = useDiscoveryCallNotes(clientId);
  const [content, setContent] = useState('');
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (note?.note_content) {
      setContent(note.note_content);
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
  if (!isTrainer()) {
    return null;
  }

  if (loading) {
    return (
      <div className={className}>
        <Button variant="ghost" size="sm" disabled>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading notes...
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm" className="h-auto py-2 justify-start text-left">
            <div className="flex flex-col items-start gap-1 w-full">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Notes
                  {clientName && (
                    <span className="font-normal text-muted-foreground ml-1">
                      for {clientName}
                    </span>
                  )}
                </span>
              </div>
              {hasContent && (
                <div className="text-xs text-muted-foreground overflow-hidden break-all whitespace-pre-wrap" style={{ wordWrap: 'break-word', overflowWrap: 'anywhere' }}>
                  {/* Strip HTML tags for preview and show plain text */}
                  {(() => {
                    const plainText = content.replace(/<[^>]*>/g, '').trim();
                    return plainText.length > 500 
                      ? `${plainText.substring(0, 500)}...` 
                      : plainText;
                  })()}
                </div>
              )}
            </div>
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Notes
              {clientName && (
                <span className="font-normal text-muted-foreground">
                  for {clientName}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col gap-4">
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
            
            <div className="flex-1 flex flex-col gap-4">
              <ReactQuill
                value={content}
                onChange={handleContentChange}
                placeholder="Add your private notes about this client's goals, preferences, concerns, or any observations from your conversation..."
                style={{ height: '300px' }}
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                    [{ 'color': [] }, { 'background': [] }],
                    ['clean']
                  ],
                }}
                formats={[
                  'header', 'bold', 'italic', 'underline', 'strike',
                  'list', 'bullet', 'color', 'background'
                ]}
              />
              
              <div className="mt-12"> {/* Add margin to account for editor height */}
                <p className="text-xs text-muted-foreground">
                  These notes are private and only visible to you. Auto-saves after 2 seconds of inactivity.
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}