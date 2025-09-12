import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Heart, X, Star, MapPin, Award, Bookmark, BookmarkCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trainer } from '@/types/trainer';
import { MatchBadge } from '@/components/MatchBadge';
import { useSavedTrainers } from '@/hooks/useSavedTrainers';
import { getTrainerDisplayPrice } from '@/lib/priceUtils';

interface SwipeableCardProps {
  trainer: Trainer;
  onSwipe: (direction: 'left' | 'right', trainer: Trainer) => void;
  matchScore?: number;
  matchReasons?: string[];
  index: number;
}

export const SwipeableCard = ({ trainer, onSwipe, matchScore = 0, matchReasons = [], index }: SwipeableCardProps) => {
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const { isTrainerSaved, saveTrainer, unsaveTrainer } = useSavedTrainers();
  const isSaved = isTrainerSaved(trainer.id);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSaved) {
      await unsaveTrainer(trainer.id);
    } else {
      await saveTrainer(trainer.id);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const offset = info.offset.x;
    const velocity = info.velocity.x;
    
    // Determine swipe direction based on offset and velocity
    if (Math.abs(velocity) >= 500) {
      if (velocity > 0) {
        setExitX(1000);
        onSwipe('right', trainer);
      } else {
        setExitX(-1000);
        onSwipe('left', trainer);
      }
    } else if (Math.abs(offset) > 150) {
      if (offset > 0) {
        setExitX(1000);
        onSwipe('right', trainer);
      } else {
        setExitX(-1000);
        onSwipe('left', trainer);
      }
    }
  };

  // Color overlay based on swipe direction
  const likeOpacity = useTransform(x, [0, 150], [0, 1]);
  const rejectOpacity = useTransform(x, [-150, 0], [1, 0]);

  return (
    <motion.div
      ref={cardRef}
      className={cn(
        "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing",
        index > 0 && "pointer-events-none"
      )}
      style={{
        x,
        rotate,
        opacity,
        zIndex: 10 - index,
        scale: index === 0 ? 1 : 1 - (index * 0.05),
        y: index * 8,
      }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={exitX !== 0 ? { x: exitX } : {}}
      initial={{ scale: 1.1, opacity: 0 }}
      whileInView={{ scale: index === 0 ? 1 : 1 - (index * 0.05), opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      exit={{ x: exitX, opacity: 0 }}
    >
      <div className="relative w-full h-full bg-white rounded-2xl shadow-2xl overflow-hidden border">
        {/* Action overlays */}
        <motion.div 
          className="absolute inset-0 bg-green-500/20 flex items-center justify-center z-10"
          style={{ opacity: likeOpacity }}
        >
          <div className="bg-green-500 rounded-full p-4 rotate-12">
            <Heart className="w-12 h-12 text-white fill-white" />
          </div>
        </motion.div>
        
        <motion.div 
          className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-10"
          style={{ opacity: rejectOpacity }}
        >
          <div className="bg-red-500 rounded-full p-4 -rotate-12">
            <X className="w-12 h-12 text-white" />
          </div>
        </motion.div>

        {/* Like Button - Heart in top left */}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-4 left-4 z-20 rounded-full w-12 h-12 p-0",
            "bg-white/90 backdrop-blur shadow-sm border border-white/20",
            "hover:bg-red-50 hover:border-red-200 transition-all duration-200",
            isSaved ? "bg-red-50 border-red-200" : ""
          )}
          onClick={handleToggleSave}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-all duration-200",
              isSaved 
                ? "text-red-500 fill-red-500" 
                : "text-red-400 hover:text-red-500 hover:fill-red-500"
            )} 
          />
        </Button>

        {/* Match Badge */}
        {matchScore > 0 && (
          <div className="absolute top-6 right-6 z-20">
            <MatchBadge score={matchScore} reasons={matchReasons} />
          </div>
        )}

        {/* Trainer Image */}
        <div className="relative h-2/3 overflow-hidden">
          <img 
            src={trainer.image} 
            alt={trainer.name}
            className="w-full h-full object-cover"
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          {/* Basic info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-3xl font-bold">{trainer.name}</h2>
              <div className="bg-green-500 rounded-full p-1">
                <Award className="h-4 w-4 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{trainer.rating}</span>
                <span>({trainer.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{trainer.location}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details section */}
        <div className="h-1/3 p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-muted-foreground text-sm">{trainer.experience} experience</p>
              <div className="text-2xl font-bold text-primary">{getTrainerDisplayPrice(trainer)}</div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Availability</p>
              <p className="font-medium">{trainer.availability}</p>
            </div>
          </div>

          {/* Specialties */}
          <div>
            <p className="text-sm font-medium mb-2">Specialties</p>
            <div className="flex flex-wrap gap-1">
              {trainer.specialties.slice(0, 4).map((specialty) => (
                <Badge key={specialty} variant="secondary" className="text-xs">
                  {specialty}
                </Badge>
              ))}
              {trainer.specialties.length > 4 && (
                <Badge variant="outline" className="text-xs">
                  +{trainer.specialties.length - 4}
                </Badge>
              )}
            </div>
          </div>

          {/* Training types */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Offers:</span>
            <div className="flex gap-1">
              {trainer.trainingType.map((type) => (
                <span key={type} className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full flex items-center gap-1">
                  {type === "In-Person" ? "🧍" : type === "Online" ? "💻" : type === "Group" ? "👥" : type === "Hybrid" ? "🔄" : ""}
                  {type}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};