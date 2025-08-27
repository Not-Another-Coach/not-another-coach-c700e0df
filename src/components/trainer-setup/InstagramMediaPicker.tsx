import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Instagram, Loader2, AlertCircle, GripVertical, Play } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  caption?: string;
  timestamp: string;
  selected?: boolean;
}

interface Connection {
  username: string;
  account_type: string;
}

export const InstagramMediaPicker = () => {
  const [media, setMedia] = useState<InstagramMedia[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<InstagramMedia[]>([]);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInstagramMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase.functions.invoke('instagram-media');
      
      if (error) throw error;
      
      if (data.error) {
        throw new Error(data.error);
      }

      setMedia(data.media || []);
      setConnection(data.connection);
      
      // Set initially selected media
      const selected = data.media?.filter((m: InstagramMedia) => m.selected) || [];
      setSelectedMedia(selected);
      
    } catch (err: any) {
      console.error('Error fetching Instagram media:', err);
      setError(err.message || 'Failed to fetch Instagram media');
      toast({
        title: 'Error',
        description: err.message || 'Failed to fetch Instagram media',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMediaSelections = async () => {
    try {
      setSaving(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the user's Instagram connection to get connection_id
      const { data: connectionData, error: connectionError } = await supabase
        .from('instagram_connections')
        .select('id')
        .eq('trainer_id', user.id)
        .eq('is_active', true)
        .maybeSingle();

      if (connectionError) throw connectionError;
      if (!connectionData) throw new Error('No active Instagram connection found');

      // First, deactivate all existing selections for this trainer
      await supabase
        .from('instagram_selected_media')
        .update({ is_active: false })
        .eq('trainer_id', user.id);

      // Then insert new selections with display order
      if (selectedMedia.length > 0) {
        const insertData = selectedMedia.map((mediaItem, index) => ({
          trainer_id: user.id,
          connection_id: connectionData.id,
          instagram_media_id: mediaItem.id,
          media_url: mediaItem.media_url,
          thumbnail_url: mediaItem.thumbnail_url || mediaItem.media_url,
          media_type: mediaItem.media_type,
          caption: mediaItem.caption || '',
          permalink: mediaItem.permalink,
          display_order: index,
          is_active: true
        }));

        const { error: insertError } = await supabase
          .from('instagram_selected_media')
          .insert(insertData);

        if (insertError) throw insertError;
      }

      toast({
        title: 'Success',
        description: `Saved ${selectedMedia.length} selected posts`,
      });
      
    } catch (err: any) {
      console.error('Error saving media selections:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save media selections',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMediaToggle = (mediaItem: InstagramMedia) => {
    const isCurrentlySelected = selectedMedia.some(m => m.id === mediaItem.id);
    
    if (isCurrentlySelected) {
      setSelectedMedia(prev => prev.filter(m => m.id !== mediaItem.id));
    } else {
      setSelectedMedia(prev => [...prev, mediaItem]);
    }
  };

  const onDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(selectedMedia);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSelectedMedia(items);
  };

  const getMediaTypeIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="h-4 w-4" />;
      case 'CAROUSEL_ALBUM':
        return <div className="h-4 w-4 border border-current rounded grid grid-cols-2 gap-0.5 p-0.5">
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
          <div className="bg-current rounded-sm"></div>
        </div>;
      default:
        return null;
    }
  };

  useEffect(() => {
    fetchInstagramMedia();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Media Picker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading your Instagram posts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Media Picker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive py-4">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
          <Button onClick={fetchInstagramMedia} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Instagram className="h-5 w-5" />
            Instagram Media Picker
          </CardTitle>
          {connection && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Connected as @{connection.username}</span>
              <Badge variant="secondary">{connection.account_type}</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select up to 12 posts to display on your profile
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {selectedMedia.length}/12 selected
                </span>
                <Button 
                  onClick={saveMediaSelections} 
                  disabled={saving || selectedMedia.length === 0}
                  size="sm"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    'Save Selection'
                  )}
                </Button>
              </div>
            </div>

            {/* Instagram Media Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((mediaItem) => {
                const isSelected = selectedMedia.some(m => m.id === mediaItem.id);
                const isMaxSelected = selectedMedia.length >= 12 && !isSelected;
                
                return (
                  <div
                    key={mediaItem.id}
                    className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all ${
                      isSelected 
                        ? 'border-primary ring-2 ring-primary/20' 
                        : 'border-border hover:border-primary/50'
                    } ${isMaxSelected ? 'opacity-50' : ''}`}
                    onClick={() => !isMaxSelected && handleMediaToggle(mediaItem)}
                  >
                    <div className="aspect-square relative">
                      <img
                        src={mediaItem.thumbnail_url || mediaItem.media_url}
                        alt={mediaItem.caption || 'Instagram post'}
                        className="w-full h-full object-cover"
                      />
                      
                      {/* Media type indicator */}
                      {mediaItem.media_type !== 'IMAGE' && (
                        <div className="absolute top-2 right-2 text-white">
                          {getMediaTypeIcon(mediaItem.media_type)}
                        </div>
                      )}
                      
                      {/* Selection checkbox */}
                      <div className="absolute top-2 left-2">
                        <Checkbox 
                          checked={isSelected}
                          disabled={isMaxSelected}
                          className="bg-white/80 border-white"
                        />
                      </div>
                      
                      {/* Selection order badge */}
                      {isSelected && (
                        <div className="absolute bottom-2 right-2 bg-primary text-primary-foreground text-xs font-medium px-2 py-1 rounded">
                          {selectedMedia.findIndex(m => m.id === mediaItem.id) + 1}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Selected Media - Reorderable */}
      {selectedMedia.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Posts ({selectedMedia.length})</CardTitle>
            <p className="text-sm text-muted-foreground">
              Drag to reorder how they'll appear on your profile
            </p>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="selected-media" direction="horizontal">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="flex gap-3 overflow-x-auto pb-2"
                  >
                    {selectedMedia.map((mediaItem, index) => (
                      <Draggable
                        key={mediaItem.id}
                        draggableId={mediaItem.id}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`relative flex-shrink-0 w-24 h-24 border rounded-lg overflow-hidden ${
                              snapshot.isDragging ? 'ring-2 ring-primary' : ''
                            }`}
                          >
                            <img
                              src={mediaItem.thumbnail_url || mediaItem.media_url}
                              alt={mediaItem.caption || 'Selected post'}
                              className="w-full h-full object-cover"
                            />
                            <div
                              {...provided.dragHandleProps}
                              className="absolute inset-0 bg-black/0 hover:bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-move"
                            >
                              <GripVertical className="h-4 w-4 text-white" />
                            </div>
                            <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      )}
    </div>
  );
};