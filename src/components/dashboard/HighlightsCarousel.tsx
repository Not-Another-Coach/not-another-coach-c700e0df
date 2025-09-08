import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Play, Heart, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Highlight {
  id: string;
  trainer_id: string;
  title: string;
  description: string;
  media_urls: string[];
  content_type: 'transformation' | 'motivational' | 'article' | 'tip';
  trainer_name?: string;
  trainer_image?: string;
}

export function HighlightsCarousel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadTodaysHighlights();
  }, [user]);

  const loadTodaysHighlights = async () => {
    if (!user) return;

    try {
      // For now, get sample highlights from active trainers
      // In production, this would use the daily_highlights_batches table
      const { data, error } = await supabase
        .from('highlights_content')
        .select(`
          id,
          trainer_id,
          title,
          description,
          media_urls,
          content_type
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (data && !error) {
        const formattedHighlights = [];
        
        for (const item of data) {
          // Get trainer profile separately
          const { data: trainerProfile } = await supabase
            .from('profiles')
            .select('first_name, last_name, profile_photo_url')
            .eq('id', item.trainer_id)
            .single();

          formattedHighlights.push({
            ...item,
            content_type: item.content_type as 'transformation' | 'motivational' | 'article' | 'tip',
            trainer_name: trainerProfile ? `${trainerProfile.first_name} ${trainerProfile.last_name}` : 'Trainer',
            trainer_image: trainerProfile?.profile_photo_url || '/placeholder.svg'
          });
        }
        
        setHighlights(formattedHighlights);
      }
    } catch (error) {
      console.error('Error loading highlights:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTrainer = async (highlight: Highlight) => {
    // Track interaction
    if (user) {
      await supabase.from('user_highlight_interactions').insert({
        user_id: user.id,
        highlight_id: highlight.id,
        interaction_type: 'trainer_visited'
      });
    }
    
    navigate(`/trainer/${highlight.trainer_id}`);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + highlights.length) % highlights.length);
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'transformation':
        return '✨';
      case 'motivational':
        return '💪';
      case 'article':
        return '📖';
      case 'tip':
        return '💡';
      default:
        return '⭐';
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case 'transformation':
        return 'Transformation Story';
      case 'motivational':
        return 'Motivation';
      case 'article':
        return 'Article';
      case 'tip':
        return 'Training Tip';
      default:
        return 'Highlight';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Today's Highlights</h2>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-80 h-64 bg-muted rounded-xl animate-pulse flex-shrink-0" />
          ))}
        </div>
      </div>
    );
  }

  if (highlights.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Today's Highlights</h2>
        <Card className="w-full h-64 bg-gradient-to-br from-secondary-50 to-accent-50">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center">
              <Star className="h-12 w-12 text-secondary mx-auto mb-3" />
              <p className="text-muted-foreground">No highlights available today</p>
              <p className="text-sm text-muted-foreground mt-1">Check back tomorrow for fresh content!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Today's Highlights</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} of {highlights.length}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              disabled={highlights.length <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              disabled={highlights.length <= 1}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-300 ease-in-out gap-4"
          style={{ transform: `translateX(-${currentIndex * 320}px)` }}
        >
          {highlights.map((highlight) => (
            <Card 
              key={highlight.id}
              className="w-80 flex-shrink-0 group cursor-pointer hover:shadow-lg transition-all duration-200 bg-gradient-to-br from-card to-secondary-50/30"
              onClick={() => handleViewTrainer(highlight)}
            >
              <CardContent className="p-0 relative h-64">
                {/* Background Image */}
                <div className="absolute inset-0 rounded-lg overflow-hidden">
                  {highlight.media_urls[0] ? (
                    <img 
                      src={highlight.media_urls[0]} 
                      alt={highlight.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary-100 to-secondary-100" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 via-gray-900/20 to-transparent" />
                </div>

                {/* Content Type Badge */}
                <div className="absolute top-3 left-3">
                  <Badge variant="secondary" className="bg-white/90 text-gray-800">
                    <span className="mr-1">{getContentTypeIcon(highlight.content_type)}</span>
                    {getContentTypeLabel(highlight.content_type)}
                  </Badge>
                </div>

                {/* Media Play Button for videos */}
                {highlight.media_urls[0]?.includes('video') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 group-hover:bg-white/30 transition-colors">
                      <Play className="h-8 w-8 text-white" />
                    </div>
                  </div>
                )}

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <img 
                      src={highlight.trainer_image} 
                      alt={highlight.trainer_name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                    <span className="text-white text-sm font-medium">
                      {highlight.trainer_name}
                    </span>
                  </div>
                  
                  <h3 className="text-white font-semibold text-lg mb-1 line-clamp-2">
                    {highlight.title}
                  </h3>
                  
                  {highlight.description && (
                    <p className="text-white/90 text-sm line-clamp-2">
                      {highlight.description}
                    </p>
                  )}

                  <Button 
                    size="sm" 
                    className="mt-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTrainer(highlight);
                    }}
                  >
                    View Trainer
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dots indicator */}
      {highlights.length > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}