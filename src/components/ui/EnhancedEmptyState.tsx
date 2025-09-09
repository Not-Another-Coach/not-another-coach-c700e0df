import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Bookmark, 
  Calendar, 
  Dumbbell, 
  Heart,
  Star,
  Search,
  Users,
  ArrowRight,
  Sparkles,
  TrendingUp,
  MapPin
} from "lucide-react";

type FilterType = 'all' | 'saved' | 'shortlisted' | 'discovery' | 'declined' | 'waitlist';

interface EnhancedEmptyStateProps {
  filterType: FilterType;
  counts: Record<FilterType, number>;
  onExploreTrainers: () => void;
  onViewAllTrainers: () => void;
  onNeedHelp?: () => void;
  journeyStage?: string;
  className?: string;
}

interface EmptyStateConfig {
  icon: React.ComponentType<any>;
  title: string;
  subtitle: string;
  progressText?: string;
  primaryCTA: string;
  secondaryCTA?: string;
  tertiaryCTA?: string;
  gradient: string;
  iconColor: string;
  suggestions?: string[];
}

const EMPTY_STATE_CONFIGS: Record<FilterType, EmptyStateConfig> = {
  shortlisted: {
    icon: Target,
    title: "You haven't shortlisted a trainer yet 🚀",
    subtitle: "Your shortlist helps you focus on the trainers that truly match your goals",
    progressText: "0/3 trainers shortlisted",
    primaryCTA: "Browse Trainers",
    secondaryCTA: "View All Trainers",
    tertiaryCTA: "How to Choose?",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
    suggestions: ["Look for trainers with your preferred workout style", "Check their availability and location", "Read client testimonials"]
  },
  saved: {
    icon: Bookmark,
    title: "Your dream coach isn't here... yet! 👟",
    subtitle: "Save trainers as you browse to build your personal collection",
    progressText: "0 trainers saved",
    primaryCTA: "Discover Trainers",
    secondaryCTA: "View All Trainers", 
    tertiaryCTA: "Get Recommendations",
    gradient: "from-amber-500/20 via-amber-500/10 to-transparent",
    iconColor: "text-amber-600",
    suggestions: ["Save interesting profiles for later", "Compare different training styles", "Build your favorites list"]
  },
  discovery: {
    icon: Calendar,
    title: "Ready to take the next step? 💪",
    subtitle: "Book discovery calls with shortlisted trainers to find your perfect match",
    progressText: "No discovery calls booked",
    primaryCTA: "Find Trainers",
    secondaryCTA: "View Shortlisted",
    tertiaryCTA: "Booking Help",
    gradient: "from-green-500/20 via-green-500/10 to-transparent",
    iconColor: "text-green-600",
    suggestions: ["Schedule calls with 2-3 top candidates", "Prepare questions about their approach", "Discuss your fitness goals"]
  },
  waitlist: {
    icon: Users,
    title: "Building your waitlist 🎯",
    subtitle: "Join waitlists for popular trainers and we'll notify you when spots open",
    progressText: "Waitlist status",
    primaryCTA: "Explore More Trainers",
    secondaryCTA: "View All Trainers",
    tertiaryCTA: "Notification Settings",
    gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
    iconColor: "text-purple-600",
    suggestions: ["Popular trainers often have openings", "Set notifications for quick updates", "Keep exploring while you wait"]
  },
  declined: {
    icon: Heart,
    title: "Every 'no' brings you closer to the right 'yes' ✨",
    subtitle: "Don't worry - there are plenty more amazing trainers to discover",
    primaryCTA: "Find New Trainers",
    secondaryCTA: "View All Options",
    tertiaryCTA: "Refine Preferences",
    gradient: "from-rose-500/20 via-rose-500/10 to-transparent",
    iconColor: "text-rose-600",
    suggestions: ["Try different trainer types", "Adjust your search criteria", "Consider virtual training options"]
  },
  all: {
    icon: Dumbbell,
    title: "Let's find a trainer that matches your goals 💪",
    subtitle: "Browse through our curated trainers and start building your fitness journey",
    progressText: "Your fitness journey starts here",
    primaryCTA: "Explore Trainers",
    secondaryCTA: "Popular Trainers",
    tertiaryCTA: "Need Help Choosing?",
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
    suggestions: ["Start with highly-rated trainers", "Filter by your preferred workout style", "Check availability in your area"]
  }
};

const POPULAR_TRAINERS_MOCK = [
  { name: "Alex Johnson", specialty: "HIIT & Strength", rating: 4.9, location: "Your Area" },
  { name: "Sarah Chen", specialty: "Yoga & Mobility", rating: 4.8, location: "Your Area" },
  { name: "Mike Rodriguez", specialty: "Bodybuilding", rating: 4.9, location: "Your Area" }
];

export function EnhancedEmptyState({
  filterType,
  counts,
  onExploreTrainers,
  onViewAllTrainers,
  onNeedHelp,
  journeyStage,
  className = ""
}: EnhancedEmptyStateProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const config = EMPTY_STATE_CONFIGS[filterType];

  useEffect(() => {
    setIsVisible(true);
    // Show suggestions after a delay for certain filters
    if (config.suggestions && ['all', 'shortlisted'].includes(filterType)) {
      const timer = setTimeout(() => setShowSuggestions(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [filterType, config.suggestions]);

  const IconComponent = config.icon;

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const floatingVariants = {
    floating: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className={`col-span-full ${className}`}>
      <motion.div
        className="text-center py-8 px-4 relative overflow-hidden"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        {/* Background gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-60`} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/80" />
        
        {/* Floating decoration elements */}
        <motion.div
          className="absolute top-8 left-8 opacity-20"
          variants={floatingVariants}
          animate="floating"
        >
          <Sparkles className="h-6 w-6 text-primary" />
        </motion.div>
        <motion.div
          className="absolute top-16 right-12 opacity-20"
          variants={floatingVariants}
          animate="floating"
          transition={{ delay: 1 }}
        >
          <TrendingUp className="h-5 w-5 text-primary" />
        </motion.div>

        <div className="relative z-10 max-w-2xl mx-auto">
          {/* Animated Icon */}
          <motion.div
            className="mb-8"
            variants={iconVariants}
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className={`w-20 h-20 mx-auto rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
              <IconComponent className={`h-10 w-10 ${config.iconColor}`} />
            </div>
          </motion.div>

          {/* Progress indicator */}
          {config.progressText && (
            <motion.div variants={itemVariants} className="mb-4">
              <Badge variant="secondary" className="text-sm px-3 py-1 bg-muted/50">
                {config.progressText}
              </Badge>
            </motion.div>
          )}

          {/* Main content */}
          <motion.h3 
            variants={itemVariants}
            className="text-2xl font-bold mb-4 text-foreground"
          >
            {config.title}
          </motion.h3>
          
          <motion.p 
            variants={itemVariants}
            className="text-muted-foreground mb-8 text-lg leading-relaxed"
          >
            {config.subtitle}
          </motion.p>

          {/* Action buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 justify-center mb-8"
          >
            <Button
              onClick={onExploreTrainers}
              size="lg"
              className="group relative overflow-hidden bg-primary hover:bg-primary/90 shadow-lg"
            >
              <span className="relative z-10 flex items-center gap-2">
                {config.primaryCTA}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
            
            {config.secondaryCTA && (
              <Button
                onClick={onViewAllTrainers}
                variant="outline"
                size="lg"
                className="hover:bg-muted/50"
              >
                {config.secondaryCTA}
              </Button>
            )}
            
            {config.tertiaryCTA && onNeedHelp && (
              <Button
                onClick={onNeedHelp}
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground"
              >
                {config.tertiaryCTA}
              </Button>
            )}
          </motion.div>

          {/* Suggestions section - only for certain filters */}
          {config.suggestions && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="border-t border-muted/30 pt-8"
            >
              <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Pro Tips
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                {config.suggestions.map((suggestion, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-start gap-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                    <span className="text-muted-foreground">{suggestion}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Popular trainers section - only for 'all' filter */}
          {filterType === 'all' && showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="border-t border-muted/30 pt-8 mt-8"
            >
              <h4 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular in Your Area
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {POPULAR_TRAINERS_MOCK.map((trainer, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="p-4 rounded-lg bg-card border hover:shadow-md transition-all cursor-pointer group"
                    onClick={onExploreTrainers}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-medium text-sm group-hover:text-primary transition-colors">
                          {trainer.name}
                        </h5>
                        <p className="text-xs text-muted-foreground truncate">
                          {trainer.specialty}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          <span className="text-xs text-muted-foreground">
                            {trainer.rating}
                          </span>
                          <MapPin className="h-3 w-3 text-muted-foreground ml-1" />
                          <span className="text-xs text-muted-foreground">
                            {trainer.location}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}