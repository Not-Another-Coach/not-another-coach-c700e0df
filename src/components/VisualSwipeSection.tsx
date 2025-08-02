import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, X, Star, MapPin } from "lucide-react";
import trainerSarah from "@/assets/trainer-sarah.jpg";
import trainerMike from "@/assets/trainer-mike.jpg";
import trainerEmma from "@/assets/trainer-emma.jpg";

export const VisualSwipeSection = () => {
  const navigate = useNavigate();

  const previewCards = [
    {
      name: "Sarah Johnson",
      specialties: ["Weight Loss", "Strength"],
      rating: 4.9,
      location: "Downtown",
      image: trainerSarah,
      price: "$85/hr"
    },
    {
      name: "Mike Rodriguez", 
      specialties: ["Muscle Building", "Powerlifting"],
      rating: 4.8,
      location: "Westside",
      image: trainerMike,
      price: "$95/hr"
    },
    {
      name: "Emma Chen",
      specialties: ["Yoga", "Flexibility"],
      rating: 4.9,
      location: "Eastside", 
      image: trainerEmma,
      price: "$70/hr"
    }
  ];

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-success/10 border-primary/20 overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent" />
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-primary/10 blur-xl" />
          <div className="absolute bottom-4 left-4 w-16 h-16 rounded-full bg-secondary/10 blur-xl" />
          
          <div className="relative p-8">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              
              {/* Left Side - Content */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="bg-gradient-to-r from-primary to-secondary p-2 rounded-full">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      🔥 Discovery Mode
                    </Badge>
                  </div>
                  <h3 className="text-3xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Find Your Perfect Match
                  </h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Swipe through trainers and discover professionals who match your fitness goals, 
                    experience level, and training preferences. It's like dating, but for fitness!
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-green-100 p-1 rounded-full">
                      <Heart className="h-3 w-3 text-green-600" />
                    </div>
                    <span>Swipe right to like a trainer</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-red-100 p-1 rounded-full">
                      <X className="h-3 w-3 text-red-600" />
                    </div>
                    <span>Swipe left to pass</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="bg-primary/10 p-1 rounded-full">
                      <Star className="h-3 w-3 text-primary" />
                    </div>
                    <span>Match with trainers who fit your goals</span>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/discovery')}
                  size="lg"
                  className="bg-gradient-to-r from-primary via-secondary to-success hover:from-primary/90 hover:via-secondary/90 hover:to-success/90 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Heart className="h-5 w-5 mr-2" />
                  Start Swiping Now
                </Button>
              </div>

              {/* Right Side - Preview Cards Stack */}
              <div className="relative h-96 flex items-center justify-center">
                <div className="relative w-72">
                  {previewCards.map((trainer, index) => (
                    <div
                      key={trainer.name}
                      className={`absolute inset-0 transition-all duration-300 ${
                        index === 0 
                          ? 'z-30 rotate-0 scale-100' 
                          : index === 1 
                          ? 'z-20 rotate-3 scale-95 blur-[1px]' 
                          : 'z-10 rotate-6 scale-90 blur-[2px]'
                      }`}
                      style={{
                        transform: `
                          rotate(${index * 3}deg) 
                          scale(${1 - index * 0.05}) 
                          translateX(${index * -8}px) 
                          translateY(${index * 4}px)
                        `,
                      }}
                    >
                      <Card className="w-full h-80 overflow-hidden shadow-xl border-2 border-white">
                        <div className="relative h-full">
                          <img 
                            src={trainer.image} 
                            alt={trainer.name}
                            className="w-full h-full object-cover"
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                          
                          {/* Content */}
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-xl font-bold">{trainer.name}</h4>
                              <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{trainer.rating}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="h-3 w-3" />
                              <span className="text-sm opacity-90">{trainer.location}</span>
                              <span className="text-sm opacity-60">•</span>
                              <span className="text-sm font-medium text-green-400">{trainer.price}</span>
                            </div>
                            
                            <div className="flex flex-wrap gap-1">
                              {trainer.specialties.map((specialty) => (
                                <Badge 
                                  key={specialty}
                                  variant="secondary" 
                                  className="bg-white/20 text-white border-white/30 text-xs"
                                >
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Top badge for featured trainers */}
                          {index === 0 && (
                            <div className="absolute top-4 right-4">
                              <Badge className="bg-gradient-to-r from-primary to-secondary text-white border-0">
                                Featured
                              </Badge>
                            </div>
                          )}
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>

                {/* Floating Action Hints */}
                <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                  <div className="bg-red-500 p-3 rounded-full shadow-lg animate-pulse">
                    <X className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-green-500 p-3 rounded-full shadow-lg animate-pulse">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};