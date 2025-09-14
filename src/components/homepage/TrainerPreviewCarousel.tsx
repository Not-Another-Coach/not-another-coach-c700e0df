import { Star, MapPin, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrainerPreviewCarouselProps {
  onViewAll?: () => void;
}

export const TrainerPreviewCarousel = ({ onViewAll }: TrainerPreviewCarouselProps) => {
  // Mock trainer data with realistic names and information
  const featuredTrainers = [
    {
      id: 1,
      name: "Emma Rodriguez",
      title: "Strength & Weight Loss Specialist",
      location: "Derby",
      rating: 4.9,
      reviews: 47,
      image: "/placeholder.svg",
      specialties: ["Strength Training", "Weight Loss"],
      badges: ["Verified", "Featured"],
      bio: "Helping clients build strength and confidence for over 8 years",
      sessions: 300
    },
    {
      id: 2,
      name: "James Mitchell",
      title: "HIIT & Conditioning Expert",
      location: "Birmingham", 
      rating: 4.8,
      reviews: 62,
      image: "/placeholder.svg",
      specialties: ["HIIT", "Conditioning"],
      badges: ["Verified", "Top Rated"],
      bio: "High-intensity training that delivers real results",
      sessions: 450
    },
    {
      id: 3,
      name: "Sarah Chen",
      title: "Yoga & Flexibility Coach",
      location: "Manchester",
      rating: 5.0,
      reviews: 38,
      image: "/placeholder.svg",
      specialties: ["Yoga", "Flexibility"],
      badges: ["Verified", "New"],
      bio: "Mind-body wellness through personalized yoga practice",
      sessions: 200
    },
    {
      id: 4,
      name: "Alex Thompson",
      title: "Sports Performance Coach",
      location: "Leeds",
      rating: 4.9,
      reviews: 55,
      image: "/placeholder.svg",
      specialties: ["Sports Performance", "Recovery"],
      badges: ["Verified", "Expert"],
      bio: "Elite athlete training and performance optimization",
      sessions: 380
    }
  ];

  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Featured Trainers
            </h2>
            <p className="text-lg text-muted-foreground">
              Discover expert trainers ready to guide your fitness journey
            </p>
          </div>
          {onViewAll && (
            <Button
              onClick={onViewAll}
              variant="outline"
              className="hidden sm:flex items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300"
            >
              View All Trainers
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
        
        {/* Trainer Cards */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4 min-w-max">
            {featuredTrainers.map((trainer) => (
              <Card 
                key={trainer.id}
                className="min-w-[320px] group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer bg-gradient-card border-0"
              >
                <CardContent className="p-0">
                  {/* Image Section */}
                  <div className="relative overflow-hidden rounded-t-lg">
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {trainer.badges.map((badge, index) => (
                        <Badge 
                          key={index}
                          variant={badge === "Featured" ? "default" : "secondary"}
                          className="text-xs backdrop-blur-sm bg-white/90 text-primary"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-xs font-medium">{trainer.rating}</span>
                    </div>
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6">
                    <div className="mb-3">
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300">
                        {trainer.name}
                      </h3>
                      <p className="text-primary font-medium">{trainer.title}</p>
                    </div>
                    
                    <div className="flex items-center gap-1 text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span className="text-sm">{trainer.location}</span>
                      <span className="text-sm">• {trainer.sessions}+ sessions</span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {trainer.bio}
                    </p>
                    
                    {/* Specialties */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {trainer.specialties.map((specialty, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Stats Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4 text-success" />
                        <span className="text-sm text-muted-foreground">
                          {trainer.reviews} reviews
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        className="text-primary hover:bg-primary hover:text-white transition-all duration-300"
                      >
                        View Profile
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* Mobile View All Button */}
        {onViewAll && (
          <div className="sm:hidden mt-8 text-center">
            <Button
              onClick={onViewAll}
              variant="outline"
              className="w-full items-center gap-2 hover:bg-primary hover:text-white transition-all duration-300"
            >
              View All Trainers
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};