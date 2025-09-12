import { TrendingUp, Users, DollarSign, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CoachRecruitmentSectionProps {
  onBecomeCoach: () => void;
}

export const CoachRecruitmentSection = ({ onBecomeCoach }: CoachRecruitmentSectionProps) => {
  const benefits = [
    {
      icon: Users,
      title: "Reach New Clients",
      description: "Access to thousands of fitness enthusiasts looking for expert guidance"
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Expand your client base and build a sustainable coaching practice"
    },
    {
      icon: DollarSign,
      title: "Earn More",
      description: "Competitive rates with transparent pricing and instant payments"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-br from-primary/5 via-secondary/5 to-success/5 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div>
            <div className="mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Join Our Coaching
                <span className="block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Community
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Reach new clients, grow your business, and focus on what you do best — transforming lives through fitness.
              </p>
              
              <Button
                onClick={onBecomeCoach}
                variant="energy"
                size="lg"
                className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-primary hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Become a Coach Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">1000+</div>
                <div className="text-sm text-muted-foreground">Active Clients</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary mb-1">£50+</div>
                <div className="text-sm text-muted-foreground">Avg. Hourly Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success mb-1">4.9★</div>
                <div className="text-sm text-muted-foreground">Coach Rating</div>
              </div>
            </div>
          </div>
          
          {/* Right Column - Benefits Cards */}
          <div className="space-y-6">
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <Card 
                  key={index}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white/50 backdrop-blur-sm border-white/20"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-full bg-gradient-primary/10 group-hover:bg-gradient-primary/20 transition-colors duration-300">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                          {benefit.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};