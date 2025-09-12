import { Star, Quote, Users, TrendingUp, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const SocialProofSection = () => {
  const testimonials = [
    {
      name: "Sophie Williams",
      role: "Lost 15kg in 4 months",
      content: "Finding the right trainer changed everything. The platform made it so easy to connect with Emma, who understood my goals perfectly.",
      rating: 5,
      image: "/placeholder.svg"
    },
    {
      name: "Michael Davis",
      role: "Built strength & confidence",
      content: "James pushed me beyond what I thought possible. The direct messaging made scheduling and support seamless throughout my journey.",
      rating: 5,
      image: "/placeholder.svg"
    },
    {
      name: "Rachel Foster",
      role: "Transformed my lifestyle",
      content: "Sarah's yoga sessions helped me find balance. The booking system is brilliant - I can schedule around my busy work schedule easily.",
      rating: 5,
      image: "/placeholder.svg"
    }
  ];

  const stats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Active Members",
      color: "primary"
    },
    {
      icon: TrendingUp,
      value: "95%",
      label: "Success Rate",
      color: "success"
    },
    {
      icon: Award,
      value: "500+",
      label: "Certified Trainers",
      color: "secondary"
    },
    {
      icon: Star,
      value: "4.9★",
      label: "Average Rating",
      color: "warning"
    }
  ];

  return (
    <div className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              const colorClasses = {
                primary: { bg: "bg-primary/10 group-hover:bg-primary/20", text: "text-primary" },
                success: { bg: "bg-success/10 group-hover:bg-success/20", text: "text-success" },
                secondary: { bg: "bg-secondary/10 group-hover:bg-secondary/20", text: "text-secondary" },
                warning: { bg: "bg-warning/10 group-hover:bg-warning/20", text: "text-warning" }
              };
              const colors = colorClasses[stat.color as keyof typeof colorClasses];
              
              return (
                <div key={index} className="text-center group">
                  <div className={`inline-flex p-4 rounded-full ${colors.bg} transition-colors duration-300 mb-4`}>
                    <IconComponent className={`h-8 w-8 ${colors.text}`} />
                  </div>
                  <div className={`text-3xl font-bold ${colors.text} mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              );
            })}
        </div>
        
        {/* Testimonials Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            What Our Members Say
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Real stories from people who transformed their lives with the right trainer
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card 
              key={index}
              className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-sm"
            >
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-warning text-warning" />
                  ))}
                </div>
                
                <div className="relative mb-6">
                  <Quote className="absolute -top-2 -left-2 h-8 w-8 text-primary/20" />
                  <p className="text-muted-foreground leading-relaxed pl-6">
                    "{testimonial.content}"
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-primary font-medium">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-8 p-6 bg-white rounded-full shadow-sm border">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">
                All trainers verified
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse [animation-delay:0.5s]"></div>
              <span className="text-sm font-medium text-muted-foreground">
                Secure payments
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-secondary rounded-full animate-pulse [animation-delay:1s]"></div>
              <span className="text-sm font-medium text-muted-foreground">
                24/7 support
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};