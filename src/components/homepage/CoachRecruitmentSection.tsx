import { TrendingUp, Users, CreditCard, ArrowRight } from "lucide-react";
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
      description: "Connect with motivated clients ready to transform their lives"
    },
    {
      icon: TrendingUp,
      title: "Earn More",
      description: "Set competitive rates and build sustainable income"
    },
    {
      icon: CreditCard,
      title: "Instant Payments",
      description: "Get paid immediately after every session with secure processing"
    }
  ];

  return (
    <section className="py-20 bg-muted/30 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5" />
      <div className="absolute top-20 right-20 w-40 h-40 rounded-full bg-secondary/10 blur-3xl" />
      <div className="absolute bottom-20 left-20 w-32 h-32 rounded-full bg-primary/10 blur-3xl" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Are You a Coach? Grow Your Business With Us
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Join the platform that connects you with serious clients and helps you build the coaching business you've always wanted.
          </p>
          <Button 
            size="lg" 
            onClick={onBecomeCoach}
            className="bg-gradient-primary hover:opacity-90 text-white font-semibold px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Become a Coach Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card 
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-2 bg-card border border-border/50"
              >
                <CardContent className="p-6 text-center">
                  <div className="inline-flex p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 mb-4 transition-all duration-300">
                    <IconComponent className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300">
                    {benefit.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Key stats */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-card rounded-2xl border border-border/50 shadow-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">Growing</div>
              <div className="text-sm text-muted-foreground">Coach Network</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">Your Rate</div>
              <div className="text-sm text-muted-foreground">You Set Prices</div>
            </div>
            <div className="w-px h-12 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">Secure</div>
              <div className="text-sm text-muted-foreground">Instant Payments</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};