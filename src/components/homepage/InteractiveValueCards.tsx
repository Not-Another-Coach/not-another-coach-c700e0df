import { Target, CreditCard, TrendingUp, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const InteractiveValueCards = () => {
  const features = [
    {
      icon: Target,
      title: "Smart Coach Matching",
      description: "Matched to your goals, style & schedule",
      colorClasses: {
        bg: "bg-primary/10 group-hover:bg-primary/20",
        text: "text-primary",
        border: "border-l-primary",
        badge: "bg-primary/10 text-primary"
      },
      stats: "Personalised"
    },
    {
      icon: CreditCard,
      title: "Transparent Pricing",
      description: "Compare packages & pay securely",
      colorClasses: {
        bg: "bg-secondary/10 group-hover:bg-secondary/20",
        text: "text-secondary",
        border: "border-l-secondary",
        badge: "bg-secondary/10 text-secondary"
      },
      stats: "Clear & Fair"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "Sessions, milestones & success in one view",
      colorClasses: {
        bg: "bg-success/10 group-hover:bg-success/20",
        text: "text-success",
        border: "border-l-success",
        badge: "bg-success/10 text-success"
      },
      stats: "Track Results"
    },
    {
      icon: Shield,
      title: "Secure Payment & Guarantee",
      description: "Funds only released after delivery",
      colorClasses: {
        bg: "bg-accent/10 group-hover:bg-accent/20",
        text: "text-accent",
        border: "border-l-accent",
        badge: "bg-accent/10 text-accent"
      },
      stats: "Protected"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional fitness matching with complete peace of mind
          </p>
        </div>
        
        {/* Clean 2x2 grid for focused features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <Card 
                key={index}
                className={`group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer border-l-4 ${feature.colorClasses.border} bg-gradient-card`}
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
    </div>
  );
};