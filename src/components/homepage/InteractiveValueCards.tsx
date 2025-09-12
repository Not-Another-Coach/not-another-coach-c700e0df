import { Shield, MessageCircle, Calendar, Star, Users, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const InteractiveValueCards = () => {
  const features = [
    {
      icon: Shield,
      title: "Verified Trainers",
      description: "Only certified professionals, so you're in safe hands",
      colorClasses: {
        bg: "bg-success/10 group-hover:bg-success/20",
        text: "text-success",
        border: "border-l-success",
        badge: "bg-success/10 text-success"
      },
      stats: "100% Verified"
    },
    {
      icon: MessageCircle,
      title: "Direct Messaging",
      description: "Chat with trainers instantly to find your fit",
      colorClasses: {
        bg: "bg-secondary/10 group-hover:bg-secondary/20",
        text: "text-secondary",
        border: "border-l-secondary",
        badge: "bg-secondary/10 text-secondary"
      },
      stats: "Instant Chat"
    },
    {
      icon: Calendar,
      title: "Easy Booking",
      description: "Schedule sessions in just a few taps",
      colorClasses: {
        bg: "bg-accent/10 group-hover:bg-accent/20",
        text: "text-accent",
        border: "border-l-accent",
        badge: "bg-accent/10 text-accent"
      },
      stats: "24/7 Booking"
    },
    {
      icon: Star,
      title: "Quality Assured",
      description: "Top-rated trainers with proven track records",
      colorClasses: {
        bg: "bg-warning/10 group-hover:bg-warning/20",
        text: "text-warning",
        border: "border-l-warning",
        badge: "bg-warning/10 text-warning"
      },
      stats: "4.8★ Average"
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Join thousands of successful fitness journeys",
      colorClasses: {
        bg: "bg-primary/10 group-hover:bg-primary/20",
        text: "text-primary",
        border: "border-l-primary",
        badge: "bg-primary/10 text-primary"
      },
      stats: "10k+ Members"
    },
    {
      icon: Award,
      title: "Results Focused",
      description: "Trainers committed to your success",
      colorClasses: {
        bg: "bg-energy/10 group-hover:bg-energy/20",
        text: "text-energy",
        border: "border-l-energy",
        badge: "bg-energy/10 text-energy"
      },
      stats: "90% Success Rate"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We've built the most trusted fitness community where quality trainers meet motivated clients
          </p>
        </div>
        
        {/* Scrollable cards container */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4 min-w-max">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index}
                  className={`min-w-[280px] group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer ${feature.colorClasses.border} bg-gradient-card`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-full ${feature.colorClasses.bg} transition-colors duration-300`}>
                        <IconComponent className={`h-6 w-6 ${feature.colorClasses.text}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${feature.colorClasses.badge}`}>
                            {feature.stats}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="flex justify-center mt-6">
          <div className="flex space-x-2">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};